const mongoose = require('mongoose');
const EmailTemplate = require('../models/emailTemplate.model');

/**
 * Generates the Telitrip-branded HTML wrapper for email templates.
 * Consistent branding: blue gradient header (#1a73e8 to #4285f4),
 * white body, light gray footer (#f8f9fa), Arial/Helvetica font stack.
 */
function wrapInBrand(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#1a73e8,#4285f4);padding:30px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">Telitrip</h1>
</td></tr>
<tr><td style="background-color:#ffffff;padding:40px;">
${bodyHtml}
</td></tr>
<tr><td style="background-color:#f8f9fa;padding:20px 40px;text-align:center;">
<p style="margin:0 0 8px 0;color:#666666;font-size:12px;font-family:Arial,Helvetica,sans-serif;">&copy; ${new Date().getFullYear()} Telitrip. All rights reserved.</p>
<p style="margin:0;color:#999999;font-size:11px;font-family:Arial,Helvetica,sans-serif;">Need help? Contact us at support@telitrip.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Creates a primary blue CTA button for email templates.
 */
function ctaButton(text, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td align="center" style="background-color:#1a73e8;border-radius:6px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">
${text}
</a>
</td></tr>
</table>`;
}

/**
 * The 12 default Telitrip-branded email template definitions.
 * Exported so property tests can reference them.
 */
const defaultTemplateDefinitions = [
  // ─── ACCOUNT TEMPLATES ───
  {
    name: 'Welcome',
    slug: 'welcome',
    category: 'account',
    subject: 'Welcome to Telitrip, {{firstName}}!',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Welcome aboard, {{firstName}}!</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Thank you for joining Telitrip. We are excited to help you discover amazing travel destinations and book your next adventure.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Start exploring now and find the perfect getaway for you.</p>
${ctaButton('Explore Destinations', '{{exploreUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Happy travels,<br>The Telitrip Team</p>`),
    textContent: 'Welcome to Telitrip, {{firstName}}! Thank you for joining us. Start exploring amazing travel destinations today.',
    variables: [
      { key: 'firstName', description: 'User first name', required: true, defaultValue: 'Traveler' },
      { key: 'exploreUrl', description: 'URL to explore destinations', required: false, defaultValue: 'https://telitrip.com/destinations' }
    ],
    sampleData: { firstName: 'Ahmed', exploreUrl: 'https://telitrip.com/destinations' },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Password Reset',
    slug: 'password_reset',
    category: 'account',
    subject: 'Reset Your Telitrip Password',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Password Reset Request</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">We received a request to reset your password. Click the button below to set a new password:</p>
${ctaButton('Reset Password', '{{resetLink}}')}
<p style="margin:0 0 8px 0;color:#666666;font-size:13px;font-family:Arial,Helvetica,sans-serif;">This link will expire in {{expiryTime}}.</p>
<p style="margin:0;color:#666666;font-size:13px;font-family:Arial,Helvetica,sans-serif;">If you did not request this, please ignore this email.</p>`),
    textContent: 'Hi {{firstName}}, we received a request to reset your password. Visit this link to reset: {{resetLink}}. This link expires in {{expiryTime}}.',
    variables: [
      { key: 'firstName', description: 'User first name', required: true, defaultValue: 'User' },
      { key: 'resetLink', description: 'Password reset URL', required: true, defaultValue: '' },
      { key: 'expiryTime', description: 'Link expiry duration', required: false, defaultValue: '1 hour' }
    ],
    sampleData: { firstName: 'Ahmed', resetLink: 'https://telitrip.com/reset?token=abc123', expiryTime: '1 hour' },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Password Changed',
    slug: 'password_changed',
    category: 'account',
    subject: 'Your Telitrip Password Has Been Changed',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Password Changed Successfully</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your Telitrip account password was successfully changed on {{changedAt}}.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">If you did not make this change, please contact our support team immediately.</p>
${ctaButton('Contact Support', '{{supportUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Stay safe,<br>The Telitrip Team</p>`),
    textContent: 'Hi {{firstName}}, your Telitrip password was changed on {{changedAt}}. If you did not make this change, contact support immediately.',
    variables: [
      { key: 'firstName', description: 'User first name', required: true, defaultValue: 'User' },
      { key: 'changedAt', description: 'Date and time of password change', required: false, defaultValue: '' },
      { key: 'supportUrl', description: 'Support page URL', required: false, defaultValue: 'https://telitrip.com/support' }
    ],
    sampleData: { firstName: 'Ahmed', changedAt: 'July 10, 2025 at 2:30 PM', supportUrl: 'https://telitrip.com/support' },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Account Suspended',
    slug: 'account_suspended',
    category: 'account',
    subject: 'Your Telitrip Account Has Been Suspended',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Account Suspended</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your Telitrip account has been suspended for the following reason:</p>
