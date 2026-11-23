const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');





// Admin Activity Log Model
const adminActivitySchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  target: {
    type: String, // 'user', 'booking', 'payment', 'hotel', 'markup', 'coupon', 'cms', 'system'
    required: true,
    trim: true
  },
  targetId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  metadata: {
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    reason: String
  }
}, {
  timestamps: true
});

adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ target: 1, createdAt: -1 });
adminActivitySchema.index({ admin: 1, createdAt: -1 });

const AdminActivity = mongoose.model('AdminActivity', adminActivitySchema);

module.exports = AdminActivity;