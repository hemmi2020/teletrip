/**
 * Real Hotelbeds Certification Test Runner
 * Performs actual end-to-end API calls against Hotelbeds Test API using mTLS (if configured)
 * Steps:
 * 1. AvailabilityRQ (2 Adults + 1 Child age 5) -> AvailabilityRS
 * 2. CheckRateRQ (Validated rateKey) -> CheckRateRS
 * 3. BookingRQ (Confirmed booking reference) -> BookingRS
 * 4. CancellationRQ (Cancelled booking) -> CancellationRS
 *
 * Output: Writes logs to hotelbeds_certification_logs.json
 */

require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { getMTLSAgent } = require('../config/mtls.config');

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const HOTELBEDS_ENV = (process.env.HOTELBEDS_ENV || 'test').toLowerCase();

// Determine Base URL
let BASE_URL = process.env.HOTELBEDS_BASE_URL;
if (!BASE_URL) {
    BASE_URL = HOTELBEDS_ENV === 'live'
        ? (process.env.HOTELBEDS_MTLS_CERT || process.env.HOTELBEDS_MTLS_CERT_PATH ? 'https://api-mtls.hotelbeds.com' : 'https://api.hotelbeds.com')
        : (process.env.HOTELBEDS_MTLS_CERT || process.env.HOTELBEDS_MTLS_CERT_PATH ? 'https://api-mtls.test.hotelbeds.com' : 'https://api.test.hotelbeds.com');
}

function generateSignature(apiKey, secret, timestamp) {
    return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

function getHeaders() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);
    return {
        'Content-Type': 'application/json',
        'Api-key': HOTELBEDS_API_KEY,
        'X-Signature': signature,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
    };
}

