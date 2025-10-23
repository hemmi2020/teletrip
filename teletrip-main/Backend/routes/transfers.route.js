const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const transfersController = require('../controllers/transfers.controller');
const { authUser, optionalAuth } = require('../middlewares/auth.middleware');

const transfersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many transfer requests'
});

const searchValidation = [
  body('fromType').isIn(['ATLAS', 'IATA', 'GIATA', 'PORT', 'STATION']).withMessage('Invalid fromType'),
  body('fromCode').notEmpty().withMessage('fromCode is required'),
  body('toType').isIn(['ATLAS', 'IATA', 'GIATA', 'PORT', 'STATION']).withMessage('Invalid toType'),
  body('toCode').notEmpty().withMessage('toCode is required'),
  body('outbound').notEmpty().withMessage('Date is required'),
  body('adults').optional().isInt({ min: 1 }),
  body('children').optional().isInt({ min: 0 }),
  body('infants').optional().isInt({ min: 0 })
];

const availabilityValidation = [
  body('rateKey').notEmpty().withMessage('rateKey is required'),
  body('transfers').isArray({ min: 1 }).withMessage('At least one transfer required')
];

const bookingValidation = [
  body('holder.name').notEmpty().withMessage('Holder name is required'),
  body('holder.surname').notEmpty().withMessage('Holder surname is required'),
  body('holder.email').isEmail().withMessage('Valid email is required'),
  body('holder.phone').notEmpty().withMessage('Phone is required'),
  body('transfers').isArray({ min: 1 }).withMessage('At least one transfer required'),
  body('transfers.*.rateKey').notEmpty().withMessage('Transfer rateKey is required'),
  body('transfers.*.transferDetails').isArray({ min: 1 }).withMessage('Transfer details required'),
  body('clientReference').optional().isString()
];

router.post('/search', transfersLimiter, searchValidation, transfersController.searchTransfers);
router.get('/:code/details', transfersLimiter, transfersController.getTransferDetails);
router.post('/availability', transfersLimiter, availabilityValidation, transfersController.checkAvailability);
router.post('/bookings', authUser, bookingValidation, transfersController.createBooking);
router.get('/bookings/:reference', authUser, transfersController.getBookingDetails);
router.delete('/bookings/:reference', authUser, transfersController.cancelBooking);
router.get('/bookings', authUser, transfersController.listUserBookings);

module.exports = router;
