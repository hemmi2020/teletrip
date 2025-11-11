const mongoose = require('mongoose');

const currencySettingsSchema = new mongoose.Schema({
  markupPerEuro: {
    type: Number,
    default: 20,
    min: 0,
    required: true
  },
  transactionFeePercentage: {
    type: Number,
    default: 1,
    min: 0,
    max: 10,
    required: true
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

// Ensure only one settings document exists
currencySettingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const CurrencySettings = mongoose.model('CurrencySettings', currencySettingsSchema);

module.exports = CurrencySettings;
