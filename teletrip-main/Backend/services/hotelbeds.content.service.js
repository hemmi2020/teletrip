const crypto = require('crypto');

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
// Content API uses standard endpoint (Hotelbeds hosts only booking flow /hotel-api on api-mtls)
const CONTENT_BASE_URL = process.env.HOTELBEDS_CONTENT_URL || (
  (process.env.HOTELBEDS_ENV || 'test').toLowerCase() === 'live'
    ? 'https://api.hotelbeds.com/hotel-content-api/1.0'
    : 'https://api.test.hotelbeds.com/hotel-content-api/1.0'
);

// Fields we actually need for sync — drastically reduces payload vs fields=all
const SYNC_FIELDS = 'code,name,description,address,city,postalCode,countryCode,stateCode,destinationCode,phones,email,web,categoryCode,categoryGroupCode,accommodationTypeCode,facilities,images,rooms';

function generateSignature(apiKey, secret, timestamp) {
  return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

/**
 * Fetch with timeout using AbortController (native fetch ignores the `timeout` option)
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Retry a fetch operation with exponential backoff
 */
async function fetchWithRetry(url, options = {}, { retries = 3, baseDelay = 2000, timeoutMs = 30000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      // If rate-limited (429), retry after delay
      if (response.status === 429) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[ContentAPI] Rate limited (429), retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[ContentAPI] Request timed out, retrying... (attempt ${attempt + 1}/${retries})`);
      } else {
        console.warn(`[ContentAPI] Request failed: ${err.message}, retrying... (attempt ${attempt + 1}/${retries})`);
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError || new Error(`Failed after ${retries} retries`);
}

/**
 * Fetch hotel details from Hotelbeds Content API
 * Returns phone numbers, address, description, facilities, images, and room facilities
 */
async function getHotelContent(hotelCode) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const url = `${CONTENT_BASE_URL}/hotels/${hotelCode}/details?language=ENG&useSecondaryLanguage=false`;
    const { getMTLSAgent } = require('../config/mtls.config');
    const agent = getMTLSAgent();
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      ...(agent && { agent })
    }, { retries: 3, baseDelay: 1000, timeoutMs: 15000 });

    if (!response.ok) {
      console.error(`Content API error for hotel ${hotelCode}:`, response.status);
      return null;
    }

    const data = await response.json();
    const hotel = data.hotel;

    if (!hotel) return null;

    // Process room-level facilities (mandatory Hotelbeds certification requirement)
    const processedRooms = (hotel.rooms || []).map(room => {
      const roomFacilities = (room.facilities || []).map(f => ({
        code: f.facilityCode,
        facilityCode: f.facilityCode,
        groupCode: f.facilityGroupCode,
        description: f.description?.content || `Facility ${f.facilityCode}`,
        indFee: f.indFee === true
      }));

      return {
        roomCode: room.roomCode,
        roomName: room.roomDescription || room.name || 'Room',
        typeCode: room.typeCode || '',
        characteristicCode: room.characteristicCode || '',
        facilities: roomFacilities,
        paidFacilities: roomFacilities.filter(f => f.indFee === true),
        freeFacilities: roomFacilities.filter(f => f.indFee !== true)
      };
    });

    return {
      code: hotel.code,
      name: hotel.name?.content || '',
      description: hotel.description?.content || '',
      address: {
        content: hotel.address?.content || '',
        street: hotel.address?.street || '',
        number: hotel.address?.number || ''
      },
      city: hotel.city?.content || '',
      postalCode: hotel.postalCode || '',
      countryCode: hotel.countryCode || '',
      stateCode: hotel.stateCode || '',
      phones: (hotel.phones || []).map(p => ({
        phoneNumber: p.phoneNumber,
        phoneType: p.phoneType
      })),
      categoryCode: hotel.categoryCode || '',
      categoryGroupCode: hotel.categoryGroupCode || '',
      accommodationTypeCode: hotel.accommodationTypeCode || '',
      // Accommodation type description from Content API (mandatory Hotelbeds requirement)
      accommodationType: hotel.accommodationType?.typeDescription?.content || hotel.accommodationTypeCode || '',
      email: hotel.email || '',
      web: hotel.web || '',
      // Facilities with paid charges (indFee=true means extra charge on-site) - mandatory display
      paidFacilities: (hotel.facilities || [])
        .filter(f => f.indFee === true)
        .slice(0, 30)
        .map(f => ({
          code: f.facilityCode,
          groupCode: f.facilityGroupCode,
          description: f.description?.content || `Facility ${f.facilityCode}`,
          fee: true,
          indFee: true
        })),
      // Complimentary facilities (indFee=false)
      freeFacilities: (hotel.facilities || [])
        .filter(f => f.indFee !== true)
        .slice(0, 50)
        .map(f => ({
          code: f.facilityCode,
          groupCode: f.facilityGroupCode,
          description: f.description?.content || `Facility ${f.facilityCode}`,
          fee: false,
          indFee: false
        })),
      // All facilities
      facilities: (hotel.facilities || []).slice(0, 50).map(f => ({
        code: f.facilityCode,
        groupCode: f.facilityGroupCode,
        description: f.description?.content || '',
        indFee: f.indFee || false
      })),
      // Room-level facilities with paid charges (indFee=true)
      roomPaidFacilities: processedRooms.flatMap(r =>
        r.paidFacilities.map(f => ({
          roomCode: r.roomCode,
          roomName: r.roomName,
          code: f.code,
          groupCode: f.groupCode,
          description: f.description,
          fee: true,
          indFee: true
        }))
      ).slice(0, 30),
      // Full rooms array with facilities
      rooms: processedRooms,
      images: (hotel.images || []).slice(0, 10).map(img => ({
        path: img.path,
        type: img.type?.description?.content || img.imageTypeCode || ''
      }))
    };
  } catch (error) {
    console.error(`Content API exception for hotel ${hotelCode}:`, error.message);
    return null;
  }
}

/**
 * Fetch hotels in bulk from Content API (up to 1000 per request)
 * Uses limited fields to reduce payload size and prevent timeouts
 */
async function getHotelsBulk(from = 1, to = 100) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const url = `${CONTENT_BASE_URL}/hotels?fields=${SYNC_FIELDS}&language=ENG&from=${from}&to=${to}`;
    const { getMTLSAgent } = require('../config/mtls.config');
    const agent = getMTLSAgent();
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      ...(agent && { agent })
    }, { retries: 3, baseDelay: 2000, timeoutMs: 45000 });

    if (!response.ok) {
      console.error('Content API bulk error:', response.status);
      return { hotels: [], total: 0 };
    }

    const data = await response.json();
    return {
      hotels: data.hotels || [],
      total: data.total || 0,
      from: data.from || from,
      to: data.to || to
    };
  } catch (error) {
    console.error('Content API bulk exception:', error.message);
    return { hotels: [], total: 0 };
  }
}

module.exports = { getHotelContent, getHotelsBulk };
