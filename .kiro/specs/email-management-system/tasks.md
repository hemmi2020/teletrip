# Implementation Plan: Email Management System

## Overview

Transform Telitrip's hardcoded email infrastructure into a dynamic, admin-managed email platform. The implementation proceeds bottom-up: data models first, then core service logic (interpolation, sanitization, template resolution), followed by the email controller/routes, Bull queue integration, notification service refactoring, and finally the React admin UI. All work uses existing dependencies (nodemailer, mongoose, bull, express-validator) with zero new npm packages.

## Tasks

- [x] 1. Create EmailTemplate and EmailLog Mongoose models
  - [x] 1.1 Create `Backend/models/emailTemplate.model.js` with the schema from the design
    - Define fields: name, slug (unique, lowercase), category (enum), subject, htmlContent, textContent, variables array, sampleData, isActive, isDefault, isDeleted, version, lastEditedBy, metadata (sendCount, lastSentAt)
    - Add mongoose-paginate-v2 plugin
    - Add indexes on slug, isActive, isDeleted, and category
    - Add pre-save hook to auto-increment version on update
    - Add slug validation regex `[a-z0-9_]+` and variable key validation regex `[a-zA-Z][a-zA-Z0-9_]*`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.2 Create `Backend/models/emailLog.model.js` with the schema from the design
    - Define fields: templateSlug, templateName, recipient, recipientUserId, subject, status (enum: queued/sent/delivered/failed/bounced), type (enum: transactional/bulk/system), messageId, error, metadata (bulkJobId, variables, ipAddress), sentAt, deliveredAt
    - Add mongoose-paginate-v2 plugin
    - Add compound indexes on `{ createdAt: -1 }`, `{ status: 1, createdAt: -1 }`, templateSlug, and recipient
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.3 Write property test for EmailTemplate input validation
    - **Property 9: EmailTemplate Input Validation**
    - Verify slug accepts only `[a-z0-9_]+`, category accepts only the six valid enum values, variable keys accept only `[a-zA-Z][a-zA-Z0-9_]*`
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 2. Implement HTML sanitization utility and template interpolation engine
  - [x] 2.1 Create `Backend/utils/htmlSanitizer.util.js` with the `sanitizeHtml()` function
    - Remove `<script>` tags and their contents using regex
    - Remove `on*` event handler attributes (onclick, onload, onerror, etc.)
    - Remove `javascript:` protocol URLs from href and src attributes
    - Preserve valid HTML structure, inline styles, and email-safe tags
    - Export as a standalone utility function
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.2 Write property test for sanitization safety
    - **Property 4: Sanitization Safety**
    - For any HTML string, after `sanitizeHtml()`, output contains no `<script>` tags, no `on*` event handlers, no `javascript:` URLs
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [x] 2.3 Write property test for sanitization idempotency
    - **Property 5: Sanitization Idempotency**
    - For any HTML string, `sanitizeHtml(sanitizeHtml(x))` produces identical output to `sanitizeHtml(x)`
    - **Validates: Requirement 6.5**

  - [x] 2.4 Write property test for safe HTML preservation
    - **Property 6: Safe HTML Preservation**
    - For any HTML string with no script tags, no `on*` handlers, and no `javascript:` URLs, `sanitizeHtml()` returns input unchanged
    - **Validates: Requirement 6.4**

  - [x] 2.5 Add `interpolate()` and `escapeHtml()` functions to the email service module
    - Implement `{{key}}` placeholder replacement using regex `/\{\{(\w+)\}\}/g`
    - HTML-escape variable values (`<`, `>`, `&`, `"`, `'`) before insertion
    - Replace unmatched placeholders with empty string
    - Do not mutate original template string or variables object
    - Do not perform nested/recursive interpolation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 2.6 Write property test for interpolation completeness
    - **Property 1: Interpolation Completeness**
    - For any template string with `{{key}}` placeholders and any variables object, after interpolation no `{{...}}` patterns remain
    - **Validates: Requirements 4.1, 4.2**

  - [x] 2.7 Write property test for HTML escape safety
    - **Property 2: HTML Escape Safety**
    - For any variable value containing `<`, `>`, `&`, `"`, `'`, the output contains only escaped equivalents and never raw characters from variable values
    - **Validates: Requirement 4.3**

  - [x] 2.8 Write property test for interpolation immutability
    - **Property 3: Interpolation Immutability**
    - For any template and variables, calling `interpolate()` does not mutate the original template string or variables object
    - **Validates: Requirement 4.5**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Refactor email service with template resolution, sending, and logging
  - [x] 4.1 Refactor `Backend/services/email.service.js` with `resolveTemplate()` method
    - Query MongoDB for active, non-deleted template matching slug: `{ slug, isActive: true, isDeleted: false }`
    - Fall back to hardcoded defaults from `Backend/templates/email.templates.js` if no DB template found
    - Return `{ template, isDefault }` structure
    - Return `{ template: null, isDefault: false }` if neither exists
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.2 Write property test for template resolution filtering
    - **Property 7: Template Resolution Filtering**
    - For any set of EmailTemplate documents with varying isActive/isDeleted states, `resolveTemplate()` only returns templates where isActive is true and isDeleted is false
    - **Validates: Requirements 3.4, 8.3**

  - [x] 4.3 Implement `sendTemplatedEmail()` method in email service
    - Resolve template via `resolveTemplate(slug)`
    - Interpolate variables into both subject and htmlContent using `interpolate()`
    - Send via existing Nodemailer transporter
    - Create EmailLog document with status `sent` on success or `failed` on error
    - Increment template `metadata.sendCount` and update `metadata.lastSentAt` on success
    - Return `{ success: true, messageId }` or `{ success: false, error }`
    - Return `{ success: false, error: 'Template not found' }` if no template and no default
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.4 Write property test for log completeness
    - **Property 10: Log Completeness**
    - For any call to `sendTemplatedEmail()` that reaches the send phase, exactly one EmailLog document is created regardless of SMTP success or failure
    - **Validates: Requirement 2.1**

  - [x] 4.5 Add `logEmail()` and `getEmailStats()` helper methods to email service
    - `logEmail()` creates an EmailLog document with provided data
    - `getEmailStats(dateRange)` aggregates EmailLog by status for the given date range, returning counts for sent, delivered, failed, bounced
    - _Requirements: 2.1, 2.6_

