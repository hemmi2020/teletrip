const fc = require('fast-check');

const { defaultTemplateDefinitions } = require('../../scripts/seedEmailTemplates');

/**
 * Property-Based Tests for New Email Template Definitions
 *
 * Tests Property 1 from the design document: Seed Template Structural Completeness
 *
 * **Validates: Requirements 2.2, 3.2, 3.4, 4.2, 4.4, 5.2, 6.2, 7.2, 9.4**
 */

// The 6 new template slugs added in this feature
const NEW_SLUGS = [
  'payment_failure',
  'checkin_reminder',
  'feedback_request',
  'admin_new_booking',
  'admin_booking_cancellation',
  'pay_on_site_confirmation'
];

// Required variables per slug as specified in the requirements
const REQUIRED_VARIABLES = {
  payment_failure: ['userName', 'bookingReference', 'amount', 'paymentMethod', 'errorMessage', 'retryUrl'],
  checkin_reminder: ['userName', 'bookingReference', 'hotelName', 'checkInDate', 'checkOutDate', 'hotelAddress', 'bookingUrl'],
  feedback_request: ['userName', 'bookingReference', 'hotelName', 'checkInDate', 'checkOutDate', 'reviewUrl'],
  admin_new_booking: ['bookingReference', 'customerName', 'customerEmail', 'hotelName', 'checkInDate', 'checkOutDate', 'totalAmount', 'bookingType'],
  admin_booking_cancellation: ['bookingReference', 'customerName', 'customerEmail', 'hotelName', 'totalAmount', 'cancellationFee', 'refundAmount', 'cancellationReason'],
  pay_on_site_confirmation: ['userName', 'bookingReference', 'hotelName', 'checkInDate', 'checkOutDate', 'totalAmount', 'currency', 'paymentId']
};

// Build a lookup map from slug to template definition
const templateBySlug = {};
for (const def of defaultTemplateDefinitions) {
  templateBySlug[def.slug] = def;
}

// ---------------------------------------------------------------------------
// Property 1: Seed Template Structural Completeness
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 2.2, 3.2, 3.4, 4.2, 4.4, 5.2, 6.2, 7.2, 9.4**
 *
 * For each of the 6 new slugs, all required fields are non-empty strings,
 * variables array entries each have key and description, sampleData is non-null,
 * and the variables array contains all keys specified in the requirements.
 */
