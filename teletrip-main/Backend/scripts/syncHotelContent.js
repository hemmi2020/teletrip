/**
 * Hotelbeds Static Content Sync
 * 
 * Downloads all hotel static data from Hotelbeds Content API and stores
 * it in MongoDB for fast local access. Recommended to run weekly or daily.
 * 
 * Usage: node scripts/syncHotelContent.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { getHotelsBulk } = require('../services/hotelbeds.content.service');

// Simple schema for cached hotel content
const HotelContentSchema = new mongoose.Schema({
  code: { type: Number, required: true, unique: true, index: true },
  name: String,
  description: String,
  address: mongoose.Schema.Types.Mixed,
  city: String,
  postalCode: String,
  countryCode: String,
  stateCode: String,
  destinationCode: String,
  phones: [{ phoneNumber: String, phoneType: String }],
  email: String,
  web: String,
  categoryCode: String,
  categoryGroupCode: String,
  accommodationTypeCode: String,
  facilities: [{ code: Number, groupCode: Number, description: String }],
  images: [{ path: String, type: String }],
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

const HotelContent = mongoose.model('HotelContent', HotelContentSchema);

async function main() {
  console.log('=== Hotelbeds Static Content Sync ===\n');
  
  const dbUri = process.env.DB_CONNECT;
  if (!dbUri) {
    console.error('DB_CONNECT not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(dbUri);
  console.log('Connected to database.\n');

  let from = 1;
  const batchSize = 1000;
  let totalSynced = 0;
  let totalInPortfolio = 0;

  try {
    // First batch to get total
    console.log(`Fetching hotels ${from}-${from + batchSize - 1}...`);
    const firstResult = await getHotelsBulk(from, from + batchSize - 1);
    totalInPortfolio = firstResult.total || 0;
    console.log(`Total hotels in portfolio: ${totalInPortfolio}\n`);

    if (firstResult.hotels.length > 0) {
      await upsertHotels(firstResult.hotels);
      totalSynced += firstResult.hotels.length;
      console.log(`  Synced: ${totalSynced}/${totalInPortfolio}`);
    }

    from += batchSize;

    while (from <= totalInPortfolio) {
      const to = Math.min(from + batchSize - 1, totalInPortfolio);
      console.log(`Fetching hotels ${from}-${to}...`);
      
      try {
        const result = await getHotelsBulk(from, to);
        if (result.hotels.length > 0) {
          await upsertHotels(result.hotels);
          totalSynced += result.hotels.length;
          console.log(`  Synced: ${totalSynced}/${totalInPortfolio}`);
        }
      } catch (err) {
        console.error(`  Error batch ${from}-${to}: ${err.message}`);
      }

      from += batchSize;
      // Rate limit - wait 2 seconds between batches
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n✅ Sync complete. Total hotels synced: ${totalSynced}`);
  } catch (error) {
    console.error('Sync error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function upsertHotels(hotels) {
  const ops = hotels.map(h => ({
    updateOne: {
      filter: { code: h.code },
      update: {
        $set: {
          code: h.code,
          name: h.name?.content || '',
          description: h.description?.content || '',
          address: h.address || {},
          city: h.city?.content || '',
          postalCode: h.postalCode || '',
          countryCode: h.countryCode || '',
          stateCode: h.stateCode || '',
          destinationCode: h.destinationCode || '',
          phones: (h.phones || []).map(p => ({ phoneNumber: p.phoneNumber, phoneType: p.phoneType })),
          email: h.email || '',
          web: h.web || '',
          categoryCode: h.categoryCode || '',
          categoryGroupCode: h.categoryGroupCode || '',
          accommodationTypeCode: h.accommodationTypeCode || '',
          facilities: (h.facilities || []).slice(0, 100).map(f => ({
            code: f.facilityCode,
            groupCode: f.facilityGroupCode,
            description: f.description?.content || ''
          })),
          images: (h.images || []).slice(0, 20).map(img => ({
            path: img.path,
            type: img.type?.description?.content || img.imageTypeCode || ''
          })),
          lastSynced: new Date()
        }
      },
      upsert: true
    }
  }));

  await HotelContent.bulkWrite(ops, { ordered: false });
}

main();
