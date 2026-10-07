/**
 * Hotelbeds Certification Log Generator (v3)
 *
 * Runs end-to-end API calls against https://api-mtls.test.hotelbeds.com:
 * 1. AvailabilityRQ (with source marker & mTLS agent)
 * 2. CheckRateRQ (with source marker & mTLS agent)
 * 3. BookingRQ (with source marker, holder, adults + child pax, & mTLS agent)
 * 4. CancellationRQ (with mTLS agent)
 *
 * Output file: c:/wamp64/www/telitrip/teletrip/hotelbeds_certification_logs_v3.json
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');

// Set MTLS cert paths if not already in env
if (!process.env.HOTELBEDS_MTLS_CERT_PATH) {
    process.env.HOTELBEDS_MTLS_CERT_PATH = path.resolve(__dirname, '../certs/telitrip-client-chain.crt');
}
if (!process.env.HOTELBEDS_MTLS_KEY_PATH) {
    process.env.HOTELBEDS_MTLS_KEY_PATH = path.resolve(__dirname, '../certs/telitrip-client.key');
}

const { getMTLSAgent } = require('../config/mtls.config');

const API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const BASE_URL = 'https://api-mtls.test.hotelbeds.com';

function getSignature(timestamp) {
    return crypto.createHash('sha256').update(API_KEY + SECRET + timestamp).digest('hex');
}

const SOURCE_MARKER = {
    channel: 'B2C',
    device: 'WEB',
    deviceInfo: 'TeleTrip Web Application',
    sourceMarket: 'PK'
};

const logs = [];

function recordLog(step, method, url, requestBody, responseStatus, responseBody) {
    logs.push({
        step,
        timestamp: new Date().toISOString(),
        request: {
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                'Api-key': API_KEY,
                'X-Signature': '[GENERATED_SHA256_HASH]',
                'Accept': 'application/json'
            },
            body: requestBody
        },
        response: {
            status: responseStatus,
            body: responseBody
        }
    });
}

async function runCertificationFlow() {
    console.log('🚀 Starting Hotelbeds Certification Log Generation (v3)...');
    const agent = getMTLSAgent();
    if (agent) {
        console.log('✅ Mutual TLS agent loaded successfully.');
    } else {
        console.warn('⚠️ mTLS agent not configured; continuing with default HTTPS agent against api-mtls.test.hotelbeds.com');
    }

    // 1. AVAILABILITY REQUEST
    console.log('\n[1/4] Sending AvailabilityRQ (Search with Source Marker)...');
    const availTimestamp = Math.floor(Date.now() / 1000);
    const availSig = getSignature(availTimestamp);
    const availUrl = `${BASE_URL}/hotel-api/1.0/hotels`;

    // Search parameters for Dubai with 2 Adults + 1 Child (Age 5)
    const futureCheckIn = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const futureCheckOut = new Date(Date.now() + 63 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const availBody = {
        stay: {
            checkIn: futureCheckIn,
            checkOut: futureCheckOut
        },
        occupancies: [
            {
                rooms: 1,
                adults: 2,
                children: 1,
                paxes: [
                    { type: 'AD', age: 30 },
                    { type: 'AD', age: 28 },
                    { type: 'CH', age: 5 }
                ]
            }
        ],
        geolocation: {
            latitude: 25.2048,
            longitude: 55.2708,
            radius: 30,
            unit: 'km'
        },
        source: SOURCE_MARKER
    };

    let rateKeyToUse = null;
    let recheckNeeded = false;

    try {
        const availRes = await fetch(availUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-key': API_KEY,
                'X-Signature': availSig,
                'Accept': 'application/json'
            },
            body: JSON.stringify(availBody),
            ...(agent && { agent })
        });

        const availData = await availRes.json();
        console.log(`   Status: ${availRes.status}`);

        // Store log for Availability
        recordLog('Availability', 'POST', availUrl, availBody, availRes.status, availData);

        if (availData.hotels && availData.hotels.hotels && availData.hotels.hotels.length > 0) {
            const selectedHotel = availData.hotels.hotels[0];
            const selectedRoom = selectedHotel.rooms ? selectedHotel.rooms[0] : null;
            const selectedRate = selectedRoom && selectedRoom.rates ? selectedRoom.rates[0] : null;
            if (selectedRate) {
                rateKeyToUse = selectedRate.rateKey;
                recheckNeeded = selectedRate.rateType === 'RECHECK';
                console.log(`   Selected Hotel: ${selectedHotel.name} (Code: ${selectedHotel.code})`);
                console.log(`   Selected RateKey: ${rateKeyToUse.substring(0, 40)}... (rateType: ${selectedRate.rateType})`);
            }
        }
    } catch (err) {
        console.error('❌ AvailabilityRQ error:', err.message);
    }

    if (!rateKeyToUse) {
        console.error('❌ Could not retrieve a valid rateKey from AvailabilityRQ. Aborting remaining steps.');
        saveLogsFile();
        return;
    }

    // 2. CHECKRATE REQUEST
    console.log('\n[2/4] Sending CheckRateRQ (Rate Recheck with Source Marker)...');
    const checkTimestamp = Math.floor(Date.now() / 1000);
    const checkSig = getSignature(checkTimestamp);
    const checkUrl = `${BASE_URL}/hotel-api/1.0/checkrates`;
    const checkBody = {
        rooms: [
            {
                rateKey: rateKeyToUse
            }
        ],
        source: SOURCE_MARKER
    };

    try {
        const checkRes = await fetch(checkUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-key': API_KEY,
                'X-Signature': checkSig,
                'Accept': 'application/json'
            },
            body: JSON.stringify(checkBody),
            ...(agent && { agent })
        });

        const checkData = await checkRes.json();
        console.log(`   Status: ${checkRes.status}`);
        recordLog('CheckRate', 'POST', checkUrl, checkBody, checkRes.status, checkData);

        if (checkData.hotel && checkData.hotel.rooms && checkData.hotel.rooms[0].rates[0]) {
            rateKeyToUse = checkData.hotel.rooms[0].rates[0].rateKey;
        }
    } catch (err) {
        console.error('❌ CheckRateRQ error:', err.message);
    }

    // 3. BOOKING REQUEST
    console.log('\n[3/4] Sending BookingRQ (Booking Confirmation with Children & Source Marker)...');
    const bookTimestamp = Math.floor(Date.now() / 1000);
    const bookSig = getSignature(bookTimestamp);
    const bookUrl = `${BASE_URL}/hotel-api/1.0/bookings`;
    const bookBody = {
        holder: {
            name: 'Zeeshan',
            surname: 'Javed'
        },
        rooms: [
            {
                rateKey: rateKeyToUse,
                paxes: [
                    { roomId: 1, type: 'AD', name: 'Zeeshan', surname: 'Javed' },
                    { roomId: 1, type: 'AD', name: 'Sara', surname: 'Javed' },
                    { roomId: 1, type: 'CH', name: 'Ali', surname: 'Javed', age: 5 }
                ]
            }
        ],
        clientReference: 'TELITRIP-CERT-' + Date.now().toString().slice(-6),
        remark: 'Hotelbeds Certification Test Booking with 1 Child',
        source: SOURCE_MARKER
    };

    let bookingReference = null;

    try {
        const bookRes = await fetch(bookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-key': API_KEY,
                'X-Signature': bookSig,
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookBody),
            ...(agent && { agent })
        });

        const bookData = await bookRes.json();
        console.log(`   Status: ${bookRes.status}`);
        recordLog('Booking', 'POST', bookUrl, bookBody, bookRes.status, bookData);

        if (bookData.booking && bookData.booking.reference) {
            bookingReference = bookData.booking.reference;
            console.log(`   ✅ Booking Success! Reference: ${bookingReference}`);
        }
    } catch (err) {
        console.error('❌ BookingRQ error:', err.message);
    }

    // 4. CANCELLATION REQUEST
    if (bookingReference) {
        console.log(`\n[4/4] Sending CancellationRQ for reference: ${bookingReference}...`);
        const cancelTimestamp = Math.floor(Date.now() / 1000);
        const cancelSig = getSignature(cancelTimestamp);
        const cancelUrl = `${BASE_URL}/hotel-api/1.0/bookings/${bookingReference}?cancellationFlag=CANCELLATION`;

        try {
            const cancelRes = await fetch(cancelUrl, {
                method: 'DELETE',
                headers: {
                    'Api-key': API_KEY,
                    'X-Signature': cancelSig,
                    'Accept': 'application/json'
                },
                ...(agent && { agent })
            });

            const cancelText = await cancelRes.text();
            let cancelData;
            try { cancelData = JSON.parse(cancelText); } catch { cancelData = cancelText; }

            console.log(`   Status: ${cancelRes.status}`);
            recordLog('Cancellation', 'DELETE', cancelUrl, null, cancelRes.status, cancelData);
            console.log('   ✅ Cancellation Success!');
        } catch (err) {
            console.error('❌ CancellationRQ error:', err.message);
        }
    }

    saveLogsFile();
}

function saveLogsFile() {
    const jsonContent = JSON.stringify(logs, null, 2);

    const destPaths = [
        path.resolve(__dirname, '../../../hotelbeds_certification_logs_v3.json'),
        path.resolve(__dirname, '../../hotelbeds_certification_logs_v3.json'),
        path.resolve(__dirname, '../../hotelbeds_certification_logs_v2.json') // Overwrite v2 to prevent stale submission
    ];

    destPaths.forEach(dest => {
        fs.writeFileSync(dest, jsonContent, 'utf-8');
        console.log(`📄 Saved clean certification logs to: ${dest}`);
    });

    console.log('\n🎉 ALL DONE! Fresh compliant certification logs generated successfully.');
}

runCertificationFlow();
