/**
 * Hotelbeds Content Sync Service
 * 
 * Reusable service for syncing hotel static data from Hotelbeds Content API.
 * Can be called from CLI scripts or HTTP endpoints.
 */

const mongoose = require('mongoose');
const { getHotelsBulk } = require('./hotelbeds.content.service');
const SyncJob = require('../models/syncJob.model');

// HotelContent schema (same as in sync script)
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

// Register model only if not already registered
const HotelContent = mongoose.models.HotelContent || mongoose.model('HotelContent', HotelContentSchema);

/**
 * Run a full hotel content sync job
 * @param {Object} options
 * @param {string} options.jobId - Existing SyncJob ID (optional)
 * @param {number} options.batchSize - Hotels per API call (default 100)
 * @param {number} options.delayMs - Delay between batches in ms (default 3000)
 * @param {function} options.onProgress - Callback(current, total, message)
 * @returns {Promise<Object>} Sync result
 */
async function runHotelContentSync(options = {}) {
  const { jobId, batchSize = 100, delayMs = 3000, onProgress } = options;

  let job;
  if (jobId) {
    job = await SyncJob.findById(jobId);
    if (!job) throw new Error(`SyncJob ${jobId} not found`);
  } else {
    job = await SyncJob.create({
      jobType: 'hotel_content_full',
      status: 'pending',
      batchSize,
      logs: [{ message: 'Job created' }]
    });
  }

  // Update job to running
  job.status = 'running';
  job.startedAt = new Date();
  job.logs.push({ message: 'Sync started' });
  await job.save();

  let from = job.currentFrom || 1;
  let totalSynced = job.processedItems || 0;
  let totalFailed = job.failedItems || 0;
  let totalInPortfolio = job.totalItems || 0;
  let consecutiveEmptyBatches = 0;
  const MAX_EMPTY_BATCHES = 10; // Stop after 10 empty batches in a row

  try {
    // If we don't know total yet, fetch first batch
    if (totalInPortfolio === 0) {
      console.log(`[SyncService] Fetching first batch: ${from}-${from + batchSize - 1}`);
      const firstResult = await getHotelsBulk(from, from + batchSize - 1);
      totalInPortfolio = firstResult.total || 0;
      job.totalItems = totalInPortfolio;
      job.logs.push({ message: `Total hotels in portfolio: ${totalInPortfolio}` });
      await job.save();

      if (firstResult.hotels.length > 0) {
        await upsertHotels(firstResult.hotels);
        totalSynced += firstResult.hotels.length;
        job.processedItems = totalSynced;
        await job.save();
        consecutiveEmptyBatches = 0;
        if (onProgress) onProgress(totalSynced, totalInPortfolio, `Synced batch ${from}-${from + batchSize - 1}`);
        console.log(`[SyncService] First batch synced: ${firstResult.hotels.length} hotels`);
      } else {
        consecutiveEmptyBatches++;
        console.log(`[SyncService] First batch empty. Consecutive empty: ${consecutiveEmptyBatches}`);
      }
      from += batchSize;
    }

    // Continue syncing remaining batches
    // Safety cap: don't iterate beyond a reasonable max code range
    const MAX_CODE_RANGE = 999999;
    while (from <= Math.min(totalInPortfolio, MAX_CODE_RANGE)) {
      const to = Math.min(from + batchSize - 1, totalInPortfolio, MAX_CODE_RANGE);

      console.log(`[SyncService] Fetching batch: ${from}-${to}`);

      try {
        const result = await getHotelsBulk(from, to);
        
        if (result.hotels.length > 0) {
          await upsertHotels(result.hotels);
          totalSynced += result.hotels.length;
          job.processedItems = totalSynced;
          job.currentFrom = from + batchSize;
          job.logs.push({ message: `Synced batch ${from}-${to} (${totalSynced}/${totalInPortfolio})` });
          await job.save();
          if (onProgress) onProgress(totalSynced, totalInPortfolio, `Synced batch ${from}-${to}`);
          console.log(`[SyncService] Batch ${from}-${to} synced: ${result.hotels.length} hotels (total: ${totalSynced})`);
          consecutiveEmptyBatches = 0;
        } else {
          consecutiveEmptyBatches++;
          job.logs.push({ message: `Empty batch ${from}-${to} (${consecutiveEmptyBatches}/${MAX_EMPTY_BATCHES} consecutive)` });
          await job.save();
          console.log(`[SyncService] Batch ${from}-${to} empty. Consecutive empty: ${consecutiveEmptyBatches}/${MAX_EMPTY_BATCHES}`);
          
          // If too many empty batches, jump ahead to find hotels faster
          if (consecutiveEmptyBatches >= MAX_EMPTY_BATCHES) {
            const jump = batchSize * 10;
            console.log(`[SyncService] Too many empty batches. Jumping ahead by ${jump}...`);
            job.logs.push({ message: `Jumping ahead by ${jump} due to empty batches` });
            await job.save();
            from += jump;
            consecutiveEmptyBatches = 0;
            continue;
          }
        }
      } catch (err) {
        totalFailed += batchSize;
        job.failedItems = totalFailed;
        job.logs.push({ message: `Error batch ${from}-${to}: ${err.message}`, timestamp: new Date() });
        await job.save();
        console.error(`[SyncService] Error batch ${from}-${to}:`, err.message);
      }

      from += batchSize;
      if (from <= totalInPortfolio && from <= MAX_CODE_RANGE) {
        await sleep(delayMs);
      }
    }

    job.status = 'completed';
    job.completedAt = new Date();
    job.message = `Sync complete. Total: ${totalSynced}, Failed: ${totalFailed}`;
    job.logs.push({ message: `Sync complete. Total: ${totalSynced}, Failed: ${totalFailed}` });
    await job.save();

    console.log(`[SyncService] Sync complete. Total synced: ${totalSynced}, Failed: ${totalFailed}`);

    return {
      success: true,
      jobId: job._id,
      totalSynced,
      totalFailed,
      totalInPortfolio
    };
  } catch (error) {
    job.status = 'failed';
    job.errorMessage = error.message;
    job.logs.push({ message: `Fatal error: ${error.message}` });
    await job.save();
    console.error(`[SyncService] Fatal error:`, error.message);
    throw error;
  }
}

/**
 * Get the latest sync job status
 */
async function getLatestSyncStatus() {
  const job = await SyncJob.findOne({ jobType: 'hotel_content_full' })
    .sort({ createdAt: -1 })
    .lean();
  return job;
}

/**
 * Get all sync jobs with pagination
 */
async function getSyncJobs(limit = 10) {
  return SyncJob.find({ jobType: 'hotel_content_full' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  runHotelContentSync,
  getLatestSyncStatus,
  getSyncJobs,
  HotelContent
};
