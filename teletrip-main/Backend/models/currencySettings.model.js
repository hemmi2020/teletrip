const mongoose = require('mongoose');

const currencySettingsSchema = new mongoose.Schema({
  // Agency commission / markup % applied to supplier net price (e.g. 10%)
  commissionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Service charge / transaction fee % applied to payment (e.g. 1%)
  serviceChargePercentage: {
    type: Number,
    default: 1,
    min: 0,
    max: 20
  },
  // Primary agency operating currency
  primaryCurrency: {
    type: String,
    default: 'AED'
  },
  // Manual exchange rate overrides to PKR (null means auto-fetch from live API)
  manualRates: {
    AED: { type: Number, default: null },
    EUR: { type: Number, default: null },
    USD: { type: Number, default: null },
    GBP: { type: Number, default: null }
  },
  autoFetchRates: {
    type: Boolean,
    default: true
  },
  // Legacy fields for backwards compatibility
  exchangeRate: {
    type: Number,
    default: null,
    min: 0
  },
  markupPerEuro: {
    type: Number,
    default: 0,
    min: 0
  },
  transactionFeePercentage: {
    type: Number,
    default: 1,
    min: 0,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
}, {
  timestamps: true
});

// Ensure only one active settings document exists
currencySettingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const CurrencySettings = mongoose.model('CurrencySettings', currencySettingsSchema);

module.exports = CurrencySettings;
