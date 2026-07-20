const mongoose = require('mongoose');

/**
 * Lightweight hotel index for name-based search/autocomplete.
 * Only stores code, name, destination - minimal footprint for fast text search.
 */
const hotelIndexSchema = new mongoose.Schema({
  code: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, index: 'text' },
  destinationCode: String,
  destinationName: String,
  countryCode: String,
  categoryCode: String,
  categoryName: String,
  zoneCode: Number,
  zoneName: String
}, { timestamps: false });

// Compound text index for fast name search
hotelIndexSchema.index({ name: 'text', destinationName: 'text', zoneName: 'text' });
// For destination-based filtering
hotelIndexSchema.index({ destinationCode: 1 });
hotelIndexSchema.index({ countryCode: 1 });

const HotelIndex = mongoose.model('HotelIndex', hotelIndexSchema);
module.exports = HotelIndex;
