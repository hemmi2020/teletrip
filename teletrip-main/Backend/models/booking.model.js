const mongoose = require('mongoose');




const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    hotelCode: String,
    name: String,
    address: String
  },
  room: {
    code: String,
    name: String,
    type: String,
    description: String
  },
  guests: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    },
    infants: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  dates: {
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date,
      required: true
    },
    nights: Number
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      default: 0
    },
    fees: {
      type: Number,
      default: 0
    },
    discounts: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'PKR'
    }
  },
  boardType: String, // Half Board, Full Board, etc.
  rateClass: String, // NOR, NRF, etc.
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  payment: {
    transactionId: String,
    paymentMethod: String,
    paidAmount: Number,
    paidAt: Date,
    refundAmount: Number,
    refundAt: Date
  },
  hotelbedsBooking: {
    reference: String,
    status: String,
    createdAt: Date,
    modifiedAt: Date
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundAmount: Number,
    penalties: Number
  },
  specialRequests: String,
  notes: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate nights before saving
bookingSchema.pre('save', function(next) {
  if (this.dates.checkIn && this.dates.checkOut) {
    const checkIn = new Date(this.dates.checkIn);
    const checkOut = new Date(this.dates.checkOut);
    this.dates.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }
  next();
});


const bookingModel = mongoose.model('booking', bookingSchema);

module.exports = bookingModel;
