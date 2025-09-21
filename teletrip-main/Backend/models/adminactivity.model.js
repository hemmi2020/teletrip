const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');





// Admin Activity Log Model
const adminActivitySchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created', 'user_updated', 'user_deleted', 'user_blocked', 'user_unblocked',
      'booking_viewed', 'booking_updated', 'booking_cancelled', 'booking_refunded',
      'payment_viewed', 'payment_refunded', 'payment_investigated',
      'hotel_added', 'hotel_updated', 'hotel_deleted',
      'system_settings_updated', 'admin_login', 'admin_logout',
      'report_generated', 'export_data'
    ]
  },
  target: {
    type: String, // 'user', 'booking', 'payment', 'hotel', 'system'
    required: true
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

const AdminActivity = mongoose.model('AdminActivity', adminActivitySchema);

module.exports = AdminActivity;