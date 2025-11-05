const userModel = require('../models/user.model');
const bookingModel = require('../models/booking.model');
const Payment = require('../models/payment.model');
const Hotel = require('../models/hotel.model');
const Review = require('../models/review.model');
const Notification = require('../models/notification.model');
const SupportTicket = require('../models/supportticket.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const notificationService = require('../services/notification.service');
const moment = require('moment');


const User = userModel;
const Booking = bookingModel;

// ========== DASHBOARD OVERVIEW ==========
const getDashboardOverview = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  console.log('Fetching dashboard overview for user:', userId);
  
  try {
    const [
      totalBookings,
      totalPayments,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      failedPayments,
      successfulPayments,
      recentBookingsRaw,
      recentPaymentsRaw,
      totalSpentResult,
      avgBookingValueResult,
      pendingPayOnSite
    ] = await Promise.allSettled([
      Booking.countDocuments({ user: userId }),
      Payment.countDocuments({ userId: userId }),
      Booking.countDocuments({ user: userId, status: 'pending' }),
      Booking.countDocuments({ user: userId, status: 'confirmed' }),
      Booking.countDocuments({ user: userId, status: 'cancelled' }),
      Payment.countDocuments({ userId: userId, status: 'failed' }),
      Payment.countDocuments({ userId: userId, status: 'completed' }),
      Booking.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Payment.find({ userId: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Booking.aggregate([
        { $match: { user: userId, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { user: userId, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, average: { $avg: '$pricing.totalAmount' } } }
      ]),
      Payment.countDocuments({ 
    userId: userId, 
    status: 'pending', 
    paymentMethod: 'pay_on_site',
    isDeleted: false 
  })
]);
    

    // Extract values safely
    const totalBookingsCount = totalBookings.status === 'fulfilled' ? totalBookings.value : 0;
    const totalPaymentsCount = totalPayments.status === 'fulfilled' ? totalPayments.value : 0;
    const pendingBookingsCount = pendingBookings.status === 'fulfilled' ? pendingBookings.value : 0;
    const completedBookingsCount = completedBookings.status === 'fulfilled' ? completedBookings.value : 0;
    const cancelledBookingsCount = cancelledBookings.status === 'fulfilled' ? cancelledBookings.value : 0;
    const failedPaymentsCount = failedPayments.status === 'fulfilled' ? failedPayments.value : 0;
    const successfulPaymentsCount = successfulPayments.status === 'fulfilled' ? successfulPayments.value : 0;
    const pendingPayOnSiteCount = pendingPayOnSite.status === 'fulfilled' ? pendingPayOnSite.value : 0;
    
    const totalSpent = (totalSpentResult.status === 'fulfilled' && totalSpentResult.value[0]) ? 
      totalSpentResult.value[0].total : 0;
    
    const avgBookingValue = (avgBookingValueResult.status === 'fulfilled' && avgBookingValueResult.value[0]) ? 
      avgBookingValueResult.value[0].average : 0;

    // Transform recent data
    const recentBookings = recentBookingsRaw.status === 'fulfilled' ? 
      recentBookingsRaw.value.map(transformBookingData) : [];
    
    const recentPayments = recentPaymentsRaw.status === 'fulfilled' ? 
      recentPaymentsRaw.value.map(transformPaymentData) : [];

    // ✅ FORMAT RESPONSE TO MATCH FRONTEND EXPECTATIONS
    const dashboardData = {
      // Frontend expects this structure:
      bookings: {
        total: totalBookingsCount,
        active: completedBookingsCount, // "active" means confirmed/completed bookings
        pending: pendingBookingsCount,
        cancelled: cancelledBookingsCount
      },
      financial: {
        totalSpent: totalSpent || 0,
        averageBookingValue: avgBookingValue || 0,
        currency: 'PKR'
      },
      pendingPayOnSite: {
    count: pendingPayOnSiteCount,
    message: 'Bookings awaiting payment on arrival'
  },
      payments: recentPayments, // Recent payments for the payments section
      upcoming: recentBookings,  // Upcoming/recent bookings
      recent: recentBookings,    // Same as upcoming but different key
      
      // Additional stats that might be used
      stats: {
        totalPayments: totalPaymentsCount,
        failedPayments: failedPaymentsCount,
        successfulPayments: successfulPaymentsCount
      }
    };

    console.log('Dashboard Data being sent to frontend:', {
      totalBookings: totalBookingsCount,
      activeBookings: completedBookingsCount,
      totalSpent: totalSpent,
      avgBookingValue: avgBookingValue,
      recentBookingsLength: recentBookings.length,
      recentPaymentsLength: recentPayments.length
    });
    
    return ApiResponse.success(res, dashboardData, 'Dashboard overview retrieved successfully');
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return ApiResponse.error(res, 'Failed to retrieve dashboard data: ' + error.message, 500);
  }
});



// ========== USER PROFILE MANAGEMENT ==========
const getProfile = asyncErrorHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -refreshTokens');
      // ❌ REMOVED: .populate('preferences.favoriteHotels', 'name location images rating');
    
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // ✅ ADDED: Safely fetch favorite hotels if they exist
    let favoriteHotels = [];
    if (user.preferences?.favoriteHotels?.length > 0) {
      try {
        favoriteHotels = await Hotel.find({
          _id: { $in: user.preferences.favoriteHotels }
        }).select('name location images rating');
      } catch (populateError) {
        console.warn('Could not fetch favorite hotels:', populateError.message);
        // Continue without favorite hotels data
      }
    }

    // Add favorite hotels data to response
    const userResponse = user.toObject();
    if (userResponse.preferences) {
      userResponse.preferences.favoriteHotelsData = favoriteHotels;
    }

    return ApiResponse.success(res, userResponse, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Profile fetch error:', error);
    return ApiResponse.error(res, 'Failed to fetch profile', 500);
  }
});

