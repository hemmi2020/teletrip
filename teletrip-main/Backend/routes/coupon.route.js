const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authUser, requireRole } = require('../middlewares/auth.middleware');

const requireAdmin = [authUser, requireRole(['admin', 'super_admin'])];

// Public / User Checkout Validation Endpoint
router.post('/validate', couponController.validateCoupon);

// Admin routes
router.get('/', ...requireAdmin, couponController.getCoupons);
router.post('/', ...requireAdmin, couponController.createCoupon);
router.put('/:id', ...requireAdmin, couponController.updateCoupon);
router.delete('/:id', ...requireAdmin, couponController.deleteCoupon);
router.patch('/:id/toggle', ...requireAdmin, couponController.toggleCoupon);

module.exports = router;
