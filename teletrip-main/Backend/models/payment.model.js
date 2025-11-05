// Fixed Payment Model - models/payment.model.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const paymentSchema = new mongoose.Schema({
  // ✅ FIXED: Make paymentId required and auto-generate with unique value
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Core payment fields
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  
  bookingId: {
    type: mongoose.Schema.Types.Mixed, // Support both ObjectId (internal) and String (Hotelbeds)
    required: true,
    index: true
  },
  
  // Financial details
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value > 0;
      },
      message: 'Amount must be a valid positive number'
    }
  },
  
  currency: {
    type: String,
    required: true,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR', 'GBP'],
    uppercase: true
  },
  
  // Payment processing
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'hbl_account', 'HBLPay', 'union_pay', 'bank_transfer', 'pay_on_site'],
    default: 'credit_card'
  },
  
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'expired'],
    default: 'pending',
    index: true
  },
  
  // Gateway integration (HBLPay)
  gateway: {
    provider: {
      type: String,
      default: 'HBLPay'
    },
    sessionId: {
      type: String,
      sparse: true,
      index: true
    },
    orderRefNumber: {
      type: String,
      sparse: true,
      index: true
    },
    responseCode: String,
    responseMessage: String,
    authCode: String,
    merchantId: String,
    terminalId: String
  },
  
  // Card tokenization
  tokenization: {
    token: String,
    maskedCardNumber: String,
    cardType: String, // visa, mastercard, etc.
    expiryDate: String,
    holderName: String
  },
  
  // Billing information
  billing: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: 'PK'
      },
      postalCode: String
    }
  },
  
  // Fees and charges
  fees: {
    processingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    gatewayFee: {
      type: Number,
      default: 0,
      min: 0
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0
    },
    totalFees: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Refund information
  refund: {
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    reason: String,
    refundedAt: Date,
    refundTransactionId: String,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'cancelled']
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Important timestamps
  initiatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  completedAt: {
    type: Date,
    index: true
  },
  
  failedAt: Date,
  cancelledAt: Date,
  expiredAt: Date,
  
  // Error handling
  errorCode: String,
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Currency conversion details
  currencyConversion: {
    originalAmount: Number,
    originalCurrency: String,
    exchangeRate: Number,
    markupPerEuro: Number,
    basePKR: Number,
    markupAmount: Number,
    totalPKR: Number,
    conversionDate: Date
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String,
    location: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  },
  
  // Security and fraud prevention
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  fraudChecks: {
    cvvCheck: {
      type: String,
      enum: ['pass', 'fail', 'not_checked']
    },
    avsCheck: {
      type: String,
      enum: ['pass', 'fail', 'not_checked']
    },
    velocityCheck: {
      type: String,
      enum: ['pass', 'fail', 'not_checked']
    }
  },
  
  // Audit trail
  auditLog: [{
    action: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String
  }],
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Additional tracking
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notification tracking
  notificationsSent: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      attempts: { type: Number, default: 0 }
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      attempts: { type: Number, default: 0 }
    },
    webhook: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      attempts: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// ✅ CRITICAL: Add mongoose-paginate plugin
paymentSchema.plugin(mongoosePaginate);

// ✅ INDEXES for performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
// paymentSchema.index({ bookingId: 1 });
// paymentSchema.index({ 'gateway.sessionId': 1 }, { sparse: true });
// paymentSchema.index({ 'gateway.orderRefNumber': 1 }, { sparse: true });
// paymentSchema.index({ status: 1, createdAt: -1 });
// paymentSchema.index({ createdAt: -1 });
// paymentSchema.index({ isDeleted: 1, status: 1 });

// ✅ VIRTUALS
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: this.currency || 'PKR',
    minimumFractionDigits: 2
  }).format(this.amount);
});

paymentSchema.virtual('netAmount').get(function() {
  return this.amount + (this.fees.totalFees || 0);
});

paymentSchema.virtual('duration').get(function() {
  if (this.completedAt && this.initiatedAt) {
    return Math.round((this.completedAt - this.initiatedAt) / 1000); // in seconds
  }
  return null;
});

paymentSchema.virtual('isExpired').get(function() {
  if (this.status === 'pending' && this.expiredAt) {
    return new Date() > this.expiredAt;
  }
  return false;
});

paymentSchema.virtual('canRefund').get(function() {
  return this.status === 'completed' && !this.refund.amount;
});

paymentSchema.virtual('refundableAmount').get(function() {
  return this.amount - (this.refund.amount || 0);
});

// ✅ STATIC METHODS
paymentSchema.statics.findByPaymentId = function(paymentId) {
  return this.findOne({ paymentId, isDeleted: false });
};

paymentSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ transactionId, isDeleted: false });
};

paymentSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ 'gateway.sessionId': sessionId, isDeleted: false });
};

paymentSchema.statics.findByOrderRef = function(orderRefNumber) {
  return this.findOne({ 'gateway.orderRefNumber': orderRefNumber, isDeleted: false });
};

paymentSchema.statics.getUserPayments = function(userId, options = {}) {
  const {
    status,
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    dateFrom,
    dateTo
  } = options;
  
  const query = { userId, isDeleted: false };
  
  if (status) query.status = status;
  
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }
  
  const paginateOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: [
      {
        path: 'bookingId',
        select: 'bookingReference hotelName checkInDate checkOutDate status'
      },
      {
        path: 'userId',
        select: 'fullname email phone'
      }
    ]
  };
  
  return this.paginate(query, paginateOptions);
};

paymentSchema.statics.getPaymentStats = function(userId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: false
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        byStatus: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount',
            avgAmount: '$avgAmount'
          }
        },
        totalPayments: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' }
      }
    }
  ]);
};

