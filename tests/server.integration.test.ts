import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { createMockBrowser, createMockContext, createMockPage, createMockResponse } from './mocks/playwright';

// Mock the scrapeUrl function before any imports
const mockScrapeUrl = jest.fn() as jest.MockedFunction<any>;
const mockHtmlToMarkdown = jest.fn((html: string) => `# Mocked Markdown\n\n${html.slice(0, 50)}...`);
const mockGetFileExtension = jest.fn((url: string, contentType: string) => '.pdf');

jest.mock('../index', () => ({
  scrapeUrl: mockScrapeUrl,
  htmlToMarkdown: mockHtmlToMarkdown,
  getFileExtension: mockGetFileExtension
}));

describe('Server Integration Tests', () => {
  let app: express.Application;
  
  beforeAll(() => {
    // Clear environment variables for clean test state
    delete process.env.API_KEY;
    delete process.env.PORT;
  });

  beforeEach(() => {
    // Reset all mocks and environment
    jest.clearAllMocks();
    delete process.env.API_KEY;
    
    // Import fresh app instance for each test
    jest.resetModules();
    app = require('../server').default;
  });

  describe('Format Support', () => {
    const testUrl = 'https://example.com';

    it('should support markdown format', async () => {
      // Mock HTML response
      mockScrapeUrl.mockResolvedValue({
        type: 'html',
        html: '<html><body><h1>Test Page</h1><p>Test content</p></body></html>',
        text: 'Test Page\nTest content',
        markdown: '# Test Page\n\nTest content',
        url: testUrl,
        finalUrl: testUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: {} }
      });

      const response = await request(app)
        .get('/scrape')
        .query({ url: testUrl, format: 'markdown' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('markdown');
      expect(response.body.output).toBeDefined();
      expect(typeof response.body.output).toBe('string');
      expect(mockScrapeUrl).toHaveBeenCalledWith(testUrl, expect.any(Object));
    });

    it('should support html format', async () => {
      // Mock HTML response
      mockScrapeUrl.mockResolvedValue({
        type: 'html',
        html: '<html><body><h1>Test Page</h1><p>Test content</p></body></html>',
        text: 'Test Page\nTest content',
        markdown: '# Test Page\n\nTest content',
        url: testUrl,
        finalUrl: testUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: {} }
      });

      const response = await request(app)
        .get('/scrape')
        .query({ url: testUrl, format: 'html' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('html');
      expect(response.body.output).toBeDefined();
      expect(typeof response.body.output).toBe('string');
    });

    it('should support text format', async () => {
      // Mock HTML response
      mockScrapeUrl.mockResolvedValue({
        type: 'html',
        html: '<html><body><h1>Test Page</h1><p>Test content</p></body></html>',
        text: 'Test Page\nTest content',
        markdown: '# Test Page\n\nTest content',
        url: testUrl,
        finalUrl: testUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: {} }
      });

      const response = await request(app)
        .get('/scrape')
        .query({ url: testUrl, format: 'text' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('text');
      expect(response.body.output).toBeDefined();
      expect(typeof response.body.output).toBe('string');
    });

    it('should default to markdown format when no format specified', async () => {
      // Mock HTML response
      mockScrapeUrl.mockResolvedValue({
        type: 'html',
        html: '<html><body><h1>Test Page</h1><p>Test content</p></body></html>',
        text: 'Test Page\nTest content',
        markdown: '# Test Page\n\nTest content',
        url: testUrl,
        finalUrl: testUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: {} }
      });

      const response = await request(app)
        .get('/scrape')
        .query({ url: testUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('markdown');
      expect(response.body.output).toBeDefined();
    });

    it('should reject invalid json format', async () => {
      const response = await request(app)
        .get('/scrape')
        .query({ url: testUrl, format: 'json' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid format');
    });
  });

  describe('Binary File Support', () => {
    const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    it('should support binary format for PDF download', async () => {
      // Mock binary response
      const mockBuffer = Buffer.from('Mock PDF content');
      mockScrapeUrl.mockResolvedValue({
        type: 'binary',
        buffer: mockBuffer,
        filename: 'dummy.pdf',
        contentType: 'application/pdf',
        url: pdfUrl,
        finalUrl: pdfUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: { 'content-type': 'application/pdf' } }
      });

      const response = await request(app)
        .get('/scrape')
        .query({ url: pdfUrl, format: 'binary' })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('filename=');
    });

    it('should return binary metadata when binary format not specified', async () => {
      // Mock binary response
      const mockBuffer = Buffer.from('Mock PDF content');
      mockScrapeUrl.mockResolvedValue({
        type: 'binary',
        buffer: mockBuffer,
        filename: 'dummy.pdf',
        contentType: 'application/pdf',
        url: pdfUrl,
        finalUrl: pdfUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: { 'content-type': 'application/pdf' } }
      });

      const response = await request(app)
        .get('/scrape')
        .query({ url: pdfUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('binary');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('binary');
      expect(response.body.data.contentType).toBe('application/pdf');
      expect(response.body.data.size).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return error for missing URL', async () => {
      const response = await request(app)
        .get('/scrape')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('URL is required');
    });

    it('should return error for invalid URL', async () => {
      const response = await request(app)
        .get('/scrape')
        .query({ url: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid URL');
    });

    it('should return error when scraping fails', async () => {
      // Mock scrapeUrl to throw an error
      mockScrapeUrl.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/scrape')
        .query({ url: 'https://example.com' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Network error');
    });
  });

  describe('Response Structure', () => {
    const testUrl = 'https://example.com';

    it('should have consistent response structure for all formats', async () => {
      const formats = ['markdown', 'html', 'text'];
      
      for (const format of formats) {
        // Mock HTML response for each format
        mockScrapeUrl.mockResolvedValue({
          type: 'html',
          html: '<html><body><h1>Test Page</h1><p>Test content</p></body></html>',
          text: 'Test Page\nTest content',
          markdown: '# Test Page\n\nTest content',
          url: testUrl,
          finalUrl: testUrl,
          redirectChain: [],
          response: { status: 200, statusText: 'OK', headers: {} }
        });

        const response = await request(app)
          .get('/scrape')
          .query({ url: testUrl, format })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          status: 'completed',
          outputLength: expect.any(Number),
          output: expect.any(String),
          format: format,
          finalUrl: expect.any(String),
          redirectCount: expect.any(Number)
        });
      }
    });
  });

  describe('API Key Authentication', () => {
    const testApiKey = 'test-api-key-123';
    const testUrl = 'https://example.com';
    let appWithApiKey: express.Application;

    beforeEach(() => {
      // Set API key environment variable and create new app instance
      process.env.API_KEY = testApiKey;
      jest.resetModules();
      appWithApiKey = require('../server').default;
    });

    afterEach(() => {
      // Clean up API key
      delete process.env.API_KEY;
    });

    it('should reject requests without API key', async () => {
      const response = await request(appWithApiKey)
        .get('/scrape')
        .query({ url: testUrl })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or missing API key');
    });

    it('should reject requests with invalid API key in header', async () => {
      const response = await request(appWithApiKey)
        .get('/scrape')
        .set('x-api-key', 'invalid-key')
        .query({ url: testUrl })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or missing API key');
    });

    it('should reject requests with invalid API key in query', async () => {
      const response = await request(appWithApiKey)
        .get('/scrape')
        .query({ url: testUrl, apiKey: 'invalid-key' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or missing API key');
    });

    it('should accept requests with valid API key in header', async () => {
      // Mock HTML response
      mockScrapeUrl.mockResolvedValue({
        type: 'html',
        html: '<html><body><h1>Test Page</h1><p>Test content</p></body></html>',
        text: 'Test Page\nTest content',
        markdown: '# Test Page\n\nTest content',
        url: testUrl,
        finalUrl: testUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: {} }
      });

      const response = await request(appWithApiKey)
        .get('/scrape')
        .set('x-api-key', testApiKey)
        .query({ url: testUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.output).toBeDefined();
    });

    it('should accept requests with valid API key in query', async () => {
      // Mock HTML response
      mockScrapeUrl.mockResolvedValue({
        type: 'html',
        html: '<html><body><h1>Test Page</h1><p>Test content</p></body></html>',
        text: 'Test Page\nTest content',
        markdown: '# Test Page\n\nTest content',
        url: testUrl,
        finalUrl: testUrl,
        redirectChain: [],
        response: { status: 200, statusText: 'OK', headers: {} }
      });

      const response = await request(appWithApiKey)
        .get('/scrape')
        .query({ url: testUrl, apiKey: testApiKey })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.output).toBeDefined();
    });

    it('should allow health check without API key', async () => {
      const response = await request(appWithApiKey)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.data.service).toBe('lighthead-api');
    });
  });
});