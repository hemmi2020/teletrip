const bookingModel = require('../models/booking.model');
const paymentModel = require('../models/payment.model');
const ApiResponse = require('../utils/response.util');
const DateUtil = require('../utils/date.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const notificationService = require('../services/notification.service');

// Create booking - FIXED VERSION
module.exports.createBooking = asyncErrorHandler(async (req, res) => {
  const {
    hotelName,
    roomName,
    location,
    checkIn,
    checkOut,
    guests,
    totalAmount,
    boardType = 'Room Only',
    rateClass = 'NOR',
    items = []
  } = req.body;

  // Get user ID from JWT token (already available in req.user)
  const userId = req.user._id;

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  // Create booking data matching your schema structure
  const bookingData = {
    // Required fields
    user: userId,                    // ✅ Correct field name
    bookingType: 'hotel',           // ✅ Required field
    bookingReference: generateBookingReference('hotel'),
    bookingId: undefined,            // ✅ Will be auto-generated if not provided
     // ✅ Will be auto-generated if not provided
    
    // Status 
    status: 'pending',
    
    // Pricing structure (required)
    pricing: {
      basePrice: totalAmount,       // ✅ Required field
      totalAmount: totalAmount,     // ✅ Required field
      currency: 'PKR',
      taxes: 0,
      fees: 0,
      discounts: 0
    },
    
    // Hotel booking details
    hotelBooking: {
      hotelName: hotelName,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: nights,
      rooms: [{
        roomName: roomName,
        boardName: boardType,
        rateClass: rateClass,
        adults: guests || 1,
        children: 0,
        netPrice: totalAmount,
        sellingPrice: totalAmount
      }],
      hotelAddress: {
        city: location ? location.split(',')[0] : '',
        country: location ? location.split(',')[1] : ''
      }
    },
    
    // Guest information
    guestInfo: {
      totalGuests: {
        adults: guests || 1,
        children: 0,
        infants: 0
      }
    },
    
    // Payment information
    payment: {
      status: 'pending',
      method: null,
      paidAmount: 0
    },
    
    // Travel dates
    travelDates: {
      departureDate: checkInDate,
      returnDate: checkOutDate,
      duration: nights
    },
    
    // Source tracking
    source: {
      platform: 'web'
    }
  };

  try {
    // Create booking
    const booking = await bookingModel.create(bookingData);
    
    // Send confirmation notification (optional)
    try {
      await notificationService.sendBookingNotification(
        userId, 
        'bookingCreated', 
        { ...booking.toObject(), userDetails: req.user }
      );
    } catch (notificationError) {
      console.log('Notification failed:', notificationError.message);
      // Don't fail the booking creation if notification fails
    }

    return ApiResponse.created(res, booking, 'Booking created successfully');
    
  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return ApiResponse.badRequest(res, 'Validation failed', validationErrors);
    }
    
    throw error; // Let asyncErrorHandler handle other errors
  }
});

// Helper function to generate booking reference
function generateBookingReference(type) {
  const prefix = type.charAt(0).toUpperCase();
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Update other methods to use correct field names
module.exports.getUserBookings = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: userId }; // ✅ Changed from 'userId' to 'user'
  if (status) query.status = status;

  const bookings = await bookingModel
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Add computed status based on dates
  const bookingsWithStatus = bookings.map(booking => ({
    ...booking,
    computedStatus: DateUtil.getBookingStatus(
      booking.hotelBooking?.checkIn, 
      booking.hotelBooking?.checkOut, 
      booking.status
    ),
    daysToCheckIn: booking.hotelBooking?.checkIn ? 
      DateUtil.getDaysBetween(new Date(), booking.hotelBooking.checkIn) : null,
    duration: booking.hotelBooking?.checkIn && booking.hotelBooking?.checkOut ?
      DateUtil.getDaysBetween(booking.hotelBooking.checkIn, booking.hotelBooking.checkOut) : null
  }));

  const total = await bookingModel.countDocuments(query);

  return ApiResponse.paginated(res, bookingsWithStatus, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
});

