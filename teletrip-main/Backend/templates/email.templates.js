// Email templates for notifications
const emailTemplates = {
  // Welcome email template
  welcome: (userName) => ({
    subject: 'Welcome to TeleTrip!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to TeleTrip, ${userName}!</h2>
        <p>Thank you for joining our platform. We're excited to have you on board.</p>
        <p>Start exploring amazing travel destinations and book your next adventure!</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
          <p style="margin: 0; color: #666;">Best regards,<br>The TeleTrip Team</p>
        </div>
      </div>
    `,
    text: `Welcome to TeleTrip, ${userName}! Thank you for joining our platform.`
  }),

  // Payment confirmation template
  paymentConfirmation: (userDetails, paymentDetails) => ({
    subject: 'Payment Confirmation - TeleTrip',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Confirmed!</h2>
        <p>Hi ${userDetails.name},</p>
        <p>Your payment has been successfully processed.</p>
        <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
          <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Thank you for your business!</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
          <p style="margin: 0; color: #666;">Best regards,<br>The TeleTrip Team</p>
        </div>
      </div>
    `,
    text: `Payment confirmed! Amount: $${paymentDetails.amount}, Transaction ID: ${paymentDetails.transactionId}`
  }),

  // Booking confirmation template
  bookingConfirmation: (userDetails, bookingDetails) => ({
    subject: 'Booking Confirmation - TeleTrip',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Booking Confirmed!</h2>
        <p>Hi ${userDetails.name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Destination:</strong> ${bookingDetails.destination}</p>
          <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
          <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
          <p><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</p>
        </div>
        <p>Have a great trip!</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
          <p style="margin: 0; color: #666;">Best regards,<br>The TeleTrip Team</p>
        </div>
      </div>
    `,
    text: `Booking confirmed! Booking ID: ${bookingDetails.bookingId}, Destination: ${bookingDetails.destination}`
  }),

  // Password reset template
  passwordReset: (userName, resetLink) => ({
    subject: 'Password Reset - TeleTrip',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
          <p style="margin: 0; color: #666;">Best regards,<br>The TeleTrip Team</p>
        </div>
      </div>
    `,
    text: `Password reset requested. Click this link to reset: ${resetLink}`
  }),

  // Generic notification template
  notification: (title, message, userName = 'User') => ({
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${title}</h2>
        <p>Hi ${userName},</p>
        <p>${message}</p>
        <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
          <p style="margin: 0; color: #666;">Best regards,<br>The TeleTrip Team</p>
        </div>
      </div>
    `,
    text: `${title}: ${message}`
  })
};

module.exports = emailTemplates;