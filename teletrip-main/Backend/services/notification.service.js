const nodemailer = require('nodemailer');
const twilio = require('twilio');
const logger = require('../utils/logger.util');
const emailTemplates = require('../templates/email.templates');

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize SMS client
    if (process.env.SMS_ENABLED === 'true') {
      this.smsClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  // Email notification methods
  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendEmailVerification(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = emailTemplates.emailVerification({
      name: user.displayName,
      verificationUrl,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      'Verify Your Email Address - Telitrip',
      html
    );
  }

  async sendWelcomeEmail(user) {
    const html = emailTemplates.welcome({
      name: user.displayName,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      'Welcome to Telitrip - Your Journey Begins Here!',
      html
    );
  }

  async sendPasswordReset(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = emailTemplates.passwordReset({
      name: user.displayName,
      resetUrl,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      'Password Reset Request - Telitrip',
      html
    );
  }

  async sendPasswordResetConfirmation(user) {
    const html = emailTemplates.passwordResetConfirmation({
      name: user.displayName,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      'Password Successfully Reset - Telitrip',
      html
    );
  }

  async sendPasswordChangeConfirmation(user) {
    const html = emailTemplates.passwordChangeConfirmation({
      name: user.displayName,
      accountUrl: `${process.env.FRONTEND_URL}/account`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      'Password Changed Successfully - Telitrip',
      html
    );
  }

  async send2FAEnabledNotification(user) {
    const html = emailTemplates.twoFactorEnabled({
      name: user.displayName,
      accountUrl: `${process.env.FRONTEND_URL}/account/security`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      'Two-Factor Authentication Enabled - Telitrip',
      html
    );
  }

  async send2FADisabledNotification(user) {
    const html = emailTemplates.twoFactorDisabled({
      name: user.displayName,
      accountUrl: `${process.env.FRONTEND_URL}/account/security`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      'Two-Factor Authentication Disabled - Telitrip',
      html
    );
  }

  // Booking-related notifications
  async sendBookingConfirmation(user, booking, payment) {
    const html = emailTemplates.bookingConfirmation({
      name: user.displayName,
      booking: {
        reference: booking.bookingReference,
        type: booking.bookingType,
        hotelName: booking.hotelBooking?.hotelName,
        checkIn: booking.hotelBooking?.checkIn,
        checkOut: booking.hotelBooking?.checkOut,
        totalAmount: booking.pricing.totalAmount,
        currency: booking.pricing.currency,
        rooms: booking.hotelBooking?.rooms,
        guests: booking.guestInfo
      },
      bookingUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `Booking Confirmation - ${booking.bookingReference}`,
      html
    );
  }

  async sendBookingCancellation(user, booking, reason) {
    const html = emailTemplates.bookingCancellation({
      name: user.displayName,
      booking: {
        reference: booking.bookingReference,
        type: booking.bookingType,
        hotelName: booking.hotelBooking?.hotelName,
        refundAmount: booking.cancellation?.refundAmount,
        currency: booking.pricing.currency,
        reason
      },
      bookingUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `Booking Cancelled - ${booking.bookingReference}`,
      html
    );
  }

  async sendBookingReminder(user, booking) {
    const html = emailTemplates.bookingReminder({
      name: user.displayName,
      booking: {
        reference: booking.bookingReference,
        type: booking.bookingType,
        hotelName: booking.hotelBooking?.hotelName,
        checkIn: booking.hotelBooking?.checkIn,
        checkOut: booking.hotelBooking?.checkOut
      },
      bookingUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `Travel Reminder - ${booking.bookingReference}`,
      html
    );
  }

  // Payment-related notifications
  async sendPaymentConfirmation(user, booking, payment) {
    const html = emailTemplates.paymentConfirmation({
      name: user.displayName,
      payment: {
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        transactionId: payment._id,
        date: payment.completedAt
      },
      booking: {
        reference: booking.bookingReference,
        type: booking.bookingType
      },
      receiptUrl: `${process.env.FRONTEND_URL}/payments/${payment._id}/receipt`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `Payment Confirmation - ${payment._id}`,
      html
    );
  }

  async sendPaymentFailure(user, booking, payment) {
    const html = emailTemplates.paymentFailure({
      name: user.displayName,
      payment: {
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        failureReason: payment.failureReason
      },
      booking: {
        reference: booking.bookingReference,
        type: booking.bookingType
      },
      retryUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}/payment`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `Payment Failed - ${booking.bookingReference}`,
      html
    );
  }

  async sendPaymentCancellation(user, booking, payment) {
    const html = emailTemplates.paymentCancellation({
      name: user.displayName,
      payment: {
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method
      },
      booking: {
        reference: booking.bookingReference,
        type: booking.bookingType
      },
      retryUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}/payment`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `Payment Cancelled - ${booking.bookingReference}`,
      html
    );
  }

  async sendRefundConfirmation(user, booking, payment, refundAmount) {
    const html = emailTemplates.refundConfirmation({
      name: user.displayName,
      refund: {
        amount: refundAmount,
        currency: payment.currency,
        originalAmount: payment.amount,
        processingTime: '5-7 business days'
      },
      booking: {
        reference: booking.bookingReference,
        type: booking.bookingType
      },
      bookingUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `Refund Processed - ${booking.bookingReference}`,
      html
    );
  }

  // SMS notification methods
  async sendSMS(phoneNumber, message) {
    if (!this.smsClient) {
      logger.warn('SMS service not configured');
      return;
    }

    try {
      const result = await this.smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      logger.info('SMS sent successfully', {
        to: phoneNumber,
        sid: result.sid
      });

      return result;
    } catch (error) {
      logger.error('SMS sending failed:', error);
      throw error;
    }
  }

  async sendBookingConfirmationSMS(user, booking) {
    if (!user.phone || !user.preferences?.notifications?.sms?.bookingUpdates) {
      return;
    }

    const message = `Hi ${user.fullname.firstname}, your booking ${booking.bookingReference} is confirmed! Check-in: ${booking.hotelBooking?.checkIn ? new Date(booking.hotelBooking.checkIn).toLocaleDateString() : 'N/A'}. Have a great trip!`;

    return await this.sendSMS(user.phone, message);
  }

  async sendBookingReminderSMS(user, booking) {
    if (!user.phone || !user.preferences?.notifications?.sms?.bookingUpdates) {
      return;
    }

    const checkInDate = booking.hotelBooking?.checkIn ? new Date(booking.hotelBooking.checkIn) : null;
    const daysUntil = checkInDate ? Math.ceil((checkInDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    const message = `Reminder: Your trip ${booking.bookingReference} is in ${daysUntil} day(s)! Check-in: ${checkInDate?.toLocaleDateString() || 'N/A'}. Safe travels!`;

    return await this.sendSMS(user.phone, message);
  }

  async sendPaymentConfirmationSMS(user, booking, payment) {
    if (!user.phone || !user.preferences?.notifications?.sms?.bookingUpdates) {
      return;
    }

    const message = `Payment confirmed! ${payment.currency} ${payment.amount} for booking ${booking.bookingReference}. Transaction ID: ${payment._id.toString().slice(-8)}`;

    return await this.sendSMS(user.phone, message);
  }

  // Push notification methods (placeholder for future implementation)
  async sendPushNotification(user, title, body, data = {}) {
    // Implement push notification logic using FCM or similar service
    logger.info('Push notification would be sent', {
      userId: user._id,
      title,
      body,
      data
    });
  }

  // Bulk notification methods
  async sendBulkEmail(recipients, subject, template, templateData) {
    const promises = recipients.map(recipient => {
      const personalizedData = { ...templateData, ...recipient };
      const html = template(personalizedData);
      return this.sendEmail(recipient.email, subject, html);
    });

    try {
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info('Bulk email completed', {
        total: recipients.length,
        successful,
        failed
      });

      return { successful, failed, results };
    } catch (error) {
      logger.error('Bulk email failed:', error);
      throw error;
    }
  }

  // Administrative notifications
  async sendAdminAlert(subject, message, data = {}) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (adminEmails.length === 0) {
      logger.warn('No admin emails configured for alerts');
      return;
    }

    const html = emailTemplates.adminAlert({
      subject,
      message,
      data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

    const promises = adminEmails.map(email => 
      this.sendEmail(email.trim(), `[ALERT] ${subject}`, html)
    );

    return await Promise.allSettled(promises);
  }

  async sendSystemAlert(type, details) {
    const subject = `System Alert: ${type}`;
    const message = `A system alert has been triggered:\n\nType: ${type}\nDetails: ${JSON.stringify(details, null, 2)}`;

    return await this.sendAdminAlert(subject, message, details);
  }

  // Scheduled notification methods
  async scheduleBookingReminders() {
    // This would typically be called by a job scheduler
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    try {
      const Booking = require('../models/booking.model');
      const User = require('../models/user.model');

      // Find bookings with check-in tomorrow that haven't been reminded
      const upcomingBookings = await Booking.find({
        'hotelBooking.checkIn': {
          $gte: tomorrow,
          $lt: nextDay
        },
        status: 'confirmed',
        'notifications.reminderSent': false
      }).populate('user');

      for (const booking of upcomingBookings) {
        try {
          await this.sendBookingReminder(booking.user, booking);
          await this.sendBookingReminderSMS(booking.user, booking);

          // Mark reminder as sent
          booking.notifications.reminderSent = true;
          await booking.save();

          logger.info('Booking reminder sent', {
            bookingId: booking._id,
            userId: booking.user._id
          });
        } catch (error) {
          logger.error('Failed to send booking reminder:', error);
        }
      }

      logger.info('Booking reminders processing completed', {
        total: upcomingBookings.length
      });

    } catch (error) {
      logger.error('Scheduled booking reminders failed:', error);
      await this.sendSystemAlert('Booking Reminders Failed', { error: error.message });
    }
  }

  async scheduleFeedbackRequests() {
    // Send feedback requests for completed bookings
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    try {
      const Booking = require('../models/booking.model');

      const completedBookings = await Booking.find({
        'hotelBooking.checkOut': {
          $lte: threeDaysAgo
        },
        status: 'confirmed',
        'notifications.feedbackRequestSent': false
      }).populate('user');

      for (const booking of completedBookings) {
        try {
          await this.sendFeedbackRequest(booking.user, booking);

          // Mark feedback request as sent
          booking.notifications.feedbackRequestSent = true;
          await booking.save();

          logger.info('Feedback request sent', {
            bookingId: booking._id,
            userId: booking.user._id
          });
        } catch (error) {
          logger.error('Failed to send feedback request:', error);
        }
      }

      logger.info('Feedback requests processing completed', {
        total: completedBookings.length
      });

    } catch (error) {
      logger.error('Scheduled feedback requests failed:', error);
      await this.sendSystemAlert('Feedback Requests Failed', { error: error.message });
    }
  }

  async sendFeedbackRequest(user, booking) {
    const html = emailTemplates.feedbackRequest({
      name: user.displayName,
      booking: {
        reference: booking.bookingReference,
        hotelName: booking.hotelBooking?.hotelName,
        checkOut: booking.hotelBooking?.checkOut
      },
      reviewUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}/review`,
      supportEmail: process.env.FROM_EMAIL
    });

    return await this.sendEmail(
      user.email,
      `How was your stay? Share your experience - ${booking.bookingReference}`,
      html
    );
  }

  // Newsletter and promotional emails
  async sendNewsletter(recipients, subject, content) {
    return await this.sendBulkEmail(
      recipients,
      subject,
      emailTemplates.newsletter,
      { content }
    );
  }

  async sendPromotionalEmail(recipients, promotion) {
    return await this.sendBulkEmail(
      recipients,
      `Special Offer: ${promotion.title}`,
      emailTemplates.promotional,
      { promotion }
    );
  }

  // Utility methods
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async verifyEmailService() {
    try {
      await this.emailTransporter.verify();
      logger.info('Email service verified successfully');
      return true;
    } catch (error) {
      logger.error('Email service verification failed:', error);
      return false;
    }
  }

  async getEmailServiceStatus() {
    const isEmailVerified = await this.verifyEmailService();
    const isSmsEnabled = !!this.smsClient;

    return {
      email: {
        enabled: true,
        verified: isEmailVerified,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT
      },
      sms: {
        enabled: isSmsEnabled,
        provider: isSmsEnabled ? 'twilio' : null
      }
    };
  }
}

module.exports = new NotificationService();