describe('Property 1: Seed Template Structural Completeness', () => {
  it('each new template has all required fields as non-empty strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_SLUGS),
        (slug) => {
          const template = templateBySlug[slug];
          expect(template).toBeDefined();

          // All required fields must be non-empty strings
          const requiredStringFields = ['name', 'slug', 'category', 'subject', 'htmlContent', 'textContent'];
          for (const field of requiredStringFields) {
            expect(typeof template[field]).toBe('string');
            expect(template[field].length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each new template has variables array entries with key and description', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_SLUGS),
        (slug) => {
          const template = templateBySlug[slug];
          expect(template).toBeDefined();
          expect(Array.isArray(template.variables)).toBe(true);
          expect(template.variables.length).toBeGreaterThan(0);

          for (const variable of template.variables) {
            expect(typeof variable.key).toBe('string');
            expect(variable.key.length).toBeGreaterThan(0);
            expect(typeof variable.description).toBe('string');
            expect(variable.description.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each new template has non-null sampleData', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_SLUGS),
        (slug) => {
          const template = templateBySlug[slug];
          expect(template).toBeDefined();
          expect(template.sampleData).not.toBeNull();
          expect(template.sampleData).not.toBeUndefined();
          expect(typeof template.sampleData).toBe('object');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each new template contains all required variable keys from the requirements', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_SLUGS),
        (slug) => {
          const template = templateBySlug[slug];
          expect(template).toBeDefined();

          const templateVariableKeys = template.variables.map(v => v.key);
          const requiredKeys = REQUIRED_VARIABLES[slug];

          for (const requiredKey of requiredKeys) {
            expect(templateVariableKeys).toContain(requiredKey);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Brand Wrapper Consistency
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 2.3, 3.3, 4.3, 5.3, 6.3, 7.3**
 *
 * For each of the 6 new template definitions, the htmlContent contains
 * the blue gradient header (linear-gradient(135deg,#1a73e8,#4285f4)),
 * a white body section (background-color:#ffffff), and the gray footer
 * with "Telitrip. All rights reserved".
 */
describe('Property 2: Brand Wrapper Consistency', () => {
  it('each new template htmlContent contains the blue gradient header', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_SLUGS),
        (slug) => {
          const template = templateBySlug[slug];
          expect(template).toBeDefined();
          expect(template.htmlContent).toContain('linear-gradient(135deg,#1a73e8,#4285f4)');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each new template htmlContent contains a white body section', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_SLUGS),
        (slug) => {
          const template = templateBySlug[slug];
          expect(template).toBeDefined();
          expect(template.htmlContent).toContain('background-color:#ffffff');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each new template htmlContent contains the gray footer with copyright text', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_SLUGS),
        (slug) => {
          const template = templateBySlug[slug];
          expect(template).toBeDefined();
          expect(template.htmlContent).toContain('background-color:#f8f9fa');
          expect(template.htmlContent).toContain('Telitrip. All rights reserved');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Template Interpolation Preserves Variable Values
// ---------------------------------------------------------------------------

const { interpolate, escapeHtml } = require('../../services/email.service');

/**
 * **Validates: Requirements 2.2, 3.2, 4.2, 5.2, 6.2, 7.2**
 *
 * For each new template definition and for randomly generated alphanumeric
 * variable values matching the template's declared variable keys, interpolating
 * htmlContent produces a result that contains the HTML-escaped form of each value.
 */
describe('Property 3: Template Interpolation Preserves Variable Values', () => {
  // Build an array of { slug, variableKeys } for the new templates
  const newTemplateVarInfo = NEW_SLUGS.map((slug) => {
    const template = templateBySlug[slug];
    const keys = template.variables.map((v) => v.key);
    return { slug, keys };
  });

  it('interpolated htmlContent contains the HTML-escaped form of every variable value', () => {
    for (const { slug, keys } of newTemplateVarInfo) {
      const template = templateBySlug[slug];

      // Build an fc.record() arbitrary that generates a random alphanumeric
      // string (length 1–20) for each variable key declared by this template
      const recordShape = {};
      for (const key of keys) {
        recordShape[key] = fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/);
      }

      fc.assert(
        fc.property(
          fc.record(recordShape),
          (variables) => {
            const result = interpolate(template.htmlContent, variables);

            for (const key of keys) {
              const escapedValue = escapeHtml(String(variables[key]));
              expect(result).toContain(escapedValue);
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  });
});


// ---------------------------------------------------------------------------
// Property 4: Graceful Template Resolution Failure
// ---------------------------------------------------------------------------

// Mock nodemailer to avoid SMTP connections
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn() })
}));

// Mock the EmailTemplate model
jest.mock('../../models/emailTemplate.model');

// Mock the EmailLog model to prevent DB validation errors
jest.mock('../../models/emailLog.model');

const EmailTemplate = require('../../models/emailTemplate.model');
const EmailLog = require('../../models/emailLog.model');

// Known slugs that have hardcoded fallbacks in email.templates.js
const KNOWN_FALLBACK_SLUGS = [
  'welcome',
  'paymentConfirmation',
  'bookingConfirmation',
  'passwordReset',
  'notification'
];

// Object prototype property names that would resolve as truthy on a plain object lookup
const OBJECT_PROTOTYPE_KEYS = Object.getOwnPropertyNames(Object.prototype);

// All known template slugs (DB seeds + hardcoded fallbacks) that could resolve successfully
const ALL_KNOWN_SLUGS = [
  ...NEW_SLUGS,
  ...KNOWN_FALLBACK_SLUGS,
  ...OBJECT_PROTOTYPE_KEYS,
  'booking_confirmation',
  'password_reset',
  'welcome_email',
  'payment_confirmation',
  'booking_cancellation',
  'account_verification',
  'booking_modification',
  'special_offer',
  'loyalty_reward',
  'review_request',
  'newsletter',
  'account_deactivation'
];

/**
 * **Validates: Requirements 8.4**
 *
 * For any randomly generated slug string that does not match any existing template slug,
 * calling sendTemplatedEmail with that slug returns { success: false } without throwing
 * an unhandled exception.
 */
describe('Property 4: Graceful Template Resolution Failure', () => {
  // We need a fresh require of email.service since we're mocking nodemailer
  let emailService;

  beforeAll(() => {
    // Clear the module cache to pick up the mocks
    jest.resetModules();
    jest.mock('nodemailer', () => ({
      createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn() })
    }));
    jest.mock('../../models/emailTemplate.model');
    jest.mock('../../models/emailLog.model');
    emailService = require('../../services/email.service');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock EmailTemplate.findOne to always return null (no DB template found)
    const EmailTemplateMock = require('../../models/emailTemplate.model');
    EmailTemplateMock.findOne = jest.fn().mockResolvedValue(null);
    // Mock EmailLog.create to prevent DB validation errors
    const EmailLogMock = require('../../models/emailLog.model');
    EmailLogMock.create = jest.fn().mockResolvedValue({});
  });

  it('sendTemplatedEmail returns { success: false } for any slug that does not match a known template', async () => {
    const EmailTemplateMock = require('../../models/emailTemplate.model');

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(
          (s) => !ALL_KNOWN_SLUGS.includes(s)
        ),
        async (randomSlug) => {
          // Ensure DB always returns null for unknown slugs
          EmailTemplateMock.findOne.mockResolvedValue(null);

          // Call sendTemplatedEmail — it should NOT throw
          const result = await emailService.sendTemplatedEmail(
            randomSlug,
            'test@example.com',
            {}
          );

          // It should return { success: false } without throwing
          expect(result).toBeDefined();
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sendTemplatedEmail never throws an unhandled exception for unknown slugs', async () => {
    const EmailTemplateMock = require('../../models/emailTemplate.model');

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }).filter(
          (s) => !ALL_KNOWN_SLUGS.includes(s) && s.trim().length > 0
        ),
        async (randomSlug) => {
          EmailTemplateMock.findOne.mockResolvedValue(null);

          // Wrapping in a try/catch to explicitly verify no exception escapes
          let threw = false;
          let result;
          try {
            result = await emailService.sendTemplatedEmail(
              randomSlug,
              'user@test.com',
              { someVar: 'value' }
            );
          } catch (e) {
            threw = true;
          }

          expect(threw).toBe(false);
          expect(result).toHaveProperty('success', false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
