/**
 * Hotel Mapping Generator for Hotelbeds Certification
 * 
 * Uses the LIVE Content API key provided by Hotelbeds to download their
 * full hotel portfolio and generate the mapping confirmation file.
 * 
 * Usage: node scripts/generateHotelMapping.js
 * 
 * The Live Content API key: ca3234ad417063365e931187b2957d16
 * (provided by Hotelbeds specifically for this mapping exercise)
 */

require('dotenv').config();
const crypto = require('crypto');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Live Content API credentials (provided by Hotelbeds for mapping)
const LIVE_API_KEY = 'ca3234ad417063365e931187b2957d16';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
const CONTENT_BASE_URL = 'https://api.hotelbeds.com/hotel-content-api/1.0';

function generateSignature(apiKey, secret, timestamp) {
  return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

async function fetchHotels(from, to) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(LIVE_API_KEY, HOTELBEDS_SECRET, timestamp);

  const url = `${CONTENT_BASE_URL}/hotels?fields=all&language=ENG&from=${from}&to=${to}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Api-key': LIVE_API_KEY,
      'X-Signature': signature,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip'
    },
    timeout: 120000
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text.substring(0, 200)}`);
  }

  return response.json();
}

async function main() {
  console.log('=== Hotelbeds Hotel Mapping Generator ===\n');
  console.log('Fetching hotel portfolio from LIVE Content API...\n');

  let allHotels = [];
  let from = 1;
  const batchSize = 1000;
  let total = 0;

  try {
    // First request to get total count
    const firstBatch = await fetchHotels(from, from + batchSize - 1);
    total = firstBatch.total || 0;
    allHotels = firstBatch.hotels || [];
    console.log(`Total hotels in portfolio: ${total}`);
    console.log(`Fetched batch 1: ${allHotels.length} hotels (${from}-${from + batchSize - 1})`);

    // Fetch remaining batches
    from += batchSize;
    while (from <= total) {
      const to = Math.min(from + batchSize - 1, total);
      console.log(`Fetching batch: ${from}-${to}...`);
      
      try {
        const batch = await fetchHotels(from, to);
        if (batch.hotels) {
          allHotels = allHotels.concat(batch.hotels);
        }
      } catch (err) {
        console.error(`  Error fetching ${from}-${to}: ${err.message}. Continuing...`);
      }
      
      from += batchSize;
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\nTotal hotels fetched: ${allHotels.length}`);

    // Generate CSV mapping file
    const outputPath = path.join(__dirname, '..', 'hotel_mapping.csv');
    const header = 'HotelbedsCode,YourHotelCode,HotelName,CountryCode,DestinationCode,IsActive\n';
    
    const rows = allHotels.map(hotel => {
      const code = hotel.code || '';
      const name = (hotel.name?.content || '').replace(/,/g, ' ').replace(/"/g, "'");
      const country = hotel.countryCode || '';
      const destination = hotel.destinationCode || '';
      // Since Hotelbeds is the unique supplier, both columns get the same code
      // IsActive = 1 (all hotels active for sale)
      return `${code},${code},"${name}",${country},${destination},1`;
    });

    fs.writeFileSync(outputPath, header + rows.join('\n'), 'utf8');
    console.log(`\n✅ Mapping file generated: ${outputPath}`);
    console.log(`   Total hotels mapped: ${rows.length}`);
    console.log(`\nNote: Copy this data into the Excel template provided by Hotelbeds.`);
    console.log('Set the same hotel code in both "hotel" columns (Hotelbeds is your unique supplier).');

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
