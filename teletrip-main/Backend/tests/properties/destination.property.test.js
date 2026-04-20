const fc = require('fast-check');
const { generateSlug } = require('../../utils/slug.util');

// ---------------------------------------------------------------------------
// Shared Arbitraries / Generators
// ---------------------------------------------------------------------------

// Arbitrary: generates a unicode-rich string that may include accented chars,
// special characters, whitespace, and emoji-like sequences.
const unicodeStringArb = fc.string({ minLength: 0, maxLength: 50 });

// Arbitrary: generates strings with accented / diacritical characters
const accentedStringArb = fc.string({
  unit: fc.constantFrom(
    ...'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿšžœ'.split(''),
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    ' ', '-', '_', '.', ',', '!', '@', '#'
  ),
  minLength: 1,
  maxLength: 30,
});

// Arbitrary: generates strings with special characters and whitespace
const specialCharsStringArb = fc.string({
  unit: fc.constantFrom(
    ...'!@#$%^&*()_+=[]{}|;:\'",.<>?/\\`~ \t\n\r'.split(''),
    ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
  ),
  minLength: 0,
  maxLength: 30,
});

// Regex that matches a valid slug: only lowercase a-z, 0-9, and hyphens,
// no leading/trailing hyphens, no consecutive hyphens.
// Empty string is also valid (when both inputs produce no alphanumeric content).
const VALID_SLUG_REGEX = /^$|^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Property 1: Slug Generation URL-Safety
// Feature: homepage-enhancements, Property 1: Slug Generation URL-Safety
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 1.2**
 *
 * For any destination name and country string (including unicode, special
 * characters, and whitespace), the generated slug SHALL contain only lowercase
 * letters (a-z), digits (0-9), and hyphens (-), and SHALL NOT start or end
 * with a hyphen or contain consecutive hyphens.
 */
