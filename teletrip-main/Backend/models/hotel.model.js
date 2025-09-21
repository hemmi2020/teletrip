const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




const hotelSchema = new mongoose.Schema({
  hotelCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  amenities: [String],
  images: [String],
  rating: {
    stars: Number,
    reviews: Number,
    averageScore: Number
  },
  policies: {
    checkIn: String,
    checkOut: String,
    cancellation: String,
    children: String,
    pets: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Hotel = mongoose.model('Hotel', hotelSchema);


module.exports = Hotel;