const updateProfile = asyncErrorHandler(async (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, gender, nationality, address } = req.body;

  const updates = {
    'fullname.firstname': firstName,
    'fullname.lastname': lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    nationality,
    address
  };

  // Remove undefined values
  Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  return ApiResponse.success(res, user, 'Profile updated successfully');
});

const updatePassword = asyncErrorHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user.id);
  
  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return ApiResponse.error(res, 'Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Send notification
  await notificationService.sendPasswordChangeNotification(user.email, user.firstName);

  return ApiResponse.success(res, null, 'Password updated successfully');
});

const uploadProfilePicture = asyncErrorHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePicture: req.file.path },
    { new: true }
  ).select('-password -refreshTokens');

  return ApiResponse.success(res, { profilePicture: user.profilePicture }, 'Profile picture updated successfully');
});

// ========== BOOKING MANAGEMENT ==========

const transformBookingData = (booking) => {
  return {
    _id: booking._id,
    bookingReference: booking.bookingReference,
    
    // Frontend expects these fields:
    hotelId: {
      name: booking.hotelBooking?.hotelName || 'Hotel Name',
      location: {
        city: booking.hotelBooking?.hotelAddress?.city || 'Location'
      },
      images: booking.hotelBooking?.images || []
    },
    
    // Map date fields
    checkInDate: booking.hotelBooking?.checkIn || booking.travelDates?.departureDate,
    checkOutDate: booking.hotelBooking?.checkOut || booking.travelDates?.returnDate,
    
    // Map amount
    totalAmount: booking.pricing?.totalAmount || 0,
    
    // Map other fields
    status: booking.status,
    guests: booking.hotelBooking?.rooms?.[0]?.adults || 
            booking.guestInfo?.totalGuests?.adults || 1,
    roomType: booking.hotelBooking?.rooms?.[0]?.roomName || 'Standard',
    
    // Add Hotelbeds-specific fields
    hotelBooking: booking.hotelBooking, // Include full hotel booking data
    guestInfo: booking.guestInfo, // Include guest information
    paymentMethod: booking.hotelBooking?.rooms?.[0]?.paymentType === 'AT_WEB' ? 'card' : 'pay_on_site',
    cancellationPolicies: booking.hotelBooking?.rooms?.[0]?.cancellationPolicies || [],
    
    // Add other fields the frontend might need
    createdAt: booking.createdAt,
    bookedAt: booking.bookedAt,
    nights: booking.hotelBooking?.nights || booking.travelDates?.duration || 1
  };
};


