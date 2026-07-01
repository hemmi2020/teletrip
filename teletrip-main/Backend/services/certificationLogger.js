/**
 * Certification Logger
 * Captures full Hotelbeds API request/response logs for certification purposes.
 * Persisted in MongoDB so logs survive server restarts/redeploys — Render's
 * process memory AND local filesystem are both ephemeral without a paid
 * persistent disk add-on, so a durable store (the database) is required.
 * Access via GET /api/admin/certification-logs
 */

const CertificationLog = require('../models/certificationLog.model');

const MAX_LOGS = 200;

async function addLog(entry) {
  try {
    await CertificationLog.create({
      step: entry.step,
      request: entry.request,
      response: entry.response,
      timestamp: new Date()
    });

    // Trim collection to last MAX_LOGS entries (best-effort, non-blocking)
    const count = await CertificationLog.countDocuments();
    if (count > MAX_LOGS) {
      const excess = count - MAX_LOGS;
      const oldest = await CertificationLog.find().sort({ timestamp: 1 }).limit(excess).select('_id');
      await CertificationLog.deleteMany({ _id: { $in: oldest.map(o => o._id) } });
    }
  } catch (err) {
    console.error('certificationLogger: failed to persist log entry:', err.message);
  }
}

async function getLogs() {
  try {
    const docs = await CertificationLog.find().sort({ timestamp: 1 }).lean();
    return docs.map(({ _id, __v, ...rest }) => rest);
  } catch (err) {
    console.error('certificationLogger: failed to read logs:', err.message);
    return [];
  }
}

async function clearLogs() {
  try {
    await CertificationLog.deleteMany({});
  } catch (err) {
    console.error('certificationLogger: failed to clear logs:', err.message);
  }
}

module.exports = { addLog, getLogs, clearLogs };
