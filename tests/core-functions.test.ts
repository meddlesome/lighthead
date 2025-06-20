import { ScrapeOptions } from '../index';

describe('Core Type Validation', () => {
  describe('ScrapeOptions interface', () => {
    it('should accept valid options', () => {
      const validOptions: ScrapeOptions[] = [
        { verbose: true },
        { followRedirects: false },
        { cookieFile: 'cookies.json' },
        { maxRedirects: 5 },
        { stealth: false },
        {
          verbose: true,
          followRedirects: false,
          cookieFile: 'session.json',
          maxRedirects: 10,
          stealth: true
        }
      ];

      validOptions.forEach(options => {
        expect(typeof options).toBe('object');
        if (options.verbose !== undefined) expect(typeof options.verbose).toBe('boolean');
        if (options.followRedirects !== undefined) expect(typeof options.followRedirects).toBe('boolean');
        if (options.cookieFile !== undefined) expect(typeof options.cookieFile).toBe('string');
        if (options.maxRedirects !== undefined) expect(typeof options.maxRedirects).toBe('number');
        if (options.stealth !== undefined) expect(typeof options.stealth).toBe('boolean');
      });
    });

    it('should handle empty options object', () => {
      const emptyOptions: ScrapeOptions = {};
      expect(typeof emptyOptions).toBe('object');
      expect(Object.keys(emptyOptions)).toHaveLength(0);
    });
  });

  describe('URL format validation', () => {
    it('should identify valid URL patterns', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost',
        'https://sub.domain.com/path?q=1',
        'http://192.168.1.1:8080'
      ];

      validUrls.forEach(url => {
        try {
          new URL(url);
          expect(url.startsWith('http')).toBe(true);
        } catch {
          fail(`URL should be valid: ${url}`);
        }
      });
    });

    it('should identify invalid URL patterns', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        ''
      ];

      invalidUrls.forEach(url => {
        let isValid = true;
        try {
          const parsed = new URL(url);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            isValid = false;
          }
        } catch {
          isValid = false;
        }
        expect(isValid).toBe(false);
      });
    });
  });
});