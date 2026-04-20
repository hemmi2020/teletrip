const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const emailController = require('../controllers/email.controller');
const { authUser, requireRole } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

// ========== MIDDLEWARE ==========
// All email admin routes require authentication and admin/super_admin role
const requireAdmin = [authUser, requireRole(['admin', 'super_admin'])];

// ========== VALIDATION SCHEMAS ==========
const paginationValidation = [
  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const templateIdValidation = [
  param('id').isMongoId().withMessage('Valid template ID is required')
];

const createTemplateValidation = [
  body('name').trim().notEmpty().withMessage('Template name is required')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('slug').trim().notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9_]+$/).withMessage('Slug must contain only lowercase letters, numbers, and underscores'),
  body('category').trim().notEmpty().withMessage('Category is required')
    .isIn(['booking', 'payment', 'account', 'support', 'marketing', 'system'])
    .withMessage('Category must be one of: booking, payment, account, support, marketing, system'),
  body('subject').trim().notEmpty().withMessage('Subject is required')
    .isLength({ max: 500 }).withMessage('Subject cannot exceed 500 characters'),
  body('htmlContent').notEmpty().withMessage('HTML content is required'),
  body('textContent').optional().isString().withMessage('Text content must be a string'),
  body('variables').optional().isArray().withMessage('Variables must be an array'),
  body('variables.*.key').optional().matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
    .withMessage('Variable key must start with a letter and contain only letters, numbers, and underscores'),
  body('sampleData').optional().isObject().withMessage('Sample data must be an object')
];

