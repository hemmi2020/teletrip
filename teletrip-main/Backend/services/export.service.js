// CREATE THIS FILE: services/export.service.js

const ExcelJS = require('exceljs');
const moment = require('moment');
const userModel = require('../models/user.model');
const bookingModel = require('../models/booking.model');
const paymentModel = require('../models/payment.model');

class ExportService {
    
    // ========== MAIN EXPORT FUNCTION ==========
    async exportData(type, format, options = {}) {
        const { startDate, endDate } = options;
        
        switch (type) {
            case 'users':
                return await this.exportUsers(format, startDate, endDate);
            case 'bookings':
                return await this.exportBookings(format, startDate, endDate);
            case 'payments':
                return await this.exportPayments(format, startDate, endDate);
            case 'summary':
                return await this.generateSummaryReport(format, startDate, endDate);
            default:
                throw new Error('Invalid export type');
        }
    }

    // ========== USER EXPORTS ==========
    async exportUsers(format, startDate, endDate) {
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const users = await userModel.find(query)
            .select('fullname email phone dateOfBirth gender isActive createdAt')
            .lean();

        const filename = `users_export_${moment().format('YYYYMMDD_HHmmss')}`;

        switch (format) {
            case 'csv':
                return this.generateUsersCSV(users, filename);
            case 'excel':
                return this.generateUsersExcel(users, filename);
            default:
                return this.generateUsersCSV(users, filename);
        }
    }

    generateUsersCSV(users, filename) {
        const headers = ['Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Status', 'Registration Date'];
        
        let csv = headers.join(',') + '\n';
        
        users.forEach(user => {
            const row = [
                `"${user.fullname?.firstname || ''} ${user.fullname?.lastname || ''}"`,
                `"${user.email}"`,
                `"${user.phone || ''}"`,
                `"${user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : ''}"`,
                `"${user.gender || ''}"`,
                `"${user.isActive ? 'Active' : 'Inactive'}"`,
                `"${moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss')}"`
            ];
            csv += row.join(',') + '\n';
        });

        return {
            data: csv,
            filename: `${filename}.csv`,
            contentType: 'text/csv'
        };
    }

