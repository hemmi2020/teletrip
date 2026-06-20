/**
 * Certification Logger
 * Captures full Hotelbeds API request/response logs for certification purposes.
 * Stores the last N API interactions in memory (no DB required).
 * Access via GET /api/admin/certification-logs
 */

const MAX_LOGS = 50;
const logs = [];

function addLog(entry) {
  logs.push({
    ...entry,
    timestamp: new Date().toISOString()
  });
  // Keep only last N entries
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
}

function getLogs() {
  return [...logs];
}

function clearLogs() {
  logs.length = 0;
}

module.exports = { addLog, getLogs, clearLogs };
