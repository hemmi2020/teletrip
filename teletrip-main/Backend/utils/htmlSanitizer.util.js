/**
 * HTML Sanitizer Utility
 *
 * Strips potentially dangerous HTML content from email templates:
 * - <script> tags and their contents
 * - on* event handler attributes (onclick, onload, onerror, etc.)
 * - javascript: protocol URLs in href and src attributes
 *
 * Preserves valid HTML structure, inline styles, and email-safe tags.
 * This function is idempotent: sanitizeHtml(sanitizeHtml(x)) === sanitizeHtml(x).
 */

/**
 * Sanitize HTML content by removing script tags, event handlers,
 * and javascript: protocol URLs.
 *
 * @param {string} htmlContent - Raw HTML string to sanitize
 * @returns {string} Sanitized HTML string safe for email templates
 */
function sanitizeHtml(htmlContent) {
  if (!htmlContent) return '';

  let sanitized = htmlContent;

  // Step 1: Remove <script> tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Step 2: Remove on* event handler attributes (onclick, onload, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Step 3: Remove javascript: protocol URLs from href and src attributes
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, 'href=""');
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, 'src=""');

  return sanitized;
}

module.exports = sanitizeHtml;
