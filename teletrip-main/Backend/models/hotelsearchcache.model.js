const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const hotelSearchCacheSchema = new mongoose.Schema({
  searchKey: {
    type: String,
    required: true,
    unique: true
  },
  searchParams: {
    destination: String,
    checkIn: Date,
    checkOut: Date,
    adults: Number,
    children: Number,
    rooms: Number
  },
  results: mongoose.Schema.Types.Mixed,
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // 1 hour TTL
  }
}, {
  timestamps: true
});

const HotelSearchCache = mongoose.model('HotelSearchCache', hotelSearchCacheSchema);

module.exports = HotelSearchCache;