describe('Feature: homepage-enhancements, Property 1: Slug Generation URL-Safety', () => {
  it('slug contains only lowercase letters, digits, and hyphens with no leading/trailing/consecutive hyphens (arbitrary unicode strings)', () => {
    fc.assert(
      fc.property(
        unicodeStringArb,
        unicodeStringArb,
        (name, country) => {
          const slug = generateSlug(name, country);

          // Slug must only contain a-z, 0-9, and hyphens
          expect(slug).toMatch(VALID_SLUG_REGEX);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('slug contains only lowercase letters, digits, and hyphens with no leading/trailing/consecutive hyphens (accented strings)', () => {
    fc.assert(
      fc.property(
        accentedStringArb,
        accentedStringArb,
        (name, country) => {
          const slug = generateSlug(name, country);

          expect(slug).toMatch(VALID_SLUG_REGEX);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('slug contains only lowercase letters, digits, and hyphens with no leading/trailing/consecutive hyphens (special characters)', () => {
    fc.assert(
      fc.property(
        specialCharsStringArb,
        specialCharsStringArb,
        (name, country) => {
          const slug = generateSlug(name, country);

          expect(slug).toMatch(VALID_SLUG_REGEX);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('slug never contains uppercase letters', () => {
    fc.assert(
      fc.property(
        unicodeStringArb,
        unicodeStringArb,
        (name, country) => {
          const slug = generateSlug(name, country);

          expect(slug).toBe(slug.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('slug does not start or end with a hyphen', () => {
    fc.assert(
      fc.property(
        unicodeStringArb,
        unicodeStringArb,
        (name, country) => {
          const slug = generateSlug(name, country);

          if (slug.length > 0) {
            expect(slug[0]).not.toBe('-');
            expect(slug[slug.length - 1]).not.toBe('-');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('slug does not contain consecutive hyphens', () => {
    fc.assert(
      fc.property(
        unicodeStringArb,
        unicodeStringArb,
        (name, country) => {
          const slug = generateSlug(name, country);

          expect(slug).not.toMatch(/--/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Shared Arbitraries for Property 2
// ---------------------------------------------------------------------------

// Arbitrary: non-empty alphanumeric string (ensures slug is non-empty)
const nonEmptyNameArb = fc.string({
  unit: fc.constantFrom(
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    ...'àáâãäåæçèéêëìíîïñòóôõöùúûüý'.split(''),
    ' ', '-'
  ),
  minLength: 1,
  maxLength: 30,
}).filter(s => /[a-zA-Zàáâãäåæçèéêëìíîïñòóôõöùúûüý]/.test(s));

// Arbitrary: URL string (simulates image URLs)
const urlArb = fc.webUrl();

// Arbitrary: non-empty plain text string for descriptions
const textArb = fc.string({ minLength: 1, maxLength: 200 });

// Arbitrary: continent value
const continentArb = fc.constantFrom(
  'Africa', 'Asia', 'Europe', 'North America',
  'South America', 'Oceania', 'Antarctica'
);

// Arbitrary: generates a full valid destination data object
const destinationDataArb = fc.record({
  name: nonEmptyNameArb,
  country: nonEmptyNameArb,
  image: urlArb,
  tag: fc.string({ minLength: 0, maxLength: 20 }),
  description: textArb,
  heroImage: urlArb,
  gallery: fc.array(urlArb, { minLength: 0, maxLength: 5 }),
  longDescription: textArb,
  highlights: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
  seo: fc.record({
    metaTitle: fc.string({ minLength: 0, maxLength: 60 }),
    metaDescription: fc.string({ minLength: 0, maxLength: 160 }),
    ogImage: urlArb,
  }),
  isFeatured: fc.boolean(),
  continent: continentArb,
  isActive: fc.boolean(),
  order: fc.integer({ min: 0, max: 1000 }),
});

// ---------------------------------------------------------------------------
// Property 2: Destination Data Round-Trip
// Feature: homepage-enhancements, Property 2: Destination Data Round-Trip
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 1.1, 1.4**
 *
 * For any valid destination object with all fields populated (name, country,
 * image, heroImage, gallery, longDescription, highlights, seo metadata,
 * continent, isFeatured), creating it via the controller and retrieving by
 * slug SHALL return a document where all field values match the original input.
 *
 * This property is tested at the model/utility level:
 * 1. Generate random valid destination data
 * 2. Compute the slug via generateSlug
 * 3. Construct a Mongoose model instance with all fields + slug
 * 4. Verify all field values on the model instance match the original input
 * 5. Verify the slug is deterministic (same input always produces same slug)
 */
describe('Feature: homepage-enhancements, Property 2: Destination Data Round-Trip', () => {
  // We require the Destination model here. Mongoose model construction
  // validates the schema without needing a database connection.
  const Destination = require('../../models/destination.model');

  it('all fields survive Mongoose schema validation and match original input', () => {
    fc.assert(
      fc.property(
        destinationDataArb,
        (data) => {
          // Compute slug from name + country
          const slug = generateSlug(data.name, data.country);

          // Construct a Mongoose model instance (validates schema, no DB needed)
          const doc = new Destination({ ...data, slug });

          // Core fields
          expect(doc.name).toBe(data.name);
          expect(doc.country).toBe(data.country);
          expect(doc.image).toBe(data.image);
          expect(doc.tag).toBe(data.tag);
          expect(doc.description).toBe(data.description);
          expect(doc.isActive).toBe(data.isActive);
          expect(doc.order).toBe(data.order);

          // Rich content fields
          expect(doc.slug).toBe(slug);
          expect(doc.heroImage).toBe(data.heroImage);
          expect(doc.longDescription).toBe(data.longDescription);
          expect(doc.isFeatured).toBe(data.isFeatured);
          expect(doc.continent).toBe(data.continent);

          // Array fields
          expect(doc.gallery.map(String)).toEqual(data.gallery);
          expect(doc.highlights.map(String)).toEqual(data.highlights);

          // SEO nested object
          expect(doc.seo.metaTitle).toBe(data.seo.metaTitle);
          expect(doc.seo.metaDescription).toBe(data.seo.metaDescription);
          expect(doc.seo.ogImage).toBe(data.seo.ogImage);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('slug generation is deterministic — same name and country always produce the same slug', () => {
    fc.assert(
      fc.property(
        nonEmptyNameArb,
        nonEmptyNameArb,
        (name, country) => {
          const slug1 = generateSlug(name, country);
          const slug2 = generateSlug(name, country);

          expect(slug1).toBe(slug2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('model instance slug matches generateSlug output for the same name and country', () => {
    fc.assert(
      fc.property(
        destinationDataArb,
        (data) => {
          const expectedSlug = generateSlug(data.name, data.country);
          const doc = new Destination({
            ...data,
            slug: generateSlug(data.name, data.country),
          });

          // The slug stored on the document matches the utility output
          expect(doc.slug).toBe(expectedSlug);

          // And the slug is URL-safe
          expect(doc.slug).toMatch(VALID_SLUG_REGEX);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Mongoose schema validation passes for all generated destination data', () => {
    fc.assert(
      fc.property(
        destinationDataArb,
        (data) => {
          const slug = generateSlug(data.name, data.country);
          const doc = new Destination({ ...data, slug });

          // validateSync returns undefined when validation passes
          const validationError = doc.validateSync();
          expect(validationError).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