<div style="background-color:#fff3cd;border-left:4px solid #ffc107;padding:12px 16px;margin:0 0 16px 0;">
<p style="margin:0;color:#856404;font-size:14px;font-family:Arial,Helvetica,sans-serif;">{{reason}}</p>
</div>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">If you believe this is a mistake, please contact our support team for assistance.</p>
${ctaButton('Contact Support', '{{supportUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">The Telitrip Team</p>`),
    textContent: 'Your Telitrip account has been suspended. Reason: {{reason}}. Contact support if you believe this is a mistake.',
    variables: [
      { key: 'reason', description: 'Suspension reason', required: true, defaultValue: 'Policy violation' },
      { key: 'supportUrl', description: 'Support page URL', required: false, defaultValue: 'https://telitrip.com/support' }
    ],
    sampleData: { reason: 'Multiple policy violations detected', supportUrl: 'https://telitrip.com/support' },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Account Reactivated',
    slug: 'account_reactivated',
    category: 'account',
    subject: 'Your Telitrip Account Has Been Reactivated',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Account Reactivated</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Great news! Your Telitrip account has been reactivated. You can now log in and continue using all features.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">We are glad to have you back. Start planning your next trip today.</p>
${ctaButton('Log In Now', '{{loginUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Welcome back,<br>The Telitrip Team</p>`),
    textContent: 'Great news! Your Telitrip account has been reactivated. You can now log in and continue using all features.',
    variables: [
      { key: 'loginUrl', description: 'Login page URL', required: false, defaultValue: 'https://telitrip.com/login' }
    ],
    sampleData: { loginUrl: 'https://telitrip.com/login' },
    isDefault: true,
    isActive: true
  },

  // ─── BOOKING TEMPLATES ───
  {
    name: 'Booking Confirmation',
    slug: 'booking_confirmation',
    category: 'booking',
    subject: 'Booking Confirmed - {{bookingReference}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Booking Confirmed!</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your booking has been confirmed. Here are the details:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Reference:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Hotel:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Check-in:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{checkInDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Check-out:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{checkOutDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Guests:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{guests}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Rooms:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{rooms}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Total:</strong></td><td style="padding:8px 16px;color:#1a73e8;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">{{totalAmount}}</td></tr>
</table>
${ctaButton('View Booking', '{{bookingUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Have a great trip!<br>The Telitrip Team</p>`),
    textContent: 'Hi {{userName}}, your booking {{bookingReference}} at {{hotelName}} is confirmed. Check-in: {{checkInDate}}, Check-out: {{checkOutDate}}. Total: {{totalAmount}}.',
    variables: [
      { key: 'userName', description: 'Customer name', required: true, defaultValue: 'Customer' },
      { key: 'bookingReference', description: 'Booking reference code', required: true, defaultValue: '' },
      { key: 'hotelName', description: 'Hotel name', required: true, defaultValue: '' },
      { key: 'checkInDate', description: 'Check-in date', required: true, defaultValue: '' },
      { key: 'checkOutDate', description: 'Check-out date', required: true, defaultValue: '' },
      { key: 'totalAmount', description: 'Total booking amount', required: true, defaultValue: '' },
      { key: 'guests', description: 'Number of guests', required: false, defaultValue: '1' },
      { key: 'rooms', description: 'Number of rooms', required: false, defaultValue: '1' },
      { key: 'bookingUrl', description: 'URL to view booking details', required: false, defaultValue: 'https://telitrip.com/bookings' }
    ],
    sampleData: {
      userName: 'Ahmed',
      bookingReference: 'TT-2025-001234',
      hotelName: 'Pearl Continental Lahore',
      checkInDate: 'July 15, 2025',
      checkOutDate: 'July 18, 2025',
      totalAmount: 'PKR 45,000',
      guests: '2',
      rooms: '1',
      bookingUrl: 'https://telitrip.com/bookings/TT-2025-001234'
    },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Booking Cancellation',
    slug: 'booking_cancellation',
    category: 'booking',
    subject: 'Booking Cancelled - {{bookingReference}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Booking Cancelled</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your booking has been cancelled. Here is a summary:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Reference:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Hotel:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Original Amount:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{totalAmount}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Cancellation Fee:</strong></td><td style="padding:8px 16px;color:#dc3545;font-family:Arial,Helvetica,sans-serif;">{{cancellationFee}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Refund Amount:</strong></td><td style="padding:8px 16px;color:#28a745;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">{{refundAmount}}</td></tr>
</table>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your refund will be processed within 5-7 business days.</p>
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">The Telitrip Team</p>`),
    textContent: 'Hi {{userName}}, your booking {{bookingReference}} at {{hotelName}} has been cancelled. Refund amount: {{refundAmount}}.',
    variables: [
      { key: 'userName', description: 'Customer name', required: true, defaultValue: 'Customer' },
      { key: 'bookingReference', description: 'Booking reference code', required: true, defaultValue: '' },
      { key: 'hotelName', description: 'Hotel name', required: true, defaultValue: '' },
      { key: 'totalAmount', description: 'Original booking amount', required: true, defaultValue: '' },
      { key: 'cancellationFee', description: 'Cancellation fee charged', required: false, defaultValue: 'PKR 0' },
      { key: 'refundAmount', description: 'Amount to be refunded', required: true, defaultValue: '' }
    ],
    sampleData: {
      userName: 'Ahmed',
      bookingReference: 'TT-2025-001234',
      hotelName: 'Pearl Continental Lahore',
      totalAmount: 'PKR 45,000',
      cancellationFee: 'PKR 5,000',
      refundAmount: 'PKR 40,000'
    },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Booking Status Update',
    slug: 'booking_status_update',
    category: 'booking',
    subject: 'Booking Update - {{bookingReference}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Booking Status Update</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">There is an update on your booking:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Reference:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Hotel:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">New Status:</strong></td><td style="padding:8px 16px;color:#1a73e8;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">{{status}}</td></tr>
</table>
<div style="background-color:#e8f0fe;border-radius:6px;padding:12px 16px;margin:0 0 16px 0;">
<p style="margin:0;color:#333333;font-size:14px;font-family:Arial,Helvetica,sans-serif;"><strong>Admin Notes:</strong> {{adminNotes}}</p>
</div>
${ctaButton('View Booking', '{{bookingUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">The Telitrip Team</p>`),
    textContent: 'Hi {{userName}}, your booking {{bookingReference}} at {{hotelName}} has been updated. New status: {{status}}. Notes: {{adminNotes}}.',
    variables: [
      { key: 'userName', description: 'Customer name', required: true, defaultValue: 'Customer' },
      { key: 'bookingReference', description: 'Booking reference code', required: true, defaultValue: '' },
      { key: 'hotelName', description: 'Hotel name', required: true, defaultValue: '' },
      { key: 'status', description: 'New booking status', required: true, defaultValue: '' },
      { key: 'adminNotes', description: 'Notes from admin', required: false, defaultValue: 'No additional notes.' },
      { key: 'bookingUrl', description: 'URL to view booking details', required: false, defaultValue: 'https://telitrip.com/bookings' }
    ],
    sampleData: {
      userName: 'Ahmed',
      bookingReference: 'TT-2025-001234',
      hotelName: 'Pearl Continental Lahore',
      status: 'Checked In',
      adminNotes: 'Guest has checked in successfully. Enjoy your stay!',
      bookingUrl: 'https://telitrip.com/bookings/TT-2025-001234'
    },
    isDefault: true,
    isActive: true
  },

  // ─── PAYMENT TEMPLATES ───
  {
    name: 'Payment Confirmation',
    slug: 'payment_confirmation',
    category: 'payment',
    subject: 'Payment Confirmed - {{transactionId}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#28a745;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Payment Confirmed!</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your payment has been successfully processed. Here are the details:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Transaction ID:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{transactionId}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Amount:</strong></td><td style="padding:8px 16px;color:#28a745;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">{{amount}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Payment Method:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{paymentMethod}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Date:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{paymentDate}}</td></tr>
</table>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Thank you for your payment!</p>
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">The Telitrip Team</p>`),
    textContent: 'Hi {{userName}}, your payment of {{amount}} (Transaction ID: {{transactionId}}) has been confirmed.',
    variables: [
      { key: 'userName', description: 'Customer name', required: true, defaultValue: 'Customer' },
      { key: 'transactionId', description: 'Payment transaction ID', required: true, defaultValue: '' },
      { key: 'amount', description: 'Payment amount', required: true, defaultValue: '' },
      { key: 'paymentMethod', description: 'Payment method used', required: false, defaultValue: 'Credit Card' },
      { key: 'paymentDate', description: 'Date of payment', required: false, defaultValue: '' }
    ],
    sampleData: {
      userName: 'Ahmed',
      transactionId: 'TXN-2025-567890',
      amount: 'PKR 45,000',
      paymentMethod: 'Credit Card (Visa ending 4242)',
      paymentDate: 'July 10, 2025'
    },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Payment Refund',
    slug: 'payment_refund',
    category: 'payment',
    subject: 'Refund Processed - {{transactionId}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Refund Processed</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your refund has been processed. Here are the details:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Transaction ID:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{transactionId}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Refund Amount:</strong></td><td style="padding:8px 16px;color:#28a745;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">{{refundAmount}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Reason:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{reason}}</td></tr>
</table>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">The refund will appear in your account within 5-7 business days.</p>
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">The Telitrip Team</p>`),
    textContent: 'Hi {{userName}}, your refund of {{refundAmount}} (Transaction ID: {{transactionId}}) has been processed. Reason: {{reason}}.',
    variables: [
      { key: 'userName', description: 'Customer name', required: true, defaultValue: 'Customer' },
      { key: 'transactionId', description: 'Original transaction ID', required: true, defaultValue: '' },
      { key: 'refundAmount', description: 'Refund amount', required: true, defaultValue: '' },
      { key: 'reason', description: 'Reason for refund', required: false, defaultValue: 'Booking cancellation' }
    ],
    sampleData: {
      userName: 'Ahmed',
      transactionId: 'TXN-2025-567890',
      refundAmount: 'PKR 40,000',
      reason: 'Booking cancellation'
    },
    isDefault: true,
    isActive: true
  },

  // ─── SUPPORT TEMPLATES ───
  {
    name: 'Support Ticket Created',
    slug: 'support_ticket_created',
    category: 'support',
    subject: 'Support Ticket #{{ticketNumber}} - {{subject}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Support Ticket Created</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">A new support ticket has been submitted:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Ticket #:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{ticketNumber}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">From:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{userName}} ({{userEmail}})</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Subject:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{subject}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Category:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{category}}</td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:#333333;font-family:Arial,Helvetica,sans-serif;">Priority:</strong></td><td style="padding:8px 16px;color:#333333;font-family:Arial,Helvetica,sans-serif;">{{priority}}</td></tr>
</table>
<div style="background-color:#f8f9fa;border-radius:6px;padding:12px 16px;margin:0 0 16px 0;">
<p style="margin:0 0 4px 0;color:#666666;font-size:12px;font-family:Arial,Helvetica,sans-serif;">Description:</p>
<p style="margin:0;color:#333333;font-size:14px;font-family:Arial,Helvetica,sans-serif;">{{description}}</p>
</div>
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">The Telitrip Support Team</p>`),
    textContent: 'Support Ticket #{{ticketNumber}} created. From: {{userName}} ({{userEmail}}). Subject: {{subject}}. Category: {{category}}. Priority: {{priority}}.',
    variables: [
      { key: 'ticketNumber', description: 'Support ticket number', required: true, defaultValue: '' },
      { key: 'userName', description: 'User who submitted the ticket', required: true, defaultValue: '' },
      { key: 'userEmail', description: 'User email address', required: true, defaultValue: '' },
      { key: 'subject', description: 'Ticket subject', required: true, defaultValue: '' },
      { key: 'category', description: 'Ticket category', required: false, defaultValue: 'General' },
      { key: 'priority', description: 'Ticket priority level', required: false, defaultValue: 'Normal' },
      { key: 'description', description: 'Ticket description', required: false, defaultValue: '' }
    ],
    sampleData: {
      ticketNumber: 'TK-2025-0042',
      userName: 'Ahmed Khan',
      userEmail: 'ahmed@example.com',
      subject: 'Unable to complete booking payment',
      category: 'Payment',
      priority: 'High',
      description: 'I am trying to book a hotel but the payment keeps failing with an error message.'
    },
    isDefault: true,
    isActive: true
  },
  {
    name: 'Support Ticket Response',
    slug: 'support_ticket_response',
    category: 'support',
    subject: 'Re: Support Ticket #{{ticketNumber}} - {{subject}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;font-family:Arial,Helvetica,sans-serif;">Support Ticket Update</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Our support team has responded to your ticket <strong>#{{ticketNumber}}</strong> regarding <em>{{subject}}</em>.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Please log in to view the full response and continue the conversation.</p>
${ctaButton('View Ticket', '{{ticketUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">The Telitrip Support Team</p>`),
    textContent: 'Hi {{firstName}}, our support team has responded to your ticket #{{ticketNumber}} regarding {{subject}}. Log in to view the response.',
    variables: [
      { key: 'firstName', description: 'Customer first name', required: true, defaultValue: 'Customer' },
      { key: 'ticketNumber', description: 'Support ticket number', required: true, defaultValue: '' },
      { key: 'subject', description: 'Ticket subject', required: true, defaultValue: '' },
      { key: 'ticketUrl', description: 'URL to view the ticket', required: false, defaultValue: 'https://telitrip.com/support/tickets' }
    ],
    sampleData: {
      firstName: 'Ahmed',
      ticketNumber: 'TK-2025-0042',
      subject: 'Unable to complete booking payment',
      ticketUrl: 'https://telitrip.com/support/tickets/TK-2025-0042'
    },
    isDefault: true,
    isActive: true
  }
];

/**
 * Seeds the 12 default Telitrip-branded email templates into MongoDB.
 * Uses updateOne with upsert and $setOnInsert to prevent overwriting
 * existing templates on re-run.
 *
 * @returns {{ created: number, skipped: number }}
 */
async function seedEmailTemplates() {
  let created = 0;
  let skipped = 0;

  for (const templateDef of defaultTemplateDefinitions) {
    const result = await EmailTemplate.updateOne(
      { slug: templateDef.slug },
      {
        $setOnInsert: {
          name: templateDef.name,
          slug: templateDef.slug,
          category: templateDef.category,
          subject: templateDef.subject,
          htmlContent: templateDef.htmlContent,
          textContent: templateDef.textContent,
          variables: templateDef.variables,
          sampleData: templateDef.sampleData,
          isDefault: true,
          isActive: true,
          isDeleted: false,
          version: 1,
          metadata: { sendCount: 0 }
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created++;
    } else {
      skipped++;
    }
  }

  return { created, skipped };
}

// Allow standalone execution: node scripts/seedEmailTemplates.js
if (require.main === module) {
  const connectToDb = require('../db/db');
  connectToDb();

  mongoose.connection.once('open', async () => {
    try {
      console.log('Seeding default email templates...');
      const result = await seedEmailTemplates();
      console.log(`Seed complete: ${result.created} created, ${result.skipped} skipped.`);
    } catch (err) {
      console.error('Seed failed:', err);
    } finally {
      await mongoose.connection.close();
      process.exit(0);
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
}

module.exports = { seedEmailTemplates, defaultTemplateDefinitions };
