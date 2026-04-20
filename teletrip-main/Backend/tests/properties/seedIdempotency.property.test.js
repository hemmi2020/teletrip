const fc = require('fast-check');
const EmailTemplate = require('../../models/emailTemplate.model');

// Mock the EmailTemplate model
jest.mock('../../models/emailTemplate.model');

const { seedEmailTemplates, defaultTemplateDefinitions } = require('../../scripts/seedEmailTemplates');

/**
 * Property-Based Tests for Seed Idempotency
 *
 * Tests Property 8 from the design document.
 *
 * **Validates: Requirements 7.2, 7.5**
 */

// The 12 expected slugs from the default template catalog
const EXPECTED_SLUGS = [
  'welcome',
  'password_reset',
  'password_changed',
  'account_suspended',
  'account_reactivated',
  'booking_confirmation',
  'booking_cancellation',
  'booking_status_update',
  'payment_confirmation',
  'payment_refund',
  'support_ticket_created',
  'support_ticket_response'
];

// ---------------------------------------------------------------------------
// Property 8: Seed Idempotency
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 7.2, 7.5**
 *
 * For any number of consecutive seed executions, the database contains exactly
 * 12 templates matched by slug with no duplicates.
 */
describe('Property 8: Seed Idempotency', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('for any number of consecutive seed runs, total created + skipped always equals 12', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (numRuns) => {
          // Simulate in-memory DB state: track which slugs have been inserted
          const insertedSlugs = new Set();

          EmailTemplate.updateOne.mockImplementation((filter, update, options) => {
            const slug = filter.slug;
            if (insertedSlugs.has(slug)) {
              // Already exists — skip (no upsert)
              return Promise.resolve({ upsertedCount: 0, matchedCount: 1, modifiedCount: 0 });
            } else {
              // First time — create via upsert
              insertedSlugs.add(slug);
              return Promise.resolve({ upsertedCount: 1, matchedCount: 0, modifiedCount: 0 });
            }
          });

          for (let i = 0; i < numRuns; i++) {
            const result = await seedEmailTemplates();
            // Every single run must account for exactly 12 templates
            expect(result.created + result.skipped).toBe(12);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('each slug appears exactly once across all template definitions (no duplicates)', () => {
    fc.assert(
      fc.property(
        fc.constant(defaultTemplateDefinitions),
        (definitions) => {
          const slugs = definitions.map(d => d.slug);
          const uniqueSlugs = new Set(slugs);
          // No duplicate slugs in the definitions
          expect(uniqueSlugs.size).toBe(slugs.length);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('all 12 expected slugs are present in the definitions', () => {
    fc.assert(
      fc.property(
        fc.constant(defaultTemplateDefinitions),
        (definitions) => {
          const slugs = definitions.map(d => d.slug);
          for (const expected of EXPECTED_SLUGS) {
            expect(slugs).toContain(expected);
          }
          expect(slugs.length).toBe(12);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('after N consecutive seed runs, the database contains exactly 12 unique slugs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (numRuns) => {
          const insertedSlugs = new Set();

          EmailTemplate.updateOne.mockImplementation((filter, update, options) => {
            const slug = filter.slug;
            if (insertedSlugs.has(slug)) {
              return Promise.resolve({ upsertedCount: 0, matchedCount: 1, modifiedCount: 0 });
            } else {
              insertedSlugs.add(slug);
              return Promise.resolve({ upsertedCount: 1, matchedCount: 0, modifiedCount: 0 });
            }
          });

          for (let i = 0; i < numRuns; i++) {
            await seedEmailTemplates();
          }

          // After any number of runs, exactly 12 unique slugs exist
          expect(insertedSlugs.size).toBe(12);
          // And they match the expected set
          for (const expected of EXPECTED_SLUGS) {
            expect(insertedSlugs.has(expected)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('first seed run creates all 12, subsequent runs skip all 12', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 10 }),
        async (numRuns) => {
          const insertedSlugs = new Set();

          EmailTemplate.updateOne.mockImplementation((filter, update, options) => {
            const slug = filter.slug;
            if (insertedSlugs.has(slug)) {
              return Promise.resolve({ upsertedCount: 0, matchedCount: 1, modifiedCount: 0 });
            } else {
              insertedSlugs.add(slug);
              return Promise.resolve({ upsertedCount: 1, matchedCount: 0, modifiedCount: 0 });
            }
          });

          // First run: all 12 should be created
          const firstResult = await seedEmailTemplates();
          expect(firstResult.created).toBe(12);
          expect(firstResult.skipped).toBe(0);

          // All subsequent runs: all 12 should be skipped
          for (let i = 1; i < numRuns; i++) {
            const result = await seedEmailTemplates();
            expect(result.created).toBe(0);
            expect(result.skipped).toBe(12);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