const getBookings = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const userId = req.user._id || req.user.id;
  console.log('Fetching bookings for user:', userId);
  
  const query = { user: userId };
  if (status) query.status = status;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookingData = await Booking.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Booking.countDocuments(query);
    console.log('Raw bookings found:', bookingData.length);
    
    // Transform the data for frontend
    const transformedBookings = bookingData.map(transformBookingData);
    console.log('Transformed booking sample:', transformedBookings[0]);
    
    const result = {
      docs: transformedBookings,
      totalDocs: total,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };
    
    return ApiResponse.success(res, result, 'Bookings retrieved successfully');
  } catch (error) {
    console.error('Bookings query error:', error);
    return ApiResponse.error(res, 'Failed to retrieve bookings: ' + error.message, 500);
  }
});

const getBookingDetails = asyncErrorHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    userId: req.user.id
  }).populate([
    { path: 'hotelId', select: 'name location images rating amenities description contactInfo' },
    { path: 'payments', select: 'amount status paymentMethod transactionId createdAt' },
    { path: 'userId', select: 'firstName lastName email phone' }
  ]);

  if (!booking) {
    return ApiResponse.error(res, 'Booking not found', 404);
  }

  return ApiResponse.success(res, booking, 'Booking details retrieved successfully');
});

const createBooking = asyncErrorHandler(async (req, res) => {
  const bookingData = {
    ...req.body,
    userId: req.user.id,
    bookingReference: `TT${Date.now()}${Math.floor(Math.random() * 1000)}`
  };

  // Validate hotel availability
  const hotel = await Hotel.findById(bookingData.hotelId);
  if (!hotel) {
    return ApiResponse.error(res, 'Hotel not found', 404);
  }

  const booking = new Booking(bookingData);
  await booking.save();
  
  await booking.populate([
    { path: 'hotelId', select: 'name location images rating' },
    { path: 'userId', select: 'firstName lastName email phone' }
  ]);

  // Send confirmation email
  await notificationService.sendBookingConfirmation(req.user.email, booking);

  return ApiResponse.success(res, booking, 'Booking created successfully', 201);
});

const cancelBooking = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    user: req.user.id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (!booking) {
    return ApiResponse.error(res, 'Booking not found or cannot be cancelled', 404);
  }

  // Cancel with Hotelbeds if booking has Hotelbeds reference
  let cancellationReference = null;
  let refundAmount = booking.pricing?.totalAmount || 0;
  
  if (booking.backup?.hotelbedsBookingData?.booking?.reference) {
    const hotelbedsReference = booking.backup.hotelbedsBookingData.booking.reference;
    console.log('🚫 Cancelling Hotelbeds booking:', hotelbedsReference);
    
    const { cancelBookingWithHotelbeds } = require('../services/hotelbeds.booking.service');
    const cancellationResult = await cancelBookingWithHotelbeds(hotelbedsReference, 'CANCELLATION');
    
    if (cancellationResult.success) {
      cancellationReference = cancellationResult.cancellationReference;
      refundAmount = cancellationResult.refundAmount;
      
      booking.backup.hotelbedsCancellationData = cancellationResult.cancellationData;
      booking.backup.cancellationReference = cancellationReference;
      
      console.log('✅ Hotelbeds cancellation successful:', cancellationReference);
    } else {
      console.error('❌ Hotelbeds cancellation failed:', cancellationResult.error);
      booking.backup.hotelbedsCancellationError = cancellationResult.error;
    }
  }

  // Update booking status
  booking.status = 'cancelled';
  booking.cancellationReason = reason || 'User requested cancellation';
  booking.cancelledAt = new Date();
  booking.cancellation = {
    ...booking.cancellation,
    reason: reason || 'User requested cancellation',
    cancelledAt: new Date(),
    refundAmount
  };
  
  await booking.save();

  // Send cancellation notification
  try {
    await notificationService.sendBookingCancellation(req.user.email, booking);
  } catch (emailError) {
    console.error('Failed to send cancellation email:', emailError);
  }

  return ApiResponse.success(res, {
    booking,
    cancellationReference,
    refundAmount
  }, 'Booking cancelled successfully');
});

