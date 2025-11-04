const mongoose = require('mongoose');

const scheduledReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    enum: ['revenue', 'user-activity', 'booking-analytics', 'custom'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  time: {
    type: String,
    required: true
  },
  recipients: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'csv', 'excel'],
    default: 'pdf'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScheduledReport', scheduledReportSchema);
