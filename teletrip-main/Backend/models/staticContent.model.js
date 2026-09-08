const mongoose = require('mongoose');

/**
 * Generic Hotelbeds static content store.
 *
 * Holds all non-hotel master data downloaded from the Hotelbeds Content API
 * (destinations, countries, states, boards, categories, chains, accommodation
 * types, issues, facility groups, room types, segments).
 *
 * One document per item, identified by the compound key (type, code).
 * Data payloads are kept as Mixed so we store the API response verbatim and
 * can enrich display logic later without re-syncing.
 */
const staticContentSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  code: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

// One document per (type, code) — codes are unique within each content type
staticContentSchema.index({ type: 1, code: 1 }, { unique: true });

const StaticContent = mongoose.models.StaticContent
  || mongoose.model('StaticContent', staticContentSchema);

module.exports = StaticContent;
