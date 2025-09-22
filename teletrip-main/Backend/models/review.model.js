const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');






// ========== REVIEW MODEL ==========
const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxLength: 1000
    },
    categories: {
        cleanliness: { type: Number, min: 1, max: 5 },
        service: { type: Number, min: 1, max: 5 },
        location: { type: Number, min: 1, max: 5 },
        value: { type: Number, min: 1, max: 5 },
        amenities: { type: Number, min: 1, max: 5 }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    images: [{
        url: String,
        caption: String
    }],
    adminResponse: {
        message: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

reviewSchema.plugin(mongoosePaginate);

reviewSchema.index({ hotelId: 1, rating: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ hotelId: 1, status: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;