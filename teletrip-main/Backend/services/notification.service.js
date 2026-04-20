const nodemailer = require('nodemailer');
const Notification = require('../models/notification.model');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const emailService = require('./email.service');

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
    return await emailService.sendTemplatedEmail('welcome', email, { firstName });
  }

  async sendBookingConfirmation(email, booking) {
    return await emailService.sendTemplatedEmail('booking_confirmation', email, {
      userName: booking.userId.firstName,
      bookingReference: booking.bookingReference,
      hotelName: booking.hotelId.name,
      checkInDate: new Date(booking.checkInDate).toLocaleDateString(),
      checkOutDate: new Date(booking.checkOutDate).toLocaleDateString(),
      totalAmount: String(booking.totalAmount),
      guests: String(booking.guests),
      rooms: String(booking.rooms)
    });
  }

  async sendBookingCancellation(email, booking) {
    return await emailService.sendTemplatedEmail('booking_cancellation', email, {
      userName: booking.userId.firstName,
      bookingReference: booking.bookingReference,
      hotelName: booking.hotelId.name,
      totalAmount: String(booking.totalAmount),
      cancellationFee: String(booking.cancellation.fee),
      refundAmount: String(booking.cancellation.refundAmount)
    });
  }

  async sendPasswordChangeNotification(email, firstName) {
    return await emailService.sendTemplatedEmail('password_changed', email, { firstName });
  }

  async sendBookingStatusUpdate(email, booking) {
    return await emailService.sendTemplatedEmail('booking_status_update', email, {
      userName: booking.userId.firstName,
      bookingReference: booking.bookingReference,
      hotelName: booking.hotelId.name,
      status: booking.status,
      adminNotes: booking.adminNotes || ''
    });
  }

  async sendAccountSuspensionNotification(email, reason) {
    return await emailService.sendTemplatedEmail('account_suspended', email, { reason });
  }

  async sendAccountReactivationNotification(email) {
    return await emailService.sendTemplatedEmail('account_reactivated', email, {});
  }

  async sendSupportTicketNotification(ticket) {
    const adminEmail = process.env.ADMIN_EMAIL;
    return await emailService.sendTemplatedEmail('support_ticket_created', adminEmail, {
      ticketNumber: ticket.ticketNumber,
      userName: `${ticket.userId?.firstName} ${ticket.userId?.lastName}`,
      userEmail: ticket.userId?.email,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      description: ticket.description
    });
  }

  async sendTicketResponseNotification(ticket) {
    const user = ticket.userId;
    return await emailService.sendTemplatedEmail('support_ticket_response', user.email, {
      firstName: user.firstName,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject
    });
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

const notificationServiceInstance = new NotificationService();

notificationServiceInstance.sendPayOnSiteConfirmation = async (data) => {
  const { user, booking, payment } = data;
  
  try {
    const subject = 'Booking Confirmed - Payment on Site';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Booking Confirmed!</h2>
        
        <p>Dear ${user.fullname || 'Customer'},</p>
        
        <p>Your booking has been confirmed successfully. Payment will be collected when you arrive at the hotel.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details:</h3>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Hotel:</strong> ${booking.hotelName || booking.hotelBooking?.hotelName}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkInDate || booking.hotelBooking?.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate || booking.hotelBooking?.checkOut).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ${payment.currency} ${payment.amount}</p>
          <p><strong>Payment ID:</strong> ${payment.paymentId}</p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h4 style="margin-top: 0;">Important Instructions:</h4>
          <ul>
            <li>Your booking is confirmed</li>
            <li>Payment will be collected when you arrive at the hotel</li>
            <li>Please bring a valid ID</li>
            <li>You can pay by cash or card at the hotel reception</li>
          </ul>
        </div>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>Telitrip Team</p>
      </div>
    `;

    await notificationServiceInstance.sendEmail(user.email, subject, html);
    console.log('✅ Pay on Site confirmation email sent to:', user.email);
    
  } catch (error) {
    console.error('❌ Failed to send Pay on Site confirmation:', error);
    throw error;
  }
};

module.exports = notificationServiceInstance;
