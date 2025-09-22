const userModel = require('../models/user.model');
const bookingModel = require('../models/booking.model');
const Payment = require('../models/payment.model');
const Hotel = require('../models/hotel.model');
const Review = require('../models/review.model');
const SupportTicket = require('../models/supportTicket.model');
const Notification = require('../models/notification.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const notificationService = require('../services/notification.service');
const moment = require('moment');

const User = userModel;
const Booking = bookingModel;

// ========== ADMIN DASHBOARD OVERVIEW ==========
const getDashboardOverview = asyncErrorHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  let startDate, endDate = new Date();
  
  switch (period) {
    case '7d':
      startDate = moment().subtract(7, 'days').toDate();
      break;
    case '30d':
      startDate = moment().subtract(30, 'days').toDate();
      break;
    case '90d':
      startDate = moment().subtract(90, 'days').toDate();
      break;
    case '1y':
      startDate = moment().subtract(1, 'year').toDate();
      break;
    default:
      startDate = moment().subtract(30, 'days').toDate();
  }

  const [
    totalUsers,
    newUsers,
    totalBookings,
    newBookings,
    totalRevenue,
    newRevenue,
    totalHotels,
    activeHotels,
    pendingBookings,
    cancelledBookings,
    completedBookings,
    openTickets,
    averageRating,
    topHotels,
    revenueByMonth,
    bookingsByStatus,
    userRegistrations,
    paymentMethods
  ] = await Promise.all([
    // User Statistics
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    
    // Booking Statistics
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: startDate } }),
    
    // Revenue Statistics
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    
    // Hotel Statistics
    Hotel.countDocuments(),
    Hotel.countDocuments({ isActive: true }),
    
    // Booking Status Statistics
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.countDocuments({ status: 'completed' }),
    
    // Support Statistics
    SupportTicket.countDocuments({ status: 'open' }),
    
    // Rating Statistics
    Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]),
    
    // Top Performing Hotels
    Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$hotelId', bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'hotels', localField: '_id', foreignField: '_id', as: 'hotel' } }
    ]),
    
    // Revenue by Month (last 12 months)
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: moment().subtract(12, 'months').toDate() }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    // Bookings by Status
    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // User Registrations (last 12 months)
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: moment().subtract(12, 'months').toDate() }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    // Payment Methods Distribution
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ])
  ]);

  const overview = {
    period,
    stats: {
      users: {
        total: totalUsers,
        new: newUsers,
        growth: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
      },
      bookings: {
        total: totalBookings,
        new: newBookings,
        pending: pendingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        growth: totalBookings > 0 ? ((newBookings / totalBookings) * 100).toFixed(2) : 0
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        new: newRevenue[0]?.total || 0,
        growth: totalRevenue[0]?.total > 0 ? 
          (((newRevenue[0]?.total || 0) / totalRevenue[0].total) * 100).toFixed(2) : 0
      },
      hotels: {
        total: totalHotels,
        active: activeHotels,
        inactive: totalHotels - activeHotels
      },
      support: {
        openTickets,
        avgRating: averageRating[0]?.avgRating || 0
      }
    },
    charts: {
      revenueByMonth,
      bookingsByStatus,
      userRegistrations,
      paymentMethods
    },
    topPerformers: {
      hotels: topHotels
    }
  };

  return ApiResponse.success(res, overview, 'Admin dashboard overview retrieved successfully');
});

// ========== USER MANAGEMENT ==========
const getAllUsers = asyncErrorHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    status, 
    role, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    dateFrom,
    dateTo
  } = req.query;

  const query = {};
  
  // Search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Filters
  if (status) query.isActive = status === 'active';
  if (role) query.role = role;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
    select: '-password -refreshTokens'
  };

  const users = await User.paginate(query, options);
  
  return ApiResponse.success(res, users, 'Users retrieved successfully');
});

