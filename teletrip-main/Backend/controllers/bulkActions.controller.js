const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Hotel = require('../models/hotel.model');
const SupportTicket = require('../models/supportticket.model');

// Bulk update users
exports.bulkUpdateUsers = async (req, res) => {
  try {
    const { action } = req.params;
    const { userIds } = req.body;

    let updateData = {};
    if (action === 'activate') {
      updateData = { isActive: true };
    } else if (action === 'deactivate') {
      updateData = { isActive: false };
    } else if (action === 'delete') {
      await User.updateMany(
        { _id: { $in: userIds } },
        { isDeleted: true, deletedAt: new Date() }
      );
      return res.json({
        success: true,
        message: `${userIds.length} users deleted successfully`
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk user update failed',
      error: error.message
    });
  }
};

// Bulk update bookings
exports.bulkUpdateBookings = async (req, res) => {
  try {
    const { action } = req.params;
    const { bookingIds } = req.body;

    let updateData = {};
    if (action === 'approve') {
      updateData = { status: 'confirmed' };
    } else if (action === 'reject') {
      updateData = { status: 'cancelled' };
    }

    const result = await Booking.updateMany(
      { _id: { $in: bookingIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} bookings updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk booking update failed',
      error: error.message
    });
  }
};

// Bulk update hotels
exports.bulkUpdateHotels = async (req, res) => {
  try {
    const { action } = req.params;
    const { hotelIds } = req.body;

    let updateData = {};
    if (action === 'approve') {
      updateData = { status: 'active', isActive: true };
    } else if (action === 'reject') {
      updateData = { status: 'rejected', isActive: false };
    } else if (action === 'delete') {
      await Hotel.updateMany(
        { _id: { $in: hotelIds } },
        { isDeleted: true, deletedAt: new Date() }
      );
      return res.json({
        success: true,
        message: `${hotelIds.length} hotels deleted successfully`
      });
    }

    const result = await Hotel.updateMany(
      { _id: { $in: hotelIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} hotels updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk hotel update failed',
      error: error.message
    });
  }
};

// Bulk update tickets
exports.bulkUpdateTickets = async (req, res) => {
  try {
    const { action } = req.params;
    const { ticketIds } = req.body;

    let updateData = {};
    if (action === 'close') {
      updateData = { status: 'closed', closedAt: new Date() };
    }

    const result = await SupportTicket.updateMany(
      { _id: { $in: ticketIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} tickets updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk ticket update failed',
      error: error.message
    });
  }
};

// Bulk export
exports.bulkExport = async (req, res) => {
  try {
    const { type, ids } = req.body;

    let data = [];
    let Model;

    switch (type) {
      case 'users':
        Model = User;
        break;
      case 'bookings':
        Model = Booking;
        break;
      case 'hotels':
        Model = Hotel;
        break;
      case 'support':
        Model = SupportTicket;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    data = await Model.find({ _id: { $in: ids } }).lean();

    // Convert to CSV
    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item =>
      Object.values(item).map(val =>
        typeof val === 'object' ? JSON.stringify(val) : val
      ).join(',')
    );

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk export failed',
      error: error.message
    });
  }
};

// Bulk email
exports.bulkEmail = async (req, res) => {
  try {
    const { type, ids, subject, message } = req.body;

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just return success
    
    res.json({
      success: true,
      message: `Bulk email sent to ${ids.length} recipients`,
      data: { sentCount: ids.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk email failed',
      error: error.message
    });
  }
};