- [x] 5. Create default template seed script and data
  - [x] 5.1 Create `Backend/scripts/seedEmailTemplates.js` with 12 default Telitrip-branded templates
    - Define all 12 templates: welcome, password_reset, password_changed, account_suspended, account_reactivated, booking_confirmation, booking_cancellation, booking_status_update, payment_confirmation, payment_refund, support_ticket_created, support_ticket_response
    - Apply consistent Telitrip branding: blue gradient header (#1a73e8 to #4285f4), white body, light gray footer (#f8f9fa), primary blue buttons (#1a73e8), Arial/Helvetica font stack
    - Each template includes appropriate variables array with key, description, required, and defaultValue
    - Each template includes sampleData for live preview
    - Use upsert by slug to prevent duplicates on re-run
    - Mark all seeded templates with `isDefault: true`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 5.2 Write property test for seed idempotency
    - **Property 8: Seed Idempotency**
    - For any number of consecutive seed executions, the database contains exactly 12 templates matched by slug with no duplicates
    - **Validates: Requirements 7.2, 7.5**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement email controller and admin REST API routes
  - [x] 7.1 Create `Backend/controllers/email.controller.js` with template CRUD methods
    - `listTemplates(req, res)` — paginated list with optional category and search filters, excluding `isDeleted: true`
    - `getTemplate(req, res)` — single template by ID
    - `createTemplate(req, res)` — validate required fields (name, slug, category, subject, htmlContent), sanitize HTML via `sanitizeHtml()`, enforce 500KB max htmlContent size, save to DB
    - `updateTemplate(req, res)` — sanitize HTML, increment version, update lastEditedBy
    - `deleteTemplate(req, res)` — soft delete (set `isDeleted: true`); default templates cannot be hard-deleted
    - `duplicateTemplate(req, res)` — copy template with new slug, set `isDefault: false`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 13.2_

  - [x] 7.2 Add preview, test send, and seed endpoints to email controller
    - `previewTemplate(req, res)` — interpolate template with provided sample data, return rendered HTML
    - `sendTestEmail(req, res)` — send rendered template to admin's own email address
    - `seedDefaultTemplates(req, res)` — trigger seed operation, return count of created/skipped templates
    - _Requirements: 9.5, 9.6_

  - [x] 7.3 Add email logs and stats endpoints to email controller
    - `getEmailLogs(req, res)` — paginated logs with status, date range, recipient, and templateSlug filters
    - `getEmailStats(req, res)` — aggregate stats (sent, delivered, failed, bounced) for configurable date range
    - _Requirements: 2.6_

  - [x] 7.4 Create `Backend/routes/email.route.js` with all admin email routes
    - Mount all routes under `/api/v1/admin/email/*` prefix
    - Apply `authUser` and `requireRole(['admin', 'super_admin'])` middleware to all routes
    - Add express-validator validation for all request parameters (body, params, query)
    - Define routes: GET/POST templates, GET/PUT/DELETE templates/:id, POST templates/:id/duplicate, POST templates/:id/preview, POST templates/:id/test, POST bulk, GET logs, GET stats, POST templates/seed
    - _Requirements: 9.7, 13.1_

  - [x] 7.5 Register email routes in `Backend/app.js`
    - Import email routes and mount at `/api/v1/admin/email`
    - Place alongside existing admin dashboard routes
    - _Requirements: 9.7_

- [x] 8. Implement bulk email via Bull queue
  - [x] 8.1 Add `queueBulkEmail()` method to email service
    - Validate template exists and is active
    - Resolve recipients from filter: `{ segment: 'all'|'active'|'inactive', userIds?: [] }`
    - Return error if no recipients match or template not found/inactive
    - Batch recipients into groups of 50
    - Add each batch to Bull `emailQueue` with `{ attempts: 3, backoff: { type: 'exponential', delay: 5000 } }`
    - Create EmailLog entry with `type: 'bulk'` and `status: 'queued'` for each recipient
    - Return `{ success: true, queued: totalCount, jobIds: [] }`
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.7, 10.8_

  - [x] 8.2 Implement Bull queue processor for bulk email batches
    - Create `Backend/services/emailQueue.service.js` (or add to email.service.js)
    - Set up Bull queue connected to Redis via existing ioredis config
    - Process each batch: resolve template, interpolate per-recipient variables, send via SMTP with 100ms delay between sends
    - Update each recipient's EmailLog to `sent` or `failed` with error details
    - Return `{ sent, failed }` counts from processor
    - _Requirements: 10.4, 10.5, 10.6_

  - [x] 8.3 Add `sendBulkEmail()` endpoint to email controller
    - Accept templateId, recipientFilter, and customVariables in request body
    - Add rate limiting: max 5 bulk operations per hour per admin
    - Validate that recipients are resolved from DB filters only (no raw email input)
    - Delegate to `emailService.queueBulkEmail()`
    - _Requirements: 10.1, 13.4, 13.5_

  - [x] 8.4 Write property test for bulk email consistency
    - **Property 11: Bulk Email Consistency**
    - For any bulk job with N recipients, after processing, sent + failed = N and exactly N EmailLog entries with type `bulk` exist
    - **Validates: Requirements 10.3, 10.6**

  - [x] 8.5 Write property test for bulk recipient batching
    - **Property 12: Bulk Recipient Batching**
    - For any N recipients, the system creates exactly `ceil(N / 50)` queue jobs, each with at most 50 recipients, and every recipient appears in exactly one batch
    - **Validates: Requirement 10.2**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Refactor notification service to use sendTemplatedEmail()
  - [x] 10.1 Refactor `Backend/services/notification.service.js` email methods
    - Import the refactored email service
    - Replace `sendWelcomeEmail()` inline HTML with `emailService.sendTemplatedEmail('welcome', email, { firstName })`
    - Replace `sendBookingConfirmation()` inline HTML with `emailService.sendTemplatedEmail('booking_confirmation', email, { userName, bookingReference, hotelName, checkInDate, checkOutDate, totalAmount, guests, rooms })`
    - Replace `sendBookingCancellation()` inline HTML with `emailService.sendTemplatedEmail('booking_cancellation', email, { userName, bookingReference, hotelName, totalAmount, cancellationFee, refundAmount })`
    - Replace `sendPasswordChangeNotification()` inline HTML with `emailService.sendTemplatedEmail('password_changed', email, { firstName })`
    - Replace `sendBookingStatusUpdate()` inline HTML with `emailService.sendTemplatedEmail('booking_status_update', email, { userName, bookingReference, hotelName, status, adminNotes })`
    - Replace `sendAccountSuspensionNotification()` inline HTML with `emailService.sendTemplatedEmail('account_suspended', email, { reason })`
    - Replace `sendAccountReactivationNotification()` inline HTML with `emailService.sendTemplatedEmail('account_reactivated', email, {})`
    - Replace `sendSupportTicketNotification()` inline HTML with `emailService.sendTemplatedEmail('support_ticket_created', adminEmail, { ticketNumber, userName, userEmail, subject, category, priority, description })`
    - Replace `sendTicketResponseNotification()` inline HTML with `emailService.sendTemplatedEmail('support_ticket_response', userEmail, { firstName, ticketNumber, subject })`
    - Remove all inline HTML template strings from notification service
    - Keep in-app notification methods (createNotification, sendBookingNotification, sendPaymentNotification, sendBulkNotification) unchanged
    - Keep SMS methods unchanged
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [x] 10.2 Write unit tests for notification service refactoring
    - Mock emailService.sendTemplatedEmail and verify each notification method calls it with the correct slug and variables
    - Verify no inline HTML remains in notification service email methods
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Build frontend admin email management UI components
  - [x] 12.1 Create `Frontend/src/components/EmailManagement/EmailManagementTab.jsx` main container
    - Add sub-navigation tabs: Templates, Bulk Email, Logs, Stats
    - Manage active sub-tab state
    - Follow existing admin dashboard tab patterns and responsive layout
    - _Requirements: 11.1, 11.8_

  - [x] 12.2 Create `Frontend/src/components/EmailManagement/TemplateList.jsx`
    - Display templates in a table/grid with name, category badge, active status toggle, send count, last-sent date
    - Add category filter dropdown and search input
    - Add action buttons: Edit, Duplicate, Delete, Send Test
    - Paginate results
    - _Requirements: 11.2_

  - [x] 12.3 Create `Frontend/src/components/EmailManagement/TemplateEditor.jsx` with split-panel editor and preview
    - Left panel: HTML textarea editor for htmlContent, subject input, category selector, variables editor
    - Right panel: live preview rendered in a sandboxed iframe using `srcDoc`
    - Variable inserter: display available `{{variables}}` as clickable chips that insert into the editor at cursor position
    - Preview button that calls POST `/api/v1/admin/email/templates/:id/preview` with current content and sampleData
    - Save button that calls PUT `/api/v1/admin/email/templates/:id`
    - _Requirements: 11.3, 11.4_

  - [x] 12.4 Create `Frontend/src/components/EmailManagement/BulkEmailComposer.jsx`
    - Template selector dropdown (fetches active templates)
    - Recipient segment selector: All Users, Active Users, By Booking Status
    - Custom variables input fields
    - Send button with confirmation dialog
    - Display queued count on success
    - _Requirements: 11.5_

  - [x] 12.5 Create `Frontend/src/components/EmailManagement/EmailLogsViewer.jsx`
    - Paginated table with columns: recipient, template, subject, status badge, type, sent date
    - Status filter (queued, sent, delivered, failed, bounced)
    - Date range filter
    - Search by recipient email
    - _Requirements: 11.6_

  - [x] 12.6 Create `Frontend/src/components/EmailManagement/EmailStatsCards.jsx`
    - Summary cards: Total Sent, Delivered, Failed, Bounced counts
    - Configurable date range selector
    - Fetch data from GET `/api/v1/admin/email/stats`
    - _Requirements: 11.7_

- [x] 13. Integrate email management tab into AdminDashboard
  - [x] 13.1 Add "Email" tab to `Frontend/src/AdminDashboard.jsx` sidebar navigation
    - Add Mail icon from lucide-react to the tab list
    - Add `email` to the activeTab options
    - Render `EmailManagementTab` component when `activeTab === 'email'`
    - Import EmailManagementTab component
    - _Requirements: 11.1, 11.8_

  - [x] 13.2 Create `Frontend/src/services/emailApi.js` API service for email management
    - Implement methods: listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate, previewTemplate, sendTestEmail, sendBulkEmail, getEmailLogs, getEmailStats, seedTemplates
    - Use existing auth token pattern from `adminApi.js`
    - Base URL: `/api/v1/admin/email`
    - _Requirements: 11.1_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All 12 correctness properties from the design are covered by property test sub-tasks
- Zero new npm packages required — all dependencies already installed
- The notification service refactoring (task 10) preserves all in-app notification and SMS methods unchanged
