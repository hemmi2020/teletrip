const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  rateKey: { 
    type: String, 
    required: true, 
    index: true 
  },
  hotelbedsRateKey: { 
    type: String 
  },
  hotelCode: { 
    type: String 
  },
  hotelName: { 
    type: String 
  },
  checkIn: { 
    type: String 
  },
  checkOut: { 
    type: String 
  },
  displayCurrency: { 
    type: String, 
    default: 'PKR' 
  },
  totalPkr: { 
    type: Number, 
    required: true 
  },
  baseFarePkr: { 
    type: Number, 
    required: true 
  },
  taxesAndFeesPkr: { 
    type: Number, 
    default: 0 
  },
  excludedTaxes: [{
    amount: String,
    currency: String,
    included: { type: Boolean, default: false },
    type: String,
    description: String
  }],
  cancellationPolicies: [{
    amountPkr: Number,
    from: String
  }],
  rooms: { 
    type: Array, 
    default: [] 
  },
  // Secure server-only audit fields (never sent to client)
  supplierCurrency: { 
    type: String, 
    default: 'AED' 
  },
  supplierNet: { 
    type: Number 
  },
  markupRuleApplied: { 
    type: Object 
  },
  exchangeRateUsed: { 
    type: Number 
  },
  fxSpreadBufferUsed: { 
    type: Number, 
    default: 1.02 
  },
  serviceChargePctUsed: { 
    type: Number 
  },
  expiresAt: { 
    type: Date, 
    required: true, 
    index: { expires: 0 } // MongoDB TTL index automatically cleans up expired quotes
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Quote', quoteSchema);
