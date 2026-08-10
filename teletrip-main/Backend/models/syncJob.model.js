const mongoose = require('mongoose');

const SyncJobSchema = new mongoose.Schema({
  jobType: { type: String, enum: ['hotel_content_full', 'hotel_index'], required: true },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  totalItems: { type: Number, default: 0 },
  processedItems: { type: Number, default: 0 },
  failedItems: { type: Number, default: 0 },
  currentFrom: { type: Number, default: 1 },
  batchSize: { type: Number, default: 1000 },
  message: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  logs: [{ message: String, timestamp: { type: Date, default: Date.now } }]
}, { timestamps: true });

module.exports = mongoose.model('SyncJob', SyncJobSchema);
