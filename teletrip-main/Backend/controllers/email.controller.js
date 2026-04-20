const EmailTemplate = require('../models/emailTemplate.model');
const EmailLog = require('../models/emailLog.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const sanitizeHtml = require('../utils/htmlSanitizer.util');
const emailService = require('../services/email.service');
const { interpolate } = require('../services/email.service');
const { seedEmailTemplates } = require('../scripts/seedEmailTemplates');

// Maximum allowed htmlContent size: 500KB
const MAX_HTML_CONTENT_SIZE = 500 * 1024;

// ========== RATE LIMITING FOR BULK EMAIL (Task 8.3) ==========
// In-memory Map tracking admin bulk operations per hour
// Key: admin user ID, Value: array of timestamps
const bulkRateLimitMap = new Map();
const BULK_RATE_LIMIT = 5; // max 5 bulk operations per hour per admin
const BULK_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// ========== TEMPLATE CRUD (Task 7.1) ==========

/**
 * GET /api/v1/admin/email/templates
 * Paginated list with optional category and search filters, excluding soft-deleted.
 */
const listTemplates = asyncErrorHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = { isDeleted: { $ne: true } };

  if (category && category.trim()) {
    query.category = category.trim();
  }

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [templates, total] = await Promise.all([
    EmailTemplate
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    EmailTemplate.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  const result = {
    templates,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    }
  };

  return ApiResponse.success(res, result, 'Templates retrieved successfully');
});

/**
 * GET /api/v1/admin/email/templates/:id
 * Single template by ID.
 */
const getTemplate = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const template = await EmailTemplate.findById(id).lean();

  if (!template) {
    return ApiResponse.notFound(res, 'Template not found');
  }

  return ApiResponse.success(res, template, 'Template retrieved successfully');
});

/**
 * POST /api/v1/admin/email/templates
 * Validate required fields, sanitize HTML, enforce 500KB max, save to DB.
 */
const createTemplate = asyncErrorHandler(async (req, res) => {
  const { name, slug, category, subject, htmlContent, textContent, variables, sampleData } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!name) missingFields.push('name');
  if (!slug) missingFields.push('slug');
  if (!category) missingFields.push('category');
  if (!subject) missingFields.push('subject');
  if (!htmlContent) missingFields.push('htmlContent');

  if (missingFields.length > 0) {
    return ApiResponse.badRequest(res, `Missing required fields: ${missingFields.join(', ')}`);
  }

  // Enforce 500KB max htmlContent size
  if (Buffer.byteLength(htmlContent, 'utf8') > MAX_HTML_CONTENT_SIZE) {
    return ApiResponse.badRequest(res, 'htmlContent exceeds maximum size of 500KB');
  }

  // Sanitize HTML
  const sanitizedHtml = sanitizeHtml(htmlContent);

  const template = new EmailTemplate({
    name,
    slug,
    category,
    subject,
    htmlContent: sanitizedHtml,
    textContent: textContent || '',
    variables: variables || [],
    sampleData: sampleData || {},
    lastEditedBy: req.user?.id || undefined
  });

  await template.save();

  return ApiResponse.created(res, template, 'Template created successfully');
});

/**
 * PUT /api/v1/admin/email/templates/:id
 * Sanitize HTML, increment version, update lastEditedBy.
 */
const updateTemplate = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const template = await EmailTemplate.findById(id);

  if (!template) {
    return ApiResponse.notFound(res, 'Template not found');
  }

  // Sanitize HTML if provided
  if (updates.htmlContent) {
    if (Buffer.byteLength(updates.htmlContent, 'utf8') > MAX_HTML_CONTENT_SIZE) {
      return ApiResponse.badRequest(res, 'htmlContent exceeds maximum size of 500KB');
    }
    updates.htmlContent = sanitizeHtml(updates.htmlContent);
  }

  // Update allowed fields on the document
  const allowedFields = [
    'name', 'subject', 'htmlContent', 'textContent',
    'category', 'variables', 'sampleData', 'isActive'
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      template[field] = updates[field];
    }
  }

  // Track who edited and let the pre-save hook increment version
  template.lastEditedBy = req.user?.id || template.lastEditedBy;

  await template.save();

  return ApiResponse.success(res, template, 'Template updated successfully');
});

/**
 * DELETE /api/v1/admin/email/templates/:id
 * Soft delete (set isDeleted: true). Default templates cannot be hard-deleted.
 */
