# Requirements Document

## Introduction

The Email Management System replaces Telitrip's hardcoded email infrastructure with a dynamic, admin-managed email platform. It introduces MongoDB-backed email templates with an admin HTML editor, live preview, dynamic variable interpolation, delivery logging, bulk email via Bull queue, and a professional Telitrip-branded template system. The system reuses existing dependencies (nodemailer, mongoose, bull, express-validator) with zero new npm packages.

## Glossary

- **Email_Service**: The refactored backend service (`email.service.js`) responsible for template resolution, variable interpolation, email sending via Nodemailer, and delivery logging.
- **Template_Engine**: The interpolation subsystem within Email_Service that replaces `{{variable}}` placeholders in template HTML and subject lines with escaped values.
- **EmailTemplate_Model**: The MongoDB model storing email templates with HTML content, subject lines, variable definitions, and metadata.
- **EmailLog_Model**: The MongoDB model tracking every email send attempt with status, recipient, template reference, and error details.
- **Admin_API**: The Express REST API endpoints under `/api/v1/admin/email/*` for template CRUD, preview, test send, bulk email, logs, and stats.
- **Admin_UI**: The React frontend components integrated into the admin dashboard for managing email templates, composing bulk emails, and viewing delivery logs.
- **Template_Interpolation**: The process of replacing `{{key}}` placeholders in template strings with HTML-escaped variable values.
- **Bulk_Email_Queue**: The Bull queue (`emailQueue`) backed by Redis that processes bulk email sends asynchronously in batches.
- **HTML_Sanitizer**: The server-side function that strips `<script>` tags, `on*` event handlers, and `javascript:` URLs from template HTML content.
- **Seed_Operation**: The process that creates the 12 default Telitrip-branded email templates on first run, matched by slug to prevent duplicates.
- **Notification_Service**: The existing backend service (`notification.service.js`) refactored to delegate email sending to Email_Service via `sendTemplatedEmail()`.

## Requirements

### Requirement 1: Email Template Storage

**User Story:** As an admin, I want email templates stored in MongoDB, so that I can edit them through the UI without requiring code changes or deployments.

#### Acceptance Criteria

1. THE EmailTemplate_Model SHALL store template name, slug, category, subject, HTML content, text content, variable definitions, sample data, active status, default flag, soft-delete flag, version number, and last-edited-by reference.
2. WHEN a template is created, THE EmailTemplate_Model SHALL enforce that the slug is unique, lowercase, and matches the pattern `[a-z0-9_]+`.
3. WHEN a template is created or updated, THE EmailTemplate_Model SHALL validate that the category is one of: booking, payment, account, support, marketing, or system.
4. WHEN a template's variable definitions are provided, THE EmailTemplate_Model SHALL validate that each variable key matches the pattern `[a-zA-Z][a-zA-Z0-9_]*`.
5. WHEN a template is saved, THE EmailTemplate_Model SHALL automatically increment the version number.
6. THE EmailTemplate_Model SHALL index the slug, isActive, and isDeleted fields for efficient query resolution.

### Requirement 2: Email Delivery Logging

**User Story:** As an admin, I want every email send attempt logged, so that I can monitor delivery status, debug failures, and generate reports.

#### Acceptance Criteria

1. WHEN an email is sent or attempted, THE Email_Service SHALL create exactly one EmailLog_Model document recording the template slug, template name, recipient email, recipient user ID, subject, status, type, message ID, and timestamp.
2. THE EmailLog_Model SHALL track status as one of: queued, sent, delivered, failed, or bounced.
3. THE EmailLog_Model SHALL track email type as one of: transactional, bulk, or system.
4. IF an email send fails, THEN THE EmailLog_Model SHALL store the error message in the error field.
5. WHEN a bulk email is queued, THE EmailLog_Model SHALL store the bulk job ID in the metadata field.
6. THE EmailLog_Model SHALL index the createdAt, status, templateSlug, and recipient fields for efficient querying and filtering.

### Requirement 3: Template Resolution with Fallback

**User Story:** As a developer, I want the email service to resolve templates from the database with a fallback to hardcoded defaults, so that critical emails still send even during database outages.

#### Acceptance Criteria

1. WHEN a template slug is requested, THE Email_Service SHALL first query MongoDB for an active, non-deleted template matching that slug.
2. IF no database template is found, THEN THE Email_Service SHALL fall back to a hardcoded default template for that slug.
3. IF neither a database template nor a hardcoded default exists, THEN THE Email_Service SHALL return a null template result.
4. WHILE resolving a template, THE Email_Service SHALL filter by `isActive: true` and `isDeleted: false`.
5. WHEN a template is resolved from the database, THE Email_Service SHALL indicate `isDefault: false` in the result.
6. WHEN a template is resolved from hardcoded defaults, THE Email_Service SHALL indicate `isDefault: true` in the result.

### Requirement 4: Template Variable Interpolation

**User Story:** As a developer, I want template variables interpolated with HTML-escaped values, so that emails render personalized content safely without XSS vulnerabilities.

#### Acceptance Criteria

