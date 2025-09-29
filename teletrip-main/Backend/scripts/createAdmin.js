const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
require('dotenv').config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await userModel.findOne({ 
            email: process.env.ADMIN_EMAIL || 'admin@telitrip.com' 
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD || 'Admin@123456',
            12
        );

        // Create admin user
        const admin = await userModel.create({
            email: process.env.ADMIN_EMAIL || 'admin@telitrip.com',
            password: hashedPassword,
            fullname: {
                firstname: 'Admin',
                lastname: 'User'
            },
            role: 'admin',
            status: 'active',
            isEmailVerified: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
        console.log('👤 Role:', admin.role);

        // Optionally create super admin
        const existingSuperAdmin = await userModel.findOne({ 
            email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@telitrip.com' 
        });

        if (!existingSuperAdmin) {
            const superAdminPassword = await bcrypt.hash('SuperAdmin@123456', 12);
            
            const superAdmin = await userModel.create({
                email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@telitrip.com',
                password: superAdminPassword,
                fullname: {
                    firstname: 'Super',
                    lastname: 'Admin'
                },
                role: 'super_admin',
                status: 'active',
                isEmailVerified: true
            });

            console.log('\n✅ Super Admin user created successfully!');
            console.log('📧 Email:', superAdmin.email);
            console.log('🔑 Password: SuperAdmin@123456');
            console.log('👤 Role:', superAdmin.role);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();