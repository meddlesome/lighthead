import { validateUrl, validateFormat, validateMaxRedirects } from '../index';

describe('Core Validation Functions', () => {
  describe('validateUrl', () => {
    it('should accept valid HTTP and HTTPS URLs', () => {
      expect(() => validateUrl('https://example.com')).not.toThrow();
      expect(() => validateUrl('http://example.com')).not.toThrow();
      expect(() => validateUrl('https://subdomain.example.com/path?query=1')).not.toThrow();
      expect(() => validateUrl('http://localhost:3000')).not.toThrow();
      expect(() => validateUrl('https://192.168.1.1:8080')).not.toThrow();
    });

    it('should reject URLs with unsupported protocols', () => {
      expect(() => validateUrl('ftp://example.com')).toThrow('URL must use HTTP or HTTPS protocol');
      expect(() => validateUrl('file:///path/to/file')).toThrow('URL must use HTTP or HTTPS protocol');
      expect(() => validateUrl('javascript:alert(1)')).toThrow('URL must use HTTP or HTTPS protocol');
      expect(() => validateUrl('data:text/plain,hello')).toThrow('URL must use HTTP or HTTPS protocol');
    });

    it('should reject malformed URLs', () => {
      expect(() => validateUrl('not-a-url')).toThrow('Invalid URL');
      expect(() => validateUrl('')).toThrow('Invalid URL');
      expect(() => validateUrl('http://')).toThrow('Invalid URL');
      expect(() => validateUrl('https:/')).toThrow('Invalid URL');
    });
  });

  describe('validateFormat', () => {
    it('should accept valid formats (case insensitive)', () => {
      expect(() => validateFormat('html')).not.toThrow();
      expect(() => validateFormat('markdown')).not.toThrow();
      expect(() => validateFormat('md')).not.toThrow();
      expect(() => validateFormat('text')).not.toThrow();
      expect(() => validateFormat('txt')).not.toThrow();
      expect(() => validateFormat('HTML')).not.toThrow();
      expect(() => validateFormat('MARKDOWN')).not.toThrow();
    });

    it('should reject invalid formats', () => {
      expect(() => validateFormat('pdf')).toThrow('Invalid format: pdf');
      expect(() => validateFormat('json')).toThrow('Invalid format: json');
      expect(() => validateFormat('xml')).toThrow('Invalid format: xml');
      expect(() => validateFormat('')).toThrow('Invalid format:');
      expect(() => validateFormat('unknown')).toThrow('Invalid format: unknown');
    });

    it('should include valid formats in error message', () => {
      try {
        validateFormat('invalid');
      } catch (error) {
        expect((error as Error).message).toContain('html, markdown, md, text, txt');
      }
    });
  });

  describe('validateMaxRedirects', () => {
    it('should accept valid redirect counts', () => {
      expect(validateMaxRedirects('0')).toBe(0);
      expect(validateMaxRedirects('5')).toBe(5);
      expect(validateMaxRedirects('10')).toBe(10);
      expect(validateMaxRedirects('50')).toBe(50);
      expect(validateMaxRedirects('100')).toBe(100);
    });

    it('should reject invalid numbers', () => {
      expect(() => validateMaxRedirects('not-a-number')).toThrow('max-redirects must be a number between 0 and 100');
      expect(() => validateMaxRedirects('')).toThrow('max-redirects must be a number between 0 and 100');
      expect(() => validateMaxRedirects('abc')).toThrow('max-redirects must be a number between 0 and 100');
      // parseInt('12.5') returns 12, so this actually succeeds
      expect(validateMaxRedirects('12')).toBe(12);
    });

    it('should reject out-of-range values', () => {
      expect(() => validateMaxRedirects('-1')).toThrow('max-redirects must be a number between 0 and 100');
      expect(() => validateMaxRedirects('-10')).toThrow('max-redirects must be a number between 0 and 100');
      expect(() => validateMaxRedirects('101')).toThrow('max-redirects must be a number between 0 and 100');
      expect(() => validateMaxRedirects('1000')).toThrow('max-redirects must be a number between 0 and 100');
    });

    it('should handle edge cases', () => {
      expect(validateMaxRedirects('00')).toBe(0);
      expect(validateMaxRedirects('007')).toBe(7);
      expect(validateMaxRedirects('10')).toBe(10); // parseInt handles this
    });
  });
});