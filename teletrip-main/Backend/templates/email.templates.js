/**
 * Default email templates used as fallback when MongoDB templates are not seeded.
 * Keyed by slug, each template has { subject, htmlContent } with {{variable}} placeholders.
 * The email.service.js resolveTemplate() method falls back to these if no DB template is found.
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

function ctaButton(text, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td align="center" style="background-color:#1a73e8;border-radius:6px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">
${text}
</a>
</td></tr>
</table>`;
}

const emailTemplates = {
  welcome: {
    name: 'Welcome',
    subject: 'Welcome to Telitrip, {{firstName}}!',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Welcome aboard, {{firstName}}!</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Thank you for joining Telitrip. We are excited to help you discover amazing travel destinations and book your next adventure.</p>
${ctaButton('Explore Destinations', '{{exploreUrl}}')}
<p style="margin:0;color:#666666;font-size:14px;">Happy travels,<br>The Telitrip Team</p>`)
  },

  password_reset: {
    name: 'Password Reset',
    subject: 'Reset Your Telitrip Password',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Password Reset Request</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
${ctaButton('Reset Password', '{{resetLink}}')}
<p style="margin:0 0 8px 0;color:#666666;font-size:13px;">This link will expire in {{expiryTime}}.</p>
<p style="margin:0;color:#666666;font-size:13px;">If you did not request this, please ignore this email.</p>`)
  },

  password_changed: {
    name: 'Password Changed',
    subject: 'Your Telitrip Password Has Been Changed',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Password Changed Successfully</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Your Telitrip account password was successfully changed.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">If you did not make this change, please contact our support team immediately.</p>
<p style="margin:0;color:#666666;font-size:14px;">Stay safe,<br>The Telitrip Team</p>`)
  },

  account_suspended: {
    name: 'Account Suspended',
    subject: 'Your Telitrip Account Has Been Suspended',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Account Suspended</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Your Telitrip account has been suspended for the following reason:</p>
<div style="background-color:#fff3cd;border-left:4px solid #ffc107;padding:12px 16px;margin:0 0 16px 0;">
<p style="margin:0;color:#856404;font-size:14px;">{{reason}}</p>
</div>
<p style="margin:0;color:#666666;font-size:14px;">If you believe this is a mistake, please contact our support team.</p>`)
  },

  account_reactivated: {
    name: 'Account Reactivated',
    subject: 'Your Telitrip Account Has Been Reactivated',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Account Reactivated</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Great news! Your Telitrip account has been reactivated. You can now log in and continue using all features.</p>
<p style="margin:0;color:#666666;font-size:14px;">Welcome back,<br>The Telitrip Team</p>`)
  },

  booking_confirmation: {
    name: 'Booking Confirmation',
    subject: 'Booking Confirmed - {{bookingReference}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Booking Confirmed!</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Your booking has been confirmed. Here are the details:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong>Reference:</strong></td><td style="padding:8px 16px;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Hotel:</strong></td><td style="padding:8px 16px;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Check-in:</strong></td><td style="padding:8px 16px;">{{checkInDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Check-out:</strong></td><td style="padding:8px 16px;">{{checkOutDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Guests:</strong></td><td style="padding:8px 16px;">{{guests}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Rooms:</strong></td><td style="padding:8px 16px;">{{rooms}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Total:</strong></td><td style="padding:8px 16px;color:#1a73e8;font-weight:bold;">{{totalAmount}}</td></tr>
</table>
<p style="margin:0;color:#666666;font-size:14px;">Have a great trip!<br>The Telitrip Team</p>`)
  },

  booking_cancellation: {
    name: 'Booking Cancellation',
    subject: 'Booking Cancelled - {{bookingReference}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Booking Cancelled</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Your booking has been cancelled. Here is a summary:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong>Reference:</strong></td><td style="padding:8px 16px;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Hotel:</strong></td><td style="padding:8px 16px;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Original Amount:</strong></td><td style="padding:8px 16px;">{{totalAmount}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Cancellation Fee:</strong></td><td style="padding:8px 16px;color:#dc3545;">{{cancellationFee}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Refund Amount:</strong></td><td style="padding:8px 16px;color:#28a745;font-weight:bold;">{{refundAmount}}</td></tr>
</table>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Your refund will be processed within 5-7 business days.</p>
<p style="margin:0;color:#666666;font-size:14px;">The Telitrip Team</p>`)
  },

  booking_status_update: {
    name: 'Booking Status Update',
    subject: 'Booking Update - {{bookingReference}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Booking Status Update</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">There is an update on your booking {{bookingReference}} at {{hotelName}}:</p>
<p style="margin:0 0 16px 0;color:#1a73e8;font-size:18px;font-weight:bold;">Status: {{status}}</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:14px;">Notes: {{adminNotes}}</p>
<p style="margin:0;color:#666666;font-size:14px;">The Telitrip Team</p>`)
  },

  payment_failure: {
    name: 'Payment Failure',
    subject: 'Payment Failed - {{bookingReference}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#dc3545;font-size:22px;">Payment Failed</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">We were unable to process your payment for booking {{bookingReference}}.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;">Amount: {{amount}} | Method: {{paymentMethod}}</p>
<p style="margin:0 0 16px 0;color:#dc3545;font-size:14px;">Error: {{errorMessage}}</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;">Please try again or contact support.</p>
<p style="margin:0;color:#666666;font-size:14px;">The Telitrip Team</p>`)
  },

  checkin_reminder: {
    name: 'Check-in Reminder',
    subject: 'Reminder: Your Stay at {{hotelName}} is Coming Up!',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#1a73e8;font-size:22px;">Your Trip is Almost Here!</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Just a reminder that your stay at <strong>{{hotelName}}</strong> begins on <strong>{{checkInDate}}</strong>.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;">Booking Reference: {{bookingReference}}</p>
<p style="margin:0;color:#666666;font-size:14px;">Have a wonderful trip!<br>The Telitrip Team</p>`)
  },

  feedback_request: {
    name: 'Feedback Request',
    subject: 'How Was Your Stay at {{hotelName}}?',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">We Value Your Feedback</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">We hope you enjoyed your stay at <strong>{{hotelName}}</strong>. Your feedback helps us improve our services.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;">Please take a moment to share your experience.</p>
<p style="margin:0;color:#666666;font-size:14px;">Thank you,<br>The Telitrip Team</p>`)
  },

  pay_on_site_confirmation: {
    name: 'Pay at Office Confirmation',
    subject: 'Booking Confirmed - Pay at Office ({{bookingReference}})',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#28a745;font-size:22px;">Booking Confirmed!</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{userName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Your booking has been confirmed. Payment will be collected at the Telitrip office.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong>Booking Reference:</strong></td><td style="padding:8px 16px;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Hotel:</strong></td><td style="padding:8px 16px;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Check-in:</strong></td><td style="padding:8px 16px;">{{checkInDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Check-out:</strong></td><td style="padding:8px 16px;">{{checkOutDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Total Amount:</strong></td><td style="padding:8px 16px;color:#1a73e8;font-weight:bold;">{{currency}} {{totalAmount}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Payment ID:</strong></td><td style="padding:8px 16px;">{{paymentId}}</td></tr>
</table>
<div style="background-color:#fff3cd;border-left:4px solid #ffc107;padding:12px 16px;margin:0 0 16px 0;">
<p style="margin:0;color:#856404;font-size:14px;"><strong>Important:</strong> Please visit the Telitrip office to complete your payment of {{currency}} {{totalAmount}} before your check-in date. Bring a valid ID.</p>
</div>
<p style="margin:0;color:#666666;font-size:14px;">Have a great trip!<br>The Telitrip Team</p>`)
  },

  admin_new_booking: {
    name: 'Admin New Booking',
    subject: 'New Booking: {{bookingReference}} - {{hotelName}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#1a73e8;font-size:22px;">New Booking Received</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">A new booking has been created:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong>Reference:</strong></td><td style="padding:8px 16px;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Customer:</strong></td><td style="padding:8px 16px;">{{customerName}} ({{customerEmail}})</td></tr>
<tr><td style="padding:8px 16px;"><strong>Hotel:</strong></td><td style="padding:8px 16px;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Check-in:</strong></td><td style="padding:8px 16px;">{{checkInDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Check-out:</strong></td><td style="padding:8px 16px;">{{checkOutDate}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Total:</strong></td><td style="padding:8px 16px;color:#1a73e8;font-weight:bold;">{{totalAmount}}</td></tr>
</table>
<p style="margin:0;color:#666666;font-size:14px;">Telitrip System</p>`)
  },

  admin_booking_cancellation: {
    name: 'Admin Booking Cancellation',
    subject: 'Booking Cancelled: {{bookingReference}} - {{hotelName}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#dc3545;font-size:22px;">Booking Cancellation Notice</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">A booking has been cancelled:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong>Reference:</strong></td><td style="padding:8px 16px;">{{bookingReference}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Customer:</strong></td><td style="padding:8px 16px;">{{customerName}} ({{customerEmail}})</td></tr>
<tr><td style="padding:8px 16px;"><strong>Hotel:</strong></td><td style="padding:8px 16px;">{{hotelName}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Original Amount:</strong></td><td style="padding:8px 16px;">{{totalAmount}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Refund:</strong></td><td style="padding:8px 16px;color:#28a745;">{{refundAmount}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Reason:</strong></td><td style="padding:8px 16px;">{{cancellationReason}}</td></tr>
</table>
<p style="margin:0;color:#666666;font-size:14px;">Telitrip System</p>`)
  },

  support_ticket_created: {
    name: 'Support Ticket Created',
    subject: 'Support Ticket #{{ticketNumber}} - {{subject}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Support Ticket Created</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">A new support ticket has been submitted:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;padding:16px;margin:0 0 16px 0;">
<tr><td style="padding:8px 16px;"><strong>Ticket #:</strong></td><td style="padding:8px 16px;">{{ticketNumber}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>From:</strong></td><td style="padding:8px 16px;">{{userName}} ({{userEmail}})</td></tr>
<tr><td style="padding:8px 16px;"><strong>Subject:</strong></td><td style="padding:8px 16px;">{{subject}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Category:</strong></td><td style="padding:8px 16px;">{{category}}</td></tr>
<tr><td style="padding:8px 16px;"><strong>Priority:</strong></td><td style="padding:8px 16px;">{{priority}}</td></tr>
</table>
<p style="margin:0;color:#666666;font-size:14px;">Telitrip Support System</p>`)
  },

  support_ticket_response: {
    name: 'Support Ticket Response',
    subject: 'Re: Support Ticket #{{ticketNumber}} - {{subject}}',
    htmlContent: wrapInBrand(`
<h2 style="margin:0 0 16px 0;color:#333333;font-size:22px;">Support Ticket Update</h2>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;line-height:1.6;">Our support team has responded to your ticket <strong>#{{ticketNumber}}</strong> regarding <em>{{subject}}</em>.</p>
<p style="margin:0 0 16px 0;color:#333333;font-size:15px;">Please log in to view the full response.</p>
<p style="margin:0;color:#666666;font-size:14px;">The Telitrip Support Team</p>`)
  }
};

module.exports = emailTemplates;