// ========== PAYMENT MANAGEMENT ==========

const transformPaymentData = (payment) => {
  return {
    _id: payment._id,
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    createdAt: payment.createdAt,
    
    // Map booking reference if available
    bookingReference: payment.bookingId ? 'Loading...' : null, // Will be populated separately
    
    // Other relevant fields
    gateway: payment.gateway,
    billing: payment.billing,
    errorMessage: payment.errorMessage
  };
};



const getPaymentHistory = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10, status, method, dateFrom, dateTo } = req.query;
  
  const userId = req.user._id || req.user.id;
  console.log('Fetching payments for user:', userId);
  
  const query = { userId: userId };
  if (status) query.status = status;
  if (method) query.paymentMethod = method;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const paymentData = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Payment.countDocuments(query);
    console.log('Raw payments found:', paymentData.length);
    
    // Transform the data for frontend
    const transformedPayments = paymentData.map(transformPaymentData);
    console.log('Transformed payment sample:', transformedPayments[0]);
    
    const result = {
      docs: transformedPayments,
      totalDocs: total,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };
    
    return ApiResponse.success(res, result, 'Payment history retrieved successfully');
  } catch (error) {
    console.error('Payment query error:', error);
    return ApiResponse.error(res, 'Failed to retrieve payments: ' + error.message, 500);
  }
});

// ========== HOTEL SEARCH & FAVORITES ==========
const searchHotels = asyncErrorHandler(async (req, res) => {
  const {
    location,
    checkIn,
    checkOut,
    guests = 1,
    rooms = 1,
    minPrice,
    maxPrice,
    rating,
    amenities,
    hotelType,
    page = 1,
    limit = 20,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  const searchCriteria = {
    isActive: true
  };

  // Location search (city, area, or coordinates)
  if (location) {
    if (location.includes(',')) {
      // Assume coordinates format: "lat,lng"
      const [lat, lng] = location.split(',').map(Number);
      searchCriteria['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 50000 // 50km radius
        }
      };
    } else {
      // Text search
      searchCriteria.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.area': { $regex: location, $options: 'i' } },
        { name: { $regex: location, $options: 'i' } }
      ];
    }
  }

  // Price range
  if (minPrice) searchCriteria['rooms.basePrice'] = { $gte: Number(minPrice) };
  if (maxPrice) {
    if (searchCriteria['rooms.basePrice']) {
      searchCriteria['rooms.basePrice'].$lte = Number(maxPrice);
    } else {
      searchCriteria['rooms.basePrice'] = { $lte: Number(maxPrice) };
    }
  }

  // Rating filter
  if (rating) searchCriteria.rating = { $gte: Number(rating) };

  // Amenities filter
  if (amenities) {
    const amenitiesList = amenities.split(',');
    searchCriteria.amenities = { $in: amenitiesList };
  }

  // Hotel type
  if (hotelType) searchCriteria.type = hotelType;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  };

  const hotels = await Hotel.paginate(searchCriteria, options);

  return ApiResponse.success(res, hotels, 'Hotels retrieved successfully');
});

const getFavoriteHotels = asyncErrorHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('preferences.favoriteHotels');

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // ✅ FIXED: Safe population without strict populate error
    let favoriteHotels = [];
    if (user.preferences?.favoriteHotels?.length > 0) {
      favoriteHotels = await Hotel.find({
        _id: { $in: user.preferences.favoriteHotels }
      }).select('name location images rating amenities priceRange');
    }

    return ApiResponse.success(res, favoriteHotels, 'Favorite hotels retrieved successfully');
  } catch (error) {
    console.error('Favorite hotels fetch error:', error);
    return ApiResponse.error(res, 'Failed to fetch favorite hotels', 500);
  }
});


