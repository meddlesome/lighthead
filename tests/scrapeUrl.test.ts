import { scrapeUrl, ScrapeOptions } from '../index';

describe('scrapeUrl error handling', () => {
  it('should reject invalid URLs', async () => {
    await expect(scrapeUrl('not-a-url')).rejects.toThrow();
    await expect(scrapeUrl('')).rejects.toThrow();
  });

  it('should handle timeout gracefully', async () => {
    const options: ScrapeOptions = { verbose: false };
    // Using a non-routable IP to force timeout
    await expect(scrapeUrl('http://10.255.255.1', options)).rejects.toThrow();
  });

  it('should validate options parameter', async () => {
    const validUrl = 'https://httpbin.org/status/200';
    
    // Test invalid maxRedirects
    await expect(scrapeUrl(validUrl, { maxRedirects: -1 })).rejects.toThrow();
    
    // Test invalid cookieFile path
    await expect(scrapeUrl(validUrl, { cookieFile: '/nonexistent/path/cookies.json' })).rejects.toThrow();
  });
});