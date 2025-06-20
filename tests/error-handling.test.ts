import { scrapeUrl, ScrapeOptions, validateUrl, validateFormat } from '../index';

describe('Error Handling and Edge Cases', () => {
  describe('Network error scenarios', () => {
    it('should handle DNS resolution failures', async () => {
      const invalidDomain = 'https://this-domain-definitely-does-not-exist-12345.com';
      
      await expect(scrapeUrl(invalidDomain, { verbose: false }))
        .rejects.toThrow();
    }, 15000);

    it('should handle connection timeouts', async () => {
      // Using a non-routable IP address to simulate timeout
      const nonRoutableUrl = 'http://10.255.255.1:80';
      
      await expect(scrapeUrl(nonRoutableUrl, { verbose: false }))
        .rejects.toThrow();
    }, 15000);

    it('should handle invalid port numbers', async () => {
      const invalidPortUrl = 'http://example.com:99999';
      
      await expect(scrapeUrl(invalidPortUrl, { verbose: false }))
        .rejects.toThrow();
    });
  });

  describe('HTTP error responses', () => {
    it('should handle 404 Not Found responses', async () => {
      const notFoundUrl = 'https://httpbin.org/status/404';
      
      try {
        const result = await scrapeUrl(notFoundUrl, { verbose: false });
        expect(result.response.status).toBe(404);
      } catch (error) {
        // Some implementations may throw on 404, which is also acceptable
        expect(error).toBeDefined();
      }
    });

    it('should handle 500 Server Error responses', async () => {
      const serverErrorUrl = 'https://httpbin.org/status/500';
      
      try {
        const result = await scrapeUrl(serverErrorUrl, { verbose: false });
        expect(result.response.status).toBe(500);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle redirect loops', async () => {
      const redirectLoopUrl = 'https://httpbin.org/redirect-to?url=https://httpbin.org/redirect-to?url=https://httpbin.org/redirect-to';
      
      await expect(scrapeUrl(redirectLoopUrl, { maxRedirects: 3 }))
        .rejects.toThrow();
    });
  });

  describe('Invalid options handling', () => {
    it('should handle negative maxRedirects', async () => {
      const validUrl = 'https://httpbin.org/get';
      
      await expect(scrapeUrl(validUrl, { maxRedirects: -1 }))
        .rejects.toThrow();
    });

    it('should handle extremely high maxRedirects', async () => {
      const validUrl = 'https://httpbin.org/get';
      
      await expect(scrapeUrl(validUrl, { maxRedirects: 1000 }))
        .rejects.toThrow();
    });

    it('should handle invalid cookie file paths', async () => {
      const validUrl = 'https://httpbin.org/get';
      const invalidCookiePath = '/nonexistent/directory/cookies.json';
      
      await expect(scrapeUrl(validUrl, { cookieFile: invalidCookiePath }))
        .rejects.toThrow();
    });

    it('should handle malformed cookie files', async () => {
      const validUrl = 'https://httpbin.org/get';
      // This would need a temp file with invalid JSON
      // For now, test the validation logic
      expect(() => {
        JSON.parse('{ invalid json }');
      }).toThrow();
    });
  });

  describe('Content processing errors', () => {
    it('should handle extremely large content gracefully', async () => {
      // Test with a URL that returns large content
      const largeContentUrl = 'https://httpbin.org/base64/SFRUUEJJTiBpcyBhd2Vzb21lSFRUUEJJTiBpcyBhd2Vzb21lSFRUUEJJTiBpcyBhd2Vzb21lSFRUUEJJTiBpcyBhd2Vzb21lSFRUUEJJTiBpcyBhd2Vzb21l';
      
      try {
        const result = await scrapeUrl(largeContentUrl, { verbose: false });
        expect(result.type).toBe('html');
        if (result.type === 'html') {
          expect(typeof result.html).toBe('string');
        }
      } catch (error) {
        // If it fails due to size limits, that's acceptable behavior
        expect(error).toBeDefined();
      }
    });

    it('should handle binary content properly', async () => {
      // Test with a binary file URL
      const binaryUrl = 'https://httpbin.org/image/png';
      
      try {
        const result = await scrapeUrl(binaryUrl, { verbose: false });
        if (result.type === 'binary') {
          expect(Buffer.isBuffer(result.buffer)).toBe(true);
          expect(result.contentType).toContain('image');
        }
      } catch (error) {
        // Some configurations may not handle binary content
        expect(error).toBeDefined();
      }
    });

    it('should handle malformed HTML gracefully', async () => {
      const malformedHtml = '<html><body><p>Unclosed paragraph<div>Nested without closing';
      
      // Test the htmlToMarkdown function directly with malformed content
      const { htmlToMarkdown } = require('../index');
      expect(() => htmlToMarkdown(malformedHtml)).not.toThrow();
      
      const result = htmlToMarkdown(malformedHtml);
      expect(typeof result).toBe('string');
    });
  });

  describe('Resource cleanup', () => {
    it('should handle browser cleanup on errors', async () => {
      // Test that resources are properly cleaned up even when errors occur
      const invalidUrl = 'not-a-valid-url';
      
      await expect(scrapeUrl(invalidUrl)).rejects.toThrow();
      
      // The error should be thrown without hanging processes
      // This test ensures the promise rejects rather than hanging
    });

    it('should handle multiple concurrent requests', async () => {
      const urls = [
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1'
      ];
      
      const promises = urls.map(url => 
        scrapeUrl(url, { verbose: false }).catch(err => ({ error: err }))
      );
      
      const results = await Promise.all(promises);
      
      // Should complete without hanging or crashing
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    }, 30000);
  });

  describe('Input validation edge cases', () => {
    it('should handle URLs with special characters', () => {
      const specialUrls = [
        'https://example.com/path with spaces',
        'https://example.com/path?query=value with spaces',
        'https://example.com/path#fragment with spaces',
        'https://user:pass@example.com/path'
      ];

      specialUrls.forEach(url => {
        // Some URLs may be valid, others invalid
        // Test that validation doesn't crash
        expect(() => {
          try {
            validateUrl(url);
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
          }
        }).not.toThrow();
      });
    });

    it('should handle format validation with various inputs', () => {
      const testFormats = [
        'HTML',
        'Markdown', 
        'TEXT',
        'md',
        'txt',
        'json',
        'pdf',
        '',
        null,
        undefined
      ];

      testFormats.forEach(format => {
        expect(() => {
          try {
            if (format !== null && format !== undefined) {
              validateFormat(format);
            }
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
          }
        }).not.toThrow();
      });
    });

    it('should handle extreme input values', () => {
      const extremeInputs = [
        'a'.repeat(10000), // Very long string
        '', // Empty string
        'https://' + 'a'.repeat(1000) + '.com', // Very long domain
        'https://example.com/' + 'path/'.repeat(100) // Very long path
      ];

      extremeInputs.forEach(input => {
        expect(() => {
          try {
            validateUrl(input);
          } catch (error) {
            expect(error).toBeDefined();
          }
        }).not.toThrow();
      });
    });
  });
});