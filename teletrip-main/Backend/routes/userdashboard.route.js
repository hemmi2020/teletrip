const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const userDashboardController = require('../controllers/userdashboard.controller');
const { authUser } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');

// ========== VALIDATION SCHEMAS ==========
const profileUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
];

const passwordUpdateValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
];

const bookingValidation = [
  body('hotelId')
    .isMongoId()
    .withMessage('Valid hotel ID is required'),
  body('checkInDate')
    .isISO8601()
    .withMessage('Valid check-in date is required'),
  body('checkOutDate')
    .isISO8601()
    .withMessage('Valid check-out date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('guests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be between 1 and 20'),
  body('rooms')
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of rooms must be between 1 and 10'),
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number')
];

const reviewValidation = [
  body('hotelId')
    .isMongoId()
    .withMessage('Valid hotel ID is required'),
  body('bookingId')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

const supportTicketValidation = [
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['booking', 'payment', 'technical', 'general', 'complaint'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('bookingId')
    .optional()
    .isMongoId()
    .withMessage('Valid booking ID required if provided')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid ID is required')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// ========== DASHBOARD OVERVIEW ==========
/**
 * @route   GET /api/v1/user/dashboard
 * @desc    Get user dashboard overview with stats, recent bookings, etc.
 * @access  Private
 */
router.get('/dashboard', authUser, userDashboardController.getDashboardOverview);

// ========== PROFILE MANAGEMENT ==========
/**
 * @route   GET /api/v1/user/profile
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile', authUser, userDashboardController.getProfile);

/**
 * @route   PUT /api/v1/user/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/profile', 
  authUser, 
  profileUpdateValidation, 
  validateRequest, 
  userDashboardController.updateProfile
);

/**
 * @route   PUT /api/v1/user/profile/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/profile/password', 
  authUser, 
  passwordUpdateValidation, 
  validateRequest, 
  userDashboardController.updatePassword
);

/**
 * @route   POST /api/v1/user/profile/picture
 * @desc    Upload user profile picture
 * @access  Private
 */
router.post('/profile/picture', 
  authUser, 
  upload.single('profilePicture'), 
  userDashboardController.uploadProfilePicture
);

// ========== BOOKING MANAGEMENT ==========
/**
 * @route   GET /api/v1/user/bookings
 * @desc    Get user's bookings with filters and pagination
 * @access  Private
 */
router.get('/bookings', 
  authUser, 
  paginationValidation, 
  validateRequest, 
  userDashboardController.getBookings
);

/**
 * @route   GET /api/v1/user/bookings/:bookingId
 * @desc    Get specific booking details
 * @access  Private
 */
router.get('/bookings/:bookingId', 
  authUser, 
  [param('bookingId').isMongoId().withMessage('Valid booking ID is required')],
  validateRequest, 
  userDashboardController.getBookingDetails
);

/**
 * @route   POST /api/v1/user/bookings
 * @desc    Create new booking
 * @access  Private
 */
router.post('/bookings', 
  authUser, 
  bookingValidation, 
  validateRequest, 
  userDashboardController.createBooking
);

/**
 * @route   PUT /api/v1/user/bookings/:bookingId/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.put('/bookings/:bookingId/cancel', 
  authUser,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
  ],
  validateRequest, 
  userDashboardController.cancelBooking
);

// ========== PAYMENT MANAGEMENT ==========
/**
 * @route   GET /api/v1/user/payments
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/payments', 
  authUser, 
  paginationValidation, 
  validateRequest, 
  userDashboardController.getPaymentHistory
);

/**
 * @route   GET /api/v1/user/payments/:paymentId
 * @desc    Get specific payment details
 * @access  Private
 */
router.get('/payments/:paymentId', 
  authUser, 
  [param('paymentId').isMongoId().withMessage('Valid payment ID is required')],
  validateRequest, 
  userDashboardController.getPaymentDetails
);

// ========== HOTEL SEARCH & FAVORITES ==========
/**
 * @route   GET /api/v1/user/hotels/search
 * @desc    Search hotels with filters
 * @access  Private
 */
router.get('/hotels/search', 
  authUser, 
  [
    query('checkIn').optional().isISO8601().withMessage('Valid check-in date required'),
    query('checkOut').optional().isISO8601().withMessage('Valid check-out date required'),
    query('guests').optional().isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20'),
    query('rooms').optional().isInt({ min: 1, max: 10 }).withMessage('Rooms must be between 1 and 10'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be positive'),
    query('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  validateRequest, 
  userDashboardController.searchHotels
);

/**
 * @route   GET /api/v1/user/hotels/favorites
 * @desc    Get user's favorite hotels
 * @access  Private
 */
router.get('/hotels/favorites', 
  authUser, 
  userDashboardController.getFavoriteHotels
);

/**
 * @route   POST /api/v1/user/hotels/:hotelId/favorite
 * @desc    Add hotel to favorites
 * @access  Private
 */
router.post('/hotels/:hotelId/favorite', 
  authUser, 
  [param('hotelId').isMongoId().withMessage('Valid hotel ID is required')],
  validateRequest, 
  userDashboardController.addToFavorites
);

/**
 * @route   DELETE /api/v1/user/hotels/:hotelId/favorite
 * @desc    Remove hotel from favorites
 * @access  Private
 */
router.delete('/hotels/:hotelId/favorite', 
  authUser, 
  [param('hotelId').isMongoId().withMessage('Valid hotel ID is required')],
  validateRequest, 
  userDashboardController.removeFromFavorites
);

// ========== TRAVEL PREFERENCES ==========
/**
 * @route   GET /api/v1/user/preferences
 * @desc    Get user travel preferences
 * @access  Private
 */
router.get('/preferences', 
  authUser, 
  userDashboardController.getPreferences
);

/**
 * @route   PUT /api/v1/user/preferences
 * @desc    Update user travel preferences
 * @access  Private
 */
router.put('/preferences', 
  authUser,
  [
    body('currency').optional().isIn(['PKR', 'USD', 'EUR']).withMessage('Invalid currency'),
    body('language').optional().isIn(['en', 'ur']).withMessage('Invalid language'),
    body('notifications').optional().isObject().withMessage('Notifications must be an object'),
    body('roomPreferences').optional().isObject().withMessage('Room preferences must be an object')
  ],
  validateRequest, 
  userDashboardController.updatePreferences
);

// ========== NOTIFICATIONS ==========
/**
 * @route   GET /api/v1/user/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', 
  authUser, 
  paginationValidation, 
  validateRequest, 
  userDashboardController.getNotifications
);

/**
 * @route   PUT /api/v1/user/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:notificationId/read', 
  authUser, 
  [param('notificationId').isMongoId().withMessage('Valid notification ID is required')],
  validateRequest, 
  userDashboardController.markNotificationAsRead
);

// ========== REVIEWS & RATINGS ==========
/**
 * @route   GET /api/v1/user/reviews
 * @desc    Get user's reviews
 * @access  Private
 */
router.get('/reviews', 
  authUser, 
  paginationValidation, 
  validateRequest, 
  userDashboardController.getMyReviews
);

/**
 * @route   POST /api/v1/user/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/reviews', 
  authUser, 
  reviewValidation, 
  validateRequest, 
  userDashboardController.createReview
);

// ========== SUPPORT & HELP ==========
/**
 * @route   POST /api/v1/user/support/tickets
 * @desc    Create support ticket
 * @access  Private
 */
router.post('/support/tickets', 
  authUser, 
  supportTicketValidation, 
  validateRequest, 
  userDashboardController.createSupportTicket
);

/**
 * @route   GET /api/v1/user/support/tickets
 * @desc    Get user's support tickets
 * @access  Private
 */
router.get('/support/tickets', 
  authUser, 
  paginationValidation, 
  validateRequest, 
  userDashboardController.getMySupportTickets
);

// ========== ANALYTICS & INSIGHTS ==========
/**
 * @route   GET /api/v1/user/insights/travel
 * @desc    Get user travel insights and analytics
 * @access  Private
 */
router.get('/insights/travel', 
  authUser,
  [
    query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Valid year required')
  ],
  validateRequest, 
  userDashboardController.getTravelInsights
);

module.exports = router;