const sanitizeHtml = require('../../utils/htmlSanitizer.util');

describe('sanitizeHtml()', () => {
  // --- Requirement 6.1: Remove <script> tags and contents ---

  it('should remove script tags and their contents', () => {
    const input = '<div>Hello</div><script>alert("xss")</script><p>World</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<div>Hello</div><p>World</p>');
  });

  it('should remove script tags case-insensitively', () => {
    const input = '<SCRIPT>alert("xss")</SCRIPT>';
    const result = sanitizeHtml(input);
    expect(result).toBe('');
  });

  it('should remove script tags with attributes', () => {
    const input = '<script type="text/javascript">var x = 1;</script>';
    const result = sanitizeHtml(input);
    expect(result).toBe('');
  });

  // --- Requirement 6.2: Remove on* event handler attributes ---

  it('should remove onclick event handler', () => {
    const input = '<button onclick="alert(1)">Click</button>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<button>Click</button>');
  });

  it('should remove onload event handler', () => {
    const input = '<img src="img.jpg" onload="alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).toBe('<img src="img.jpg">');
  });

  it('should remove onerror event handler', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).toBe('<img src="x">');
  });

  it('should remove multiple event handlers from one element', () => {
    const input = '<div onclick="a()" onmouseover="b()">text</div>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<div>text</div>');
  });

  it('should remove event handlers with single quotes', () => {
    const input = "<div onclick='alert(1)'>text</div>";
    const result = sanitizeHtml(input);
    expect(result).toBe('<div>text</div>');
  });

  // --- Requirement 6.3: Remove javascript: protocol URLs ---

  it('should remove javascript: from href attributes', () => {
    const input = '<a href="javascript:alert(1)">link</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('should remove javascript: from src attributes', () => {
    const input = '<img src="javascript:alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('should remove javascript: case-insensitively', () => {
    const input = '<a href="JavaScript:alert(1)">link</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('JavaScript:');
  });

  // --- Requirement 6.4: Preserve valid HTML ---

  it('should preserve valid HTML structure', () => {
    const input = '<div class="container"><p>Hello <strong>World</strong></p></div>';
    const result = sanitizeHtml(input);
    expect(result).toBe(input);
  });

  it('should preserve inline styles', () => {
    const input = '<p style="color: red; font-size: 14px;">Styled text</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe(input);
  });

  it('should preserve email-safe tags', () => {
    const input = '<table><tr><td>Cell</td></tr></table>';
    const result = sanitizeHtml(input);
    expect(result).toBe(input);
  });

  it('should preserve valid href links', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toBe(input);
  });

  // --- Requirement 6.5: Idempotency ---

  it('should be idempotent - applying twice produces same result', () => {
    const input = '<div onclick="alert(1)"><script>bad</script><a href="javascript:void(0)">link</a></div>';
    const once = sanitizeHtml(input);
    const twice = sanitizeHtml(once);
    expect(twice).toBe(once);
  });

  // --- Edge cases ---

  it('should return empty string for null input', () => {
    expect(sanitizeHtml(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('should return empty string for empty string input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('should handle plain text without HTML', () => {
    const input = 'Hello World';
    expect(sanitizeHtml(input)).toBe('Hello World');
  });
});
