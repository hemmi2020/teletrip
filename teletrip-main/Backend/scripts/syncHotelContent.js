/**
 * Hotelbeds Static Content Sync (CLI)
 * 
 * Downloads all hotel static data from Hotelbeds Content API and stores
 * it in MongoDB for fast local access. Recommended to run weekly or daily.
 * 
 * Usage: node scripts/syncHotelContent.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { runHotelContentSync } = require('../services/hotelSync.service');

async function main() {
  console.log('=== Hotelbeds Static Content Sync (CLI) ===\n');

  const dbUri = process.env.DB_CONNECT;
  if (!dbUri) {
    console.error('DB_CONNECT not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(dbUri);
  console.log('Connected to database.\n');

  try {
    const result = await runHotelContentSync({
      batchSize: 1000,
      delayMs: 2000,
      onProgress: (current, total, message) => {
        console.log(`  ${message} — ${current}/${total}`);
      }
    });

    console.log(`\n✅ Sync complete. Total hotels synced: ${result.totalSynced}`);
    if (result.totalFailed > 0) {
      console.log(`⚠️  Failed batches: ${result.totalFailed}`);
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
