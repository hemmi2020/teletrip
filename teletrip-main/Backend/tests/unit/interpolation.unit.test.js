const { interpolate, escapeHtml } = require('../../services/email.service');

describe('escapeHtml()', () => {
  it('should escape & to &amp;', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape < to &lt;', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('should escape > to &gt;', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('should escape " to &quot;', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it("should escape ' to &#x27;", () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });

  it('should escape multiple special characters in one string', () => {
    expect(escapeHtml('<b>"A & B"</b>')).toBe('&lt;b&gt;&quot;A &amp; B&quot;&lt;/b&gt;');
  });

  it('should return the same string when no special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('interpolate()', () => {
  // --- Requirement 4.1: Replace {{key}} with variable values ---

  it('should replace a single placeholder with its value', () => {
    expect(interpolate('Hello {{name}}', { name: 'Alice' })).toBe('Hello Alice');
  });

  it('should replace multiple placeholders', () => {
    const result = interpolate('{{greeting}} {{name}}!', { greeting: 'Hi', name: 'Bob' });
    expect(result).toBe('Hi Bob!');
  });

  it('should replace the same placeholder appearing multiple times', () => {
    const result = interpolate('{{x}} and {{x}}', { x: 'val' });
    expect(result).toBe('val and val');
  });

  // --- Requirement 4.2: Replace unmatched placeholders with empty string ---

  it('should replace unmatched placeholders with empty string', () => {
    expect(interpolate('Hello {{name}}', {})).toBe('Hello ');
  });

  it('should replace placeholders with null values with empty string', () => {
    expect(interpolate('Hello {{name}}', { name: null })).toBe('Hello ');
  });

  it('should replace placeholders with undefined values with empty string', () => {
    expect(interpolate('Hello {{name}}', { name: undefined })).toBe('Hello ');
  });

  // --- Requirement 4.3: HTML-escape variable values ---

  it('should HTML-escape variable values containing <', () => {
    expect(interpolate('{{val}}', { val: '<script>' })).toBe('&lt;script&gt;');
  });

  it('should HTML-escape variable values containing &', () => {
    expect(interpolate('{{val}}', { val: 'A & B' })).toBe('A &amp; B');
  });

  it('should HTML-escape variable values containing quotes', () => {
    expect(interpolate('{{val}}', { val: '"hello"' })).toBe('&quot;hello&quot;');
  });

  // --- Requirement 4.4: Apply to both subject and body (tested via function reuse) ---

  it('should work on any string (subject or body)', () => {
    const subject = interpolate('Order {{id}} confirmed', { id: '123' });
    const body = interpolate('<p>Order {{id}} details</p>', { id: '123' });
    expect(subject).toBe('Order 123 confirmed');
    expect(body).toBe('<p>Order 123 details</p>');
  });

  // --- Requirement 4.5: Do not mutate original template or variables ---

  it('should not mutate the original template string', () => {
    const template = 'Hello {{name}}';
    interpolate(template, { name: 'Alice' });
    expect(template).toBe('Hello {{name}}');
  });

  it('should not mutate the variables object', () => {
    const vars = { name: 'Alice' };
    const varsCopy = { ...vars };
    interpolate('Hello {{name}}', vars);
    expect(vars).toEqual(varsCopy);
  });

  // --- Requirement 4.6: No nested/recursive interpolation ---

  it('should not perform nested interpolation', () => {
    const result = interpolate('{{val}}', { val: '{{other}}', other: 'nested' });
    expect(result).toBe('{{other}}');
  });

  // --- Edge cases ---

  it('should return empty string for null template', () => {
    expect(interpolate(null, { name: 'Alice' })).toBe('');
  });

  it('should return empty string for undefined template', () => {
    expect(interpolate(undefined, { name: 'Alice' })).toBe('');
  });

  it('should return empty string for empty template', () => {
    expect(interpolate('', { name: 'Alice' })).toBe('');
  });

  it('should return template unchanged for null variables', () => {
    expect(interpolate('Hello {{name}}', null)).toBe('Hello {{name}}');
  });

  it('should return template unchanged for undefined variables', () => {
    expect(interpolate('Hello {{name}}', undefined)).toBe('Hello {{name}}');
  });

  it('should return template unchanged for non-object variables', () => {
    expect(interpolate('Hello {{name}}', 'not an object')).toBe('Hello {{name}}');
  });

  it('should convert numeric values to string', () => {
    expect(interpolate('Count: {{n}}', { n: 42 })).toBe('Count: 42');
  });

  it('should handle template with no placeholders', () => {
    expect(interpolate('No placeholders here', { name: 'Alice' })).toBe('No placeholders here');
  });

  it('should not match placeholders with non-word characters in key', () => {
    expect(interpolate('{{my-key}}', { 'my-key': 'val' })).toBe('{{my-key}}');
  });

  it('should handle nested interpolation output being escaped', () => {
    // The value contains HTML special chars that look like a placeholder
    const result = interpolate('{{val}}', { val: '<b>{{inner}}</b>' });
    expect(result).toBe('&lt;b&gt;{{inner}}&lt;/b&gt;');
  });
});
