/**
 * Cancel Live Certification Booking
 * 
 * Safely cancels the live certification reservation once Hotelbeds has verified it.
 * 
 * Usage:
 *   node scripts/cancel_live_booking.js [--reference=148-XXXXXXX] [--secret=YOUR_SECRET]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { getMTLSAgent } = require('../config/mtls.config');

const LIVE_API_KEY = process.env.HOTELBEDS_LIVE_API_KEY || 'f879ffbe1a15cfa78d4fc6770ec7c8e7';

let LIVE_SECRET = process.env.HOTELBEDS_LIVE_SECRET;
const secretArg = process.argv.find(arg => arg.startsWith('--secret='));
if (secretArg) {
  LIVE_SECRET = secretArg.split('=')[1].trim();
}

let bookingRef = null;
const refArg = process.argv.find(arg => arg.startsWith('--reference='));
if (refArg) {
  bookingRef = refArg.split('=')[1].trim();
} else {
  // Try reading from LIVE_CERTIFICATION_BOOKING.json
  const recordPath = path.join(__dirname, '..', 'LIVE_CERTIFICATION_BOOKING.json');
  if (fs.existsSync(recordPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
      bookingRef = data.hotelbedsReference;
    } catch (e) {}
  }
}

if (!bookingRef) {
  console.error('❌ ERROR: No booking reference specified.');
  console.error('Usage: node scripts/cancel_live_booking.js --reference=148-XXXXXXX --secret=YOUR_SECRET');
  process.exit(1);
}

if (!LIVE_SECRET) {
  console.error('❌ ERROR: Live Secret not provided.');
  console.error('Usage: node scripts/cancel_live_booking.js --secret=YOUR_SECRET');
  process.exit(1);
}

function generateSignature(apiKey, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
  return { timestamp, signature: hash };
}

async function cancel() {
  console.log(`\n🚫 Cancelling Live Booking: ${bookingRef}...`);
  const agent = getMTLSAgent();
  const { signature } = generateSignature(LIVE_API_KEY, LIVE_SECRET);

  const cancelUrl = `https://api-mtls.hotelbeds.com/hotel-api/1.0/bookings/${bookingRef}?cancellationFlag=CANCELLATION`;

  const res = await fetch(cancelUrl, {
    method: 'DELETE',
    headers: {
      'Api-key': LIVE_API_KEY,
      'X-Signature': signature,
      'Accept': 'application/json'
    },
    agent
  });

  const text = await res.text();
  console.log(`Response HTTP ${res.status}:`, text);

  if (!res.ok) {
    console.error('❌ Cancellation failed.');
    process.exit(1);
  }

  const data = JSON.parse(text);
  console.log('\n✅ LIVE BOOKING CANCELLED SUCCESSFULLY!');
  console.log(`Cancellation Reference: ${data.booking?.cancellationReference}`);
  console.log(`Cancellation Amount Charged: ${data.booking?.cancellationAmount || '0.00'}`);
  console.log(`Booking Status: ${data.booking?.status}`);
}

cancel().catch(err => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
