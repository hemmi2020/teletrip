const fc = require('fast-check');
const { interpolate, escapeHtml } = require('../../services/email.service');

/**
 * Property-Based Tests for Template Interpolation Engine
 *
 * Tests Properties 1, 2, and 3 from the design document.
 */

// ---------------------------------------------------------------------------
// Arbitraries / Generators
// ---------------------------------------------------------------------------

// Arbitrary: generates valid template variable keys matching \w+ (alphanumeric + underscore)
const varKeyArb = fc.string({
  unit: fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('')
  ),
  minLength: 1,
  maxLength: 15
});

// Arbitrary: generates variable values (any printable string, may contain HTML special chars)
const varValueArb = fc.string({ minLength: 0, maxLength: 50 });

// Arbitrary: generates a variables object with 1-5 key-value pairs
const variablesArb = fc.array(
  fc.tuple(varKeyArb, varValueArb),
  { minLength: 1, maxLength: 5 }
).map(pairs => Object.fromEntries(pairs));

// Arbitrary: generates a template string that uses keys from a given variables object.
// Ensures every placeholder key exists in the variables so we can test completeness.
const templateWithMatchingVarsArb = variablesArb.chain(vars => {
  const keys = Object.keys(vars);
  if (keys.length === 0) {
    return fc.constant({ template: 'no placeholders', variables: vars });
  }
  // Build a template that intersperses text segments with {{key}} placeholders
  return fc.array(
    fc.tuple(
      fc.string({ minLength: 0, maxLength: 20 }).filter(s => !s.includes('{{')),
      fc.constantFrom(...keys)
    ),
    { minLength: 1, maxLength: 5 }
  ).map(segments => {
    const template = segments.map(([text, key]) => `${text}{{${key}}}`).join('');
    return { template, variables: vars };
  });
});

// Arbitrary: generates a template with placeholders that may or may not have matching vars
const templateWithMixedVarsArb = fc.tuple(
  fc.array(
    fc.tuple(
      fc.string({ minLength: 0, maxLength: 15 }).filter(s => !s.includes('{{')),
      varKeyArb
    ),
    { minLength: 1, maxLength: 5 }
  ),
  variablesArb
).map(([segments, vars]) => {
  const template = segments.map(([text, key]) => `${text}{{${key}}}`).join('');
  return { template, variables: vars };
});

// Arbitrary: generates variable values that specifically contain HTML special characters
const htmlSpecialChars = ['<', '>', '&', '"', "'"];
const htmlDangerousValueArb = fc.string({
  unit: fc.oneof(
    fc.constantFrom(...htmlSpecialChars),
    fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyz 0123456789'.split('')
    )
  ),
  minLength: 1,
  maxLength: 30
}).filter(s => htmlSpecialChars.some(c => s.includes(c)));

// Arbitrary: generates variables where every value contains at least one HTML special char
const htmlDangerousVariablesArb = fc.array(
  fc.tuple(varKeyArb, htmlDangerousValueArb),
  { minLength: 1, maxLength: 5 }
).map(pairs => Object.fromEntries(pairs));

// Arbitrary: template + variables where values contain HTML special chars
const templateWithHtmlVarsArb = htmlDangerousVariablesArb.chain(vars => {
  const keys = Object.keys(vars);
  if (keys.length === 0) {
    return fc.constant({ template: 'no placeholders', variables: vars });
  }
  return fc.array(
    fc.tuple(
      fc.string({ minLength: 0, maxLength: 15 }).filter(s => !s.includes('{{')),
      fc.constantFrom(...keys)
    ),
    { minLength: 1, maxLength: 5 }
  ).map(segments => {
    const template = segments.map(([text, key]) => `${text}{{${key}}}`).join('');
    return { template, variables: vars };
  });
});

// ---------------------------------------------------------------------------
// Property 1: Interpolation Completeness
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 4.1, 4.2**
 *
 * For any template string with {{key}} placeholders and any variables object,
 * after interpolation no {{...}} patterns remain.
 */
describe('Property 1: Interpolation Completeness', () => {
  it('no {{...}} patterns remain after interpolation when all keys have matching variables', () => {
    fc.assert(
      fc.property(templateWithMatchingVarsArb, ({ template, variables }) => {
        const result = interpolate(template, variables);
        expect(result).not.toMatch(/\{\{\w+\}\}/);
      }),
      { numRuns: 200 }
    );
  });

  it('no {{...}} patterns remain after interpolation with mixed/missing variables', () => {
    fc.assert(
      fc.property(templateWithMixedVarsArb, ({ template, variables }) => {
        const result = interpolate(template, variables);
        expect(result).not.toMatch(/\{\{\w+\}\}/);
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: HTML Escape Safety
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirement 4.3**
 *
 * For any variable value containing <, >, &, ", ', the output contains only
 * escaped equivalents and never raw characters from variable values.
 */
describe('Property 2: HTML Escape Safety', () => {
  it('output never contains raw HTML special characters from variable values', () => {
    // Strategy: use a template with a unique marker so we can isolate the interpolated
    // portion and verify it contains only escaped characters, not raw HTML specials.
    fc.assert(
      fc.property(
        varKeyArb,
        htmlDangerousValueArb,
        (key, value) => {
          const marker = '|||';
          const template = `${marker}{{${key}}}${marker}`;
          const variables = { [key]: value };
          const result = interpolate(template, variables);

          // Extract the interpolated portion between markers
          const parts = result.split(marker);
          const interpolatedPart = parts[1];

          // The interpolated part should equal the escaped value
          const expectedEscaped = escapeHtml(String(value));
          expect(interpolatedPart).toBe(expectedEscaped);

          // The interpolated part should never contain raw <, >, ", '
          expect(interpolatedPart).not.toMatch(/[<>"']/);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('escapeHtml always escapes all five HTML special characters', () => {
    fc.assert(
      fc.property(htmlDangerousValueArb, (value) => {
        const escaped = escapeHtml(value);
        // After escaping, raw <, >, ", ' should never remain
        expect(escaped).not.toContain('<');
        expect(escaped).not.toContain('>');
        expect(escaped).not.toContain('"');
        expect(escaped).not.toContain("'");
        // & should only appear as part of escape entities
        const ampersands = escaped.match(/&/g) || [];
        const entities = escaped.match(/&(?:amp|lt|gt|quot|#x27);/g) || [];
        expect(ampersands.length).toBe(entities.length);
      }),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Interpolation Immutability
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirement 4.5**
 *
 * For any template and variables, calling interpolate() does not mutate
 * the original template string or variables object.
 */
describe('Property 3: Interpolation Immutability', () => {
  it('interpolate() does not mutate the original template string', () => {
    fc.assert(
      fc.property(templateWithMixedVarsArb, ({ template, variables }) => {
        const templateBefore = template;
        interpolate(template, variables);
        expect(template).toBe(templateBefore);
      }),
      { numRuns: 200 }
    );
  });

  it('interpolate() does not mutate the original variables object', () => {
    fc.assert(
      fc.property(templateWithMixedVarsArb, ({ template, variables }) => {
        const variablesBefore = JSON.parse(JSON.stringify(variables));
        interpolate(template, variables);
        expect(variables).toEqual(variablesBefore);
      }),
      { numRuns: 200 }
    );
  });

  it('interpolate() does not mutate variables even with HTML special chars in values', () => {
    fc.assert(
      fc.property(templateWithHtmlVarsArb, ({ template, variables }) => {
        const variablesBefore = JSON.parse(JSON.stringify(variables));
        interpolate(template, variables);
        expect(variables).toEqual(variablesBefore);
      }),
      { numRuns: 200 }
    );
  });
});