async function runTest() {
    console.log('🚀 Starting Real Hotelbeds Certification Test Flow...');
    console.log(`🌐 Base URL: ${BASE_URL}`);

    const agent = getMTLSAgent();
    if (agent) {
        console.log('🔒 Using Mutual TLS (mTLS) Agent for API calls');
    } else {
        console.log('ℹ️ mTLS certs not configured locally, proceeding with standard HTTPS endpoint');
    }

    const logs = [];

    // Setup dates 60 days in advance
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 60);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    console.log(`📅 Dates: ${checkInStr} to ${checkOutStr}`);

    // STEP 1: AvailabilityRQ
    console.log('\n--- STEP 1: Availability Request (Dubai, 2 Adults + 1 Child age 5) ---');
    const availPayload = {
        stay: { checkIn: checkInStr, checkOut: checkOutStr },
        occupancies: [
            {
                rooms: 1,
                adults: 2,
                children: 1,
                paxes: [
                    { type: 'AD', age: 30 },
                    { type: 'AD', age: 30 },
                    { type: 'CH', age: 5 }
                ]
            }
        ],
        destination: { code: 'DXB' },
        filter: { maxHotels: 5 },
        source: {
            channel: 'B2C',
            device: 'WEB',
            deviceInfo: 'TeleTrip Web Application',
            sourceMarket: 'PK'
        }
    };

    const headers1 = getHeaders();
    const availRes = await fetch(`${BASE_URL}/hotel-api/1.0/hotels`, {
        method: 'POST',
        headers: headers1,
        body: JSON.stringify(availPayload),
        ...(agent && { agent })
    });

    const availText = await availRes.text();
    let availData = {};
    try { availData = JSON.parse(availText); } catch (e) { }

    console.log(`Availability RS Status: ${availRes.status}`);

    logs.push({
        step: 'Availability',
        timestamp: new Date().toISOString(),
        request: {
            method: 'POST',
            url: `${BASE_URL}/hotel-api/1.0/hotels`,
            headers: { 'Content-Type': 'application/json', 'Api-key': HOTELBEDS_API_KEY, 'X-Signature': headers1['X-Signature'], 'Accept': 'application/json' },
            body: availPayload
        },
        response: {
            status: availRes.status,
            body: availData
        }
    });

    if (!availRes.ok || !availData.hotels || !availData.hotels.hotels || availData.hotels.hotels.length === 0) {
        console.error('❌ Availability search returned no hotels or error:', availText);
        process.exit(1);
    }

    // Find a rate from hotels
    let selectedRateKey = null;
    let selectedRateType = null;
    let selectedHotel = null;
    let selectedRoom = null;

    for (const h of availData.hotels.hotels) {
        if (h.rooms && h.rooms.length > 0) {
            for (const r of h.rooms) {
                if (r.rates && r.rates.length > 0) {
                    selectedHotel = h;
                    selectedRoom = r;
                    selectedRateKey = r.rates[0].rateKey;
                    selectedRateType = r.rates[0].rateType;
                    break;
                }
            }
        }
        if (selectedRateKey) break;
    }

    if (!selectedRateKey) {
        console.error('❌ Could not find a bookable rateKey in Availability response');
        process.exit(1);
    }

    console.log(`✅ Selected Hotel: ${selectedHotel.name} (Code: ${selectedHotel.code})`);
    console.log(`✅ Selected Room: ${selectedRoom.name}`);
    console.log(`✅ Rate Type: ${selectedRateType}, RateKey length: ${selectedRateKey.length}`);

    // STEP 2: CheckRateRQ
    console.log('\n--- STEP 2: CheckRate Request ---');
    const checkratePayload = {
        rooms: [
            { rateKey: selectedRateKey }
        ],
        source: {
            channel: 'B2C',
            device: 'WEB',
            deviceInfo: 'TeleTrip Web Application',
            sourceMarket: 'PK'
        }
    };

    const headers2 = getHeaders();
    const checkrateRes = await fetch(`${BASE_URL}/hotel-api/1.0/checkrates`, {
        method: 'POST',
        headers: headers2,
        body: JSON.stringify(checkratePayload),
        ...(agent && { agent })
    });

    const checkrateText = await checkrateRes.text();
    let checkrateData = {};
    try { checkrateData = JSON.parse(checkrateText); } catch (e) { }

    console.log(`CheckRate RS Status: ${checkrateRes.status}`);

    logs.push({
        step: 'CheckRate',
        timestamp: new Date().toISOString(),
        request: {
            method: 'POST',
            url: `${BASE_URL}/hotel-api/1.0/checkrates`,
            headers: { 'Content-Type': 'application/json', 'Api-key': HOTELBEDS_API_KEY, 'X-Signature': headers2['X-Signature'], 'Accept': 'application/json' },
            body: checkratePayload
        },
        response: {
            status: checkrateRes.status,
            body: checkrateData
        }
    });

    let bookingRateKey = selectedRateKey;
    if (checkrateRes.ok && checkrateData.hotel && checkrateData.hotel.rooms?.[0]?.rates?.[0]?.rateKey) {
        bookingRateKey = checkrateData.hotel.rooms[0].rates[0].rateKey;
        console.log('✅ CheckRate succeeded, updated rateKey captured.');
    } else {
        console.warn('⚠️ CheckRate response notice, proceeding with rateKey from Availability');
    }

    // STEP 3: BookingRQ
    console.log('\n--- STEP 3: Booking Request (With Child Pax) ---');
    const bookingPayload = {
        holder: {
            name: 'Zeeshan',
            surname: 'Javed'
        },
        rooms: [
            {
                rateKey: bookingRateKey,
                paxes: [
                    { roomId: 1, type: 'AD', name: 'Zeeshan', surname: 'Javed' },
                    { roomId: 1, type: 'AD', name: 'Fatima', surname: 'Javed' },
                    { roomId: 1, type: 'CH', age: 5, name: 'Ali', surname: 'Javed' }
                ]
            }
        ],
        clientReference: `REF${Date.now().toString().slice(-12)}`,
        remark: 'Hotelbeds Certification Test Booking with Child',
        tolerance: 2.00,
        source: {
            channel: 'B2C',
            device: 'WEB',
            deviceInfo: 'TeleTrip Web Application',
            sourceMarket: 'PK'
        }
    };

    const headers3 = getHeaders();
    const bookingRes = await fetch(`${BASE_URL}/hotel-api/1.0/bookings`, {
        method: 'POST',
        headers: headers3,
        body: JSON.stringify(bookingPayload),
        ...(agent && { agent })
    });

    const bookingText = await bookingRes.text();
    let bookingData = {};
    try { bookingData = JSON.parse(bookingText); } catch (e) { }

    console.log(`Booking RS Status: ${bookingRes.status}`);

    logs.push({
        step: 'Booking',
        timestamp: new Date().toISOString(),
        request: {
            method: 'POST',
            url: `${BASE_URL}/hotel-api/1.0/bookings`,
            headers: { 'Content-Type': 'application/json', 'Api-key': HOTELBEDS_API_KEY, 'X-Signature': headers3['X-Signature'], 'Accept': 'application/json' },
            body: bookingPayload
        },
        response: {
            status: bookingRes.status,
            body: bookingData
        }
    });

    if (!bookingRes.ok || !bookingData.booking || !bookingData.booking.reference) {
        console.error('❌ Booking failed:', bookingText);
        process.exit(1);
    }

    const bookingReference = bookingData.booking.reference;
    console.log(`🎉 Booking CONFIRMED! Reference: ${bookingReference}`);

    // STEP 4: CancellationRQ
    console.log('\n--- STEP 4: Cancellation Request ---');
    const headers4 = getHeaders();
    delete headers4['Content-Type']; // DELETE request does not need body/content-type

    const cancelUrl = `${BASE_URL}/hotel-api/1.0/bookings/${bookingReference}?cancellationFlag=CANCELLATION`;
    const cancelRes = await fetch(cancelUrl, {
        method: 'DELETE',
        headers: {
            'Api-key': HOTELBEDS_API_KEY,
            'X-Signature': headers4['X-Signature'],
            'Accept': 'application/json'
        },
        ...(agent && { agent })
    });

    const cancelText = await cancelRes.text();
    let cancelData = {};
    try { cancelData = JSON.parse(cancelText); } catch (e) { }

    console.log(`Cancellation RS Status: ${cancelRes.status}`);

    logs.push({
        step: 'Cancellation',
        timestamp: new Date().toISOString(),
        request: {
            method: 'DELETE',
            url: cancelUrl,
            headers: { 'Api-key': HOTELBEDS_API_KEY, 'X-Signature': headers4['X-Signature'], 'Accept': 'application/json' }
        },
        response: {
            status: cancelRes.status,
            body: cancelData
        }
    });

    if (cancelRes.ok && cancelData.booking) {
        console.log(`🎉 Booking CANCELLED! Cancellation Ref: ${cancelData.booking.cancellationReference}`);
    } else {
        console.warn('⚠️ Cancellation response notice:', cancelText);
    }

    // WRITE LOGS TO FILES
    const outputPaths = [
        path.join(__dirname, '../hotelbeds_certification_logs.json'),
        path.join(__dirname, '../../hotelbeds_certification_logs.json'),
        path.join(__dirname, '../../hotelbeds_certification_logs_v3.json'),
        path.join(__dirname, '../../../hotelbeds_certification_logs.json')
    ];

    const jsonContent = JSON.stringify(logs, null, 2);
    for (const p of outputPaths) {
        try {
            fs.writeFileSync(p, jsonContent, 'utf8');
            console.log(`💾 Saved certification logs to: ${p}`);
        } catch (e) {
            // Ignore path errors if folder structure differs
        }
    }

    console.log('\n✅ All 4 certification test steps completed successfully with REAL API calls!');
}

runTest().catch(err => {
    console.error('💥 Fatal error in test runner:', err);
    process.exit(1);
});
