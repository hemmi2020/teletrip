/**
 * Hotelbeds HCN (Hotel Confirmation Number) Polling Service
 * Automatically fetches hotel confirmation numbers for confirmed bookings
 */

const crypto = require('crypto');
const bookingModel = require('../models/booking.model');
const { getMTLSAgent } = require('../config/mtls.config');

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const HOTELBEDS_BASE_URL = process.env.HOTELBEDS_BASE_URL || (
  process.env.HOTELBEDS_MTLS_CERT_PATH 
    ? 'https://api-mtls.test.hotelbeds.com' 
    : 'https://api.test.hotelbeds.com'
);

function generateSignature(apiKey, secret, timestamp) {
  return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

/**
 * Fetch booking details from Hotelbeds to get HCN
 * @param {string} bookingReference - Hotelbeds booking reference
 */
async function fetchBookingDetail(bookingReference) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const agent = getMTLSAgent();
    const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings/${bookingReference}`, {
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
    return data.booking;
  } catch (error) {
    console.error(`[HCN] Failed to fetch booking detail for ${bookingReference}:`, error.message);
    throw error;
  }
}

/**
 * Poll HCN for all confirmed bookings that don't have one yet
 * @param {Object} options
 * @param {number} options.maxAgeDays - Only poll bookings newer than this many days
 * @param {number} options.batchSize - Max bookings to poll per run
 */
async function pollHCNForBookings({ maxAgeDays = 30, batchSize = 50 } = {}) {
  const results = {
    ranAt: new Date(),
    processed: 0,
    updated: 0,
    failed: 0,
    alreadyHaveHCN: 0,
    details: []
  };

  // Find confirmed bookings without HCN
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  const bookings = await bookingModel.find({
    status: { $in: ['confirmed', 'completed'] },
    bookingType: 'hotel',
    createdAt: { $gte: cutoffDate },
    $or: [
      { 'hotelBooking.hotelConfirmationNumber': { $exists: false } },
      { 'hotelBooking.hotelConfirmationNumber': null },
      { 'hotelBooking.hotelConfirmationNumber': '' }
    ]
  })
  .select('bookingReference hotelBooking.confirmationNumber hotelBooking.hotelName')
  .limit(batchSize)
  .lean();

  console.log(`[HCN] Found ${bookings.length} bookings to poll for HCN`);

  for (const booking of bookings) {
    const hbRef = booking.hotelBooking?.confirmationNumber || booking.bookingReference;
    if (!hbRef) continue;

    results.processed++;

    try {
      const hbBooking = await fetchBookingDetail(hbRef);
      
      if (!hbBooking) {
        results.details.push({
          reference: hbRef,
          status: 'not_found',
          message: 'Booking not found in Hotelbeds'
        });
        results.failed++;
        continue;
      }

      // Extract HCN from Hotelbeds response
      // HCN can be in hotel.supplierReference or hotel.confirmationNumber
      const hotelData = hbBooking.hotel || {};
      const hcn = hotelData.supplierReference || hotelData.confirmationNumber || null;
      
      if (hcn) {
        // Update local booking with HCN
        await bookingModel.findByIdAndUpdate(booking._id, {
          'hotelBooking.hotelConfirmationNumber': hcn,
          'hotelBooking.hcnUpdatedAt': new Date(),
          'backup.hotelbedsBookingData': hbBooking
        });

        results.updated++;
        results.details.push({
          reference: hbRef,
          status: 'updated',
          hcn: hcn,
          hotelName: hotelData.name
        });
        console.log(`[HCN] Updated booking ${hbRef} with HCN: ${hcn}`);
      } else {
        results.alreadyHaveHCN++;
        results.details.push({
          reference: hbRef,
          status: 'pending',
          message: 'HCN not yet available from hotel'
        });
      }
    } catch (error) {
      results.failed++;
      results.details.push({
        reference: hbRef,
        status: 'error',
        message: error.message
      });
    }
  }

  return results;
}

/**
 * Get HCN status summary for admin dashboard
 */
async function getHCNStatusSummary() {
  const total = await bookingModel.countDocuments({
    status: { $in: ['confirmed', 'completed'] },
    bookingType: 'hotel'
  });

  const withHCN = await bookingModel.countDocuments({
    status: { $in: ['confirmed', 'completed'] },
    bookingType: 'hotel',
    'hotelBooking.hotelConfirmationNumber': { $exists: true, $ne: null, $ne: '' }
  });

  const withoutHCN = await bookingModel.countDocuments({
    status: { $in: ['confirmed', 'completed'] },
    bookingType: 'hotel',
    $or: [
      { 'hotelBooking.hotelConfirmationNumber': { $exists: false } },
      { 'hotelBooking.hotelConfirmationNumber': null },
      { 'hotelBooking.hotelConfirmationNumber': '' }
    ]
  });

  return {
    total,
    withHCN,
    withoutHCN,
    percentage: total > 0 ? Math.round((withHCN / total) * 100) : 0
  };
}

module.exports = {
  pollHCNForBookings,
  fetchBookingDetail,
  getHCNStatusSummary
};