const addToFavorites = asyncErrorHandler(async (req, res) => {
  const { hotelId } = req.params;
  
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return ApiResponse.error(res, 'Hotel not found', 404);
  }

  try {
    // ✅ FIXED: Ensure preferences object exists before updating
    const user = await User.findById(req.user.id);
    
    if (!user.preferences) {
      user.preferences = { favoriteHotels: [] };
    }
    
    if (!user.preferences.favoriteHotels) {
      user.preferences.favoriteHotels = [];
    }

    // Add to favorites if not already present
    if (!user.preferences.favoriteHotels.includes(hotelId)) {
      user.preferences.favoriteHotels.push(hotelId);
      await user.save();
    }

    return ApiResponse.success(res, null, 'Hotel added to favorites');
  } catch (error) {
    console.error('Add to favorites error:', error);
    return ApiResponse.error(res, 'Failed to add hotel to favorites', 500);
  }
});

const removeFromFavorites = asyncErrorHandler(async (req, res) => {
  const { hotelId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    
    if (user.preferences?.favoriteHotels) {
      user.preferences.favoriteHotels = user.preferences.favoriteHotels.filter(
        id => id.toString() !== hotelId
      );
      await user.save();
    }

    return ApiResponse.success(res, null, 'Hotel removed from favorites');
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return ApiResponse.error(res, 'Failed to remove hotel from favorites', 500);
  }
});


// ========== TRAVEL PREFERENCES ==========
const getPreferences = asyncErrorHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('preferences');

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // ✅ FIXED: Safe handling of preferences
    let preferences = user.preferences || {};
    
    // Fetch favorite hotels data separately if they exist
    let favoriteHotelsData = [];
    if (preferences.favoriteHotels?.length > 0) {
      try {
        favoriteHotelsData = await Hotel.find({
          _id: { $in: preferences.favoriteHotels }
        }).select('name location images');
      } catch (populateError) {
        console.warn('Could not fetch favorite hotels:', populateError.message);
      }
    }

    // Add favorite hotels data to preferences
    const preferencesResponse = {
      ...preferences.toObject(),
      favoriteHotelsData
    };

    return ApiResponse.success(res, preferencesResponse, 'Preferences retrieved successfully');
  } catch (error) {
    console.error('Preferences fetch error:', error);
    return ApiResponse.error(res, 'Failed to fetch preferences', 500);
  }
});


const updatePreferences = asyncErrorHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { preferences: req.body } },
    { new: true, runValidators: true }
  ).select('preferences');

  return ApiResponse.success(res, user.preferences, 'Preferences updated successfully');
});

// ========== NOTIFICATIONS ==========
const getNotifications = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  
  const query = { userId: req.user.id };
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  };

  const notifications = await Notification.paginate(query, options);
  
  return ApiResponse.success(res, notifications, 'Notifications retrieved successfully');
});

const markNotificationAsRead = asyncErrorHandler(async (req, res) => {
  const { notificationId } = req.params;
  
  await Notification.findOneAndUpdate(
    { _id: notificationId, userId: req.user.id },
    { isRead: true, readAt: new Date() }
  );

  return ApiResponse.success(res, null, 'Notification marked as read');
});

// ========== REVIEWS & RATINGS ==========
const getMyReviews = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: 'hotelId', select: 'name location images' },
      { path: 'bookingId', select: 'bookingReference checkInDate checkOutDate' }
    ]
  };

  const reviews = await Review.paginate({ userId: req.user.id }, options);
  
  return ApiResponse.success(res, reviews, 'Reviews retrieved successfully');
});

const createReview = asyncErrorHandler(async (req, res) => {
  const { hotelId, bookingId, rating, comment, categories } = req.body;
  
  // Verify user has stayed at this hotel
  const booking = await Booking.findOne({
    _id: bookingId,
    userId: req.user.id,
    hotelId,
    status: 'completed'
  });

  if (!booking) {
    return ApiResponse.error(res, 'You can only review hotels you have stayed at', 400);
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ userId: req.user.id, hotelId, bookingId });
  if (existingReview) {
    return ApiResponse.error(res, 'You have already reviewed this stay', 400);
  }

  const review = new Review({
    userId: req.user.id,
    hotelId,
    bookingId,
    rating,
    comment,
    categories
  });

  await review.save();

  return ApiResponse.success(res, review, 'Review created successfully', 201);
});