1. WHEN a template is rendered, THE Template_Engine SHALL replace every `{{key}}` placeholder where the key exists in the provided variables with the HTML-escaped value.
2. WHEN a `{{key}}` placeholder has no matching variable, THE Template_Engine SHALL replace it with an empty string.
3. WHEN interpolating variable values, THE Template_Engine SHALL escape HTML special characters: `<`, `>`, `&`, `"`, and `'`.
4. THE Template_Engine SHALL apply the same interpolation function to both the subject line and the HTML body content.
5. THE Template_Engine SHALL not mutate the original template string or the input variables object.
6. THE Template_Engine SHALL not perform nested or recursive interpolation of `{{{{nested}}}}` patterns.

### Requirement 5: Transactional Email Sending

**User Story:** As a developer, I want a single method to send templated transactional emails, so that all email sending follows a consistent pattern with automatic logging.

#### Acceptance Criteria

1. WHEN `sendTemplatedEmail()` is called with a valid template slug and recipient, THE Email_Service SHALL resolve the template, interpolate variables, send via SMTP, and log the result.
2. WHEN an email is sent successfully, THE Email_Service SHALL return `{ success: true, messageId }` and create an EmailLog with status `sent`.
3. IF the SMTP send fails, THEN THE Email_Service SHALL return `{ success: false, error }` and create an EmailLog with status `failed`.
4. WHEN an email is sent successfully, THE Email_Service SHALL increment the template's `metadata.sendCount` and update `metadata.lastSentAt`.
5. IF the template is not found and no default exists, THEN THE Email_Service SHALL return `{ success: false, error: 'Template not found' }` without sending an email.

### Requirement 6: HTML Sanitization

**User Story:** As an admin, I want template HTML automatically sanitized on save, so that email templates cannot contain malicious scripts or event handlers.

#### Acceptance Criteria

1. WHEN a template is saved, THE HTML_Sanitizer SHALL remove all `<script>` tags and their contents from the HTML content.
2. WHEN a template is saved, THE HTML_Sanitizer SHALL remove all `on*` event handler attributes (e.g., onclick, onload, onerror) from the HTML content.
3. WHEN a template is saved, THE HTML_Sanitizer SHALL remove all `javascript:` protocol URLs from href and src attributes.
4. WHEN sanitizing HTML, THE HTML_Sanitizer SHALL preserve valid HTML structure, inline styles, and email-safe tags.
5. THE HTML_Sanitizer SHALL be idempotent: applying sanitization to already-sanitized content SHALL produce identical output.

### Requirement 7: Default Template Seeding

**User Story:** As a system operator, I want 12 default Telitrip-branded templates seeded on first run, so that the system works out of the box without manual template creation.

#### Acceptance Criteria