module.exports.getBookingDetails = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await bookingModel.findOne({
    $or: [{ _id: bookingId }, { bookingReference: bookingId }], // ✅ Changed to bookingReference
    user: userId // ✅ Changed from userId to user
  }).lean();

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  // Get associated payments
  const payments = await paymentModel.find({ bookingId: booking._id });

  // Add computed fields
  const bookingWithDetails = {
    ...booking,
    computedStatus: DateUtil.getBookingStatus(
      booking.hotelBooking?.checkIn, 
      booking.hotelBooking?.checkOut, 
      booking.status
    ),
    daysToCheckIn: booking.hotelBooking?.checkIn ?
      DateUtil.getDaysBetween(new Date(), booking.hotelBooking.checkIn) : null,
    duration: booking.hotelBooking?.checkIn && booking.hotelBooking?.checkOut ?
      DateUtil.getDaysBetween(booking.hotelBooking.checkIn, booking.hotelBooking.checkOut) : null,
    payments,
    canCancel: booking.status !== 'cancelled' && booking.status !== 'completed' && 
               booking.hotelBooking?.checkIn && DateUtil.isUpcoming(booking.hotelBooking.checkIn)
  };

  return ApiResponse.success(res, bookingWithDetails, 'Booking details retrieved');
});

module.exports.updateBooking = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;
  const updates = req.body;

  const booking = await bookingModel.findOne({
    $or: [{ _id: bookingId }, { bookingReference: bookingId }], // ✅ Changed to bookingReference
    user: userId // ✅ Changed from userId to user
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return ApiResponse.badRequest(res, 'Cannot update cancelled or completed booking');
  }

  // Check if check-in date is not in the past
  const newCheckIn = updates.checkIn || booking.hotelBooking?.checkIn;
  if (newCheckIn && DateUtil.isPast(newCheckIn)) {
    return ApiResponse.badRequest(res, 'Cannot update to a past date');
  }

  // Update booking - handle nested structure
  if (updates.checkIn || updates.checkOut || updates.hotelName || updates.roomName) {
    if (!booking.hotelBooking) booking.hotelBooking = {};
    
    if (updates.checkIn) booking.hotelBooking.checkIn = new Date(updates.checkIn);
    if (updates.checkOut) booking.hotelBooking.checkOut = new Date(updates.checkOut);
    if (updates.hotelName) booking.hotelBooking.hotelName = updates.hotelName;
    if (updates.roomName && booking.hotelBooking.rooms && booking.hotelBooking.rooms[0]) {
      booking.hotelBooking.rooms[0].roomName = updates.roomName;
    }
  }

  if (updates.totalAmount) {
    if (!booking.pricing) booking.pricing = {};
    booking.pricing.totalAmount = updates.totalAmount;
    booking.pricing.basePrice = updates.totalAmount;
  }

  await booking.save();

  return ApiResponse.success(res, booking, 'Booking updated successfully');
});

module.exports.cancelBooking = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await bookingModel.findOne({
    $or: [{ _id: bookingId }, { bookingReference: bookingId }], // ✅ Changed to bookingReference
    user: userId // ✅ Changed from userId to user
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  if (booking.status === 'cancelled') {
    return ApiResponse.badRequest(res, 'Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    return ApiResponse.badRequest(res, 'Cannot cancel completed booking');
  }

  // Update booking status
  booking.status = 'cancelled';
  if (!booking.cancellation) booking.cancellation = {};
  booking.cancellation.cancelledAt = new Date();
  booking.cancellation.cancelledBy = userId;
  
  await booking.save();

  // Process refund if payment was made
  if (booking.payment && booking.payment.status === 'completed') {
    const payment = await paymentModel.findOne({ 
      bookingId: booking._id, 
      status: 'completed' 
    });
    
    if (payment) {
      // Create refund record
      await paymentModel.create({
        userId,
        bookingId: booking._id,
        paymentId: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: -payment.amount,
        method: 'Refund',
        status: 'completed',
        transactionId: `refund_${payment.transactionId}`,
        currency: payment.currency
      });

      // Update payment status
      payment.status = 'refunded'; 
      await payment.save();

      booking.payment.status = 'refunded';
      await booking.save();
    }
  }

  // Send cancellation notification
  try {
    await notificationService.sendBookingNotification(
      userId, 
      'bookingCancellation', 
      { ...booking.toObject(), userDetails: req.user }
    );
  } catch (notificationError) {
    console.log('Notification failed:', notificationError.message);
  }

  return ApiResponse.success(res, booking, 'Booking cancelled successfully');
});