const deleteTemplate = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const template = await EmailTemplate.findById(id);

  if (!template) {
    return ApiResponse.notFound(res, 'Template not found');
  }

  // Soft delete for all templates (default templates are always soft-deleted)
  template.isDeleted = true;
  await template.save();

  return ApiResponse.success(res, null, 'Template deleted successfully');
});

/**
 * POST /api/v1/admin/email/templates/:id/duplicate
 * Copy template with new slug, set isDefault: false.
 */
const duplicateTemplate = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { slug: newSlug } = req.body;

  const original = await EmailTemplate.findById(id);

  if (!original) {
    return ApiResponse.notFound(res, 'Template not found');
  }

  if (!newSlug) {
    return ApiResponse.badRequest(res, 'A new slug is required for the duplicate');
  }

  // Check if the new slug already exists
  const existing = await EmailTemplate.findOne({ slug: newSlug });
  if (existing) {
    return ApiResponse.badRequest(res, `A template with slug '${newSlug}' already exists`);
  }

  const duplicate = new EmailTemplate({
    name: `${original.name} (Copy)`,
    slug: newSlug,
    category: original.category,
    subject: original.subject,
    htmlContent: original.htmlContent,
    textContent: original.textContent,
    variables: original.variables,
    sampleData: original.sampleData,
    isDefault: false,
    isActive: original.isActive,
    isDeleted: false,
    lastEditedBy: req.user?.id || undefined
  });

  await duplicate.save();

  return ApiResponse.created(res, duplicate, 'Template duplicated successfully');
});


// ========== PREVIEW, TEST SEND, SEED (Task 7.2) ==========

/**
 * POST /api/v1/admin/email/templates/:id/preview
 * Interpolate template with provided sample data, return rendered HTML.
 */
const previewTemplate = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { sampleData, htmlContent: overrideHtml, subject: overrideSubject } = req.body;

  const template = await EmailTemplate.findById(id);

  if (!template) {
    return ApiResponse.notFound(res, 'Template not found');
  }

  const data = sampleData || template.sampleData || {};
  const htmlToRender = overrideHtml || template.htmlContent;
  const subjectToRender = overrideSubject || template.subject;

  const renderedHtml = interpolate(htmlToRender, data);
  const renderedSubject = interpolate(subjectToRender, data);

  return ApiResponse.success(res, {
    html: renderedHtml,
    subject: renderedSubject
  }, 'Template preview generated successfully');
});

/**
 * POST /api/v1/admin/email/templates/:id/test
 * Send rendered template to admin's own email address.
 */
const sendTestEmail = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { sampleData } = req.body;

  const template = await EmailTemplate.findById(id);

  if (!template) {
    return ApiResponse.notFound(res, 'Template not found');
  }

  // Use the admin's own email address
  const adminEmail = req.user?.email;
  if (!adminEmail) {
    return ApiResponse.badRequest(res, 'Admin email address not available');
  }

  const data = sampleData || template.sampleData || {};
  const renderedHtml = interpolate(template.htmlContent, data);
  const renderedSubject = interpolate(template.subject, data);

  const result = await emailService.sendEmail({
    to: adminEmail,
    subject: `[TEST] ${renderedSubject}`,
    html: renderedHtml,
    text: template.textContent ? interpolate(template.textContent, data) : ''
  });

  if (result.success) {
    return ApiResponse.success(res, {
      messageId: result.messageId,
      sentTo: adminEmail
    }, 'Test email sent successfully');
  }

  return ApiResponse.error(res, `Failed to send test email: ${result.error}`, 500);
});

/**
 * POST /api/v1/admin/email/templates/seed
 * Trigger seed operation, return count of created/skipped templates.
 */
const seedDefaultTemplates = asyncErrorHandler(async (req, res) => {
  const result = await seedEmailTemplates();

  return ApiResponse.success(res, {
    created: result.created,
    skipped: result.skipped,
    total: result.created + result.skipped
  }, `Seed complete: ${result.created} created, ${result.skipped} skipped`);
});

// ========== EMAIL LOGS & STATS (Task 7.3) ==========

/**
 * GET /api/v1/admin/email/logs
 * Paginated logs with status, date range, recipient, and templateSlug filters.
 */