const updateTemplateValidation = [
  param('id').isMongoId().withMessage('Valid template ID is required'),
  body('name').optional().trim().isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('slug').optional().trim()
    .matches(/^[a-z0-9_]+$/).withMessage('Slug must contain only lowercase letters, numbers, and underscores'),
  body('category').optional().trim()
    .isIn(['booking', 'payment', 'account', 'support', 'marketing', 'system'])
    .withMessage('Category must be one of: booking, payment, account, support, marketing, system'),
  body('subject').optional().trim().isLength({ max: 500 }).withMessage('Subject cannot exceed 500 characters'),
  body('htmlContent').optional().isString().withMessage('HTML content must be a string'),
  body('textContent').optional().isString().withMessage('Text content must be a string'),
  body('variables').optional().isArray().withMessage('Variables must be an array'),
  body('variables.*.key').optional().matches(/^[a-zA-Z][a-zA-Z0-9_]*$/)
    .withMessage('Variable key must start with a letter and contain only letters, numbers, and underscores'),
  body('sampleData').optional().isObject().withMessage('Sample data must be an object'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const duplicateTemplateValidation = [
  param('id').isMongoId().withMessage('Valid template ID is required'),
  body('slug').trim().notEmpty().withMessage('A new slug is required for the duplicate')
    .matches(/^[a-z0-9_]+$/).withMessage('Slug must contain only lowercase letters, numbers, and underscores')
];

const previewTemplateValidation = [
  param('id').isMongoId().withMessage('Valid template ID is required'),
  body('sampleData').optional().isObject().withMessage('Sample data must be an object'),
  body('htmlContent').optional().isString().withMessage('HTML content must be a string'),
  body('subject').optional().isString().withMessage('Subject must be a string')
];

const testEmailValidation = [
  param('id').isMongoId().withMessage('Valid template ID is required'),
  body('sampleData').optional().isObject().withMessage('Sample data must be an object')
];

const bulkEmailValidation = [
  body('templateId').isMongoId().withMessage('Valid template ID is required'),
  body('recipientFilter').isObject().withMessage('Recipient filter is required'),
  body('recipientFilter.segment')
    .isIn(['all', 'active', 'inactive'])
    .withMessage('Segment must be one of: all, active, inactive'),
  body('recipientFilter.userIds').optional().isArray().withMessage('User IDs must be an array'),
  body('customVariables').optional().isObject().withMessage('Custom variables must be an object')
];

const logsQueryValidation = [
  ...paginationValidation,
  query('status')
    .optional({ checkFalsy: true })
    .isIn(['queued', 'sent', 'delivered', 'failed', 'bounced'])
    .withMessage('Invalid status'),
  query('templateSlug')
    .optional({ checkFalsy: true })
    .trim(),
  query('recipient')
    .optional({ checkFalsy: true })
    .trim(),
  query('type')
    .optional({ checkFalsy: true })
    .isIn(['transactional', 'bulk', 'system'])
    .withMessage('Invalid email type'),
  query('dateFrom')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid start date required'),
  query('dateTo')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid end date required'),
  query('sortBy')
    .optional({ checkFalsy: true })
    .isString(),
  query('sortOrder')
    .optional({ checkFalsy: true })
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const statsQueryValidation = [
  query('dateFrom')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid start date required'),
  query('dateTo')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid end date required')
];

// ========== TEMPLATE CRUD ==========

/**
 * @route   GET /api/v1/admin/email/templates
 * @desc    Get paginated list of email templates with optional filters
 * @access  Private (Admin only)
 */
router.get('/templates',
  ...requireAdmin,
  [
    ...paginationValidation,
    query('category')
      .optional({ checkFalsy: true })
      .isIn(['booking', 'payment', 'account', 'support', 'marketing', 'system'])
      .withMessage('Invalid category'),
    query('search')
      .optional({ checkFalsy: true })
      .trim(),
    query('sortBy')
      .optional({ checkFalsy: true })
      .isString(),
    query('sortOrder')
      .optional({ checkFalsy: true })
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  validateRequest,
  emailController.listTemplates
);

/**
 * @route   POST /api/v1/admin/email/templates
 * @desc    Create a new email template
 * @access  Private (Admin only)
 */
router.post('/templates',
  ...requireAdmin,
  createTemplateValidation,
  validateRequest,
  emailController.createTemplate
);

/**
 * @route   POST /api/v1/admin/email/templates/seed
 * @desc    Seed default email templates
 * @access  Private (Admin only)
 */
router.post('/templates/seed',
  ...requireAdmin,
  emailController.seedDefaultTemplates
);

/**
 * @route   GET /api/v1/admin/email/templates/:id
 * @desc    Get a single email template by ID
 * @access  Private (Admin only)
 */
router.get('/templates/:id',
  ...requireAdmin,
  templateIdValidation,
  validateRequest,
  emailController.getTemplate
);

/**
 * @route   PUT /api/v1/admin/email/templates/:id
 * @desc    Update an email template
 * @access  Private (Admin only)
 */
router.put('/templates/:id',
  ...requireAdmin,
  updateTemplateValidation,
  validateRequest,
  emailController.updateTemplate
);

/**
 * @route   DELETE /api/v1/admin/email/templates/:id
 * @desc    Soft delete an email template
 * @access  Private (Admin only)
 */
router.delete('/templates/:id',
  ...requireAdmin,
  templateIdValidation,
  validateRequest,
  emailController.deleteTemplate
);

/**
 * @route   POST /api/v1/admin/email/templates/:id/duplicate
 * @desc    Duplicate an email template with a new slug
 * @access  Private (Admin only)
 */
router.post('/templates/:id/duplicate',
  ...requireAdmin,
  duplicateTemplateValidation,
  validateRequest,
  emailController.duplicateTemplate
);

/**
 * @route   POST /api/v1/admin/email/templates/:id/preview
 * @desc    Preview a template with sample data interpolation
 * @access  Private (Admin only)
 */
router.post('/templates/:id/preview',
  ...requireAdmin,
  previewTemplateValidation,
  validateRequest,
  emailController.previewTemplate
);

/**
 * @route   POST /api/v1/admin/email/templates/:id/test
 * @desc    Send a test email to the admin's own email address
 * @access  Private (Admin only)
 */
router.post('/templates/:id/test',
  ...requireAdmin,
  testEmailValidation,
  validateRequest,
  emailController.sendTestEmail
);

// ========== BULK EMAIL ==========

/**
 * @route   POST /api/v1/admin/email/bulk
 * @desc    Queue bulk emails to user segments
 * @access  Private (Admin only)
 */
router.post('/bulk',
  ...requireAdmin,
  bulkEmailValidation,
  validateRequest,
  emailController.sendBulkEmail
);

// ========== LOGS & STATS ==========

/**
 * @route   GET /api/v1/admin/email/logs
 * @desc    Get paginated email logs with filters
 * @access  Private (Admin only)
 */
router.get('/logs',
  ...requireAdmin,
  logsQueryValidation,
  validateRequest,
  emailController.getEmailLogs
);

/**
 * @route   GET /api/v1/admin/email/stats
 * @desc    Get email delivery statistics
 * @access  Private (Admin only)
 */
router.get('/stats',
  ...requireAdmin,
  statsQueryValidation,
  validateRequest,
  emailController.getEmailStats
);

module.exports = router;