paymentSchema.statics.findExpiredPayments = function(minutesAgo = 30) {
  const cutoffTime = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  return this.find({
    status: 'pending',
    initiatedAt: { $lt: cutoffTime },
    isDeleted: false
  });
};

// ✅ INSTANCE METHODS
paymentSchema.methods.addAuditLog = function(action, details = {}, userId = null) {
  this.auditLog.push({
    action,
    details,
    userId,
    timestamp: new Date(),
    ipAddress: details.ipAddress,
    userAgent: details.userAgent
  });
  return this;
};

paymentSchema.methods.updateStatus = function(newStatus, details = {}, userId = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Set appropriate timestamps
  switch (newStatus) {
    case 'completed':
      this.completedAt = new Date();
      break;
    case 'failed':
      this.failedAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
    case 'expired':
      this.expiredAt = new Date();
      break;
  }
  
  // Add audit log
  this.addAuditLog(`Status changed from ${oldStatus} to ${newStatus}`, details, userId);
  
  return this;
};

paymentSchema.methods.processRefund = function(refundAmount, reason, refundedBy) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed payments');
  }
  
  if (refundAmount > this.refundableAmount) {
    throw new Error('Refund amount exceeds refundable amount');
  }
  
  this.refund = {
    amount: refundAmount,
    reason,
    refundedAt: new Date(),
    refundStatus: 'pending',
    refundedBy,
    refundTransactionId: `REF_${this.paymentId}_${Date.now()}`
  };
  
  if (refundAmount === this.amount) {
    this.status = 'refunded';
  }
  
  this.addAuditLog('Refund initiated', { refundAmount, reason }, refundedBy);
  
  return this;
};

paymentSchema.methods.softDelete = function(deletedBy = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.addAuditLog('Payment soft deleted', {}, deletedBy);
  return this.save();
};

paymentSchema.methods.restore = function(restoredBy = null) {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.addAuditLog('Payment restored', {}, restoredBy);
  return this.save();
};

// ✅ PRE-SAVE MIDDLEWARE - CRITICAL FIX
paymentSchema.pre('save', function(next) {
  // ✅ AUTO-GENERATE UNIQUE PAYMENT ID
  if (this.isNew && !this.paymentId) {
    this.paymentId = generatePaymentId();
  }
  
  // ✅ Ensure paymentId is never null
  if (!this.paymentId) {
    this.paymentId = generatePaymentId();
  }
  
  // Validate refund amount
  if (this.refund && this.refund.amount > this.amount) {
    return next(new Error('Refund amount cannot exceed payment amount'));
  }
  
  // Calculate total fees
  if (this.fees) {
    this.fees.totalFees = (this.fees.processingFee || 0) + 
                         (this.fees.gatewayFee || 0) + 
                         (this.fees.serviceFee || 0);
  }
  
  // Set expiry for pending payments (30 minutes)
  if (this.isNew && this.status === 'pending' && !this.expiredAt) {
    this.expiredAt = new Date(Date.now() + 30 * 60 * 1000);
  }
  
  // Auto-generate order reference number for gateway
  if (this.isNew && !this.gateway.orderRefNumber) {
    this.gateway.orderRefNumber = `ORD_${this.paymentId}_${Date.now()}`;
  }
  
  next();
});

// ✅ PRE-VALIDATE MIDDLEWARE
paymentSchema.pre('validate', function(next) {
  // Ensure currency is uppercase
  if (this.currency) {
    this.currency = this.currency.toUpperCase();
  }
  
  // Round amount to 2 decimal places for currency precision
  if (this.amount) {
    this.amount = Math.round(this.amount * 100) / 100;
  }
  
  // Validate email format
  if (this.billing && this.billing.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.billing.email)) {
      return next(new Error('Invalid email format'));
    }
  }
  
  next();
});

// ✅ POST-SAVE MIDDLEWARE
paymentSchema.post('save', function(doc) {
  // Log important status changes
  if (doc.status === 'completed') {
    console.log(`✅ Payment completed: ${doc.paymentId} - ${doc.formattedAmount}`);
  } else if (doc.status === 'failed') {
    console.log(`❌ Payment failed: ${doc.paymentId} - ${doc.errorMessage || 'Unknown error'}`);
  } else if (doc.status === 'refunded') {
    console.log(`🔄 Payment refunded: ${doc.paymentId} - ${doc.formattedAmount}`);
  }
});

// ✅ ERROR HANDLING MIDDLEWARE
paymentSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    if (error.message.includes('paymentId')) {
      next(new Error('Payment ID already exists. Please try again.'));
    } else if (error.message.includes('transactionId')) {
      next(new Error('Transaction ID already exists.'));
    } else {
      next(new Error('Duplicate payment detected.'));
    }
  } else {
    next(error);
  }
});

// ✅ QUERY HELPERS
paymentSchema.query.active = function() {
  return this.where({ isDeleted: false });
};

paymentSchema.query.byStatus = function(status) {
  return this.where({ status });
};

paymentSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

paymentSchema.query.recent = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.where({ createdAt: { $gte: startDate } });
};

paymentSchema.query.completed = function() {
  return this.where({ status: 'completed' });
};

paymentSchema.query.pending = function() {
  return this.where({ status: 'pending' });
};

// ✅ HELPER FUNCTION TO GENERATE UNIQUE PAYMENT ID
function generatePaymentId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `PAY_${timestamp}_${random}`.toUpperCase();
}

// ✅ ENSURE VIRTUAL FIELDS ARE SERIALIZED
paymentSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

paymentSchema.set('toObject', { virtuals: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;