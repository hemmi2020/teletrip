// Hotelbeds Booking Service
// Handles actual hotel booking confirmation with Hotelbeds API

const crypto = require('crypto');
const fetch = require('node-fetch');

// Hotelbeds API configuration
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const HOTELBEDS_BASE_URL = 'https://api.test.hotelbeds.com';

/**
 * Generate Hotelbeds API signature
 */
function generateHotelbedsSignature(apiKey, secret, timestamp) {
  const stringToSign = apiKey + secret + timestamp;
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

/**
 * Confirm booking with Hotelbeds
 * @param {Object} bookingRequest - Hotelbeds booking request payload
 * @returns {Promise<Object>} - Booking confirmation result
 */
async function confirmBookingWithHotelbeds(bookingRequest) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    console.log('📞 [HOTELBEDS] Calling POST /bookings API...');
    console.log('📦 [HOTELBEDS] Request:', JSON.stringify(bookingRequest, null, 2));

    const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      body: JSON.stringify(bookingRequest),
      timeout: 30000
    });

    const responseText = await response.text();
    console.log('📥 [HOTELBEDS] Response status:', response.status);
    console.log('📥 [HOTELBEDS] Response body:', responseText);

    if (!response.ok) {
      console.error('❌ [HOTELBEDS] Booking failed:', response.status, responseText);
      
      let errorMessage = 'Hotel booking failed';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
          
          // User-friendly error messages
          if (errorMessage === 'Insufficient allotment') {
            errorMessage = 'This room is no longer available. Please search again.';
          } else if (errorMessage.includes('Price has changed') || errorMessage.includes('price difference')) {
            errorMessage = 'Room price has changed. Please search again for updated pricing.';
          }
        }
      } catch (e) {
        // Use raw error text if JSON parsing fails
        errorMessage = responseText;
      }
      
      return {
        success: false,
        error: errorMessage,
        rawError: responseText
      };
    }

    const hotelbedsResponse = JSON.parse(responseText);
    const bookingReference = hotelbedsResponse.booking?.reference;

    console.log('✅ [HOTELBEDS] Booking confirmed successfully!');
    console.log('📋 [HOTELBEDS] Reference:', bookingReference);
    console.log('📋 [HOTELBEDS] Status:', hotelbedsResponse.booking?.status);

    return {
      success: true,
      hotelbedsReference: bookingReference,
      hotelbedsData: hotelbedsResponse,
      booking: hotelbedsResponse.booking
    };

  } catch (error) {
    console.error('❌ [HOTELBEDS] Exception:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancel booking with Hotelbeds
 * @param {String} bookingReference - Hotelbeds booking reference
 * @param {String} cancellationFlag - CANCELLATION or SIMULATION
 * @returns {Promise<Object>} - Cancellation result
 */
async function cancelBookingWithHotelbeds(bookingReference, cancellationFlag = 'CANCELLATION') {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    console.log('🚫 [HOTELBEDS] Cancelling booking:', bookingReference);

    const response = await fetch(
      `${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings/${bookingReference}?cancellationFlag=${cancellationFlag}`,
      {
        method: 'DELETE',
        headers: {
          'Api-key': HOTELBEDS_API_KEY,
          'X-Signature': signature,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        timeout: 30000
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ [HOTELBEDS] Cancellation failed:', response.status, responseText);
      return {
        success: false,
        error: responseText
      };
    }

    const cancellationResponse = JSON.parse(responseText);
    console.log('✅ [HOTELBEDS] Booking cancelled:', cancellationResponse.booking?.cancellationReference);

    return {
      success: true,
      cancellationReference: cancellationResponse.booking?.cancellationReference,
      refundAmount: cancellationResponse.booking?.totalNet || 0,
      cancellationData: cancellationResponse
    };

  } catch (error) {
    console.error('❌ [HOTELBEDS] Cancellation exception:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get booking details from Hotelbeds
 * @param {String} bookingReference - Hotelbeds booking reference
 * @returns {Promise<Object>} - Booking details
 */
async function getBookingDetails(bookingReference) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    const response = await fetch(
      `${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings/${bookingReference}`,
      {
        method: 'GET',
        headers: {
          'Api-key': HOTELBEDS_API_KEY,
          'X-Signature': signature,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        timeout: 30000
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: errorText
      };
    }

    const bookingData = await response.json();
    return {
      success: true,
      booking: bookingData.booking
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  confirmBookingWithHotelbeds,
  cancelBookingWithHotelbeds,
  getBookingDetails
};