    async generateUsersExcel(users, filename) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 35 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
            { header: 'Gender', key: 'gender', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Registration Date', key: 'registrationDate', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        users.forEach(user => {
            worksheet.addRow({
                name: `${user.fullname?.firstname || ''} ${user.fullname?.lastname || ''}`,
                email: user.email,
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : '',
                gender: user.gender || '',
                status: user.isActive ? 'Active' : 'Inactive',
                registrationDate: moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss')
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return {
            data: buffer,
            filename: `${filename}.xlsx`,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    }

    // ========== BOOKING EXPORTS ==========
    async exportBookings(format, startDate, endDate) {
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const bookings = await bookingModel.find(query)
            .populate('userId', 'fullname email')
            .lean();

        const filename = `bookings_export_${moment().format('YYYYMMDD_HHmmss')}`;

        switch (format) {
            case 'csv':
                return this.generateBookingsCSV(bookings, filename);
            case 'excel':
                return this.generateBookingsExcel(bookings, filename);
            default:
                return this.generateBookingsCSV(bookings, filename);
        }
    }

    generateBookingsCSV(bookings, filename) {
        const headers = [
            'Booking ID', 'Guest Name', 'Email', 'Hotel', 'Location',
            'Check-in', 'Check-out', 'Guests', 'Status', 'Total Amount', 'Booking Date'
        ];
        
        let csv = headers.join(',') + '\n';
        
        bookings.forEach(booking => {
            const guestName = booking.userId?.fullname 
                ? `${booking.userId.fullname.firstname} ${booking.userId.fullname.lastname}`
                : 'N/A';
                
            const row = [
                `"${booking.bookingId || booking._id}"`,
                `"${guestName}"`,
                `"${booking.userId?.email || 'N/A'}"`,
                `"${booking.hotelName || 'N/A'}"`,
                `"${booking.location || 'N/A'}"`,
                `"${moment(booking.checkIn).format('YYYY-MM-DD')}"`,
                `"${moment(booking.checkOut).format('YYYY-MM-DD')}"`,
                `"${booking.guests || 'N/A'}"`,
                `"${booking.status || 'N/A'}"`,
                `"PKR ${booking.totalAmount || 0}"`,
                `"${moment(booking.createdAt).format('YYYY-MM-DD HH:mm:ss')}"`
            ];
            csv += row.join(',') + '\n';
        });

        return {
            data: csv,
            filename: `${filename}.csv`,
            contentType: 'text/csv'
        };
    }

    async generateBookingsExcel(bookings, filename) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bookings');

        worksheet.columns = [
            { header: 'Booking ID', key: 'bookingId', width: 20 },
            { header: 'Guest Name', key: 'guestName', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Hotel', key: 'hotel', width: 30 },
            { header: 'Location', key: 'location', width: 20 },
            { header: 'Check-in', key: 'checkin', width: 15 },
            { header: 'Check-out', key: 'checkout', width: 15 },
            { header: 'Guests', key: 'guests', width: 10 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Total Amount', key: 'amount', width: 15 },
            { header: 'Booking Date', key: 'bookingDate', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        bookings.forEach(booking => {
            const guestName = booking.userId?.fullname 
                ? `${booking.userId.fullname.firstname} ${booking.userId.fullname.lastname}`
                : 'N/A';
                
            worksheet.addRow({
                bookingId: booking.bookingId || booking._id,
                guestName: guestName,
                email: booking.userId?.email || 'N/A',
                hotel: booking.hotelName || 'N/A',
                location: booking.location || 'N/A',
                checkin: moment(booking.checkIn).format('YYYY-MM-DD'),
                checkout: moment(booking.checkOut).format('YYYY-MM-DD'),
                guests: booking.guests || 'N/A',
                status: booking.status || 'N/A',
                amount: `PKR ${booking.totalAmount || 0}`,
                bookingDate: moment(booking.createdAt).format('YYYY-MM-DD HH:mm:ss')
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return {
            data: buffer,
            filename: `${filename}.xlsx`,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    }

    // ========== PAYMENT EXPORTS ==========
    async exportPayments(format, startDate, endDate) {
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const payments = await paymentModel.find(query)
            .populate('userId', 'fullname email')
            .populate('bookingId', 'bookingId')
            .lean();

        const filename = `payments_export_${moment().format('YYYYMMDD_HHmmss')}`;

        switch (format) {
            case 'csv':
                return this.generatePaymentsCSV(payments, filename);
            case 'excel':
                return this.generatePaymentsExcel(payments, filename);
            default:
                return this.generatePaymentsCSV(payments, filename);
        }
    }

    generatePaymentsCSV(payments, filename) {
        const headers = [
            'Transaction ID', 'User Name', 'Email', 'Booking ID',
            'Amount', 'Payment Method', 'Status', 'Payment Date'
        ];
        
        let csv = headers.join(',') + '\n';
        
        payments.forEach(payment => {
            const userName = payment.userId?.fullname 
                ? `${payment.userId.fullname.firstname} ${payment.userId.fullname.lastname}`
                : 'N/A';
                
            const row = [
                `"${payment.transactionId || payment.paymentId || payment._id}"`,
                `"${userName}"`,
                `"${payment.userId?.email || 'N/A'}"`,
                `"${payment.bookingId?.bookingId || payment.bookingId || 'N/A'}"`,
                `"PKR ${payment.amount || 0}"`,
                `"${payment.paymentMethod || 'N/A'}"`,
                `"${payment.status || 'N/A'}"`,
                `"${moment(payment.createdAt).format('YYYY-MM-DD HH:mm:ss')}"`
            ];
            csv += row.join(',') + '\n';
        });

        return {
            data: csv,
            filename: `${filename}.csv`,
            contentType: 'text/csv'
        };
    }

    async generatePaymentsExcel(payments, filename) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payments');

        worksheet.columns = [
            { header: 'Transaction ID', key: 'transactionId', width: 25 },
            { header: 'User Name', key: 'userName', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Booking ID', key: 'bookingId', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Payment Method', key: 'method', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment Date', key: 'paymentDate', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        payments.forEach(payment => {
            const userName = payment.userId?.fullname 
                ? `${payment.userId.fullname.firstname} ${payment.userId.fullname.lastname}`
                : 'N/A';
                
            worksheet.addRow({
                transactionId: payment.transactionId || payment.paymentId || payment._id,
                userName: userName,
                email: payment.userId?.email || 'N/A',
                bookingId: payment.bookingId?.bookingId || payment.bookingId || 'N/A',
                amount: `PKR ${payment.amount || 0}`,
                method: payment.paymentMethod || 'N/A',
                status: payment.status || 'N/A',
                paymentDate: moment(payment.createdAt).format('YYYY-MM-DD HH:mm:ss')
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return {
            data: buffer,
            filename: `${filename}.xlsx`,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
    }

    // ========== SUMMARY REPORTS ==========
    async generateSummaryReport(format, startDate, endDate) {
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const [userStats, bookingStats, paymentStats] = await Promise.all([
            userModel.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } }
                    }
                }
            ]),
            bookingModel.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                }
            ]),
            paymentModel.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        totalPayments: { $sum: 1 },
                        totalPaid: { $sum: '$amount' }
                    }
                }
            ])
        ]);

        const summary = {
            totalUsers: userStats[0]?.totalUsers || 0,
            activeUsers: userStats[0]?.activeUsers || 0,
            totalBookings: bookingStats[0]?.totalBookings || 0,
            totalRevenue: bookingStats[0]?.totalRevenue || 0,
            totalPayments: paymentStats[0]?.totalPayments || 0,
            totalPaid: paymentStats[0]?.totalPaid || 0
        };

        const filename = `summary_report_${moment().format('YYYYMMDD_HHmmss')}`;

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Summary');

            worksheet.columns = [
                { header: 'Metric', key: 'metric', width: 30 },
                { header: 'Value', key: 'value', width: 20 }
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            worksheet.addRow({ metric: 'Total Users', value: summary.totalUsers });
            worksheet.addRow({ metric: 'Active Users', value: summary.activeUsers });
            worksheet.addRow({ metric: 'Total Bookings', value: summary.totalBookings });
            worksheet.addRow({ metric: 'Total Revenue', value: `PKR ${summary.totalRevenue}` });
            worksheet.addRow({ metric: 'Total Payments', value: summary.totalPayments });
            worksheet.addRow({ metric: 'Total Paid', value: `PKR ${summary.totalPaid}` });

            const buffer = await workbook.xlsx.writeBuffer();

            return {
                data: buffer,
                filename: `${filename}.xlsx`,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        } else {
            // CSV
            const headers = ['Metric', 'Value'];
            let csv = headers.join(',') + '\n';
            csv += `Total Users,${summary.totalUsers}\n`;
            csv += `Active Users,${summary.activeUsers}\n`;
            csv += `Total Bookings,${summary.totalBookings}\n`;
            csv += `Total Revenue,PKR ${summary.totalRevenue}\n`;
            csv += `Total Payments,${summary.totalPayments}\n`;
            csv += `Total Paid,PKR ${summary.totalPaid}\n`;

            return {
                data: csv,
                filename: `${filename}.csv`,
                contentType: 'text/csv'
            };
        }
    }
}

module.exports = new ExportService();