const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const exchangeRateSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    required: true,
    default: 'PKR'
  },
  targetCurrency: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    default: 'manual'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient currency lookups
exchangeRateSchema.index({ baseCurrency: 1, targetCurrency: 1, validFrom: -1 });

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

module.exports = ExchangeRate;