const mongoose = require('mongoose');

/**
 * Stores Hotelbeds API request/response pairs for certification purposes.
 * Persisted in MongoDB so entries survive server restarts/redeploys
 * (Render's filesystem and process memory are both ephemeral without a
 * paid persistent disk add-on).
 */
const certificationLogSchema = new mongoose.Schema({
  step: {
    type: String,
    required: true,
    index: true
  },
  request: {
    type: mongoose.Schema.Types.Mixed
  },
  response: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

const CertificationLog = mongoose.model('CertificationLog', certificationLogSchema);
module.exports = CertificationLog;