const getUserDetails = asyncErrorHandler(async (req, res) => {
  const { userId } = req.params;
  
  const [user, userStats] = await Promise.all([
    User.findById(userId)
      .select('-password -refreshTokens')
      .populate('preferences.favoriteHotels', 'name location images'),
    
    // Get user statistics
    Promise.all([
      Booking.countDocuments({ userId }),
      Booking.countDocuments({ userId, status: 'completed' }),
      Payment.aggregate([
        { $match: { userId: userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Review.countDocuments({ userId }),
      SupportTicket.countDocuments({ userId })
    ])
  ]);

  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  const [totalBookings, completedBookings, totalSpent, totalReviews, totalTickets] = userStats;

  const userWithStats = {
    ...user.toObject(),
    stats: {
      totalBookings,
      completedBookings,
      totalSpent: totalSpent[0]?.total || 0,
      totalReviews,
      totalTickets
    }
  };

  return ApiResponse.success(res, userWithStats, 'User details retrieved successfully');
});

const updateUserStatus = asyncErrorHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive, reason } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { 
      isActive,
      ...(reason && { statusChangeReason: reason }),
      statusChangedAt: new Date(),
      statusChangedBy: req.user.id
    },
    { new: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  // Send notification to user
  if (!isActive) {
    await notificationService.sendAccountSuspensionNotification(user.email, reason);
  } else {
    await notificationService.sendAccountReactivationNotification(user.email);
  }

  return ApiResponse.success(res, user, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
});

const deleteUser = asyncErrorHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  // Check if user has active bookings
  const activeBookings = await Booking.countDocuments({ 
    userId, 
    status: { $in: ['pending', 'confirmed'] } 
  });

  if (activeBookings > 0) {
    return ApiResponse.error(res, 'Cannot delete user with active bookings', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  // Soft delete - mark as deleted instead of removing
  await User.findByIdAndUpdate(userId, {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: req.user.id,
    deletionReason: reason
  });

  return ApiResponse.success(res, null, 'User deleted successfully');
});

// ========== BOOKING MANAGEMENT ==========
const getAllBookings = asyncErrorHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    hotelId, 
    userId,
    dateFrom, 
    dateTo,
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    search
  } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (hotelId) query.hotelId = hotelId;
  if (userId) query.userId = userId;
  
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  if (search) {
    query.$or = [
      { bookingReference: { $regex: search, $options: 'i' } }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
    populate: [
      { path: 'userId', select: 'firstName lastName email phone' },
      { path: 'hotelId', select: 'name location images rating' },
      { path: 'payments', select: 'amount status paymentMethod' }
    ]
  };

  const bookings = await Booking.paginate(query, options);
  
  return ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
});

const getBookingDetails = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate([
    { path: 'userId', select: 'firstName lastName email phone address' },
    { path: 'hotelId', select: 'name location images rating amenities contactInfo' },
    { path: 'payments', select: 'amount status paymentMethod transactionId createdAt' }
  ]);

  if (!booking) {
    return ApiResponse.error(res, 'Booking not found', 404);
  }

  return ApiResponse.success(res, booking, 'Booking details retrieved successfully');
});

const updateBookingStatus = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status, notes } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { 
      status,
      ...(notes && { adminNotes: notes }),
      statusUpdatedAt: new Date(),
      statusUpdatedBy: req.user.id
    },
    { new: true }
  ).populate([
    { path: 'userId', select: 'firstName lastName email' },
    { path: 'hotelId', select: 'name location' }
  ]);

  if (!booking) {
    return ApiResponse.error(res, 'Booking not found', 404);
  }

  // Send notification to user
  await notificationService.sendBookingStatusUpdate(booking.userId.email, booking);

  return ApiResponse.success(res, booking, 'Booking status updated successfully');
});

// ========== HOTEL MANAGEMENT ==========
const getAllHotels = asyncErrorHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    city, 
    rating,
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    search
  } = req.query;

  const query = {};
  
  if (status) query.isActive = status === 'active';
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (rating) query.rating = { $gte: Number(rating) };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { 'location.area': { $regex: search, $options: 'i' } }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  };

  const hotels = await Hotel.paginate(query, options);
  
  return ApiResponse.success(res, hotels, 'Hotels retrieved successfully');
});

