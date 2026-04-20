const fc = require('fast-check');
const sanitizeHtml = require('../../utils/htmlSanitizer.util');

/**
 * Property-Based Tests for HTML Sanitizer Utility
 *
 * Tests Properties 4, 5, and 6 from the design document.
 */

// ---------------------------------------------------------------------------
// Arbitraries / Generators
// ---------------------------------------------------------------------------

// Arbitrary: generates random HTML-like strings that may contain dangerous content
const htmlWithScriptArb = fc.oneof(
  // Script tags with content
  fc.tuple(
    fc.string({ minLength: 0, maxLength: 30 }),
    fc.string({ minLength: 0, maxLength: 30 }),
    fc.string({ minLength: 0, maxLength: 30 })
  ).map(([before, scriptBody, after]) =>
    `${before}<script>${scriptBody}</script>${after}`
  ),
  // Script tags with attributes
  fc.tuple(
    fc.string({ minLength: 0, maxLength: 30 }),
    fc.constantFrom('type="text/javascript"', 'src="evil.js"', 'async'),
    fc.string({ minLength: 0, maxLength: 30 }),
    fc.string({ minLength: 0, maxLength: 30 })
  ).map(([before, attr, body, after]) =>
    `${before}<script ${attr}>${body}</script>${after}`
  ),
  // Case variations
  fc.tuple(
    fc.string({ minLength: 0, maxLength: 30 }),
    fc.constantFrom('<SCRIPT>', '<Script>', '<sCrIpT>'),
    fc.string({ minLength: 0, maxLength: 30 }),
    fc.constantFrom('</SCRIPT>', '</Script>', '</sCrIpT>')
  ).map(([before, open, body, close]) =>
    `${before}${open}${body}${close}`
  )
);

// Arbitrary: generates HTML with on* event handlers
const htmlWithEventHandlerArb = fc.tuple(
  fc.constantFrom('div', 'img', 'button', 'a', 'p', 'span', 'body'),
  fc.constantFrom('onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'ONCLICK', 'OnLoad'),
  fc.constantFrom('"alert(1)"', "'alert(1)'", 'alert(1)'),
  fc.string({ minLength: 0, maxLength: 20 })
).map(([tag, handler, value, content]) =>
  `<${tag} ${handler}=${value}>${content}</${tag}>`
);

// Arbitrary: generates HTML with javascript: URLs
const htmlWithJavascriptUrlArb = fc.oneof(
  fc.tuple(
    fc.constantFrom('href', 'src'),
    fc.constantFrom('javascript:', 'JavaScript:', 'JAVASCRIPT:', 'jAvAsCrIpT:'),
    fc.string({ minLength: 0, maxLength: 20 })
  ).map(([attr, proto, code]) =>
    `<a ${attr}="${proto}${code}">link</a>`
  ),
  fc.tuple(
    fc.constantFrom('href', 'src'),
    fc.constantFrom('javascript:', 'JavaScript:'),
    fc.string({ minLength: 0, maxLength: 20 })
  ).map(([attr, proto, code]) =>
    `<img ${attr}="${proto}${code}">`
  )
);

// Arbitrary: generates mixed dangerous HTML combining multiple attack vectors
const dangerousHtmlArb = fc.oneof(
  htmlWithScriptArb,
  htmlWithEventHandlerArb,
  htmlWithJavascriptUrlArb,
  // Combined: multiple dangerous elements
  fc.tuple(htmlWithScriptArb, htmlWithEventHandlerArb).map(([a, b]) => a + b),
  fc.tuple(htmlWithEventHandlerArb, htmlWithJavascriptUrlArb).map(([a, b]) => a + b),
  // Completely random strings (may or may not contain dangerous patterns)
  fc.string({ minLength: 0, maxLength: 200 })
);

// Arbitrary: generates safe HTML that should pass through unchanged
// Safe HTML = no script tags, no on* handlers, no javascript: URLs
const safeTagArb = fc.constantFrom(
  'div', 'p', 'span', 'strong', 'em', 'a', 'table', 'tr', 'td',
  'th', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'br', 'hr', 'img'
);

const safeAttrArb = fc.constantFrom(
  'class="container"',
  'style="color: red;"',
  'id="main"',
  'href="https://example.com"',
  'src="https://example.com/img.jpg"',
  'alt="image"',
  'width="100"',
  'height="50"',
  'border="0"',
  'cellpadding="5"'
);

const safeContentArb = fc.string({
  unit: fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-:;'.split('')
  ),
  minLength: 0,
  maxLength: 40,
});

