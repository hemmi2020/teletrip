const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - user
 *         - bookingType
 *         - totalAmount
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated booking ID
 *         bookingReference:
 *           type: string
 *           description: Unique booking reference number
 *         user:
 *           type: string
 *           description: User ID who made the booking
 *         bookingType:
 *           type: string
 *           enum: [hotel, flight, package, car_rental, activity]
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, refunded]
 *         totalAmount:
 *           type: number
 *           description: Total booking amount
 */

const bookingSchema = new mongoose.Schema({
  // Basic booking information
  bookingReference: {
    type: String,
    unique: true, // This creates an index automatically
    required: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true // Index for user-based queries
  },
  
  bookingType: {
    type: String,
    enum: ['hotel', 'flight', 'package', 'car_rental', 'activity', 'insurance'],
    required: true,
    index: true // Index for type-based queries
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'expired', 'on_hold'],
    default: 'pending',
    index: true // Index for status-based queries
  },
  
  // Hotel booking details
  hotelBooking: {
    hotelId: String, // Hotelbeds hotel ID
    hotelName: String,
    hotelCode: String,
    checkIn: {
      type: Date,
      index: true // Index for check-in date queries
    },
    checkOut: {
      type: Date,
      index: true // Index for check-out date queries
    },
    nights: Number,
    rooms: [{
      roomId: String,
      roomName: String,
      roomCode: String,
      boardName: String,
      boardCode: String,
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
      childAges: [Number],
      rateKey: String,
      rateClass: String,
      rateType: String,
      rateComments: String,
      netPrice: Number,
      sellingPrice: Number,
      taxes: Number,
      allotment: Number,
      paymentType: String,
      packaging: Boolean,
      cancellationPolicies: [{
        amount: Number,
        from: Date,
        currency: String
      }]
    }],
    hotelAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    amenities: [String],
    images: [String],
    description: String,
    category: String,
    rating: Number,
    specialRequests: String,
    confirmationNumber: String
  },
  
  // Flight booking details
  flightBooking: {
    airline: String,
    airlineCode: String,
    outbound: {
      flightNumber: String,
      departure: {
        airport: String,
        airportCode: String,
        terminal: String,
        gate: String,
        dateTime: Date,
        city: String,
        country: String
      },
      arrival: {
        airport: String,
        airportCode: String,
        terminal: String,
        gate: String,
        dateTime: Date,
        city: String,
        country: String
      },
      duration: String,
      aircraft: String,
      class: String,
      stops: Number,
      layovers: [{
        airport: String,
        duration: String
      }]
    },
    return: {
      flightNumber: String,
      departure: {
        airport: String,
        airportCode: String,
        terminal: String,
        gate: String,
        dateTime: Date,
        city: String,
        country: String
      },
      arrival: {
        airport: String,
        airportCode: String,
        terminal: String,
        gate: String,
        dateTime: Date,
        city: String,
        country: String
      },
      duration: String,
      aircraft: String,
      class: String,
      stops: Number,
      layovers: [{
        airport: String,
        duration: String
      }]
    },
    passengers: [{
      type: { type: String, enum: ['adult', 'child', 'infant'] },
      title: String,
      firstName: String,
      lastName: String,
      dateOfBirth: Date,
      nationality: String,
      passportNumber: String,
      passportExpiry: Date,
      seatNumber: String,
      mealPreference: String,
      specialRequests: String
    }],
    baggage: {
      checkedBags: Number,
      carryOnBags: Number,
      extraBaggage: Boolean
    },
    pnr: String, // Passenger Name Record
    eTicketNumbers: [String]
  },
  
  // Guest information
  guestInfo: {
    primaryGuest: {
      title: String,
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      dateOfBirth: Date,
      nationality: String,
      passportNumber: String,
      passportExpiry: Date
    },
    additionalGuests: [{
      title: String,
      firstName: String,
      lastName: String,
      dateOfBirth: Date,
      nationality: String,
      passportNumber: String,
      passportExpiry: Date,
      relationship: String
    }],
    totalGuests: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 }
    }
  },
  
  // Pricing and payment
  pricing: {
    basePrice: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    exchangeRate: { type: Number, default: 1 },
    priceBreakdown: [{
      item: String,
      amount: Number,
      currency: String
    }]
  },
  
  // Payment information
  payment: {
    method: String, // hblpay, card, wallet, etc.
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partial_refund'],
      default: 'pending',
      index: true // Index for payment status queries
    },
    transactionId: String,
    paymentReference: String,
    paidAmount: { type: Number, default: 0 },
    refundedAmount: { type: Number, default: 0 },
    paymentDate: Date,
    refundDate: Date,
    gateway: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  
  // Cancellation and modification
  cancellation: {
    isCancellable: { type: Boolean, default: true },
    cancellationPolicy: String,
    cancellationFee: Number,
    freeCancellationUntil: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    cancellationReason: String,
    refundAmount: Number,
    refundProcessed: { type: Boolean, default: false }
  },
  
  modification: {
    isModifiable: { type: Boolean, default: true },
    modificationFee: Number,
    freeModificationUntil: Date,
    modifications: [{
      modifiedAt: { type: Date, default: Date.now },
      modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      changes: mongoose.Schema.Types.Mixed,
      additionalFee: Number
    }]
  },
  
  // Special requests and preferences
  specialRequests: {
    dietaryRequirements: [String],
    accessibility: [String],
    roomPreferences: String,
    transportationNeeds: String,
    other: String
  },
  
  // Booking source and tracking
  source: {
    platform: { type: String, default: 'web' }, // web, mobile, api, agent
    channel: String, // direct, affiliate, partner
    affiliateId: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    }
  },
  
  // Notifications and communications
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    checkInReminderSent: { type: Boolean, default: false },
    feedbackRequestSent: { type: Boolean, default: false }
  },
  
  // Review and feedback
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    reviewDate: Date,
    wouldRecommend: Boolean,
    categories: {
      service: Number,
      cleanliness: Number,
      location: Number,
      valueForMoney: Number,
      facilities: Number
    }
  },
  
  // Internal tracking
  internal: {
    salesAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    commission: Number,
    costPrice: Number,
    markup: Number,
    profit: Number,
    supplier: String,
    supplierReference: String,
    notes: String,
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  },
  
  // Vouchers and documents
  documents: {
    voucher: String,
    invoice: String,
    receipt: String,
    tickets: [String],
    insurance: String,
    additionalDocuments: [{
      name: String,
      url: String,
      type: String
    }]
  },
  
  // Travel dates
  travelDates: {
    departureDate: {
      type: Date,
      index: true // Index for departure date queries
    },
    returnDate: Date,
    duration: Number // in days
  },
  
  // Loyalty and rewards
  loyalty: {
    pointsEarned: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    tierBenefitsApplied: [String],
    promocodeUsed: String,
    discountApplied: Number
  },
  
  // Backup and recovery
  backup: {
    originalBookingData: mongoose.Schema.Types.Mixed,
    supplierBookingData: mongoose.Schema.Types.Mixed,
    paymentData: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now,
    index: true // Index for booking date queries
  },
  confirmedAt: Date,
  completedAt: Date,
  expiresAt: Date

}, {
  timestamps: true, // This creates createdAt and updatedAt fields with indexes
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// REMOVED DUPLICATE INDEXES - These are now handled in the schema definition above
// The following indexes are now redundant and have been removed:
// bookingSchema.index({ bookingReference: 1 }); // REMOVED - field has unique: true
// bookingSchema.index({ user: 1 }); // REMOVED - field has index: true
// bookingSchema.index({ status: 1 }); // REMOVED - field has index: true
// bookingSchema.index({ bookingType: 1 }); // REMOVED - field has index: true
// bookingSchema.index({ 'payment.status': 1 }); // REMOVED - field has index: true
// bookingSchema.index({ 'travelDates.departureDate': 1 }); // REMOVED - field has index: true
// bookingSchema.index({ 'hotelBooking.checkIn': 1 }); // REMOVED - field has index: true
// bookingSchema.index({ 'hotelBooking.checkOut': 1 }); // REMOVED - field has index: true
// bookingSchema.index({ createdAt: -1 }); // REMOVED - timestamps: true creates this automatically
// bookingSchema.index({ bookedAt: -1 }); // REMOVED - field has index: true

// Keep only necessary compound indexes that can't be defined in schema fields
bookingSchema.index({ user: 1, status: 1 }); // Compound index for user + status queries
bookingSchema.index({ bookingType: 1, status: 1 }); // Compound index for type + status queries
bookingSchema.index({ user: 1, createdAt: -1 }); // Compound index for user + date queries

// Virtual fields
bookingSchema.virtual('isActive').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

bookingSchema.virtual('canCancel').get(function() {
  const now = new Date();
  return this.cancellation.isCancellable && 
         this.status === 'confirmed' && 
         (!this.cancellation.freeCancellationUntil || now <= this.cancellation.freeCancellationUntil);
});

bookingSchema.virtual('canModify').get(function() {
  const now = new Date();
  return this.modification.isModifiable && 
         this.status === 'confirmed' && 
         (!this.modification.freeModificationUntil || now <= this.modification.freeModificationUntil);
});

bookingSchema.virtual('daysUntilTravel').get(function() {
  if (!this.travelDates.departureDate) return null;
  const now = new Date();
  const departure = new Date(this.travelDates.departureDate);
  const diffTime = departure - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Generate booking reference if new
  if (this.isNew && !this.bookingReference) {
    this.bookingReference = this.generateBookingReference();
  }
  
  // Set expiry date for pending bookings
  if (this.isNew && this.status === 'pending' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  // Update confirmed date
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  // Update completed date
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Instance methods
bookingSchema.methods.generateBookingReference = function() {
  const prefix = this.bookingType.charAt(0).toUpperCase();
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

bookingSchema.methods.calculateRefundAmount = function() {
  const now = new Date();
  let refundAmount = this.pricing.totalAmount;
  
  if (this.cancellation.freeCancellationUntil && now > this.cancellation.freeCancellationUntil) {
    refundAmount -= this.cancellation.cancellationFee || 0;
  }
  
  return Math.max(0, refundAmount);
};

bookingSchema.methods.addModification = function(changes, fee = 0, modifiedBy) {
  this.modification.modifications.push({
    modifiedAt: new Date(),
    modifiedBy,
    changes,
    additionalFee: fee
  });
  
  if (fee > 0) {
    this.pricing.totalAmount += fee;
  }
  
  return this.save();
};

bookingSchema.methods.processPayment = function(paymentData) {
  this.payment = {
    ...this.payment,
    ...paymentData,
    paymentDate: new Date()
  };
  
  if (paymentData.status === 'completed') {
    this.status = 'confirmed';
    this.payment.paidAmount = this.pricing.totalAmount;
  }
  
  return this.save();
};

bookingSchema.methods.cancelBooking = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellation.cancelledAt = new Date();
  this.cancellation.cancelledBy = cancelledBy;
  this.cancellation.cancellationReason = reason;
  this.cancellation.refundAmount = this.calculateRefundAmount();
  
  return this.save();
};

bookingSchema.methods.addReview = function(reviewData) {
  this.review = {
    ...reviewData,
    reviewDate: new Date()
  };
  
  return this.save();
};

// Static methods
bookingSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

bookingSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

bookingSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

bookingSchema.statics.getStats = async function(dateRange = {}) {
  const matchStage = {};
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageBookingValue: { $avg: '$pricing.totalAmount' },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0
  };
};

bookingSchema.statics.getBookingsByType = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$bookingType',
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.totalAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};
bookingSchema.plugin(mongoosePaginate);
const bookingModel = mongoose.model('booking', bookingSchema);

module.exports = bookingModel;