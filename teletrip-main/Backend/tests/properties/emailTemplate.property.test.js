const fc = require('fast-check');
const EmailTemplate = require('../../models/emailTemplate.model');

/**
 * Property 9: EmailTemplate Input Validation
 *
 * Verify slug accepts only [a-z0-9_]+, category accepts only the six valid
 * enum values, variable keys accept only [a-zA-Z][a-zA-Z0-9_]*
 *
 * **Validates: Requirements 1.2, 1.3, 1.4**
 */

// Helper: build a valid base template document for testing
function buildValidTemplate(overrides = {}) {
  return {
    name: 'Test Template',
    slug: 'test_template',
    category: 'booking',
    subject: 'Test Subject',
    htmlContent: '<p>Hello</p>',
    ...overrides,
  };
}

// Character arbitraries
const slugChars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
const letterChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const varBodyChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';

// Arbitrary: generates strings that match [a-z0-9_]+
const validSlugArb = fc
  .string({ unit: fc.constantFrom(...slugChars.split('')), minLength: 1, maxLength: 30 });

// Arbitrary: generates strings that do NOT match ^[a-z0-9_]+$
// Strategy: include at least one character outside [a-z0-9_]
const invalidSlugCharArb = fc.constantFrom(
  ...'!@#$%^&*()-+=[]{}|;:,.<>?/~` '.split('')
);

const invalidSlugArb = fc
  .tuple(
    fc.string({ unit: fc.constantFrom(...slugChars.split('')), minLength: 0, maxLength: 10 }),
    invalidSlugCharArb,
    fc.string({ unit: fc.constantFrom(...slugChars.split('')), minLength: 0, maxLength: 10 })
  )
  .map(([prefix, bad, suffix]) => prefix + bad + suffix)
  .filter((s) => s.length > 0);

// The six valid category values
const VALID_CATEGORIES = ['booking', 'payment', 'account', 'support', 'marketing', 'system'];

const validCategoryArb = fc.constantFrom(...VALID_CATEGORIES);

// Arbitrary: generates category strings that are NOT in the valid set
const invalidCategoryArb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => !VALID_CATEGORIES.includes(s));

// Arbitrary: generates variable keys matching [a-zA-Z][a-zA-Z0-9_]*
const validVarKeyArb = fc
  .tuple(
    fc.constantFrom(...letterChars.split('')),
    fc.string({ unit: fc.constantFrom(...varBodyChars.split('')), minLength: 0, maxLength: 20 })
  )
  .map(([first, rest]) => first + rest);

// Arbitrary: generates variable keys that do NOT match ^[a-zA-Z][a-zA-Z0-9_]*$
// Strategy 1: starts with a digit or special char
const invalidVarKeyStartArb = fc
  .tuple(
    fc.constantFrom(...'0123456789_!@#$%^&*'.split('')),
    fc.string({ unit: fc.constantFrom(...varBodyChars.split('')), minLength: 0, maxLength: 10 })
  )
  .map(([first, rest]) => first + rest)
  .filter((s) => s.length > 0);

// Strategy 2: starts with a letter but contains invalid chars in the rest
const invalidVarKeyBodyArb = fc
  .tuple(
    fc.constantFrom(...letterChars.split('')),
    fc.string({ unit: fc.constantFrom(...varBodyChars.split('')), minLength: 0, maxLength: 5 }),
    fc.constantFrom(...'!@#$%^&*()-+=[] '.split('')),
    fc.string({ unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), minLength: 0, maxLength: 5 })
  )
  .map(([first, mid, bad, tail]) => first + mid + bad + tail);

const invalidVarKeyArb = fc.oneof(invalidVarKeyStartArb, invalidVarKeyBodyArb);

describe('Property 9: EmailTemplate Input Validation', () => {

  // --- Slug validation ---

  it('should accept any slug matching [a-z0-9_]+', async () => {
    await fc.assert(
      fc.asyncProperty(validSlugArb, async (slug) => {
        const doc = new EmailTemplate(buildValidTemplate({ slug }));
        const err = doc.validateSync();
        // Slug field should not have a validation error
        const slugError = err && err.errors && err.errors.slug;
        expect(slugError).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject slugs containing characters outside [a-z0-9_]', async () => {
    await fc.assert(
      fc.asyncProperty(invalidSlugArb, async (slug) => {
        const doc = new EmailTemplate(buildValidTemplate({ slug }));
        const err = doc.validateSync();
        // Mongoose applies lowercase and trim transforms before validation,
        // so we need to check if the transformed version still fails the regex
        const transformed = slug.toLowerCase().trim();
        if (/^[a-z0-9_]+$/.test(transformed)) {
          // After lowercase + trim transforms, the slug becomes valid — this is
          // expected behavior (e.g., 'Test' → 'test', 'a ' → 'a'). Skip this case.
          return;
        }
        expect(err).toBeDefined();
        expect(err.errors.slug).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject empty slug', async () => {
    const doc = new EmailTemplate(buildValidTemplate({ slug: '' }));
    const err = doc.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.slug).toBeDefined();
  });

  // --- Category validation ---

  it('should accept all six valid category enum values', async () => {
    await fc.assert(
      fc.asyncProperty(validCategoryArb, async (category) => {
        const doc = new EmailTemplate(buildValidTemplate({ category }));
        const err = doc.validateSync();
        const catError = err && err.errors && err.errors.category;
        expect(catError).toBeUndefined();
      }),
      { numRuns: 50 }
    );
  });

  it('should reject category values not in the valid enum set', async () => {
    await fc.assert(
      fc.asyncProperty(invalidCategoryArb, async (category) => {
        const doc = new EmailTemplate(buildValidTemplate({ category }));
        const err = doc.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.category).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  // --- Variable key validation ---

  it('should accept variable keys matching [a-zA-Z][a-zA-Z0-9_]*', async () => {
    await fc.assert(
      fc.asyncProperty(validVarKeyArb, async (key) => {
        const doc = new EmailTemplate(buildValidTemplate({
          variables: [{ key, description: 'test var' }],
        }));
        const err = doc.validateSync();
        const varKeyPath = 'variables.0.key';
        const keyError = err && err.errors && err.errors[varKeyPath];
        expect(keyError).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject variable keys not matching [a-zA-Z][a-zA-Z0-9_]*', async () => {
    await fc.assert(
      fc.asyncProperty(invalidVarKeyArb, async (key) => {
        const doc = new EmailTemplate(buildValidTemplate({
          variables: [{ key, description: 'test var' }],
        }));
        const err = doc.validateSync();
        const varKeyPath = 'variables.0.key';
        expect(err).toBeDefined();
        expect(err.errors[varKeyPath]).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});
