const mongoose = require('mongoose');

const designLabFeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  clientName: { type: String, default: 'Anonymous Client' },
  clientEmail: { type: String, default: '' },
  preferredVariant: { type: String, default: 'Not Specified' },
  rating: { type: Number, default: 5 },
  overallDirection: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
  comments: [{
    variant: String,
    tag: String,
    text: String,
    selector: String,
    elementDescription: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  markdown: { type: String, default: '' },
  targetName: { type: String, default: 'HotelSearchExperience' },
  clientMeta: {
    ip: String,
    userAgent: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DesignLabFeedback', designLabFeedbackSchema);

