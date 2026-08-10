const crypto = require('crypto');
const { getMTLSAgent } = require('../config/mtls.config');

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const CONTENT_BASE_URL = process.env.HOTELBEDS_CONTENT_URL || (
  process.env.HOTELBEDS_MTLS_CERT || process.env.HOTELBEDS_MTLS_CERT_PATH
    ? 'https://api-mtls.test.hotelbeds.com/hotel-content-api/1.0'
    : 'https://api.test.hotelbeds.com/hotel-content-api/1.0'
);

function generateSignature(apiKey, secret, timestamp) {
  return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

/**
 * Fetch hotel details from Hotelbeds Content API
 * Returns phone numbers, address, description, facilities, images
 */
async function getHotelContent(hotelCode) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const url = `${CONTENT_BASE_URL}/hotels/${hotelCode}/details?language=ENG&useSecondaryLanguage=false`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json'
      },
      agent: getMTLSAgent(),
      timeout: 15000
    });

    if (!response.ok) {
      console.error(`Content API error for hotel ${hotelCode}:`, response.status);
      return null;
    }

    const data = await response.json();
    const hotel = data.hotel;
    
    if (!hotel) return null;

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
          fee: true
        })),
      // All facilities
      facilities: (hotel.facilities || []).slice(0, 50).map(f => ({
        code: f.facilityCode,
        groupCode: f.facilityGroupCode,
        description: f.description?.content || '',
        indFee: f.indFee || false
      })),
      // Room-level facilities with paid charges (indFee=true)
      roomPaidFacilities: (hotel.rooms || []).flatMap(room => 
        (room.facilities || [])
          .filter(f => f.indFee === true)
          .map(f => ({
            roomName: room.roomDescription || room.name || 'Room',
            code: f.facilityCode,
            groupCode: f.facilityGroupCode,
            description: f.description?.content || `Facility ${f.facilityCode}`,
            fee: true
          }))
      ).slice(0, 30),
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
 */
async function getHotelsBulk(from = 1, to = 100) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const url = `${CONTENT_BASE_URL}/hotels?fields=all&language=ENG&from=${from}&to=${to}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json'
      },
      agent: getMTLSAgent(),
      timeout: 60000
    });

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