const getEmailLogs = asyncErrorHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    templateSlug,
    recipient,
    type,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (status && status.trim()) {
    query.status = status.trim();
  }

  if (templateSlug && templateSlug.trim()) {
    query.templateSlug = templateSlug.trim();
  }

  if (recipient && recipient.trim()) {
    query.recipient = { $regex: recipient.trim(), $options: 'i' };
  }

  if (type && type.trim()) {
    query.type = type.trim();
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [logs, total] = await Promise.all([
    EmailLog
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    EmailLog.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  const result = {
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    }
  };

  return ApiResponse.success(res, result, 'Email logs retrieved successfully');
});

/**
 * GET /api/v1/admin/email/stats
 * Aggregate stats (sent, delivered, failed, bounced) for configurable date range.
 */
const getEmailStats = asyncErrorHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  const dateRange = {};
  if (dateFrom) dateRange.start = new Date(dateFrom);
  if (dateTo) dateRange.end = new Date(dateTo);

  // Use the email service's getEmailStats helper
  const stats = await emailService.getEmailStats(
    dateRange.start && dateRange.end ? dateRange : undefined
  );

  return ApiResponse.success(res, stats, 'Email stats retrieved successfully');
});

// ========== BULK EMAIL (Task 8.3) ==========

/**
 * Checks if an admin has exceeded the bulk email rate limit.
 * Cleans up expired timestamps and returns whether the limit is exceeded.
 * @param {string} adminId - The admin user ID
 * @returns {boolean} true if rate limit exceeded
 */
function isBulkRateLimited(adminId) {
  const now = Date.now();
  const timestamps = bulkRateLimitMap.get(adminId) || [];

  // Filter out timestamps older than the rate window
  const recentTimestamps = timestamps.filter(ts => now - ts < BULK_RATE_WINDOW_MS);
  bulkRateLimitMap.set(adminId, recentTimestamps);

  return recentTimestamps.length >= BULK_RATE_LIMIT;
}

/**
 * Records a bulk email operation for rate limiting.
 * @param {string} adminId - The admin user ID
 */
function recordBulkOperation(adminId) {
  const timestamps = bulkRateLimitMap.get(adminId) || [];
  timestamps.push(Date.now());
  bulkRateLimitMap.set(adminId, timestamps);
}

/**
 * POST /api/v1/admin/email/bulk
 * Queue bulk emails to user segments.
 * Accepts templateId, recipientFilter, and customVariables in request body.
 * Rate limited: max 5 bulk operations per hour per admin.
 * Recipients are resolved from DB filters only (no raw email input).
 */
const sendBulkEmail = asyncErrorHandler(async (req, res) => {
  const { templateId, recipientFilter, customVariables } = req.body;

  // Validate required fields
  if (!templateId) {
    return ApiResponse.badRequest(res, 'templateId is required');
  }

  if (!recipientFilter || !recipientFilter.segment) {
    return ApiResponse.badRequest(res, 'recipientFilter with a segment is required');
  }

  // Validate segment value
  const validSegments = ['all', 'active', 'inactive'];
  if (!validSegments.includes(recipientFilter.segment)) {
    return ApiResponse.badRequest(res, 'Segment must be one of: all, active, inactive');
  }

  // Validate that no raw email addresses are provided (security: Req 13.5)
  if (recipientFilter.emails || recipientFilter.rawEmails) {
    return ApiResponse.badRequest(res, 'Raw email addresses are not accepted. Use segment or userIds filters only.');
  }

  // Rate limiting: max 5 bulk operations per hour per admin (Req 13.4)
  const adminId = req.user?._id?.toString() || req.user?.id;
  if (!adminId) {
    return ApiResponse.unauthorized(res, 'Admin authentication required');
  }

  if (isBulkRateLimited(adminId)) {
    return ApiResponse.error(res, 'Rate limit exceeded. Maximum 5 bulk email operations per hour.', 429);
  }

  // Delegate to email service
  const result = await emailService.queueBulkEmail(
    templateId,
    recipientFilter,
    customVariables || {}
  );

  if (!result.success) {
    return ApiResponse.badRequest(res, result.error);
  }

  // Record this bulk operation for rate limiting
  recordBulkOperation(adminId);

  return ApiResponse.success(res, {
    queued: result.queued,
    jobIds: result.jobIds,
  }, `Bulk email queued successfully: ${result.queued} recipients`);
});

// ========== EXPORTS ==========

module.exports = {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  previewTemplate,
  sendTestEmail,
  seedDefaultTemplates,
  getEmailLogs,
  getEmailStats,
  sendBulkEmail
};
