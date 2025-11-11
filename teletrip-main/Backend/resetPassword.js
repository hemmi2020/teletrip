require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./models/user.model');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('✅ Connected to database');

    const email = 'hemmi@gmail.com';
    const newPassword = 'hamza123';

    const user = await userModel.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('👤 Found user:', user.email);
    
    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
