const fc = require('fast-check');
const EmailTemplate = require('../../models/emailTemplate.model');

// Mock nodemailer to avoid SMTP connections
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn() })
}));

// Mock the EmailTemplate model
jest.mock('../../models/emailTemplate.model');

const emailService = require('../../services/email.service');

/**
 * Property-Based Tests for Template Resolution Filtering
 *
 * Tests Property 7 from the design document.
 *
 * **Validates: Requirements 3.4, 8.3**
 */

// ---------------------------------------------------------------------------
// Arbitraries / Generators
// ---------------------------------------------------------------------------

// Arbitrary: generates valid template slugs matching [a-z0-9_]+
const slugArb = fc.string({
  unit: fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyz0123456789_'.split('')
  ),
  minLength: 1,
  maxLength: 20
});

// Arbitrary: generates a valid category
const categoryArb = fc.constantFrom(
  'booking', 'payment', 'account', 'support', 'marketing', 'system'
);

// Arbitrary: generates an EmailTemplate-like document with explicit isActive/isDeleted states
const templateDocArb = fc.record({
  _id: fc.string({
    unit: fc.constantFrom(...'0123456789abcdef'.split('')),
    minLength: 24,
    maxLength: 24
  }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  slug: slugArb,
  category: categoryArb,
  subject: fc.string({ minLength: 1, maxLength: 100 }),
  htmlContent: fc.string({ minLength: 1, maxLength: 200 }),
  isActive: fc.boolean(),
  isDeleted: fc.boolean(),
  isDefault: fc.boolean(),
  version: fc.nat({ max: 100 }),
  metadata: fc.record({
    sendCount: fc.nat({ max: 10000 }),
    lastSentAt: fc.constant(null)
  })
});

// ---------------------------------------------------------------------------
// Property 7: Template Resolution Filtering
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 3.4, 8.3**
 *
 * For any set of EmailTemplate documents with varying isActive/isDeleted states,
 * resolveTemplate() only returns templates where isActive is true and isDeleted is false.
 */
describe('Property 7: Template Resolution Filtering', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('resolveTemplate() only returns DB templates that are active and not deleted', async () => {
    await fc.assert(
      fc.asyncProperty(templateDocArb, async (templateDoc) => {
        // Simulate the DB: if the template is active and not deleted, findOne returns it;
        // otherwise findOne returns null (as the query filters would exclude it).
        const isEligible = templateDoc.isActive === true && templateDoc.isDeleted === false;

        EmailTemplate.findOne.mockResolvedValue(isEligible ? templateDoc : null);

        const result = await emailService.resolveTemplate(templateDoc.slug);

        if (isEligible) {
          // DB returned the template — result should have the template and isDefault: false
          expect(result.template).toBe(templateDoc);
          expect(result.isDefault).toBe(false);
        } else {
          // DB filtered it out — result should NOT contain the original templateDoc
          // It may fall back to a hardcoded default or return null
          if (result.template !== null) {
            // If a fallback was returned, it must be a default (isDefault: true)
            expect(result.isDefault).toBe(true);
            // And it must NOT be the ineligible DB document
            expect(result.template).not.toBe(templateDoc);
          } else {
            // No template found at all
            expect(result.isDefault).toBe(false);
          }
        }
      }),
      { numRuns: 200 }
    );
  });

  it('resolveTemplate() always queries with isActive: true and isDeleted: false filters', async () => {
    await fc.assert(
      fc.asyncProperty(slugArb, async (slug) => {
        EmailTemplate.findOne.mockResolvedValue(null);

        await emailService.resolveTemplate(slug);

        // Verify the query always includes the correct filter criteria
        expect(EmailTemplate.findOne).toHaveBeenCalledWith({
          slug: slug,
          isActive: true,
          isDeleted: false
        });
      }),
      { numRuns: 200 }
    );
  });

  it('inactive templates (isActive: false) are never returned from DB resolution', async () => {
    await fc.assert(
      fc.asyncProperty(
        templateDocArb.filter(t => t.isActive === false),
        async (inactiveTemplate) => {
          // An inactive template would be filtered out by the DB query
          EmailTemplate.findOne.mockResolvedValue(null);

          const result = await emailService.resolveTemplate(inactiveTemplate.slug);

          // The result should never be the inactive template itself
          expect(result.template).not.toBe(inactiveTemplate);
          // If something is returned, it must be a default fallback
          if (result.template !== null) {
            expect(result.isDefault).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('soft-deleted templates (isDeleted: true) are never returned from DB resolution', async () => {
    await fc.assert(
      fc.asyncProperty(
        templateDocArb.filter(t => t.isDeleted === true),
        async (deletedTemplate) => {
          // A deleted template would be filtered out by the DB query
          EmailTemplate.findOne.mockResolvedValue(null);

          const result = await emailService.resolveTemplate(deletedTemplate.slug);

          // The result should never be the deleted template itself
          expect(result.template).not.toBe(deletedTemplate);
          // If something is returned, it must be a default fallback
          if (result.template !== null) {
            expect(result.isDefault).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('only templates with isActive: true AND isDeleted: false pass the filter', async () => {
    await fc.assert(
      fc.asyncProperty(
        slugArb,
        fc.constantFrom(
          { isActive: true, isDeleted: false },   // eligible
          { isActive: true, isDeleted: true },     // not eligible
          { isActive: false, isDeleted: false },   // not eligible
          { isActive: false, isDeleted: true }     // not eligible
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (slug, flags, htmlContent) => {
          const templateDoc = {
            _id: 'test123',
            slug,
            htmlContent,
            ...flags
          };

          const isEligible = flags.isActive === true && flags.isDeleted === false;
          EmailTemplate.findOne.mockResolvedValue(isEligible ? templateDoc : null);

          const result = await emailService.resolveTemplate(slug);

          if (isEligible) {
            expect(result.template).toBe(templateDoc);
            expect(result.isDefault).toBe(false);
          } else {
            // Must not return the ineligible template from DB
            expect(result.template).not.toBe(templateDoc);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
