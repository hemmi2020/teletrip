/**
 * Hotelbeds Booking Reconciliation Service
 * Compares local bookings with Hotelbeds to detect mismatches
 */

const crypto = require('crypto');
const bookingModel = require('../models/booking.model');
const { getMTLSAgent } = require('../config/mtls.config');

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const HOTELBEDS_BASE_URL = process.env.HOTELBEDS_BASE_URL || (
  (process.env.HOTELBEDS_MTLS_CERT || process.env.HOTELBEDS_MTLS_CERT_PATH)
    ? 'https://api-mtls.test.hotelbeds.com'
    : 'https://api.test.hotelbeds.com'
);

function generateSignature(apiKey, secret, timestamp) {
  return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

/**
 * Fetch bookings from Hotelbeds for a date range
 * @param {Object} options
 * @param {string} options.startDate - ISO start date
 * @param {string} options.endDate - ISO end date
 * @param {string} options.filterType - CHECKIN, CREATION, MODIFICATION
 * @param {number} options.from - pagination start
 * @param {number} options.to - pagination end
 */
async function fetchHotelbedsBookings({ startDate, endDate, filterType = 'CHECKIN', from = 1, to = 100 } = {}) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('filterType', filterType);
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);

    const agent = getMTLSAgent();
    const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings?${params}`, {
      method: 'GET',
      headers: {
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json'
      },
      ...(agent && { agent })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hotelbeds API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      bookings: data.bookings || [],
      total: data.total || 0
    };
  } catch (error) {
    console.error('[Reconciliation] Failed to fetch Hotelbeds bookings:', error.message);
    throw error;
  }
}

/**
 * Run reconciliation between local bookings and Hotelbeds
 * @param {Object} options
 * @param {Date} options.startDate
 * @param {Date} options.endDate
 * @param {string} options.filterType
 */
async function runReconciliation({ startDate, endDate, filterType = 'CHECKIN' } = {}) {
  const results = {
    ranAt: new Date(),
    period: { startDate, endDate },
    matched: [],
    missingLocally: [],      // In Hotelbeds but not in our DB
    missingInHotelbeds: [],  // In our DB but not in Hotelbeds
    statusMismatches: [],
    apiError: null,
    summary: {
      totalHotelbedsBookings: 0,
      totalLocalBookings: 0,
      matchedCount: 0,
      missingLocallyCount: 0,
      missingInHotelbedsCount: 0,
      statusMismatchCount: 0
    }
  };

  // Format dates for Hotelbeds API (YYYY-MM-DD)
  const formatDate = (d) => d ? d.toISOString().split('T')[0] : undefined;

  // 1. Fetch from Hotelbeds (with error handling)
  let hbBookings = [];
  try {
    const hbData = await fetchHotelbedsBookings({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      filterType,
      from: 1,
      to: 1000
    });
    hbBookings = hbData.bookings;
    results.summary.totalHotelbedsBookings = hbData.total;
  } catch (error) {
    console.error('[Reconciliation] Hotelbeds API call failed:', error.message);
    results.apiError = {
      message: error.message,
      note: 'Local bookings were still fetched for comparison. Hotelbeds API may be unavailable or credentials invalid.'
    };
    // Continue with local bookings only - don't crash the entire request
  }

  // Build map by reference
  const hbMap = new Map();
  for (const hb of hbBookings) {
    hbMap.set(hb.reference, hb);
  }

  // 2. Fetch local bookings for the same period
  const localQuery = {
    status: { $in: ['confirmed', 'completed', 'pending'] },
    bookingType: 'hotel'
  };
  if (startDate || endDate) {
    localQuery['hotelBooking.checkIn'] = {};
    if (startDate) localQuery['hotelBooking.checkIn'].$gte = startDate;
    if (endDate) localQuery['hotelBooking.checkIn'].$lte = endDate;
  }

  const localBookings = await bookingModel.find(localQuery)
    .select('bookingReference status hotelBooking.confirmationNumber hotelBooking.hotelName hotelBooking.checkIn pricing.currency pricing.totalAmount createdAt')
    .lean();

  results.summary.totalLocalBookings = localBookings.length;

  // Build local map by Hotelbeds reference
  const localMap = new Map();
  for (const lb of localBookings) {
    const hbRef = lb.hotelBooking?.confirmationNumber || lb.bookingReference;
    localMap.set(hbRef, lb);
  }

  // 3. Compare
  // 3a. Check Hotelbeds bookings against local
  for (const hb of hbBookings) {
    const local = localMap.get(hb.reference);
    if (!local) {
      results.missingLocally.push({
        hotelbedsReference: hb.reference,
        hotelName: hb.hotel?.name,
        checkIn: hb.hotel?.checkIn,
        status: hb.status,
        clientReference: hb.clientReference,
        totalNet: hb.totalNet,
        currency: hb.currency
      });
    } else {
      // Check status mismatch
      const localStatus = local.status === 'confirmed' || local.status === 'completed' ? 'CONFIRMED' : local.status.toUpperCase();
      const hbStatus = hb.status;
      if (localStatus !== hbStatus && hbStatus !== 'CONFIRMED') {
        results.statusMismatches.push({
          hotelbedsReference: hb.reference,
          hotelName: hb.hotel?.name,
          localStatus: local.status,
          hotelbedsStatus: hbStatus,
          checkIn: hb.hotel?.checkIn
        });
      }
      results.matched.push({
        hotelbedsReference: hb.reference,
        localReference: local.bookingReference,
        hotelName: hb.hotel?.name,
        status: hbStatus,
        checkIn: hb.hotel?.checkIn
      });
    }
  }

  // 3b. Check local bookings against Hotelbeds
  for (const lb of localBookings) {
    const hbRef = lb.hotelBooking?.confirmationNumber || lb.bookingReference;
    if (!hbMap.has(hbRef)) {
      results.missingInHotelbeds.push({
        localReference: lb.bookingReference,
        hotelName: lb.hotelBooking?.hotelName,
        checkIn: lb.hotelBooking?.checkIn,
        status: lb.status,
        totalAmount: lb.pricing?.totalAmount,
        currency: lb.pricing?.currency,
        createdAt: lb.createdAt
      });
    }
  }

  results.summary.matchedCount = results.matched.length;
  results.summary.missingLocallyCount = results.missingLocally.length;
  results.summary.missingInHotelbedsCount = results.missingInHotelbeds.length;
  results.summary.statusMismatchCount = results.statusMismatches.length;

  return results;
}

module.exports = {
  runReconciliation,
  fetchHotelbedsBookings
};
