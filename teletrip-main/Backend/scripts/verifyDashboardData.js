// Backend/scripts/verifyDashboardData.js
// Run: node scripts/verifyDashboardData.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const Hotel = require('../models/hotel.model');

async function verifyData() {
  try {
    await mongoose.connect(process.env.DB_CONNECT || 'mongodb://localhost:27017/auth-api');
    console.log('✅ Connected to MongoDB\n');

    // Count documents
    const [userCount, bookingCount, paymentCount, hotelCount] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Payment.countDocuments(),
      Hotel.countDocuments()
    ]);

    console.log('📊 DATABASE COUNTS:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Payments: ${paymentCount}`);
    console.log(`   Hotels: ${hotelCount}\n`);

    // Check sample documents
    console.log('📄 SAMPLE DOCUMENTS:\n');

    // Check Users
    if (userCount > 0) {
      const sampleUser = await User.findOne().lean();
      console.log('User Sample:', {
        _id: sampleUser._id,
        email: sampleUser.email,
        role: sampleUser.role,
        isActive: sampleUser.isActive,
        status: sampleUser.status,
        createdAt: sampleUser.createdAt
      });
    }

    // Check Bookings
    if (bookingCount > 0) {
      const sampleBooking = await Booking.findOne().lean();
      console.log('\nBooking Sample:', {
        _id: sampleBooking._id,
        user: sampleBooking.user || sampleBooking.userId,
        hotel: sampleBooking.hotel || sampleBooking.hotelId,
        status: sampleBooking.status,
        totalAmount: sampleBooking.totalAmount || sampleBooking.pricing?.totalAmount,
        createdAt: sampleBooking.createdAt
      });
    }

    // Check Payments
    if (paymentCount > 0) {
      const samplePayment = await Payment.findOne().lean();
      console.log('\nPayment Sample:', {
        _id: samplePayment._id,
        user: samplePayment.user || samplePayment.userId,
        amount: samplePayment.amount,
        status: samplePayment.status,
        method: samplePayment.method || samplePayment.paymentMethod,
        createdAt: samplePayment.createdAt
      });
    }

    // Check Hotels
    if (hotelCount > 0) {
      const sampleHotel = await Hotel.findOne().lean();
      console.log('\nHotel Sample:', {
        _id: sampleHotel._id,
        name: sampleHotel.name,
        isActive: sampleHotel.isActive,
        status: sampleHotel.status,
        createdAt: sampleHotel.createdAt
      });
    }

    // Test the admin dashboard query logic
    console.log('\n🔍 TESTING DASHBOARD QUERIES:\n');

    // Test User queries
    const totalUsers = await User.countDocuments({ isActive: true });
    const allUsers = await User.countDocuments();
    console.log(`Active Users (isActive: true): ${totalUsers}`);
    console.log(`All Users: ${allUsers}`);

    // Test alternative user query
    const totalUsersAlt = await User.countDocuments({ status: 'active' });
    console.log(`Users (status: 'active'): ${totalUsersAlt}`);

    // Test Booking queries
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    console.log(`\nTotal Bookings: ${totalBookings}`);
    console.log(`Completed Bookings: ${completedBookings}`);
    console.log(`Confirmed Bookings: ${confirmedBookings}`);

    // Test Payment queries
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const paidPayments = await Payment.countDocuments({ status: 'paid' });
    console.log(`\nTotal Payments: ${totalPayments}`);
    console.log(`Completed Payments: ${completedPayments}`);
    console.log(`Paid Payments: ${paidPayments}`);

    // Test revenue query
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log(`\nRevenue (status='completed'): ${revenueResult[0]?.total || 0}`);

    // Test alternative revenue query
    const revenueAlt = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log(`Revenue (status='paid'): ${revenueAlt[0]?.total || 0}`);

    // Test Hotel queries
    const totalHotels = await Hotel.countDocuments();
    const activeHotelsIsActive = await Hotel.countDocuments({ isActive: true });
    const activeHotelsStatus = await Hotel.countDocuments({ status: 'active' });
    console.log(`\nTotal Hotels: ${totalHotels}`);
    console.log(`Active Hotels (isActive: true): ${activeHotelsIsActive}`);
    console.log(`Active Hotels (status: 'active'): ${activeHotelsStatus}`);

    console.log('\n✅ Verification complete!');
    
    // Provide fix recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (allUsers > 0 && totalUsers === 0 && totalUsersAlt > 0) {
      console.log('⚠️  Users use "status" field, not "isActive"');
      console.log('   Fix: Change query from { isActive: true } to { status: "active" }');
    }
    if (totalPayments > 0 && completedPayments === 0 && paidPayments > 0) {
      console.log('⚠️  Payments use status "paid", not "completed"');
      console.log('   Fix: Change query from { status: "completed" } to { status: "paid" }');
    }
    if (totalHotels > 0 && activeHotelsIsActive === 0 && activeHotelsStatus > 0) {
      console.log('⚠️  Hotels use "status" field, not "isActive"');
      console.log('   Fix: Change query from { isActive: true } to { status: "active" }');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyData();