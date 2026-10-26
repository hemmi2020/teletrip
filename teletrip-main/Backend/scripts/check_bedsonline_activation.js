/**
 * Bedsonline Live Contract Activation Checker
 * 
 * Usage:
 *   node scripts/check_bedsonline_activation.js
 * 
 * Runs a search against the live Hotelbeds / Bedsonline endpoint to check
 * if commercial contract mapping has been completed by your Account Manager.
 */

require('dotenv').config();
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const certPath = path.resolve(__dirname, '../certs');
const certFile = path.join(certPath, 'telitrip-client-fullchain.crt');
const keyFile = path.join(certPath, 'telitrip-client.key');

const apiKey = process.env.HOTELBEDS_API_KEY || 'f879ffbe1a15cfa78d4fc6770ec7c8e7';
const secret = process.env.HOTELBEDS_SECRET || 'qLevQhmgdb';

function sign(k, s) {
  const ts = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha256').update(k + s + ts).digest('hex');
  return hash;
}

function makeReq(body) {
  return new Promise((resolve, reject) => {
    const cert = fs.readFileSync(certFile);
    const key = fs.readFileSync(keyFile);
    const hash = sign(apiKey, secret);
    
    const postData = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Api-key': apiKey,
      'X-Signature': hash,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Length': Buffer.byteLength(postData)
    };

    const options = {
      hostname: 'api-mtls.hotelbeds.com',
      port: 443,
      path: '/hotel-api/1.0/hotels',
      method: 'POST',
      cert,
      key,
      rejectUnauthorized: true,
      headers
    };

    const req = https.request(options, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const encoding = res.headers['content-encoding'];
        let text;
        try {
          if (encoding === 'gzip') text = zlib.gunzipSync(buffer).toString('utf8');
          else if (encoding === 'deflate') text = zlib.inflateSync(buffer).toString('utf8');
          else text = buffer.toString('utf8');
          resolve({ status: res.statusCode, body: JSON.parse(text) });
        } catch (e) {
          resolve({ status: res.statusCode, body: buffer.toString('utf8') });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function checkActivation() {
  console.log('====================================================');
  console.log('   TeleTrip - Bedsonline Live Contract Checker');
  console.log('====================================================');
  console.log(`API Key:  ${apiKey}`);
  console.log(`Endpoint: https://api-mtls.hotelbeds.com`);

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 45);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);

  const payload = {
    stay: {
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0]
    },
    occupancies: [{ rooms: 1, adults: 2, children: 0 }],
    destination: { code: 'DXB' }
  };

  try {
    const res = await makeReq(payload);
    console.log(`HTTP Status: ${res.status}`);

    if (res.status === 200) {
      const total = res.body?.hotels?.total || 0;
      if (total > 0) {
        console.log('\n🎉 SUCCESS! Contract mapping is ACTIVE!');
        console.log(`Found ${total} live hotels available in Dubai.`);
        console.log('Live rates and inventory are now flowing to telitrip.com.');
      } else {
        console.log('\n⏳ Authentication is working (HTTP 200), but contract mapping is still pending.');
        console.log('Bedsonline operations has not yet linked your Agency Office Code to this API Key.');
        console.log('Once they reply to your email, run this script again to confirm.');
      }
    } else {
      console.log('API returned an error:', res.body);
    }
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

checkActivation();
