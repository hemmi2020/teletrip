const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200,
        index: 'text'
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 2000
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true, index: true },
        area: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true, default: 'Pakistan' },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    images: [{
        url: { type: String, required: true },
        caption: String,
        isPrimary: { type: Boolean, default: false }
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        index: true
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    amenities: [{
        type: String,
        enum: [
            'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar',
            'room_service', 'laundry', 'concierge', 'business_center',
            'conference_rooms', 'elevator', 'ac', 'heating', 'pet_friendly'
        ]
    }],
    rooms: [{
        type: {
            type: String,
            required: true,
            enum: ['single', 'double', 'twin', 'suite', 'family', 'deluxe']
        },
        name: String,
        description: String,
        basePrice: { type: Number, required: true, min: 0 },
        maxOccupancy: { type: Number, required: true, min: 1 },
        amenities: [String],
        images: [String],
        quantity: { type: Number, default: 1 },
        isAvailable: { type: Boolean, default: true }
    }],
    policies: {
        checkInTime: { type: String, default: '14:00' },
        checkOutTime: { type: String, default: '12:00' },
        cancellationPolicy: String,
        petPolicy: String,
        smokingPolicy: String
    },
    contactInfo: {
        phone: { type: String, required: true },
        email: { type: String, required: true },
        website: String
    },
    priceRange: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

hotelSchema.plugin(mongoosePaginate);

// Indexes for better performance
hotelSchema.index({ 'location.city': 1, isActive: 1 });
hotelSchema.index({ rating: -1, isActive: 1 });
hotelSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });
hotelSchema.index({ amenities: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
