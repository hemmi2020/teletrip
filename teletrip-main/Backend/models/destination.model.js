const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  // Existing fields
  name: { type: String, required: true },
  country: { type: String, required: true },
  image: { type: String, required: true },
  tag: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },

  // Rich content fields
  slug: { type: String },
  heroImage: { type: String, default: '' },
  gallery: [{ type: String }],
  longDescription: { type: String, default: '' },
  highlights: [{ type: String }],
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
  },
  isFeatured: { type: Boolean, default: false },
  continent: { type: String, default: '' },
}, { timestamps: true });

// Indexes for efficient queries
destinationSchema.index({ slug: 1 }, { unique: true, sparse: true });
destinationSchema.index({ isFeatured: 1, order: 1 });
destinationSchema.index({ continent: 1, isActive: 1 });

module.exports = mongoose.model('Destination', destinationSchema);
