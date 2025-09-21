const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'hbl_account', 'union_pay'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  gateway: {
    provider: {
      type: String,
      default: 'HBLPay'
    },
    sessionId: String,
    responseCode: String,
    responseMessage: String,
    authCode: String,
    orderRefNumber: String
  },
  tokenization: {
    token: String,
    maskedCardNumber: String,
    expiryDate: String
  },
  billing: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    gatewayFee: {
      type: Number,
      default: 0
    }
  },
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundTransactionId: String,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String,
    location: {
      country: String,
      city: String
    }
  },
  auditLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Compound indexes


// Virtual for payment duration
paymentSchema.virtual('duration').get(function() {
  if (this.completedAt && this.initiatedAt) {
    return this.completedAt - this.initiatedAt;
  }
  return null;
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 2
  });
  
  try {
    return formatter.format(this.amount);
  } catch (error) {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
});

// Virtual for total refunded amount
paymentSchema.virtual('totalRefunded').get(function() {
  if (this.refunds && this.refunds.length > 0) {
    return this.refunds
      .filter(refund => refund.status === 'completed')
      .reduce((total, refund) => total + refund.amount, 0);
  }
  return this.refundAmount || 0;
});

// Virtual for remaining refundable amount
paymentSchema.virtual('refundableAmount').get(function() {
  if (this.status !== 'completed') return 0;
  return this.amount - this.totalRefunded;
});

// Virtual for payment age in hours
paymentSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.initiatedAt) / (1000 * 60 * 60));
});

// Instance methods
paymentSchema.methods.markAsCompleted = function(gatewayResponse = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.gatewayResponse = { ...this.gatewayResponse, ...gatewayResponse };
  this.errorCode = undefined;
  this.errorMessage = undefined;
  this.failureReason = undefined;
  return this.save();
};

paymentSchema.methods.markAsFailed = function(errorCode, errorMessage, gatewayResponse = {}) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorCode = errorCode;
  this.errorMessage = errorMessage;
  this.failureReason = errorMessage;
  this.gatewayResponse = { ...this.gatewayResponse, ...gatewayResponse };
  return this.save();
};

paymentSchema.methods.markAsCancelled = function(reason, gatewayResponse = {}) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.failureReason = reason;
  this.gatewayResponse = { ...this.gatewayResponse, ...gatewayResponse };
  return this.save();
};

paymentSchema.methods.markAsRefunded = function(refundAmount, refundReason, transactionId = null) {
  const refundAmt = refundAmount || this.amount;
  
  // Add to refunds array
  this.refunds.push({
    amount: refundAmt,
    reason: refundReason,
    refundedAt: new Date(),
    transactionId: transactionId,
    status: 'completed'
  });
  
  // Update main refund fields
  this.refundAmount = (this.refundAmount || 0) + refundAmt;
  this.refundReason = refundReason;
  this.refundedAt = new Date();
  this.refundTransactionId = transactionId;
  
  // Update status
  if (this.refundAmount >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partial_refund';
  }
  
  return this.save();
};

paymentSchema.methods.addPartialRefund = function(amount, reason, transactionId = null) {
  if (amount <= 0) {
    throw new Error('Refund amount must be positive');
  }
  
  if (amount > this.refundableAmount) {
    throw new Error('Refund amount exceeds refundable amount');
  }
  
  return this.markAsRefunded(amount, reason, transactionId);
};

paymentSchema.methods.updateCardInfo = function(cardData) {
  if (cardData.last4Digits) {
    this.cardInfo.last4Digits = cardData.last4Digits;
  }
  if (cardData.cardType) {
    this.cardInfo.cardType = cardData.cardType;
  }
  if (cardData.maskedCardNumber) {
    this.cardInfo.maskedCardNumber = cardData.maskedCardNumber;
  }
  if (cardData.expiryMonth) {
    this.cardInfo.expiryMonth = cardData.expiryMonth;
  }
  if (cardData.expiryYear) {
    this.cardInfo.expiryYear = cardData.expiryYear;
  }
  return this.save();
};

paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'completed' && this.refundableAmount > 0;
};

paymentSchema.methods.isExpired = function() {
  // Consider payment expired if pending for more than 30 minutes
  const expiryTime = 30 * 60 * 1000; // 30 minutes in milliseconds
  return this.status === 'pending' && (Date.now() - this.initiatedAt) > expiryTime;
};

paymentSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  
  // Remove sensitive information
  delete obj.gatewayResponse;
  if (obj.cardInfo) {
    delete obj.cardInfo.maskedCardNumber;
  }
  
  return obj;
};

// Static methods
paymentSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ sessionId, isDeleted: false });
};

paymentSchema.statics.findByPaymentId = function(paymentId) {
  return this.findOne({ paymentId, isDeleted: false });
};

paymentSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ transactionId, isDeleted: false });
};

paymentSchema.statics.getUserPayments = function(userId, status = null, options = {}) {
  const query = { userId, isDeleted: false };
  if (status) query.status = status;
  
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 }
  } = options;
  
  return this.find(query)
    .populate('bookingId', 'hotelName checkIn checkOut bookingId')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

paymentSchema.statics.getPaymentStats = function(userId, startDate, endDate) {
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
        stats: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount',
            avgAmount: '$avgAmount'
          }
        },
        totalPayments: { $sum: '$count' },
        grandTotal: { $sum: '$totalAmount' }
      }
    }
  ]);
};

paymentSchema.statics.findExpiredPayments = function() {
  const expiryTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
  return this.find({
    status: 'pending',
    initiatedAt: { $lt: expiryTime },
    isDeleted: false
  });
};

paymentSchema.statics.getTotalsByStatus = function(userId = null) {
  const matchStage = { isDeleted: false };
  if (userId) {
    matchStage.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

paymentSchema.statics.getRecentPayments = function(limit = 10) {
  return this.find({ isDeleted: false })
    .populate('userId', 'fullname email')
    .populate('bookingId', 'hotelName bookingId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Set updatedBy if in context
  if (this.isModified() && this.$locals && this.$locals.userId) {
    this.updatedBy = this.$locals.userId;
  }
  
  // Auto-generate paymentId if not set
  if (this.isNew && !this.paymentId) {
    this.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Validate refund amount
  if (this.refundAmount > this.amount) {
    return next(new Error('Refund amount cannot exceed payment amount'));
  }
  
  // Auto-set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-set failedAt when status changes to failed
  if (this.isModified('status') && this.status === 'failed' && !this.failedAt) {
    this.failedAt = new Date();
  }
  
  // Auto-set cancelledAt when status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

// Pre-validate middleware
paymentSchema.pre('validate', function(next) {
  // Ensure currency is uppercase
  if (this.currency) {
    this.currency = this.currency.toUpperCase();
  }
  
  // Validate amount precision based on currency
  if (this.amount) {
    if (this.currency === 'PKR') {
      // PKR allows up to 2 decimal places
      this.amount = Math.round(this.amount * 100) / 100;
    } else {
      // USD, EUR allow up to 2 decimal places
      this.amount = Math.round(this.amount * 100) / 100;
    }
  }
  
  next();
});

// Post-save middleware for logging
paymentSchema.post('save', function(doc) {
  console.log(`Payment ${doc.paymentId} status updated to: ${doc.status}`);
  
  // Log important status changes
  if (doc.status === 'completed') {
    console.log(`✅ Payment completed: ${doc.paymentId} - ${doc.formattedAmount}`);
  } else if (doc.status === 'failed') {
    console.log(`❌ Payment failed: ${doc.paymentId} - ${doc.errorMessage || 'Unknown error'}`);
  } else if (doc.status === 'refunded') {
    console.log(`🔄 Payment refunded: ${doc.paymentId} - ${doc.formattedAmount}`);
  }
});

// Post-update middleware
paymentSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    console.log(`Payment ${doc.paymentId} updated via findOneAndUpdate`);
  }
});

// Error handling middleware
paymentSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Payment ID already exists'));
  } else {
    next(error);
  }
});

// Soft delete method
paymentSchema.methods.softDelete = function(deletedBy = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  if (deletedBy) {
    this.deletedBy = deletedBy;
  }
  return this.save();
};

// Restore soft deleted document
paymentSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Query helpers
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

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

paymentSchema.set('toObject', { virtuals: true });

const paymentModel = mongoose.model('payment', paymentSchema);

module.exports = paymentModel;