const getHotelDetails = asyncErrorHandler(async (req, res) => {
  const { hotelId } = req.params;

  const [hotel, hotelStats] = await Promise.all([
    Hotel.findById(hotelId),
    
    // Get hotel statistics
    Promise.all([
      Booking.countDocuments({ hotelId }),
      Booking.countDocuments({ hotelId, status: 'completed' }),
      Review.countDocuments({ hotelId }),
      Review.aggregate([
        { $match: { hotelId: hotelId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      Booking.aggregate([
        { $match: { hotelId: hotelId, status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ])
  ]);

  if (!hotel) {
    return ApiResponse.error(res, 'Hotel not found', 404);
  }

  const [totalBookings, completedBookings, totalReviews, avgRating, revenue] = hotelStats;

  const hotelWithStats = {
    ...hotel.toObject(),
    stats: {
      totalBookings,
      completedBookings,
      totalReviews,
      averageRating: avgRating[0]?.avgRating || 0,
      totalRevenue: revenue[0]?.totalRevenue || 0
    }
  };

  return ApiResponse.success(res, hotelWithStats, 'Hotel details retrieved successfully');
});

const createHotel = asyncErrorHandler(async (req, res) => {
  const hotelData = {
    ...req.body,
    createdBy: req.user.id
  };

  const hotel = new Hotel(hotelData);
  await hotel.save();

  return ApiResponse.success(res, hotel, 'Hotel created successfully', 201);
});

const updateHotel = asyncErrorHandler(async (req, res) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findByIdAndUpdate(
    hotelId,
    { 
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  );

  if (!hotel) {
    return ApiResponse.error(res, 'Hotel not found', 404);
  }

  return ApiResponse.success(res, hotel, 'Hotel updated successfully');
});

const updateHotelStatus = asyncErrorHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { isActive, reason } = req.body;

  const hotel = await Hotel.findByIdAndUpdate(
    hotelId,
    { 
      isActive,
      ...(reason && { statusChangeReason: reason }),
      statusChangedAt: new Date(),
      statusChangedBy: req.user.id
    },
    { new: true }
  );

  if (!hotel) {
    return ApiResponse.error(res, 'Hotel not found', 404);
  }

  return ApiResponse.success(res, hotel, `Hotel ${isActive ? 'activated' : 'deactivated'} successfully`);
});

// ========== PAYMENT MANAGEMENT ==========
const getAllPayments = asyncErrorHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    method, 
    userId,
    dateFrom, 
    dateTo,
    sortBy = 'createdAt', 
    sortOrder = 'desc'
  } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (method) query.paymentMethod = method;
  if (userId) query.userId = userId;
  
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
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'bookingId', select: 'bookingReference hotelId' }
    ]
  };

  const payments = await Payment.paginate(query, options);
  
  return ApiResponse.success(res, payments, 'Payments retrieved successfully');
});

const getPaymentDetails = asyncErrorHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId).populate([
    { path: 'userId', select: 'firstName lastName email phone' },
    { path: 'bookingId', select: 'bookingReference hotelId checkInDate checkOutDate' }
  ]);

  if (!payment) {
    return ApiResponse.error(res, 'Payment not found', 404);
  }

  return ApiResponse.success(res, payment, 'Payment details retrieved successfully');
});

const processRefund = asyncErrorHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return ApiResponse.error(res, 'Payment not found', 404);
  }

  if (payment.status !== 'completed') {
    return ApiResponse.error(res, 'Cannot refund incomplete payment', 400);
  }

  // Process refund (integrate with payment gateway)
  payment.refunds = payment.refunds || [];
  payment.refunds.push({
    amount,
    reason,
    processedBy: req.user.id,
    processedAt: new Date(),
    status: 'processed'
  });

  payment.refundedAmount = (payment.refundedAmount || 0) + amount;
  
  if (payment.refundedAmount >= payment.amount) {
    payment.status = 'refunded';
  } else {
    payment.status = 'partially_refunded';
  }

  await payment.save();

  return ApiResponse.success(res, payment, 'Refund processed successfully');
});

// ========== SUPPORT MANAGEMENT ==========
const getAllSupportTickets = asyncErrorHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    priority, 
    category,
    assignedTo,
    sortBy = 'createdAt', 
    sortOrder = 'desc'
  } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (assignedTo) query.assignedTo = assignedTo;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
    populate: [
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'bookingId', select: 'bookingReference' }
    ]
  };

  const tickets = await SupportTicket.paginate(query, options);
  
  return ApiResponse.success(res, tickets, 'Support tickets retrieved successfully');
});

const getSupportTicketDetails = asyncErrorHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await SupportTicket.findById(ticketId).populate([
    { path: 'userId', select: 'firstName lastName email phone' },
    { path: 'assignedTo', select: 'firstName lastName email' },
    { path: 'bookingId', select: 'bookingReference hotelId' },
    { path: 'responses.userId', select: 'firstName lastName email' }
  ]);

  if (!ticket) {
    return ApiResponse.error(res, 'Support ticket not found', 404);
  }

  return ApiResponse.success(res, ticket, 'Support ticket details retrieved successfully');
});

