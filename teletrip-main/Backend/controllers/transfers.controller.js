const transfersService = require('../services/hotelbedsTransfersService');
const { validationResult } = require('express-validator');

exports.searchTransfers = async (req, res) => {
  console.log('\n========== TRANSFERS SEARCH REQUEST ==========');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Request Headers:', req.headers);
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ success: false, message: 'Validation failed', error: errors.array()[0].msg });
    }

    console.log('Calling transfersService.searchTransfers...');
    const result = await transfersService.searchTransfers(req.body);
    console.log('Search successful, transfers found:', result.transfers?.length || 0);
    console.log('========== SEARCH COMPLETED ==========\n');
    res.json({ success: true, data: result, message: 'Transfers found' });
  } catch (error) {
    console.error('Transfer search error:', error.message);
    console.error('Error stack:', error.stack);
    console.log('========== SEARCH FAILED ==========\n');
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

exports.getTransferDetails = async (req, res) => {
  try {
    const { code } = req.params;
    const { searchId, language } = req.query;
    
    if (!searchId) {
      return res.status(400).json({ success: false, message: 'searchId is required' });
    }

    const result = await transfersService.getTransferDetails(code, searchId, language);
    res.json({ success: true, data: result, message: 'Transfer details retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get details', error: error.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', error: errors.array() });
    }

    const result = await transfersService.checkAvailability(req.body);
    res.json({ success: true, data: result, message: 'Availability checked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Availability check failed', error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', error: errors.array() });
    }

    const bookingData = { ...req.body, userId: req.user._id };
    const result = await transfersService.createBooking(bookingData);
    
    console.log('Booking created:', {
      reference: result.bookingReference,
      userId: req.user._id,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, data: result, message: 'Booking created successfully' });
  } catch (error) {
    console.error('Booking failed:', error.message);
    res.status(500).json({ success: false, message: 'Booking failed', error: error.message });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await transfersService.getBookingDetails(reference);
    res.json({ success: true, data: result, message: 'Booking details retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get booking', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { reference } = req.params;
    const { reason } = req.body;
    const result = await transfersService.cancelBooking(reference, req.user._id, reason);
    res.json({ success: true, data: result, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cancellation failed', error: error.message });
  }
};

exports.listUserBookings = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit
    };
    const result = await transfersService.getUserBookings(req.user._id, filters);
    res.json({ success: true, data: result, message: 'User bookings retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get bookings', error: error.message });
  }
};
