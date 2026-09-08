/**
 * Hotelbeds Static Content Sync (CLI)
 *
 * Downloads all non-hotel master data from the Hotelbeds Content API and
 * stores it in MongoDB. Recommended to run weekly or after Hotelbeds content
 * updates.
 *
 * Usage:
 *   node scripts/syncStaticContent.js                     # sync all types
 *   node scripts/syncStaticContent.js boards,chains,segments   # sync subset
 *   node scripts/syncStaticContent.js --types=boards,chains    # sync subset
 *   node scripts/syncStaticContent.js --status               # show local counts only
 */

require('dotenv').config();
const mongoose = require('mongoose');
const {
  STATIC_CONTENT_TYPES,
  runStaticContentSync,
  getStaticContentCounts
} = require('../services/hotelbeds.staticcontent.service');

function parseArgs() {
  const args = process.argv.slice(2);
  const types = [];
  let statusOnly = false;

  for (const arg of args) {
    if (arg === '--status') {
      statusOnly = true;
    } else if (arg.startsWith('--types=')) {
      types.push(...arg.replace('--types=', '').split(',').map(s => s.trim()).filter(Boolean));
    } else if (!arg.startsWith('--')) {
      types.push(...arg.split(',').map(s => s.trim()).filter(Boolean));
    }
  }

  return { types: types.length ? types : Object.keys(STATIC_CONTENT_TYPES), statusOnly };
}

async function main() {
  console.log('=== Hotelbeds Static Content Sync (CLI) ===\n');

  const dbUri = process.env.DB_CONNECT;
  if (!dbUri) {
    console.error('DB_CONNECT not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(dbUri);
  console.log('Connected to database.\n');

  const { types, statusOnly } = parseArgs();

  if (statusOnly) {
    const counts = await getStaticContentCounts();
    console.log('Local static content counts:');
    for (const key of Object.keys(STATIC_CONTENT_TYPES)) {
      const c = counts[key];
      console.log(`  ${key.padEnd(16)} ${c ? c.count : 0}${c ? ` (last synced: ${c.lastSynced})` : ''}`);
    }
    await mongoose.disconnect();
    process.exit(0);
  }

  // Validate requested types
  const invalid = types.filter(t => !STATIC_CONTENT_TYPES[t]);
  if (invalid.length) {
    console.error(`Unknown content type(s): ${invalid.join(', ')}`);
    console.error(`Valid types: ${Object.keys(STATIC_CONTENT_TYPES).join(', ')}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Syncing types: ${types.join(', ')}\n`);

  try {
    const result = await runStaticContentSync({
      types,
      pageSize: 1000,
      delayMs: 1000,
      onProgress: (typeKey, synced, total, message) => {
        console.log(`  ${message} — ${synced}/${total}`);
      }
    });

    console.log('\n✅ Static content sync complete.');
    console.log(`   Total synced: ${result.totalSynced}`);
    if (result.totalFailed > 0) {
      console.log(`⚠️  Failed items: ${result.totalFailed}`);
    }
    for (const [key, state] of Object.entries(result.types)) {
      console.log(`   ${key.padEnd(16)} ${state.synced}/${state.total}${state.failed ? ` (${state.failed} failed)` : ''}`);
    }
  } catch (error) {
    console.error('\n❌ Static content sync failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
}

main();
