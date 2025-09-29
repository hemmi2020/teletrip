// ========================================
// Test Admin Password
// Save as: Backend/scripts/testPassword.js
// Run: node scripts/testPassword.js
// ========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testPassword = async () => {
    try {
        console.log('\n🔐 TESTING ADMIN PASSWORD\n');
        console.log('═══════════════════════════════════\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('✅ Connected to MongoDB\n');

        // Get admin user
        const User = mongoose.connection.collection('users');
        const admin = await User.findOne({ email: 'admin@telitrip.com' });

        if (!admin) {
            console.log('❌ Admin user not found');
            process.exit(1);
        }

        console.log('👤 Admin found');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password Hash:', admin.password);
        console.log('');

        // Test different passwords
        const testPasswords = [
            'Admin@123456',
            'admin@123456', 
            'Admin123456',
            'StrongAdminPassword123!',
            'admin'
        ];

        console.log('🧪 Testing passwords...\n');

        for (const pwd of testPasswords) {
            const isMatch = await bcrypt.compare(pwd, admin.password);
            console.log(`   "${pwd}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
        }

        console.log('');

        // Check if any matched
        const correctPassword = await bcrypt.compare('Admin@123456', admin.password);
        
        if (correctPassword) {
            console.log('═══════════════════════════════════');
            console.log('✅ CORRECT PASSWORD: Admin@123456');
            console.log('═══════════════════════════════════\n');
        } else {
            console.log('═══════════════════════════════════');
            console.log('❌ PASSWORD MISMATCH DETECTED');
            console.log('═══════════════════════════════════\n');
            
            console.log('🔧 FIXING: Creating new password hash...\n');
            
            const newPassword = 'Admin@123456';
            const newHash = await bcrypt.hash(newPassword, 12);
            
            await User.updateOne(
                { email: 'admin@telitrip.com' },
                { $set: { password: newHash } }
            );
            
            console.log('✅ Password updated successfully!');
            console.log('🔑 New Password: Admin@123456\n');
            
            // Verify the new password
            const updatedAdmin = await User.findOne({ email: 'admin@telitrip.com' });
            const verified = await bcrypt.compare(newPassword, updatedAdmin.password);
            
            if (verified) {
                console.log('✅ VERIFICATION PASSED: Password works now!\n');
            }
        }

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testPassword();