const updateSupportTicket = asyncErrorHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { status, priority, assignedTo, internalNotes } = req.body;

  const updates = {};
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (assignedTo) updates.assignedTo = assignedTo;
  if (internalNotes) updates.internalNotes = internalNotes;
  
  updates.updatedBy = req.user.id;
  updates.updatedAt = new Date();

  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    updates,
    { new: true }
  ).populate([
    { path: 'userId', select: 'firstName lastName email' },
    { path: 'assignedTo', select: 'firstName lastName email' }
  ]);

  if (!ticket) {
    return ApiResponse.error(res, 'Support ticket not found', 404);
  }

  // Send notification if assigned to someone
  if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
    await notificationService.sendTicketAssignmentNotification(ticket);
  }

  return ApiResponse.success(res, ticket, 'Support ticket updated successfully');
});

const addTicketResponse = asyncErrorHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { message, isInternal = false } = req.body;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    return ApiResponse.error(res, 'Support ticket not found', 404);
  }

  ticket.responses.push({
    userId: req.user.id,
    message,
    isInternal,
    createdAt: new Date()
  });

  if (!isInternal) {
    ticket.lastResponseAt = new Date();
    ticket.lastResponseBy = req.user.id;
  }

  await ticket.save();

  await ticket.populate([
    { path: 'userId', select: 'firstName lastName email' },
    { path: 'responses.userId', select: 'firstName lastName email' }
  ]);

  // Send notification to user if response is not internal
  if (!isInternal) {
    await notificationService.sendTicketResponseNotification(ticket);
  }

  return ApiResponse.success(res, ticket, 'Response added successfully');
});

// ========== ANALYTICS & REPORTS ==========
const getAnalytics = asyncErrorHandler(async (req, res) => {
  const { startDate, endDate, type = 'revenue' } = req.query;
  
  const start = startDate ? new Date(startDate) : moment().subtract(30, 'days').toDate();
  const end = endDate ? new Date(endDate) : new Date();

  let analytics = {};

  switch (type) {
    case 'revenue':
      analytics = await getRevenueAnalytics(start, end);
      break;
    case 'bookings':
      analytics = await getBookingAnalytics(start, end);
      break;
    case 'users':
      analytics = await getUserAnalytics(start, end);
      break;
    case 'hotels':
      analytics = await getHotelAnalytics(start, end);
      break;
    default:
      analytics = await getRevenueAnalytics(start, end);
  }

  return ApiResponse.success(res, analytics, 'Analytics retrieved successfully');
});

// Helper functions for analytics
const getRevenueAnalytics = async (startDate, endDate) => {
  const revenueData = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return { type: 'revenue', data: revenueData, period: { startDate, endDate } };
};

const getBookingAnalytics = async (startDate, endDate) => {
  const bookingData = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        averageValue: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return { type: 'bookings', data: bookingData, period: { startDate, endDate } };
};

const getUserAnalytics = async (startDate, endDate) => {
  const userData = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        newUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return { type: 'users', data: userData, period: { startDate, endDate } };
};

const getHotelAnalytics = async (startDate, endDate) => {
  const hotelData = await Hotel.aggregate([
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'hotelId',
        as: 'bookings'
      }
    },
    {
      $project: {
        name: 1,
        location: 1,
        totalBookings: { $size: '$bookings' },
        completedBookings: {
          $size: {
            $filter: {
              input: '$bookings',
              cond: { $eq: ['$this.status', 'completed'] }
            }
          }
        },
        totalRevenue: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$bookings',
                  cond: { $eq: ['$this.status', 'completed'] }
                }
              },
              as: 'booking',
              in: '$booking.totalAmount'
            }
          }
        }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 20 }
  ]);

  return { type: 'hotels', data: hotelData, period: { startDate, endDate } };
};

const exportData = asyncErrorHandler(async (req, res) => {
  const { type, format = 'csv', startDate, endDate } = req.query;
  
  if (!['users', 'bookings', 'payments', 'hotels'].includes(type)) {
    return ApiResponse.error(res, 'Invalid export type', 400);
  }

  try {
    const exportResult = await exportService.exportData(type, format, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    
    return res.send(exportResult.data);
  } catch (error) {
    return ApiResponse.error(res, 'Export failed', 500);
  }
});

module.exports = {
  getDashboardOverview,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAllBookings,
  getBookingDetails,
  updateBookingStatus,
  getAllHotels,
  getHotelDetails,
  createHotel,
  updateHotel,
  updateHotelStatus,
  getAllPayments,
  getPaymentDetails,
  processRefund,
  getAllSupportTickets,
  getSupportTicketDetails,
  updateSupportTicket,
  addTicketResponse,
  getAnalytics,
  exportData
};