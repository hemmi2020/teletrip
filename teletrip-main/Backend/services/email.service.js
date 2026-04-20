const nodemailer = require('nodemailer');
const crypto = require('crypto');
const EmailTemplate = require('../models/emailTemplate.model');
const EmailLog = require('../models/emailLog.model');
const User = require('../models/user.model');
const defaultTemplates = require('../templates/email.templates');

/**
 * Escapes HTML special characters in a string to prevent XSS.
 * Replaces &, <, >, ", and ' with their HTML entity equivalents.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(str) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };
  return str.replace(/[&<>"']/g, char => escapeMap[char]);
}

/**
 * Replaces {{key}} placeholders in a template string with HTML-escaped variable values.
 * - Unmatched placeholders are replaced with empty string
 * - Does not mutate the original template or variables object
 * - Does not perform nested/recursive interpolation
 * @param {string} template - The template string containing {{key}} placeholders
 * @param {Object} variables - Key-value pairs for placeholder replacement
 * @returns {string} The interpolated string
 */
function interpolate(template, variables) {
  if (!template) return '';
  if (!variables || typeof variables !== 'object') return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined || value === null) return '';
    return escapeHtml(String(value));
  });
}

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Hotel Booking'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });

      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Hotel Booking Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${user.fullname.firstname}!</h2>
        <p>Thank you for registering with our hotel booking platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Search and book hotels worldwide</li>
          <li>Manage your bookings</li>
          <li>Track payment history</li>
          <li>Update your preferences</li>
        </ul>
        <p>Happy travels!</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Welcome ${user.fullname.firstname}! Thank you for registering with our hotel booking platform.`
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.fullname.firstname},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Password reset requested. Visit: ${resetUrl}`
    });
  }

  async sendBookingConfirmation(user, booking) {
    const subject = `Booking Confirmed - ${booking.bookingId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Booking Confirmed!</h2>
        <p>Dear ${user.fullname.firstname},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Hotel:</strong> ${booking.hotelName}</p>
          <p><strong>Room:</strong> ${booking.roomName}</p>
          <p><strong>Location:</strong> ${booking.location}</p>
          <p><strong>Check-in:</strong> ${booking.checkIn.toDateString()}</p>
          <p><strong>Check-out:</strong> ${booking.checkOut.toDateString()}</p>
          <p><strong>Guests:</strong> ${booking.guests}</p>
          <p><strong>Total Amount:</strong> €${booking.totalAmount.toFixed(2)}</p>
        </div>
        
        <p>We look forward to your stay!</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Booking confirmed: ${booking.bookingId} at ${booking.hotelName}`
    });
  }

  /**
   * Resolves an email template by slug.
   * First queries MongoDB for an active, non-deleted template matching the slug.
   * Falls back to hardcoded defaults from email.templates.js if no DB template found.
   * Returns { template: null, isDefault: false } if neither exists.
   *
   * @param {string} slug - The template slug to resolve
   * @returns {Promise<{ template: object|null, isDefault: boolean }>}
   */
  async resolveTemplate(slug) {
    // Step 1: Try database first
    const dbTemplate = await EmailTemplate.findOne({
      slug: slug,
      isActive: true,
      isDeleted: false
    });

    if (dbTemplate) {
      return { template: dbTemplate, isDefault: false };
    }

    // Step 2: Fallback to hardcoded defaults
    const defaultTemplate = defaultTemplates[slug];

    if (defaultTemplate) {
      return { template: defaultTemplate, isDefault: true };
    }

    // Step 3: No template found
    return { template: null, isDefault: false };
  }

  /**
   * Sends a templated email by resolving the template, interpolating variables,
   * sending via SMTP, and logging the result.
   *
   * @param {string} templateSlug - The template slug to resolve
   * @param {string} recipientEmail - The recipient email address
   * @param {Object} variables - Key-value pairs for placeholder replacement
   * @param {Object} [options={}] - Additional options (e.g., recipientUserId, type)
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendTemplatedEmail(templateSlug, recipientEmail, variables = {}, options = {}) {
    // Step 1: Resolve template
    const { template, isDefault } = await this.resolveTemplate(templateSlug);

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Step 2: Extract subject and htmlContent from template
    const templateSubject = template.subject || '';
    const templateHtmlContent = template.htmlContent || '';
    const templateName = template.name || templateSlug;

    // Step 3: Interpolate variables into subject and htmlContent
    const renderedSubject = interpolate(templateSubject, variables);
    const renderedHtml = interpolate(templateHtmlContent, variables);

    try {
      // Step 4: Send via SMTP
      const info = await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Hotel Booking'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: renderedSubject,
        html: renderedHtml,
      });

      // Step 5: Log success
      await EmailLog.create({
        templateSlug,
        templateName,
        recipient: recipientEmail,
        recipientUserId: options.recipientUserId || undefined,
        subject: renderedSubject,
        status: 'sent',
        type: options.type || 'transactional',
        messageId: info.messageId,
        sentAt: new Date(),
        metadata: {
          variables,
        },
      });

      // Step 6: Increment template metadata (only for DB templates)
      if (!isDefault && template._id) {
        await EmailTemplate.updateOne(
          { _id: template._id },
          {
            $inc: { 'metadata.sendCount': 1 },
            $set: { 'metadata.lastSentAt': new Date() },
          }
        );
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      // Step 7: Log failure
      await EmailLog.create({
        templateSlug,
        templateName,
        recipient: recipientEmail,
        recipientUserId: options.recipientUserId || undefined,
        subject: renderedSubject,
        status: 'failed',
        type: options.type || 'transactional',
        error: error.message,
        metadata: {
          variables,
        },
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Queues a bulk email operation for asynchronous processing via Bull queue.
   *
   * Validates that the template exists and is active, resolves recipients from
   * the provided filter, batches them into groups of 50, adds each batch to the
   * Bull emailQueue, and creates an EmailLog entry per recipient.
   *
   * @param {string} templateId - MongoDB ObjectId string for the EmailTemplate
   * @param {Object} recipientFilter - Filter to resolve recipients
   * @param {string} recipientFilter.segment - 'all' | 'active' | 'inactive'
   * @param {string[]} [recipientFilter.userIds] - Optional array of specific user IDs
   * @param {Object} [customVariables={}] - Extra variables to merge per recipient
   * @returns {Promise<{ success: boolean, queued?: number, jobIds?: string[], error?: string }>}
   */
  async queueBulkEmail(templateId, recipientFilter, customVariables = {}) {
    // Lazy-load the queue to avoid circular dependency issues at module load time
    const { emailQueue } = require('./emailQueue.service');

    // Step 1: Validate template exists and is active
    const template = await EmailTemplate.findOne({
      _id: templateId,
      isActive: true,
      isDeleted: false,
    });

    if (!template) {
      return { success: false, error: 'Template not found or inactive' };
    }

    // Step 2: Resolve recipients from filter
    const userQuery = {};

    if (recipientFilter.userIds && recipientFilter.userIds.length > 0) {
      userQuery._id = { $in: recipientFilter.userIds };
    } else if (recipientFilter.segment === 'active') {
      userQuery.status = 'active';
    } else if (recipientFilter.segment === 'inactive') {
      userQuery.status = { $in: ['inactive', 'suspended'] };
    }
    // 'all' segment uses no filter

    const users = await User.find(userQuery)
      .select('email fullname _id')
      .lean();

    if (!users || users.length === 0) {
      return { success: false, error: 'No recipients found' };
    }

    // Step 3: Map users to recipient objects
    const recipients = users.map(user => ({
      email: user.email,
      firstName: user.fullname?.firstname || 'Customer',
      userId: user._id.toString(),
    }));

    // Step 4: Generate a unique bulk job ID for this operation
    const bulkJobId = crypto.randomUUID();

    // Step 5: Batch recipients into groups of 50
    const BATCH_SIZE = 50;
    const batches = [];
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      batches.push(recipients.slice(i, i + BATCH_SIZE));
    }

    // Step 6: Create EmailLog entries for all recipients with status 'queued'
    const logEntries = recipients.map(recipient => ({
      templateSlug: template.slug,
      templateName: template.name,
      recipient: recipient.email,
      recipientUserId: recipient.userId,
      subject: template.subject,
      status: 'queued',
      type: 'bulk',
      metadata: {
        bulkJobId,
        variables: customVariables,
      },
    }));

    await EmailLog.insertMany(logEntries);

    // Step 7: Add each batch to the Bull queue
    const jobIds = [];
    for (const batch of batches) {
      const job = await emailQueue.add('sendBulk', {
        recipients: batch,
        templateId: templateId,
        customVariables,
        bulkJobId,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });

      jobIds.push(job.id.toString());
    }

    return {
      success: true,
      queued: recipients.length,
      jobIds,
    };
  }

  /**
   * Creates an EmailLog document with the provided data.
   *
   * @param {Object} logData - The log data to persist
   * @param {string} logData.templateSlug - The template slug
   * @param {string} logData.templateName - The template name
   * @param {string} logData.recipient - The recipient email address
   * @param {string} logData.subject - The email subject
   * @param {string} logData.status - The delivery status (queued, sent, delivered, failed, bounced)
   * @param {string} [logData.type] - The email type (transactional, bulk, system)
   * @param {string} [logData.messageId] - The SMTP message ID
   * @param {string} [logData.error] - Error message if failed
   * @param {Object} [logData.metadata] - Additional metadata
   * @returns {Promise<Object>} The created EmailLog document
   */
  async logEmail(logData) {
    return EmailLog.create(logData);
  }

  /**
   * Aggregates EmailLog documents by status for a given date range.
   * Returns counts for sent, delivered, failed, and bounced statuses.
   *
   * @param {{ start: Date, end: Date }} dateRange - The date range to aggregate over
   * @returns {Promise<{ sent: number, delivered: number, failed: number, bounced: number }>}
   */
  async getEmailStats(dateRange) {
    const match = {};
    if (dateRange && dateRange.start && dateRange.end) {
      match.createdAt = {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      };
    }

    const results = await EmailLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = { sent: 0, delivered: 0, failed: 0, bounced: 0 };
    for (const entry of results) {
      if (stats.hasOwnProperty(entry._id)) {
        stats[entry._id] = entry.count;
      }
    }

    return stats;
  }
}

const emailServiceInstance = new EmailService();

module.exports = emailServiceInstance;
module.exports.interpolate = interpolate;
module.exports.escapeHtml = escapeHtml;
module.exports.EmailService = EmailService;