/**
 * Hotel Mapping Generator for Hotelbeds Certification
 * 
 * Downloads hotel portfolio and writes mapping CSV incrementally
 * to avoid memory issues with 284K+ hotels.
 * 
 * Usage: node scripts/generateHotelMapping.js SECRET
 */

require('dotenv').config();
const crypto = require('crypto');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const LIVE_API_KEY = 'ca3234ad417063365e931187b2957d16';
const LIVE_SECRET = process.argv[2] || process.env.HOTELBEDS_LIVE_SECRET || process.env.HOTELBEDS_SECRET || '018e478aa6';
const CONTENT_BASE_URL = 'https://api.hotelbeds.com/hotel-content-api/1.0';
const OUTPUT_PATH = path.join(__dirname, '..', 'hotel_mapping.csv');

function generateSignature(apiKey, secret, timestamp) {
  return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

async function fetchHotels(from, to) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(LIVE_API_KEY, LIVE_SECRET, timestamp);

  // Only request code and countryCode to minimize memory usage
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
  console.log(`Using API key: ${LIVE_API_KEY.substring(0, 8)}...`);
  console.log(`Output: ${OUTPUT_PATH}\n`);

  // Write CSV header
  fs.writeFileSync(OUTPUT_PATH, 'Client Hotel Code,Hotelbeds Hotel Code,IsActive\n', 'utf8');

  let from = 1;
  const batchSize = 1000;
  let totalWritten = 0;
  let totalInPortfolio = 0;

  try {
    // First request to get total count
    console.log(`Fetching first batch (1-${batchSize})...`);
    const firstBatch = await fetchHotels(from, from + batchSize - 1);
    totalInPortfolio = firstBatch.total || 0;
    console.log(`Total hotels in portfolio: ${totalInPortfolio}\n`);

    // Write first batch
    if (firstBatch.hotels && firstBatch.hotels.length > 0) {
      const rows = firstBatch.hotels.map(h => `${h.code},${h.code},1`).join('\n') + '\n';
      fs.appendFileSync(OUTPUT_PATH, rows, 'utf8');
      totalWritten += firstBatch.hotels.length;
      console.log(`  Written: ${totalWritten}/${totalInPortfolio} (${Math.round(totalWritten/totalInPortfolio*100)}%)`);
    }

    // Free memory
    firstBatch.hotels = null;

    // Fetch and write remaining batches
    from += batchSize;
    while (from <= totalInPortfolio) {
      const to = Math.min(from + batchSize - 1, totalInPortfolio);
      
      try {
        const batch = await fetchHotels(from, to);
        if (batch.hotels && batch.hotels.length > 0) {
          const rows = batch.hotels.map(h => `${h.code},${h.code},1`).join('\n') + '\n';
          fs.appendFileSync(OUTPUT_PATH, rows, 'utf8');
          totalWritten += batch.hotels.length;
          
          if (totalWritten % 10000 === 0 || from + batchSize > totalInPortfolio) {
            console.log(`  Written: ${totalWritten}/${totalInPortfolio} (${Math.round(totalWritten/totalInPortfolio*100)}%)`);
          }
        }
        // Free memory immediately
        batch.hotels = null;
      } catch (err) {
        console.error(`  Error batch ${from}-${to}: ${err.message}. Skipping...`);
      }

      from += batchSize;
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`\n✅ Mapping complete!`);
    console.log(`   Hotels written: ${totalWritten}`);
    console.log(`   File: ${OUTPUT_PATH}`);
    console.log(`\n   Next: run 'node scripts/fillMappingExcel.js' to create the Excel file.`);

  } catch (error) {
    console.error('\nFatal error:', error.message);
    console.log(`\nPartial data saved. Hotels written so far: ${totalWritten}`);
    process.exit(1);
  }
}

main();