const safeHtmlElementArb = fc.tuple(safeTagArb, safeAttrArb, safeContentArb)
  .map(([tag, attr, content]) => {
    const selfClosing = ['br', 'hr', 'img'];
    if (selfClosing.includes(tag)) {
      return `<${tag} ${attr}>`;
    }
    return `<${tag} ${attr}>${content}</${tag}>`;
  });

const safeHtmlArb = fc.array(safeHtmlElementArb, { minLength: 1, maxLength: 5 })
  .map(elements => elements.join(''));

// ---------------------------------------------------------------------------
// Property 4: Sanitization Safety
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 6.1, 6.2, 6.3**
 *
 * For any HTML string, after sanitizeHtml(), output contains no <script> tags,
 * no on* event handlers, no javascript: URLs.
 */
describe('Property 4: Sanitization Safety', () => {
  it('output should never contain <script> tags after sanitization', () => {
    fc.assert(
      fc.property(dangerousHtmlArb, (html) => {
        const result = sanitizeHtml(html);
        // No <script or </script tags (case-insensitive)
        expect(result.toLowerCase()).not.toMatch(/<script[\s>]/);
        expect(result.toLowerCase()).not.toMatch(/<\/script>/);
      }),
      { numRuns: 200 }
    );
  });

  it('output should never contain on* event handler attributes after sanitization', () => {
    fc.assert(
      fc.property(dangerousHtmlArb, (html) => {
        const result = sanitizeHtml(html);
        // No on* event handlers as attributes (e.g., onclick=, onload=, onerror=)
        expect(result).not.toMatch(/\son\w+\s*=/i);
      }),
      { numRuns: 200 }
    );
  });

  it('output should never contain javascript: protocol URLs after sanitization', () => {
    fc.assert(
      fc.property(dangerousHtmlArb, (html) => {
        const result = sanitizeHtml(html);
        // No javascript: in href or src attributes
        expect(result).not.toMatch(/(?:href|src)\s*=\s*["']?\s*javascript:/i);
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Sanitization Idempotency
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirement 6.5**
 *
 * For any HTML string, sanitizeHtml(sanitizeHtml(x)) produces identical
 * output to sanitizeHtml(x).
 */
describe('Property 5: Sanitization Idempotency', () => {
  it('applying sanitizeHtml twice should produce the same result as once', () => {
    fc.assert(
      fc.property(dangerousHtmlArb, (html) => {
        const once = sanitizeHtml(html);
        const twice = sanitizeHtml(once);
        expect(twice).toBe(once);
      }),
      { numRuns: 200 }
    );
  });

  it('idempotency holds for safe HTML as well', () => {
    fc.assert(
      fc.property(safeHtmlArb, (html) => {
        const once = sanitizeHtml(html);
        const twice = sanitizeHtml(once);
        expect(twice).toBe(once);
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Safe HTML Preservation
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirement 6.4**
 *
 * For any HTML string with no script tags, no on* handlers, and no
 * javascript: URLs, sanitizeHtml() returns input unchanged.
 */
describe('Property 6: Safe HTML Preservation', () => {
  it('safe HTML should pass through sanitizeHtml unchanged', () => {
    fc.assert(
      fc.property(safeHtmlArb, (html) => {
        const result = sanitizeHtml(html);
        expect(result).toBe(html);
      }),
      { numRuns: 200 }
    );
  });

  it('plain text without any HTML should pass through unchanged', () => {
    fc.assert(
      fc.property(safeContentArb, (text) => {
        const result = sanitizeHtml(text);
        expect(result).toBe(text);
      }),
      { numRuns: 200 }
    );
  });
});
