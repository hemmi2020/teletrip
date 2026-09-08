/**
 * Hotelbeds Static Content Service
 *
 * Downloads non-hotel master data from the Hotelbeds Content API:
 *   destinations, countries, states, boards, categories, chains,
 *   accommodation types, issues, facility groups, room types, segments.
 *
 * Recommended by Hotelbeds certification ("Automatically download the static
 * data provided with our content api service is recommended").
 *
 * Reuses the same signature authentication and retry pattern as
 * hotelbeds.content.service.js. Content API is NOT MTLS-gated (MTLS applies
 * to the booking flow only).
 *
 * Can be called from CLI scripts (scripts/syncStaticContent.js) or HTTP
 * endpoints (admindashboard.controller.js).
 */

const crypto = require('crypto');
const SyncJob = require('../models/syncJob.model');

const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6';
// Content API uses the regular test endpoint — MTLS is only required for the booking flow
const CONTENT_BASE_URL = process.env.HOTELBEDS_CONTENT_URL || 'https://api.test.hotelbeds.com/hotel-content-api/1.0';

const StaticContent = require('../models/staticContent.model');

/**
 * All supported static content types.
 * key   → short name used in DB `type` field and API filters
 * path  → Content API resource path
 * field → top-level array key in the JSON response
 */
const STATIC_CONTENT_TYPES = {
  destinations:   { path: '/locations/destinations', field: 'destinations' },
  countries:      { path: '/locations/countries',    field: 'countries' },
  states:         { path: '/locations/states',       field: 'states' },
  boards:         { path: '/types/boards',           field: 'boards' },
  categories:     { path: '/types/categories',       field: 'categories' },
  chains:         { path: '/types/chains',           field: 'chains' },
  accommodations: { path: '/types/accommodations',   field: 'accommodations' },
  issues:         { path: '/types/issues',           field: 'issues' },
  facilitygroups: { path: '/types/facilitygroups',   field: 'facilityGroups' },
  roomtypes:      { path: '/types/rooms',            field: 'rooms' },
  segments:       { path: '/types/segments',         field: 'segments' }
};

const DEFAULT_PAGE_SIZE = 1000;
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 30000;

