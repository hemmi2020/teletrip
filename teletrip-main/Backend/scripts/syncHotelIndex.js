/**
 * Sync Hotel Name Index from Hotelbeds Content API
 * 
 * Downloads only hotel code, name, and destination info (minimal data)
 * for fast autocomplete/search. Much lighter than full content sync.
 * 
 * Usage: node scripts/syncHotelIndex.js [SECRET]
 */

require('dotenv').config();
const crypto = require('crypto');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const HotelIndex = require('../models/hotelIndex.model');

const API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const SECRET = process.argv[2] || process.env.HOTELBEDS_SECRET || '018e478aa6';
const BASE_URL = process.env.HOTELBEDS_BASE_URL?.includes('mtls') 
  ? 'https://api-mtls.test.hotelbeds.com' 
  : 'https://api.test.hotelbeds.com';

function sig(k, s, t) {
  return crypto.createHash('sha256').update(k + s + t).digest('hex');
}

async function fetchBatch(from, to) {
  const t = Math.floor(Date.now() / 1000);
  const s = sig(API_KEY, SECRET, t);
  
  const url = `${BASE_URL}/hotel-content-api/1.0/hotels?fields=code,name,destinationCode,countryCode,categoryCode,categoryGroupCode,zoneCode&language=ENG&from=${from}&to=${to}`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Api-key': API_KEY, 'X-Signature': s, 'Accept': 'application/json' },
    timeout: 60000
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function main() {
  console.log('=== Hotel Name Index Sync ===\n');

  if (!process.env.DB_CONNECT) {
    console.error('DB_CONNECT not set');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_CONNECT);
  console.log('Connected to DB\n');

  let from = 1;
  const batchSize = 1000;
  let total = 0;
  let synced = 0;

  try {
    const first = await fetchBatch(from, batchSize);
    total = first.total || 0;
    console.log(`Total hotels: ${total}\n`);

    if (first.hotels?.length > 0) {
      await upsert(first.hotels);
      synced += first.hotels.length;
      console.log(`  ${synced}/${total}`);
    }

    from += batchSize;
    while (from <= total) {
      try {
        const batch = await fetchBatch(from, Math.min(from + batchSize - 1, total));
        if (batch.hotels?.length > 0) {
          await upsert(batch.hotels);
          synced += batch.hotels.length;
          if (synced % 10000 < 1000) console.log(`  ${synced}/${total}`);
        }
      } catch (e) {
        console.error(`  Error at ${from}: ${e.message}`);
      }
      from += batchSize;
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n✅ Done. Synced: ${synced} hotels`);
  } catch (e) {
    console.error('Fatal:', e.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function upsert(hotels) {
  const ops = hotels.map(h => ({
    updateOne: {
      filter: { code: h.code },
      update: {
        $set: {
          code: h.code,
          name: h.name?.content || '',
          destinationCode: h.destinationCode || '',
          countryCode: h.countryCode || '',
          categoryCode: h.categoryCode || '',
          zoneCode: h.zoneCode || null
        }
      },
      upsert: true
    }
  }));
  await HotelIndex.bulkWrite(ops, { ordered: false });
}

main();