// ========== SUPPORT & HELP ==========
const createSupportTicket = asyncErrorHandler(async (req, res) => {
  const { subject, description, category, priority = 'medium', bookingId } = req.body;
  
  const ticket = new SupportTicket({
    userId: req.user.id,
    ticketNumber: `SP${Date.now()}`,
    subject,
    description,
    category,
    priority,
    bookingId,
    status: 'open'
  });

  await ticket.save();
  
  // Send notification to support team
  await notificationService.sendSupportTicketNotification(ticket);

  return ApiResponse.success(res, ticket, 'Support ticket created successfully', 201);
});

const getMySupportTickets = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const query = { userId: req.user.id };
  if (status) query.status = status;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: 'bookingId', select: 'bookingReference' }
    ]
  };

  const tickets = await SupportTicket.paginate(query, options);
  
  return ApiResponse.success(res, tickets, 'Support tickets retrieved successfully');
});

// ========== ANALYTICS & INSIGHTS ==========
const getTravelInsights = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { year = new Date().getFullYear() } = req.query;

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  const insights = await Booking.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageStayDuration: { $avg: '$nights' },
        totalNights: { $sum: '$nights' }
      }
    }
  ]);

  // Get most visited cities
  const cities = await Booking.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $lookup: {
        from: 'hotels',
        localField: 'hotelId',
        foreignField: '_id',
        as: 'hotel'
      }
    },
    {
      $group: {
        _id: '$hotel.location.city',
        visits: { $sum: 1 }
      }
    },
    {
      $sort: { visits: -1 }
    },
    {
      $limit: 5
    }
  ]);

  const result = {
    year: parseInt(year),
    summary: insights[0] || {},
    topDestinations: cities
  };

  return ApiResponse.success(res, result, 'Travel insights retrieved successfully');
});


const testQueries = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  
  try {
    console.log('Testing queries for user:', userId, 'Type:', typeof userId);
    
    // Test booking query without populate
    const bookings = await Booking.find({ user: userId }).limit(3).lean();
    console.log('Bookings found:', bookings.length);
    
    // Test payment query without populate
    const payments = await Payment.find({ userId: userId }).limit(3).lean();
    console.log('Payments found:', payments.length);
    
    return res.json({
      success: true,
      userId: userId,
      userIdType: typeof userId,
      bookingsFound: bookings.length,
      paymentsFound: payments.length,
      bookingSample: bookings[0] || null,
      paymentSample: payments[0] || null
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
      userId: userId
    });
  }
});

const getPendingPayments = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id || req.user.id;

  console.log('📋 Fetching pending payments for user:', userId);

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const pendingPayments = await Payment.find({
      userId,
      status: 'pending',
      paymentMethod: 'pay_on_site',
      isDeleted: false
    })
    .populate({
      path: 'bookingId',
      select: 'bookingReference hotelName checkInDate checkOutDate status hotelBooking'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    const total = await Payment.countDocuments({
      userId,
      status: 'pending',
      paymentMethod: 'pay_on_site',
      isDeleted: false
    });

    console.log(`✅ Found ${pendingPayments.length} pending payments`);

    const result = {
      payments: pendingPayments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    };

    return ApiResponse.success(res, result, 'Pending payments retrieved successfully');

  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
    return ApiResponse.error(res, 'Failed to fetch pending payments', 500);
  }
});

module.exports = {
  getDashboardOverview,
  getProfile,
  getPendingPayments,
  updateProfile,
  updatePassword,
  uploadProfilePicture,
  transformBookingData,
  getBookings,
  getBookingDetails,
  createBooking,
  cancelBooking,
  transformPaymentData,
  getPaymentHistory,
  searchHotels,
  getFavoriteHotels,
  addToFavorites,
  removeFromFavorites,
  getPreferences,
  updatePreferences,
  getNotifications,
  markNotificationAsRead,
  getMyReviews,
  createReview,
  createSupportTicket,
  getMySupportTickets,
  getTravelInsights,
  testQueries
};