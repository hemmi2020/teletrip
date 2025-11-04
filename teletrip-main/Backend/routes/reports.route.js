const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const ScheduledReport = require('../models/scheduledReport.model');
const { authenticateAdmin } = require('../middlewares/auth.middleware');

// Generate revenue report
router.get('/revenue', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const bookings = await Booking.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $in: ['confirmed', 'completed'] }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalBookings = bookings.length;
    const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const byType = bookings.reduce((acc, b) => {
      const type = b.type || 'hotel';
      if (!acc[type]) acc[type] = { type, count: 0, revenue: 0 };
      acc[type].count++;
      acc[type].revenue += b.totalAmount || 0;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        avgOrderValue,
        byType: Object.values(byType)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate user activity report
router.get('/user-activity', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const activities = await Booking.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
    .populate('user', 'email fullname')
    .limit(100)
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        activities: activities.map(a => ({
          userName: a.user?.email || 'Unknown',
          action: 'Booking Created',
          date: a.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate booking analytics report
router.get('/booking-analytics', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const bookings = await Booking.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const totalBookings = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;

    const destinations = bookings.reduce((acc, b) => {
      const dest = b.hotelBooking?.hotelAddress?.city || 'Unknown';
      if (!acc[dest]) acc[dest] = { name: dest, count: 0, revenue: 0 };
      acc[dest].count++;
      acc[dest].revenue += b.totalAmount || 0;
      return acc;
    }, {});

    const topDestinations = Object.values(destinations)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmed,
        pending,
        cancelled,
        topDestinations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scheduled reports
router.get('/scheduled', authenticateAdmin, async (req, res) => {
  try {
    const schedules = await ScheduledReport.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create scheduled report
router.post('/scheduled', authenticateAdmin, async (req, res) => {
  try {
    const schedule = new ScheduledReport({
      ...req.body,
      createdBy: req.user._id
    });
    await schedule.save();
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update scheduled report
router.put('/scheduled/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ScheduledReport.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete scheduled report
router.delete('/scheduled/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ScheduledReport.findByIdAndDelete(id);
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({
      success: true,
      message: 'Schedule deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Email report
router.post('/email', authenticateAdmin, async (req, res) => {
  try {
    const { reportData, recipients } = req.body;
    // Implement email sending logic
    res.json({
      success: true,
      message: 'Report sent successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate invoice
router.get('/invoice/:bookingId', authenticateAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('user');
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({
      success: true,
      data: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        userName: booking.user?.fullname?.firstname + ' ' + booking.user?.fullname?.lastname,
        userEmail: booking.user?.email,
        amount: booking.totalAmount,
        type: booking.type || 'Hotel Booking',
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
