const nodemailer = require('nodemailer');
const Notification = require('../models/notification.model');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // ========== EMAIL NOTIFICATIONS ==========
  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to Telitrip - Your Travel Journey Begins!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Telitrip</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Telitrip!</h1>
              <p>Your gateway to amazing travel experiences</p>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Thank you for joining Telitrip! We're excited to help you discover and book incredible hotels around the world.</p>
              
              <h3>What you can do with Telitrip:</h3>
              <ul>
                <li>🏨 Search and book hotels worldwide</li>
                <li>💳 Secure payments with HBL Pay</li>
                <li>⭐ Read and write honest reviews</li>
                <li>📱 Manage bookings on the go</li>
                <li>🎯 Get personalized recommendations</li>
                <li>🏆 Earn loyalty points and rewards</li>
              </ul>
              
              <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Explore Your Dashboard</a>
              
              <p>If you have any questions, our support team is here to help 24/7.</p>
              
              <p>Happy travels!<br>The Telitrip Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Telitrip Travel & Tours. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendBookingConfirmation(email, booking) {
    const subject = `Booking Confirmed - ${booking.bookingReference}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
              <p>Reference: ${booking.bookingReference}</p>
            </div>
            <div class="content">
              <h2>Hello ${booking.userId.firstName}!</h2>
              <p>Great news! Your booking has been confirmed. Here are your details:</p>
              
              <div class="booking-details">
                <h3>${booking.hotelId.name}</h3>
                <div class="detail-row">
                  <span><strong>Check-in:</strong></span>
                  <span>${new Date(booking.checkInDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Check-out:</strong></span>
                  <span>${new Date(booking.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Guests:</strong></span>
                  <span>${booking.guests}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Rooms:</strong></span>
                  <span>${booking.rooms}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Total Amount:</strong></span>
                  <span>PKR ${booking.totalAmount}</span>
                </div>
              </div>
              
              <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" class="btn">View Booking Details</a>
              
              <p><strong>Important:</strong> Please arrive at the hotel with a valid ID and this confirmation.</p>
              
              <p>Have a wonderful stay!<br>The Telitrip Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendBookingCancellation(email, booking) {
    const subject = `Booking Cancelled - ${booking.bookingReference}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Cancellation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .cancellation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancelled</h1>
              <p>Reference: ${booking.bookingReference}</p>
            </div>
            <div class="content">
              <h2>Hello ${booking.userId.firstName},</h2>
              <p>Your booking has been cancelled as requested.</p>
              
              <div class="cancellation-details">
                <div class="detail-row">
                  <span><strong>Hotel:</strong></span>
                  <span>${booking.hotelId.name}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Original Amount:</strong></span>
                  <span>PKR ${booking.totalAmount}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Cancellation Fee:</strong></span>
                  <span>PKR ${booking.cancellation.fee}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Refund Amount:</strong></span>
                  <span>PKR ${booking.cancellation.refundAmount}</span>
                </div>
              </div>
              
              <p>If applicable, your refund will be processed within 5-7 business days.</p>
              
              <p>We're sorry to see you go. We hope to serve you again in the future!</p>
              
              <p>Best regards,<br>The Telitrip Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendPasswordChangeNotification(email, firstName) {
    const subject = 'Password Changed Successfully';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #17a2b8; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Changed</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName},</h2>
              <p>Your password has been successfully changed.</p>
              
              <div class="security-notice">
                <strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately.
              </div>
              
              <p>For your security, we recommend:</p>
              <ul>
                <li>Using a strong, unique password</li>
                <li>Not sharing your login credentials</li>
                <li>Logging out from shared devices</li>
              </ul>
              
              <p>Best regards,<br>The Telitrip Security Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendBookingStatusUpdate(email, booking) {
    const subject = `Booking Update - ${booking.bookingReference}`;
    const statusColors = {
      confirmed: '#28a745',
      completed: '#17a2b8',
      cancelled: '#dc3545'
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusColors[booking.status] || '#6c757d'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { background: ${statusColors[booking.status] || '#6c757d'}; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Status Update</h1>
              <p>Reference: ${booking.bookingReference}</p>
            </div>
            <div class="content">
              <h2>Hello ${booking.userId.firstName},</h2>
              <p>Your booking status has been updated:</p>
              
              <p><strong>New Status:</strong> <span class="status-badge">${booking.status.toUpperCase()}</span></p>
              
              <p><strong>Hotel:</strong> ${booking.hotelId.name}</p>
              
              ${booking.adminNotes ? `<p><strong>Notes:</strong> ${booking.adminNotes}</p>` : ''}
              
              <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Booking</a>
              
              <p>Best regards,<br>The Telitrip Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendSupportTicketNotification(ticket) {
    const subject = `New Support Ticket - ${ticket.ticketNumber}`;
    // This would typically go to the admin/support team
    const adminEmail = process.env.ADMIN_EMAIL;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Support Ticket</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .priority-high { color: #dc3545; font-weight: bold; }
            .priority-urgent { color: #dc3545; font-weight: bold; background: #f8d7da; padding: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 New Support Ticket</h1>
              <p>Ticket #${ticket.ticketNumber}</p>
            </div>
            <div class="content">
              <h2>Ticket Details</h2>
              
              <p><strong>User:</strong> ${ticket.userId?.firstName} ${ticket.userId?.lastName}</p>
              <p><strong>Email:</strong> ${ticket.userId?.email}</p>
              <p><strong>Subject:</strong> ${ticket.subject}</p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>Priority:</strong> 
                <span class="${ticket.priority === 'high' || ticket.priority === 'urgent' ? 'priority-' + ticket.priority : ''}">${ticket.priority.toUpperCase()}</span>
              </p>
              
              <h3>Description:</h3>
              <p>${ticket.description}</p>
              
              ${ticket.bookingId ? `<p><strong>Related Booking:</strong> ${ticket.bookingId}</p>` : ''}
              
              <a href="${process.env.FRONTEND_URL}/admin/support/tickets/${ticket._id}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Ticket</a>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(adminEmail, subject, html);
  }

  async sendTicketResponseNotification(ticket) {
    const user = ticket.userId;
    const subject = `Response to your ticket - ${ticket.ticketNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket Response</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 Support Response</h1>
              <p>Ticket #${ticket.ticketNumber}</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName},</h2>
              <p>We've responded to your support ticket regarding: <strong>${ticket.subject}</strong></p>
              
              <a href="${process.env.FRONTEND_URL}/support/tickets/${ticket._id}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Response</a>
              
              <p>If you need further assistance, please reply to this ticket.</p>
              
              <p>Best regards,<br>The Telitrip Support Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendAccountSuspensionNotification(email, reason) {
    const subject = 'Account Suspended - Telitrip';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Suspended</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Account Suspended</h1>
            </div>
            <div class="content">
              <div class="warning">
                <strong>Your Telitrip account has been suspended.</strong>
              </div>
              
              <p><strong>Reason:</strong> ${reason}</p>
              
              <p>If you believe this is an error or would like to appeal this decision, please contact our support team.</p>
              
              <p>Email: ${process.env.FROM_EMAIL}<br>
              Phone: ${process.env.COMPANY_PHONE || 'N/A'}</p>
              
              <p>Best regards,<br>The Telitrip Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendAccountReactivationNotification(email) {
    const subject = 'Account Reactivated - Welcome Back!';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Reactivated</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d1edff; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome Back!</h1>
            </div>
            <div class="content">
              <div class="success">
                <strong>Your Telitrip account has been reactivated!</strong>
              </div>
              
              <p>You can now access all features and services again.</p>
              
              <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Login to Your Account</a>
              
              <p>Thank you for being a valued member of Telitrip!</p>
              
              <p>Best regards,<br>The Telitrip Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // ========== IN-APP NOTIFICATIONS ==========
  async createNotification(userId, title, message, type = 'info', relatedId = null, relatedModel = null) {
    try {
      const notification = new Notification({
        userId,
        title,
        message,
        type,
        relatedId,
        relatedModel,
        isRead: false
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async sendBookingNotification(userId, booking, type) {
    const titles = {
      confirmed: 'Booking Confirmed',
      cancelled: 'Booking Cancelled',
      completed: 'Stay Completed',
      reminder: 'Upcoming Stay Reminder'
    };

    const messages = {
      confirmed: `Your booking at ${booking.hotelId.name} has been confirmed. Reference: ${booking.bookingReference}`,
      cancelled: `Your booking at ${booking.hotelId.name} has been cancelled. Reference: ${booking.bookingReference}`,
      completed: `Thank you for staying at ${booking.hotelId.name}. We hope you had a great experience!`,
      reminder: `Reminder: Your stay at ${booking.hotelId.name} starts tomorrow. Reference: ${booking.bookingReference}`
    };

    return await this.createNotification(
      userId,
      titles[type],
      messages[type],
      type === 'cancelled' ? 'warning' : 'info',
      booking._id,
      'Booking'
    );
  }

  async sendPaymentNotification(userId, payment, type) {
    const titles = {
      completed: 'Payment Successful',
      failed: 'Payment Failed',
      refunded: 'Refund Processed'
    };

    const messages = {
      completed: `Your payment of PKR ${payment.amount} has been processed successfully.`,
      failed: `Your payment of PKR ${payment.amount} could not be processed. Please try again.`,
      refunded: `A refund of PKR ${payment.refundAmount || payment.amount} has been processed to your account.`
    };

    return await this.createNotification(
      userId,
      titles[type],
      messages[type],
      type === 'failed' ? 'error' : type === 'refunded' ? 'warning' : 'success',
      payment._id,
      'Payment'
    );
  }

  // ========== BULK NOTIFICATIONS ==========
  async sendBulkNotification(userIds, title, message, type = 'info') {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title,
        message,
        type,
        isRead: false
      }));

      await Notification.insertMany(notifications);
      return notifications.length;
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
      throw error;
    }
  }

  // ========== SMS NOTIFICATIONS (if SMS service is configured) ==========
  async sendSMS(phone, message) {
    if (!process.env.SMS_ENABLED || process.env.SMS_ENABLED !== 'true') {
      console.log('SMS service not enabled');
      return;
    }

    try {
      // Implement SMS sending logic here (Twilio, etc.)
      console.log(`SMS would be sent to ${phone}: ${message}`);
      return { success: true, phone, message };
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  async sendBookingSMS(phone, booking, type) {
    const messages = {
      confirmed: `Telitrip: Your booking ${booking.bookingReference} at ${booking.hotelId.name} is confirmed. Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}`,
      cancelled: `Telitrip: Your booking ${booking.bookingReference} has been cancelled. Contact support for assistance.`,
      reminder: `Telitrip: Reminder - Your stay at ${booking.hotelId.name} starts tomorrow. Ref: ${booking.bookingReference}`
    };

    return await this.sendSMS(phone, messages[type]);
  }
}

module.exports = new NotificationService();