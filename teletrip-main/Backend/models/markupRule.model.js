const mongoose = require('mongoose');

const markupRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  ruleType: {
    type: String,
    required: true,
    enum: ['global', 'destination', 'hotel', 'star_rating'],
    default: 'global'
  },
  targetDestination: {
    type: String,
    trim: true
  },
  targetHotelId: {
    type: String,
    trim: true
  },
  targetStarRating: {
    type: Number,
    min: 1,
    max: 5
  },
  calculationType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed_amount'],
    default: 'percentage'
  },
  markupValue: {
    type: Number,
    required: [true, 'Markup value is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

markupRuleSchema.index({ isActive: 1, priority: -1 });
markupRuleSchema.index({ ruleType: 1, isActive: 1 });

const MarkupRule = mongoose.models.MarkupRule || mongoose.model('MarkupRule', markupRuleSchema);

module.exports = MarkupRule;
