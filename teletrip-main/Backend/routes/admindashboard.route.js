const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const adminDashboardController = require('../controllers/admindashboard.controller'); 
const { authUser, requireRole } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
 
// ========== MIDDLEWARE ==========
// All admin routes require authentication and admin/super_admin role
const requireAdmin = [authUser, requireRole(['admin', 'super_admin'])];

// ========== VALIDATION SCHEMAS ==========
const userStatusValidation = [
  param('userId').isMongoId().withMessage('Valid user ID is required'),
  body('isActive').isBoolean().withMessage('Active status must be boolean'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
];

const userDeleteValidation = [
  param('userId').isMongoId().withMessage('Valid user ID is required'),
  body('reason').trim().notEmpty().withMessage('Deletion reason is required')
];

const bookingStatusValidation = [
  param('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

const hotelValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Hotel name must be between 2 and 200 characters'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.area').trim().notEmpty().withMessage('Area is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('amenities').isArray().withMessage('Amenities must be an array'),
  body('rooms').isArray({ min: 1 }).withMessage('At least one room type is required'),
  body('contactInfo.phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required')
];

const hotelStatusValidation = [
  param('hotelId').isMongoId().withMessage('Valid hotel ID is required'),
  body('isActive').isBoolean().withMessage('Active status must be boolean'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
];

const refundValidation = [
  param('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Refund amount must be greater than 0'),
  body('reason').trim().notEmpty().withMessage('Refund reason is required')
];

const ticketUpdateValidation = [
  param('ticketId').isMongoId().withMessage('Valid ticket ID is required'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignedTo').optional().isMongoId().withMessage('Valid user ID required for assignment'),
  body('internalNotes').optional().trim().isLength({ max: 2000 }).withMessage('Internal notes cannot exceed 2000 characters')
];

const ticketResponseValidation = [
  param('ticketId').isMongoId().withMessage('Valid ticket ID is required'),
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('isInternal').optional().isBoolean().withMessage('Internal flag must be boolean')
];

const paginationValidation = [
  query('page')
    .optional({ checkFalsy: true })  // Added checkFalsy
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional({ checkFalsy: true })  // Added checkFalsy
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const dateRangeValidation = [
  query('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid start date required'),
  query('endDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid end date required')
];

// ========== DASHBOARD OVERVIEW ==========
/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get admin dashboard overview with comprehensive stats
 * @access  Private (Admin only)
 */
router.get('/dashboard', 
  ...requireAdmin,
  [
    query('period')
      .optional({ checkFalsy: true })
      .isIn(['7d', '30d', '90d', '1y'])
      .withMessage('Invalid period')
  ],
  validateRequest,
  adminDashboardController.getDashboardOverview
);

// ========== USER MANAGEMENT ==========
/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filters and pagination
 * @access  Private (Admin only)
 */
router.get('/users', 
  ...requireAdmin,
  [
    ...paginationValidation,
    query('status')
      .optional({ checkFalsy: true })
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status'),
    query('role')
      .optional({ checkFalsy: true })
      .isIn(['user', 'admin', 'super_admin'])
      .withMessage('Invalid role'),
    query('search')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search term must be at least 2 characters'),
    query('sortBy')
      .optional({ checkFalsy: true })
      .isString(),
    query('sortOrder')
      .optional({ checkFalsy: true })
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  validateRequest,
  adminDashboardController.getAllUsers
);

/**
 * @route   GET /api/v1/admin/users/:userId
 * @desc    Get specific user details with statistics
 * @access  Private (Admin only)
 */
router.get('/users/:userId', 
  ...requireAdmin,
  [param('userId').isMongoId().withMessage('Valid user ID is required')],
  validateRequest,
  adminDashboardController.getUserDetails
);

/**
 * @route   PUT /api/v1/admin/users/:userId/status
 * @desc    Update user status (activate/deactivate)
 * @access  Private (Admin only)
 */
router.put('/users/:userId/status', 
  ...requireAdmin,
  userStatusValidation,
  validateRequest,
  adminDashboardController.updateUserStatus
);

/**
 * @route   DELETE /api/v1/admin/users/:userId
 * @desc    Delete user (soft delete)
 * @access  Private (Super Admin only)
 */
router.delete('/users/:userId', 
  authUser,
  requireRole(['super_admin']),
  userDeleteValidation,
  validateRequest,
  adminDashboardController.deleteUser
);

// ========== BOOKING MANAGEMENT ==========
/**
 * @route   GET /api/v1/admin/bookings
 * @desc    Get all bookings with filters
 * @access  Private (Admin only)
 */
router.get('/bookings', 
  ...requireAdmin,
  [
    ...paginationValidation,
    ...dateRangeValidation,
    query('status')
      .optional({ checkFalsy: true })
      .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    query('hotelId')
      .optional({ checkFalsy: true })
      .isMongoId()
      .withMessage('Valid hotel ID required'),
    query('userId')
      .optional({ checkFalsy: true })
      .isMongoId()
      .withMessage('Valid user ID required'),
    query('search')
      .optional({ checkFalsy: true })
      .trim(),
    query('sortBy')
      .optional({ checkFalsy: true })
      .isString(),
    query('sortOrder')
      .optional({ checkFalsy: true })
      .isIn(['asc', 'desc'])
  ],
  validateRequest,
  adminDashboardController.getAllBookings
);

/**
 * @route   GET /api/v1/admin/bookings/:bookingId
 * @desc    Get specific booking details
 * @access  Private (Admin only)
 */
router.get('/bookings/:bookingId', 
  ...requireAdmin,
  [param('bookingId').isMongoId().withMessage('Valid booking ID is required')],
  validateRequest,
  adminDashboardController.getBookingDetails
);

/**
 * @route   PUT /api/v1/admin/bookings/:bookingId/status
 * @desc    Update booking status
 * @access  Private (Admin only)
 */
router.put('/bookings/:bookingId/status', 
  ...requireAdmin,
  bookingStatusValidation,
  validateRequest,
  adminDashboardController.updateBookingStatus
);

// ========== HOTEL MANAGEMENT ==========
/**
 * @route   GET /api/v1/admin/hotels
 * @desc    Get all hotels with filters
 * @access  Private (Admin only)
 */
router.get('/hotels', 
  ...requireAdmin,
  [
    ...paginationValidation,
    query('search')
      .optional({ checkFalsy: true })
      .trim(),
    query('status')
      .optional({ checkFalsy: true })
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status'),
    query('city')
      .optional({ checkFalsy: true })
      .trim(),
    query('rating')
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    query('sortBy')
      .optional({ checkFalsy: true })
      .isString(),
    query('sortOrder')
      .optional({ checkFalsy: true })
      .isIn(['asc', 'desc'])
  ],
  validateRequest,
  adminDashboardController.getAllHotels
);

/**
 * @route   GET /api/v1/admin/hotels/:hotelId
 * @desc    Get specific hotel details with statistics
 * @access  Private (Admin only)
 */
router.get('/hotels/:hotelId', 
  ...requireAdmin,
  [param('hotelId').isMongoId().withMessage('Valid hotel ID is required')],
  validateRequest,
  adminDashboardController.getHotelDetails
);

/**
 * @route   POST /api/v1/admin/hotels
 * @desc    Create new hotel
 * @access  Private (Admin only)
 */
router.post('/hotels', 
  ...requireAdmin,
  hotelValidation,
  validateRequest,
  adminDashboardController.createHotel
);

/**
 * @route   PUT /api/v1/admin/hotels/:hotelId
 * @desc    Update hotel information
 * @access  Private (Admin only)
 */
router.put('/hotels/:hotelId', 
  ...requireAdmin,
  [
    param('hotelId').isMongoId().withMessage('Valid hotel ID is required'),
    ...hotelValidation
  ],
  validateRequest,
  adminDashboardController.updateHotel
);

/**
 * @route   PUT /api/v1/admin/hotels/:hotelId/status
 * @desc    Update hotel status
 * @access  Private (Admin only)
 */
router.put('/hotels/:hotelId/status', 
  ...requireAdmin,
  hotelStatusValidation,
  validateRequest,
  adminDashboardController.updateHotelStatus
);

// ========== PAYMENT MANAGEMENT ==========
/**
 * @route   GET /api/v1/admin/payments
 * @desc    Get all payments with filters
 * @access  Private (Admin only)
 */
router.get('/payments', 
  ...requireAdmin,
  [
    ...paginationValidation,
    ...dateRangeValidation,
    query('status')
      .optional({ checkFalsy: true })
      .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
      .withMessage('Invalid payment status'),
    query('method')
      .optional({ checkFalsy: true })
      .trim(),
    query('userId')
      .optional({ checkFalsy: true })
      .isMongoId()
      .withMessage('Valid user ID required'),
    query('search')
      .optional({ checkFalsy: true })
      .trim(),
    query('sortBy')
      .optional({ checkFalsy: true })
      .isString(),
    query('sortOrder')
      .optional({ checkFalsy: true })
      .isIn(['asc', 'desc'])
  ],
  validateRequest,
  adminDashboardController.getAllPayments
);

/**
 * @route   GET /api/v1/admin/payments/:paymentId
 * @desc    Get specific payment details
 * @access  Private (Admin only)
 */
router.get('/payments/:paymentId', 
  ...requireAdmin,
  [param('paymentId').isMongoId().withMessage('Valid payment ID is required')],
  validateRequest,
  adminDashboardController.getPaymentDetails
);

/**
 * @route   POST /api/v1/admin/payments/:paymentId/refund
 * @desc    Process payment refund
 * @access  Private (Admin only)
 */
router.post('/payments/:paymentId/refund', 
  ...requireAdmin,
  refundValidation,
  validateRequest,
  adminDashboardController.processRefund
);

// ========== SUPPORT MANAGEMENT ==========
/**
 * @route   GET /api/v1/admin/support/tickets
 * @desc    Get all support tickets
 * @access  Private (Admin only)
 */
router.get('/support/tickets', 
  ...requireAdmin,
  [
    ...paginationValidation,
    query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    query('category').optional().isIn(['booking', 'payment', 'technical', 'general', 'complaint']).withMessage('Invalid category'),
    query('assignedTo').optional().isMongoId().withMessage('Valid user ID required')
  ],
  validateRequest,
  adminDashboardController.getAllSupportTickets
);

/**
 * @route   GET /api/v1/admin/support/tickets/:ticketId
 * @desc    Get specific support ticket details
 * @access  Private (Admin only)
 */
router.get('/support/tickets/:ticketId', 
  ...requireAdmin,
  [param('ticketId').isMongoId().withMessage('Valid ticket ID is required')],
  validateRequest,
  adminDashboardController.getSupportTicketDetails
);

/**
 * @route   PUT /api/v1/admin/support/tickets/:ticketId
 * @desc    Update support ticket
 * @access  Private (Admin only)
 */
router.put('/support/tickets/:ticketId', 
  ...requireAdmin,
  ticketUpdateValidation,
  validateRequest,
  adminDashboardController.updateSupportTicket
);

/**
 * @route   POST /api/v1/admin/support/tickets/:ticketId/responses
 * @desc    Add response to support ticket
 * @access  Private (Admin only)
 */
router.post('/support/tickets/:ticketId/responses', 
  ...requireAdmin,
  ticketResponseValidation,
  validateRequest,
  adminDashboardController.addTicketResponse
);

// ========== ANALYTICS & REPORTS ==========
/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get comprehensive analytics data
 * @access  Private (Admin only)
 */
router.get('/analytics', 
  ...requireAdmin,
  [
    ...dateRangeValidation,
    query('type').optional().isIn(['revenue', 'bookings', 'users', 'hotels']).withMessage('Invalid analytics type')
  ],
  validateRequest,
  adminDashboardController.getAnalytics
);

/**
 * @route   GET /api/v1/admin/reports/export
 * @desc    Export data in various formats (CSV, Excel, PDF)
 * @access  Private (Admin only)
 */
router.get('/reports/export', 
  ...requireAdmin,
  [
    ...dateRangeValidation,
    query('type').isIn(['users', 'bookings', 'payments', 'hotels']).withMessage('Export type is required'),
    query('format').optional().isIn(['csv', 'excel', 'pdf']).withMessage('Invalid export format')
  ],
  validateRequest,
  adminDashboardController.exportData
);

module.exports = router;