function generateSignature(apiKey, secret, timestamp) {
  return crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithRetry(url, options = {}, { retries = MAX_RETRIES, baseDelay = 1500, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      if (response.status === 429) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[StaticContent] Rate limited (429), retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`[StaticContent] Request failed (${err.name === 'AbortError' ? 'timeout' : err.message}), retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
      await sleep(delay);
    }
  }
  throw lastError || new Error(`Failed after ${retries} retries`);
}

/**
 * Fetch one page of a static content type.
 * @returns {{ items: Array, total: number }}
 */
async function fetchStaticContentPage(typeKey, from = 1, to = DEFAULT_PAGE_SIZE, language = 'ENG') {
  const def = STATIC_CONTENT_TYPES[typeKey];
  if (!def) throw new Error(`Unknown static content type: ${typeKey}`);

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

  const url = `${CONTENT_BASE_URL}${def.path}?language=${language}&from=${from}&to=${to}`;
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Api-key': HOTELBEDS_API_KEY,
      'X-Signature': signature,
      'Accept': 'application/json'
    }
  }, { retries: MAX_RETRIES, baseDelay: 1500, timeoutMs: REQUEST_TIMEOUT_MS });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Content API error ${response.status} for ${typeKey}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  return {
    items: Array.isArray(data[def.field]) ? data[def.field] : [],
    total: data.total || 0,
    from: data.from || from,
    to: data.to || to
  };
}

async function upsertStaticItems(typeKey, items) {
  if (!items.length) return 0;
  const now = new Date();
  const ops = items.map(item => ({
    updateOne: {
      filter: { type: typeKey, code: String(item.code) },
      update: {
        $set: {
          type: typeKey,
          code: String(item.code),
          data: item,
          lastSynced: now
        }
      },
      upsert: true
    }
  }));
  const result = await StaticContent.bulkWrite(ops, { ordered: false });
  return result.upsertedCount + (result.modifiedCount || 0);
}

const MAX_LOG_ENTRIES = 100;

async function saveJobTrimmed(job) {
  if (job.logs && job.logs.length > MAX_LOG_ENTRIES) {
    job.logs = job.logs.slice(-MAX_LOG_ENTRIES);
  }
  await job.save();
}

/**
 * Run a full static content sync job.
 *
 * @param {Object}  options
 * @param {string}  [options.jobId]        - Existing SyncJob ID to resume
 * @param {Array}   [options.types]        - Subset of type keys (default: all)
 * @param {number}  [options.pageSize]     - Items per API call (default 1000, API max)
 * @param {number}  [options.delayMs]      - Delay between API calls (default 1000)
 * @param {function} [options.onProgress]  - Callback(typeKey, synced, total, message)
 * @returns {Promise<{jobId, totalSynced, totalFailed, types: Object}>}
 */
async function runStaticContentSync(options = {}) {
  const {
    jobId,
    types = Object.keys(STATIC_CONTENT_TYPES),
    pageSize = DEFAULT_PAGE_SIZE,
    delayMs = 1000,
    onProgress
  } = options;

  let job;
  if (jobId) {
    job = await SyncJob.findById(jobId);
    if (!job) throw new Error(`SyncJob ${jobId} not found`);
  } else {
    job = await SyncJob.create({
      jobType: 'static_content_full',
      status: 'pending',
      batchSize: pageSize,
      logs: [{ message: `Static content sync created for types: ${types.join(', ')}` }]
    });
  }

  job.status = 'running';
  job.startedAt = new Date();
  job.lastActivityAt = new Date();
  job.logs.push({ message: 'Static content sync started' });
  await saveJobTrimmed(job);

  const perType = {};
  let totalSynced = 0;
  let totalFailed = 0;

  try {
    for (const typeKey of types) {
      const def = STATIC_CONTENT_TYPES[typeKey];
      const typeState = { synced: 0, failed: 0, total: 0 };
      perType[typeKey] = typeState;

      job.logs.push({ message: `Syncing ${typeKey} from ${def.path}` });
      await saveJobTrimmed(job);

      let from = 1;
      let firstPage = true;

      while (firstPage || from <= typeState.total) {
        const to = from + pageSize - 1;
        try {
          const page = await fetchStaticContentPage(typeKey, from, to);
          if (firstPage) {
            typeState.total = page.total;
            job.totalItems += page.total;
            await saveJobTrimmed(job);
            console.log(`[StaticContent] ${typeKey}: total ${page.total} items`);
            firstPage = false;
          }
          await upsertStaticItems(typeKey, page.items);
          typeState.synced += page.items.length;
          totalSynced += page.items.length;
          job.processedItems = totalSynced;
          job.logs.push({ message: `${typeKey}: synced ${typeState.synced}/${typeState.total}` });
          await saveJobTrimmed(job);
          if (onProgress) onProgress(typeKey, typeState.synced, typeState.total, `Synced ${typeKey}`);
        } catch (err) {
          typeState.failed += pageSize;
          totalFailed += pageSize;
          job.failedItems = totalFailed;
          job.logs.push({ message: `Error ${typeKey} ${from}-${to}: ${err.message}`, timestamp: new Date() });
          console.error(`[StaticContent] Error ${typeKey} ${from}-${to}:`, err.message);
          await saveJobTrimmed(job);
        }
        from += pageSize;
        if (from <= typeState.total) await sleep(delayMs);
      }

      console.log(`[StaticContent] ${typeKey} done: ${typeState.synced}/${typeState.total}`);
    }

    job.status = 'completed';
    job.completedAt = new Date();
    job.lastActivityAt = new Date();
    job.message = `Static content sync complete. Total: ${totalSynced}, Failed: ${totalFailed}`;
    job.logs.push({ message: job.message });
    await saveJobTrimmed(job);

    return { success: true, jobId: job._id, totalSynced, totalFailed, types: perType };
  } catch (error) {
    job.status = 'failed';
    job.errorMessage = error.message;
    job.lastActivityAt = new Date();
    job.logs.push({ message: `Fatal error: ${error.message}` });
    await saveJobTrimmed(job);
    console.error('[StaticContent] Fatal error:', error.message);
    throw error;
  }
}

/**
 * Get the latest static content sync job status
 */
async function getLatestStaticSyncStatus() {
  return SyncJob.findOne({ jobType: 'static_content_full' }).sort({ createdAt: -1 }).lean();
}

/**
 * Get per-type document counts from the local store
 */
async function getStaticContentCounts() {
  const counts = await StaticContent.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, lastSynced: { $max: '$lastSynced' } } }
  ]);
  const result = {};
  for (const c of counts) {
    result[c._id] = { count: c.count, lastSynced: c.lastSynced };
  }
  return result;
}

module.exports = {
  STATIC_CONTENT_TYPES,
  fetchStaticContentPage,
  runStaticContentSync,
  getLatestStaticSyncStatus,
  getStaticContentCounts
};
