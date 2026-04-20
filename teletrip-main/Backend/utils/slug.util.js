/**
 * Slug Utility Module
 * Generates URL-safe slugs from destination name and country.
 */

/**
 * Generates a URL-safe slug from a destination name and country.
 *
 * Rules:
 * 1. Concatenate name and country with a hyphen separator
 * 2. Convert to lowercase
 * 3. Replace accented characters with ASCII equivalents
 * 4. Replace non-alphanumeric characters (except hyphens) with hyphens
 * 5. Collapse consecutive hyphens into a single hyphen
 * 6. Trim leading/trailing hyphens
 *
 * @param {string} name - The destination name
 * @param {string} country - The destination country
 * @returns {string} A lowercase, hyphen-separated, URL-safe string
 *
 * @example
 * generateSlug("São Paulo", "Brazil") // => "sao-paulo-brazil"
 * generateSlug("Paris", "France")     // => "paris-france"
 */
function generateSlug(name, country) {
  // Handle empty/falsy inputs
  const safeName = (name || '').toString();
  const safeCountry = (country || '').toString();

  // Step 1: Concatenate name and country with a hyphen separator
  const combined = `${safeName}-${safeCountry}`;

  // Step 2: Convert to lowercase
  const lowered = combined.toLowerCase();

  // Step 3: Replace accented characters with ASCII equivalents
  // Uses Unicode normalization (NFD) to decompose characters,
  // then removes combining diacritical marks
  const deaccented = lowered.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Step 4: Replace non-alphanumeric characters (except hyphens) with hyphens
  const hyphenated = deaccented.replace(/[^a-z0-9-]/g, '-');

  // Step 5: Collapse consecutive hyphens into a single hyphen
  const collapsed = hyphenated.replace(/-{2,}/g, '-');

  // Step 6: Trim leading/trailing hyphens
  const trimmed = collapsed.replace(/^-+|-+$/g, '');

  return trimmed;
}

module.exports = { generateSlug };
