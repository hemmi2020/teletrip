const userModel = require('../models/user.model');
const bookingModel = require('../models/booking.model');
const Payment = require('../models/payment.model');
const Hotel = require('../models/hotel.model');
const Review = require('../models/review.model');
const Notification = require('../models/notification.model');
const SupportTicket = require('../models/supportTicket.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const notificationService = require('../services/notification.service');
const moment = require('moment');


const User = userModel;
const Booking = bookingModel;

// ========== DASHBOARD OVERVIEW ==========
const getDashboardOverview = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get user statistics
  const [
    totalBookings,
    activeBookings,
    completedBookings,
    cancelledBookings,
    totalSpent,
    upcomingBookings,
    recentBookings,
    paymentHistory,
    favoriteHotels
  ] = await Promise.all([
    Booking.countDocuments({ userId }),
    Booking.countDocuments({ userId, status: 'confirmed' }),
    Booking.countDocuments({ userId, status: 'completed' }),
    Booking.countDocuments({ userId, status: 'cancelled' }),
    Payment.aggregate([
      { $match: { userId: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Booking.find({ 
      userId, 
      checkInDate: { $gte: new Date() },
      status: { $in: ['confirmed', 'pending'] }
    }).limit(3).populate('hotelId', 'name location images'),
    Booking.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('hotelId', 'name location images rating'),
    Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5),
    Booking.aggregate([
      { $match: { userId } },
      { $group: { _id: '$hotelId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'hotels', localField: '_id', foreignField: '_id', as: 'hotel' } }
    ])
  ]);

  const stats = {
    bookings: {
      total: totalBookings,
      active: activeBookings,
      completed: completedBookings,
      cancelled: cancelledBookings
    },
    financial: {
      totalSpent: totalSpent[0]?.total || 0,
      averageBookingValue: totalBookings > 0 ? (totalSpent[0]?.total || 0) / totalBookings : 0,
      currency: 'PKR'
    },
    upcoming: upcomingBookings,
    recent: recentBookings,
    payments: paymentHistory,
    favorites: favoriteHotels
  };

  return ApiResponse.success(res, stats, 'Dashboard overview retrieved successfully');
});

// ========== USER PROFILE MANAGEMENT ==========
const getProfile = asyncErrorHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password -refreshTokens')
    .populate('preferences.favoriteHotels', 'name location images rating');
  
  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  return ApiResponse.success(res, user, 'Profile retrieved successfully');
});

const updateProfile = asyncErrorHandler(async (req, res) => {
  const allowedUpdates = [
    'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender',
    'address', 'preferences', 'emergencyContact', 'nationality'
  ];
  
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

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
const getBookings = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10, status, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const query = { userId: req.user.id };
  
  // Add filters
  if (status) query.status = status;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
    populate: [
      { path: 'hotelId', select: 'name location images rating amenities' },
      { path: 'payments', select: 'amount status paymentMethod transactionId' }
    ]
  };

  const bookings = await Booking.paginate(query, options);
  
  return ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
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
    userId: req.user.id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (!booking) {
    return ApiResponse.error(res, 'Booking not found or cannot be cancelled', 404);
  }

  // Check cancellation policy
  const checkInDate = new Date(booking.checkInDate);
  const now = new Date();
  const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

  let cancellationFee = 0;
  if (hoursUntilCheckIn < 24) {
    cancellationFee = booking.totalAmount * 0.5; // 50% fee for cancellation within 24 hours
  } else if (hoursUntilCheckIn < 48) {
    cancellationFee = booking.totalAmount * 0.25; // 25% fee for cancellation within 48 hours
  }

  booking.status = 'cancelled';
  booking.cancellation = {
    reason,
    cancelledAt: new Date(),
    fee: cancellationFee,
    refundAmount: booking.totalAmount - cancellationFee
  };

  await booking.save();

  // Send cancellation notification
  await notificationService.sendBookingCancellation(req.user.email, booking);

  return ApiResponse.success(res, booking, 'Booking cancelled successfully');
});

// ========== PAYMENT MANAGEMENT ==========
const getPaymentHistory = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10, status, method, dateFrom, dateTo } = req.query;
  
  const query = { userId: req.user.id };
  
  if (status) query.status = status;
  if (method) query.paymentMethod = method;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: 'bookingId', select: 'bookingReference hotelId checkInDate checkOutDate' }
    ]
  };

  const payments = await Payment.paginate(query, options);
  
  return ApiResponse.success(res, payments, 'Payment history retrieved successfully');
});

const getPaymentDetails = asyncErrorHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    userId: req.user.id
  }).populate([
    { path: 'bookingId', select: 'bookingReference hotelId checkInDate checkOutDate' },
    { path: 'userId', select: 'firstName lastName email' }
  ]);

  if (!payment) {
    return ApiResponse.error(res, 'Payment not found', 404);
  }

  return ApiResponse.success(res, payment, 'Payment details retrieved successfully');
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
  const user = await User.findById(req.user.id)
    .populate('preferences.favoriteHotels', 'name location images rating amenities priceRange')
    .select('preferences.favoriteHotels');

  return ApiResponse.success(res, user.preferences.favoriteHotels, 'Favorite hotels retrieved successfully');
});

const addToFavorites = asyncErrorHandler(async (req, res) => {
  const { hotelId } = req.params;
  
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return ApiResponse.error(res, 'Hotel not found', 404);
  }

  await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { 'preferences.favoriteHotels': hotelId } }
  );

  return ApiResponse.success(res, null, 'Hotel added to favorites');
});

const removeFromFavorites = asyncErrorHandler(async (req, res) => {
  const { hotelId } = req.params;

  await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { 'preferences.favoriteHotels': hotelId } }
  );

  return ApiResponse.success(res, null, 'Hotel removed from favorites');
});

// ========== TRAVEL PREFERENCES ==========
const getPreferences = asyncErrorHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('preferences')
    .populate('preferences.favoriteHotels', 'name location images');

  return ApiResponse.success(res, user.preferences, 'Preferences retrieved successfully');
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

module.exports = {
  getDashboardOverview,
  getProfile,
  updateProfile,
  updatePassword,
  uploadProfilePicture,
  getBookings,
  getBookingDetails,
  createBooking,
  cancelBooking,
  getPaymentHistory,
  getPaymentDetails,
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
  getTravelInsights
};