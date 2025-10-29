const express = require('express'); 
const router = express.Router(); 
const {body} = require('express-validator');
const userController = require('../controllers/user.controller'); 
const authMiddleware = require('../middlewares/auth.middleware');   
const { validateRequest } = require('../middlewares/validation.middleware');
const userModel = require('../models/user.model');
 
 
router.post('/register',[ 
    body('fullname.firstname').isLength({min: 3}).withMessage('First name must be atleast 3 characters long'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 6}).withMessage('Password must be atleast 6 characters long') 
],validateRequest,userController.registerUser)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'), 
    body('password').isLength({min: 6}).withMessage('Password must be atleast 6 characters long')
],validateRequest, userController.loginUser);
console.log('authUser:', typeof authMiddleware.authUser);
console.log('getUserProfile:', typeof userController.getUserProfile);   

// Google OAuth Login/Signup Route
router.post('/google-auth', async (req, res) => {
  try {
    const { email, name, googleId, picture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ 
        message: 'Email and Google ID are required' 
      });
    }

    // Check if user exists
    let user = await userModel.findOne({ email });

    if (user) {
      // User exists - update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Create new user
      const nameParts = name ? name.split(' ') : ['User', ''];
      user = await userModel.create({
        googleId,
        email,
        fullname: {
          firstname: nameParts[0] || 'User',
          lastname: nameParts.slice(1).join(' ') || '',
        },
        profilePicture: picture,
        isVerified: true, // Google accounts are pre-verified
      });
    }

    // Generate JWT token (using your existing token generation)
    const token = user.generateAuthToken();

    // Return user data and token
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        profilePicture: user.profilePicture,
        googleId: user.googleId
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: 'Failed to authenticate with Google',
      error: error.message 
    });
  }
});


router.get('/profile', authMiddleware.authUser, userController.getUserProfile); 
router.post('/logout', authMiddleware.authUser, userController.logoutUser);

// New routes for dashboard functionality
router.put('/profile', [
  body('fullname.firstname').optional().isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
  body('fullname.lastname').optional().isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], authMiddleware.authUser, userController.updateUserProfile);

router.get('/bookings', authMiddleware.authUser, userController.getUserBookings);
router.get('/bookings/:bookingId', authMiddleware.authUser, userController.getBookingDetails);
router.put('/bookings/:bookingId/cancel', authMiddleware.authUser, userController.cancelBooking);

router.get('/payments', authMiddleware.authUser, userController.getPaymentHistory);

router.put('/preferences', [
  body('emailNotifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('twoFactorAuth').optional().isBoolean().withMessage('Two factor auth must be boolean')
], authMiddleware.authUser, userController.updateUserPreferences);


router.delete('/account', [
  body('password').notEmpty().withMessage('Password is required for account deletion')
], authMiddleware.authUser, userController.deleteUserAccount);

// Change/Set password
router.post('/change-password', [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authMiddleware.authUser, userController.changePassword);

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], validateRequest, userController.forgotPassword);

// Reset password
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return value;
  })
], validateRequest, userController.resetPassword);



module.exports = router;