1. WHEN the seed operation runs, THE Seed_Operation SHALL create 12 default templates: welcome, password_reset, password_changed, account_suspended, account_reactivated, booking_confirmation, booking_cancellation, booking_status_update, payment_confirmation, payment_refund, support_ticket_created, and support_ticket_response.
2. WHEN a default template already exists (matched by slug), THE Seed_Operation SHALL skip creation of that template without error.
3. THE Seed_Operation SHALL mark all seeded templates with `isDefault: true`.
4. THE Seed_Operation SHALL apply consistent Telitrip branding to all default templates: blue gradient header (#1a73e8 to #4285f4), white body, light gray footer, primary blue buttons, and Arial/Helvetica font stack.
5. WHEN the seed operation runs multiple times, THE Seed_Operation SHALL produce the same set of templates without duplicates.

### Requirement 8: Soft Delete and Default Template Protection

**User Story:** As an admin, I want default templates protected from permanent deletion, so that critical system emails always have a template available.

#### Acceptance Criteria

1. WHEN an admin deletes a template with `isDefault: true`, THE Admin_API SHALL set `isDeleted: true` instead of removing the document.
2. WHEN an admin deletes a non-default template, THE Admin_API SHALL set `isDeleted: true` on the document.
3. WHILE a template has `isDeleted: true`, THE Email_Service SHALL exclude it from template resolution results.
4. WHILE a template has `isDeleted: true`, THE Admin_API SHALL exclude it from template list responses.

### Requirement 9: Admin Template CRUD API

**User Story:** As an admin, I want REST API endpoints for managing email templates, so that I can create, read, update, delete, duplicate, preview, and test-send templates.

#### Acceptance Criteria

1. WHEN an admin requests the template list, THE Admin_API SHALL return paginated templates filtered by optional category and search parameters.
2. WHEN an admin creates a template, THE Admin_API SHALL validate required fields (name, slug, category, subject, htmlContent) and sanitize the HTML content before saving.
3. WHEN an admin updates a template, THE Admin_API SHALL sanitize the HTML content and increment the version number.
4. WHEN an admin duplicates a template, THE Admin_API SHALL create a copy with a new slug and `isDefault: false`.
5. WHEN an admin requests a template preview, THE Admin_API SHALL interpolate the template with provided sample data and return the rendered HTML.
6. WHEN an admin sends a test email, THE Admin_API SHALL send the rendered template to the admin's own email address.
7. THE Admin_API SHALL require authentication and admin role (`admin` or `super_admin`) for all email management endpoints.

### Requirement 10: Bulk Email via Queue

**User Story:** As an admin, I want to send bulk emails to user segments asynchronously, so that marketing campaigns and announcements reach users without blocking the server.

#### Acceptance Criteria

1. WHEN an admin initiates a bulk email, THE Bulk_Email_Queue SHALL resolve recipients from the specified filter (all users, active users, or specific user IDs).
2. WHEN recipients are resolved, THE Bulk_Email_Queue SHALL batch them into groups of 50 and add each batch as a separate Bull queue job.
3. WHEN a bulk batch is queued, THE Email_Service SHALL create an EmailLog entry with status `queued` and type `bulk` for each recipient.
4. WHEN a bulk batch is processed, THE Bulk_Email_Queue SHALL send each email with a 100ms delay between sends to avoid SMTP throttling.
5. WHEN a bulk email job fails, THE Bulk_Email_Queue SHALL retry up to 3 times with exponential backoff (5s, 10s, 20s).
6. WHEN all recipients in a bulk job are processed, THE Bulk_Email_Queue SHALL ensure that the count of sent plus failed equals the total recipient count.
7. IF no recipients match the filter, THEN THE Bulk_Email_Queue SHALL return an error without creating queue jobs.
8. IF the template is not found or inactive, THEN THE Bulk_Email_Queue SHALL return an error without creating queue jobs.

### Requirement 11: Admin Email Management UI

**User Story:** As an admin, I want a dashboard tab for managing email templates, composing bulk emails, and viewing delivery logs, so that I can manage all email operations from a single interface.

#### Acceptance Criteria

1. WHEN an admin navigates to the email management tab, THE Admin_UI SHALL display a sub-navigation with sections for templates, bulk email, logs, and stats.
2. WHEN viewing the template list, THE Admin_UI SHALL display templates with name, category, status, send count, and last-sent date, with category filtering and search.
3. WHEN editing a template, THE Admin_UI SHALL display a split-panel view with an HTML editor on the left and a live preview rendered in an iframe on the right.
4. WHEN editing a template, THE Admin_UI SHALL display available template variables as clickable chips that insert `{{variable}}` into the editor.
5. WHEN composing a bulk email, THE Admin_UI SHALL allow the admin to select a template and a recipient segment (all users, active users, by booking status).
6. WHEN viewing email logs, THE Admin_UI SHALL display a paginated table with status badges, date filtering, and search by recipient.
7. WHEN viewing email stats, THE Admin_UI SHALL display summary cards showing total sent, delivered, failed, and bounced counts for a configurable date range.
8. THE Admin_UI SHALL follow the existing admin dashboard design patterns and responsive layout.

### Requirement 12: Notification Service Refactoring

**User Story:** As a developer, I want the notification service refactored to use `sendTemplatedEmail()`, so that all transactional emails use database-backed templates with consistent logging.

#### Acceptance Criteria

1. WHEN the Notification_Service sends a booking confirmation email, THE Notification_Service SHALL delegate to `Email_Service.sendTemplatedEmail('booking_confirmation', ...)` with the appropriate variables.
2. WHEN the Notification_Service sends a booking cancellation email, THE Notification_Service SHALL delegate to `Email_Service.sendTemplatedEmail('booking_cancellation', ...)` with the appropriate variables.
3. WHEN the Notification_Service sends a welcome email, THE Notification_Service SHALL delegate to `Email_Service.sendTemplatedEmail('welcome', ...)` with the appropriate variables.
4. WHEN the Notification_Service sends a password change notification, THE Notification_Service SHALL delegate to `Email_Service.sendTemplatedEmail('password_changed', ...)` with the appropriate variables.
5. WHEN the Notification_Service sends an account suspension notification, THE Notification_Service SHALL delegate to `Email_Service.sendTemplatedEmail('account_suspended', ...)` with the appropriate variables.
6. WHEN the Notification_Service sends an account reactivation notification, THE Notification_Service SHALL delegate to `Email_Service.sendTemplatedEmail('account_reactivated', ...)` with the appropriate variables.
7. WHEN the Notification_Service sends a booking status update email, THE Notification_Service SHALL delegate to `Email_Service.sendTemplatedEmail('booking_status_update', ...)` with the appropriate variables.
8. THE Notification_Service SHALL remove all inline HTML template strings and rely entirely on Email_Service for email content.

### Requirement 13: Security and Access Control

**User Story:** As a system operator, I want email management secured with proper access controls and input validation, so that only authorized admins can manage templates and send emails.

#### Acceptance Criteria

1. THE Admin_API SHALL require `authUser` and `requireRole(['admin', 'super_admin'])` middleware on all email management endpoints.
2. WHEN a template is saved, THE Admin_API SHALL enforce a maximum `htmlContent` size of 500KB.
3. THE Email_Service SHALL store SMTP credentials exclusively in environment variables and never expose them via API responses or logs.
4. WHEN a bulk email is requested, THE Admin_API SHALL enforce a rate limit of a maximum of 5 bulk operations per hour per admin.
5. THE Bulk_Email_Queue SHALL resolve recipients exclusively from database filters and not accept raw email addresses from user input.
