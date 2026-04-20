const Bull = require('bull');
const EmailTemplate = require('../models/emailTemplate.model');
const EmailLog = require('../models/emailLog.model');
const { interpolate } = require('./email.service');
const nodemailer = require('nodemailer');

// Redis connection URL from environment or default
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Bull queue connected to Redis
const emailQueue = new Bull('emailQueue', REDIS_URL);

// Create a dedicated transporter for bulk sends
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Delays execution for the specified number of milliseconds.
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a bulk email batch job.
 *
 * Each job contains:
 *   - recipients: Array of { email, firstName, userId }
 *   - templateId: MongoDB ObjectId string for the EmailTemplate
 *   - customVariables: Object of extra variables to merge per recipient
 *   - bulkJobId: Unique identifier tying all batches of a single bulk operation
 *
 * For each recipient:
 *   1. Resolve the template from DB
 *   2. Interpolate per-recipient variables into subject and htmlContent
 *   3. Send via SMTP
 *   4. Update the recipient's EmailLog to 'sent' or 'failed'
 *   5. Wait 100ms before the next send to avoid SMTP throttling
 *
 * Returns { sent, failed } counts.
 */
emailQueue.process('sendBulk', async (job) => {
  const { recipients, templateId, customVariables, bulkJobId } = job.data;

  const template = await EmailTemplate.findById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const transporter = createTransporter();

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      // Merge custom variables with per-recipient variables
      const variables = {
        ...customVariables,
        userName: recipient.firstName || 'Customer',
        userEmail: recipient.email,
      };

      const renderedSubject = interpolate(template.subject, variables);
      const renderedHtml = interpolate(template.htmlContent, variables);

      const fromAddress = `"${process.env.FROM_NAME || 'Hotel Booking'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;

      await transporter.sendMail({
        from: fromAddress,
        to: recipient.email,
        subject: renderedSubject,
        html: renderedHtml,
      });

      // Update EmailLog to sent
      await EmailLog.updateOne(
        {
          recipient: recipient.email,
          'metadata.bulkJobId': bulkJobId,
          status: 'queued',
        },
        {
          $set: {
            status: 'sent',
            sentAt: new Date(),
          },
        }
      );

      sent++;
    } catch (error) {
      // Update EmailLog to failed with error details
      await EmailLog.updateOne(
        {
          recipient: recipient.email,
          'metadata.bulkJobId': bulkJobId,
          status: 'queued',
        },
        {
          $set: {
            status: 'failed',
            error: error.message,
          },
        }
      );

      failed++;
    }

    // 100ms delay between sends to avoid SMTP throttling
    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await delay(100);
    }
  }

  return { sent, failed };
});

module.exports = { emailQueue };
