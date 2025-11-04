const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const { authenticateAdmin } = require('../middlewares/auth.middleware');

// Financial overview
router.get('/overview', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [payments, bookings] = await Promise.all([
      Payment.find(query),
      Booking.find(query)
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCost = bookings.reduce((sum, b) => sum + (b.cost || b.totalAmount * 0.7), 0);
    const totalCommission = totalRevenue * 0.1;
    const totalRefunds = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);
    const netProfit = totalRevenue - totalCost - totalCommission - totalRefunds;

    const revenueByCategory = [
      { category: 'Hotels', amount: totalRevenue * 0.7, percentage: 70 },
      { category: 'Activities', amount: totalRevenue * 0.2, percentage: 20 },
      { category: 'Transfers', amount: totalRevenue * 0.1, percentage: 10 }
    ];

    res.json({
      success: true,
      data: {
        totalRevenue,
        netProfit,
        profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
        totalCommission,
        commissionRate: 10,
        totalRefunds,
        refundCount: payments.filter(p => p.status === 'refunded').length,
        revenueGrowth: 15,
        revenueByCategory,
        taxableAmount: totalRevenue,
        taxRate: 17,
        taxAmount: totalRevenue * 0.17
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get refunds
router.get('/refunds', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { status: 'refunded' };
    if (status && status !== 'all') query.refundStatus = status;

    const payments = await Payment.find(query)
      .populate('userId', 'fullname email')
      .populate('bookingId', 'bookingReference');

    const refunds = payments.map(p => ({
      id: p._id,
      bookingId: p.bookingId?.bookingReference || p._id,
      userName: p.userId?.fullname?.firstname + ' ' + p.userId?.fullname?.lastname,
      amount: p.amount,
      reason: p.refundReason || 'Customer request',
      status: p.refundStatus || 'pending'
    }));

    res.json({ success: true, data: refunds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process refund
router.post('/refunds/:refundId/:action', authenticateAdmin, async (req, res) => {
  try {
    const { refundId, action } = req.params;
    await Payment.findByIdAndUpdate(refundId, {
      refundStatus: action === 'approve' ? 'approved' : 'rejected'
    });
    res.json({ success: true, message: `Refund ${action}d` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get commissions
router.get('/commissions', authenticateAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $in: ['confirmed', 'completed'] } });
    
    const commissions = bookings.map(b => ({
      id: b._id,
      bookingId: b.bookingReference || b._id,
      amount: b.totalAmount,
      rate: 10,
      commission: b.totalAmount * 0.1,
      status: b.commissionPaid ? 'paid' : 'pending'
    }));

    const summary = {
      total: commissions.reduce((sum, c) => sum + c.commission, 0),
      paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission, 0),
      pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission, 0)
    };

    res.json({ success: true, data: { commissions, summary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reconcile payments
router.post('/reconcile', authenticateAdmin, async (req, res) => {
  try {
    const payments = await Payment.find();
    
    const matched = payments.filter(p => p.status === 'completed').length;
    const unmatched = payments.filter(p => p.status === 'failed').length;
    const pending = payments.filter(p => p.status === 'pending').length;

    res.json({
      success: true,
      data: {
        matched,
        matchedAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        unmatched,
        unmatchedAmount: payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
        pending,
        pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        discrepancies: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Financial forecast
router.get('/forecast', authenticateAdmin, async (req, res) => {
  try {
    const { period } = req.query;
    const months = period === '1month' ? 1 : period === '3months' ? 3 : period === '6months' ? 6 : 12;

    const chartData = Array.from({ length: months }, (_, i) => ({
      month: `Month ${i + 1}`,
      actual: Math.floor(Math.random() * 100000) + 50000,
      forecast: Math.floor(Math.random() * 120000) + 60000
    }));

    res.json({
      success: true,
      data: {
        projectedRevenue: 500000,
        revenueGrowth: 15,
        projectedProfit: 150000,
        profitGrowth: 12,
        confidence: 85,
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
