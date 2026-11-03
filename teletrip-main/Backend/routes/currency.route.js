const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validation.middleware');
const { authUser } = require('../middlewares/auth.middleware');
const currencyService = require('../services/currency.service');
const ApiResponse = require('../utils/response.util');

/**
 * @route   POST /api/currency/convert
 * @desc    Convert any currency (AED, EUR, USD, GBP) to PKR with admin commission & service charges
 * @access  Public
 */
router.post('/convert', [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isString().withMessage('Currency must be a string')
], validateRequest, async (req, res) => {
  try {
    const { amount, currency, applyCommission } = req.body;
    const targetCurrency = currency || 'AED';
    const conversion = await currencyService.convertCurrency(amount, targetCurrency, { applyCommission });
    return ApiResponse.success(res, conversion, 'Currency converted successfully');
  } catch (error) {
    console.error('Currency conversion error:', error);
    return ApiResponse.error(res, 'Failed to convert currency', 500);
  }
});

/**
 * @route   GET /api/currency/rate
 * @desc    Get current exchange rates, commission %, and service charge %
 * @access  Public
 */
router.get('/rate', async (req, res) => {
  try {
    const settings = await currencyService.getCurrencySettings();
    return ApiResponse.success(res, settings, 'Exchange rates retrieved successfully');
  } catch (error) {
    console.error('Exchange rate error:', error);
    return ApiResponse.error(res, 'Failed to fetch exchange rates', 500);
  }
});

/**
 * @route   GET /api/currency/settings
 * @desc    Get currency and commission settings
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
 * @route   PUT /api/currency/settings
 * @desc    Update unified pricing, commission, and currency settings (Admin only)
 * @access  Private (Admin)
 */
router.put('/settings', authUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return ApiResponse.error(res, 'Unauthorized. Admin access required.', 403);
    }

    const {
      commissionPercentage,
      serviceChargePercentage,
      primaryCurrency,
      manualRates,
      autoFetchRates,
      markupPerEuro
    } = req.body;

    const updated = await currencyService.updateSettings({
      commissionPercentage,
      serviceChargePercentage,
      primaryCurrency,
      manualRates,
      autoFetchRates,
      markupPerEuro
    }, req.user._id);

    return ApiResponse.success(res, updated, 'Currency and commission settings updated successfully');
  } catch (error) {
    console.error('Settings update error:', error);
    return ApiResponse.error(res, 'Failed to update settings', 500);
  }
});

/**
 * @route   PUT /api/currency/settings/markup
 * @desc    Update markup per EUR (Admin only - legacy support)
 * @access  Private (Admin)
 */
router.put('/settings/markup', [
  authUser,
  body('markupPerEuro').isFloat({ min: 0, max: 100 }).withMessage('Markup must be between 0 and 100')
], validateRequest, async (req, res) => {
  try {
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
 * @desc    Update transaction fee percentage (Admin only - legacy support)
 * @access  Private (Admin)
 */
router.put('/settings/transaction-fee', [
  authUser,
  body('transactionFeePercentage').isFloat({ min: 0, max: 20 }).withMessage('Transaction fee must be between 0 and 20%')
], validateRequest, async (req, res) => {
  try {
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

/**
 * @route   PUT /api/currency/settings/exchange-rate
 * @desc    Update exchange rate (Admin only - legacy support)
 * @access  Private (Admin)
 */
router.put('/settings/exchange-rate', [
  authUser,
  body('exchangeRate').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Exchange rate must be a positive number or null')
], validateRequest, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return ApiResponse.error(res, 'Unauthorized. Admin access required.', 403);
    }

    const { exchangeRate } = req.body;
    const settings = await currencyService.updateExchangeRate(exchangeRate || null, req.user._id);
    return ApiResponse.success(res, settings, 'Exchange rate updated successfully');
  } catch (error) {
    console.error('Exchange rate update error:', error);
    return ApiResponse.error(res, 'Failed to update exchange rate', 500);
  }
});

module.exports = router;
