const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { validateRequest } = require('../middlewares/validation.middleware');
const { authUser } = require('../middlewares/auth.middleware');
const currencyService = require('../services/currency.service');
const ApiResponse = require('../utils/response.util');

/**
 * @route   POST /api/currency/convert
 * @desc    Convert EUR to PKR with markup
 * @access  Public
 */
router.post('/convert', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isIn(['EUR']).withMessage('Only EUR is supported')
], validateRequest, async (req, res) => {
  try {
    const { amount } = req.body;
    const conversion = await currencyService.convertEURtoPKR(amount);
    return ApiResponse.success(res, conversion, 'Currency converted successfully');
  } catch (error) {
    console.error('Currency conversion error:', error);
    return ApiResponse.error(res, 'Failed to convert currency', 500);
  }
});

/**
 * @route   GET /api/currency/rate
 * @desc    Get current EUR to PKR exchange rate
 * @access  Public
 */
router.get('/rate', async (req, res) => {
  try {
    const rate = await currencyService.getExchangeRate();
    const markup = await currencyService.getMarkupPerEuro();
    const transactionFee = await currencyService.getTransactionFeePercentage();
    
    return ApiResponse.success(res, {
      exchangeRate: rate,
      markupPerEuro: markup,
      transactionFeePercentage: transactionFee,
      effectiveRate: rate + markup
    }, 'Exchange rate retrieved successfully');
  } catch (error) {
    console.error('Exchange rate error:', error);
    return ApiResponse.error(res, 'Failed to fetch exchange rate', 500);
  }
});

/**
 * @route   GET /api/currency/settings
 * @desc    Get currency settings
 * @access  Private (Admin)
 */
router.get('/settings', authUser, async (req, res) => {
  try {
    const settings = await currencyService.getCurrencySettings();
    return ApiResponse.success(res, settings, 'Currency settings retrieved successfully');
  } catch (error) {
    console.error('Settings fetch error:', error);
    return ApiResponse.error(res, 'Failed to fetch settings', 500);
  }
});

/**
 * @route   PUT /api/currency/settings/markup
 * @desc    Update markup per EUR (Admin only)
 * @access  Private (Admin)
 */
router.put('/settings/markup', [
  authUser,
  body('markupPerEuro').isFloat({ min: 0, max: 100 }).withMessage('Markup must be between 0 and 100')
], validateRequest, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return ApiResponse.error(res, 'Unauthorized. Admin access required.', 403);
    }

    const { markupPerEuro } = req.body;
    const settings = await currencyService.updateMarkup(markupPerEuro, req.user._id);
    
    return ApiResponse.success(res, settings, 'Markup updated successfully');
  } catch (error) {
    console.error('Markup update error:', error);
    return ApiResponse.error(res, 'Failed to update markup', 500);
  }
});

/**
 * @route   PUT /api/currency/settings/transaction-fee
 * @desc    Update transaction fee percentage (Admin only)
 * @access  Private (Admin)
 */
router.put('/settings/transaction-fee', [
  authUser,
  body('transactionFeePercentage').isFloat({ min: 0, max: 10 }).withMessage('Transaction fee must be between 0 and 10%')
], validateRequest, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return ApiResponse.error(res, 'Unauthorized. Admin access required.', 403);
    }

    const { transactionFeePercentage } = req.body;
    const settings = await currencyService.updateTransactionFee(transactionFeePercentage, req.user._id);
    
    return ApiResponse.success(res, settings, 'Transaction fee updated successfully');
  } catch (error) {
    console.error('Transaction fee update error:', error);
    return ApiResponse.error(res, 'Failed to update transaction fee', 500);
  }
});

module.exports = router;
