import request from 'supertest';
import express from 'express';
import { spawn, ChildProcess } from 'child_process';
import { jest } from '@jest/globals';

describe('Server Integration Tests', () => {
  let serverProcess: ChildProcess;
  const PORT = 3006; // Use different port for tests
  const baseUrl = `http://localhost:${PORT}`;

  beforeAll(async () => {
    // Start server in background for testing
    serverProcess = spawn('node', ['-e', `
      process.env.PORT = '${PORT}';
      require('ts-node/register');
      require('./server.ts');
    `], {
      stdio: 'pipe',
      env: { ...process.env, PORT: PORT.toString() }
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  }, 10000);

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }, 5000);

  describe('Format Support', () => {
    const testUrl = 'https://example.com';

    it('should support markdown format', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: testUrl, format: 'markdown' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('markdown');
      expect(response.body.output).toBeDefined();
      expect(typeof response.body.output).toBe('string');
    }, 15000);

    it('should support html format', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: testUrl, format: 'html' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('html');
      expect(response.body.output).toBeDefined();
      expect(typeof response.body.output).toBe('string');
    }, 15000);

    it('should support text format', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: testUrl, format: 'text' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('text');
      expect(response.body.output).toBeDefined();
      expect(typeof response.body.output).toBe('string');
    }, 15000);

    it('should default to markdown format when no format specified', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: testUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('markdown');
      expect(response.body.output).toBeDefined();
    }, 15000);

    it('should handle removed json format by defaulting to markdown', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: testUrl, format: 'json' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('markdown');
      expect(response.body.output).toBeDefined();
    }, 15000);
  });

  describe('Binary File Support', () => {
    const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    it('should support binary format for PDF download', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: pdfUrl, format: 'binary' })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('filename=');
    }, 20000);

    it('should return binary metadata when binary format not specified', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: pdfUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('binary');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('binary');
      expect(response.body.data.contentType).toBe('application/pdf');
      expect(response.body.data.size).toBeGreaterThan(0);
    }, 20000);
  });

  describe('Error Handling', () => {
    it('should return error for missing URL', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('URL is required');
    });

    it('should return error for invalid URL', async () => {
      const response = await request(baseUrl)
        .get('/scrape')
        .query({ url: 'not-a-valid-url' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    }, 15000);
  });

  describe('Response Structure', () => {
    const testUrl = 'https://example.com';

    it('should have consistent response structure for all formats', async () => {
      const formats = ['markdown', 'html', 'text'];
      
      for (const format of formats) {
        const response = await request(baseUrl)
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
    }, 45000);
  });

  describe('API Key Authentication', () => {
    let serverWithApiKey: ChildProcess;
    const apiKeyPort = 3007;
    const apiKeyBaseUrl = `http://localhost:${apiKeyPort}`;
    const testApiKey = 'test-api-key-123';
    const testUrl = 'https://example.com';

    beforeAll(async () => {
      // Start server with API key enabled
      serverWithApiKey = spawn('node', ['-e', `
        process.env.PORT = '${apiKeyPort}';
        process.env.API_KEY = '${testApiKey}';
        require('ts-node/register');
        require('./server.ts');
      `], {
        stdio: 'pipe',
        env: { 
          ...process.env, 
          PORT: apiKeyPort.toString(),
          API_KEY: testApiKey
        }
      });

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
    }, 15000);

    afterAll(async () => {
      if (serverWithApiKey) {
        serverWithApiKey.kill();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }, 5000);

    it('should reject requests without API key', async () => {
      const response = await request(apiKeyBaseUrl)
        .get('/scrape')
        .query({ url: testUrl })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or missing API key');
    });

    it('should reject requests with invalid API key in header', async () => {
      const response = await request(apiKeyBaseUrl)
        .get('/scrape')
        .set('x-api-key', 'invalid-key')
        .query({ url: testUrl })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or missing API key');
    });

    it('should reject requests with invalid API key in query', async () => {
      const response = await request(apiKeyBaseUrl)
        .get('/scrape')
        .query({ url: testUrl, apiKey: 'invalid-key' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or missing API key');
    });

    it('should accept requests with valid API key in header', async () => {
      const response = await request(apiKeyBaseUrl)
        .get('/scrape')
        .set('x-api-key', testApiKey)
        .query({ url: testUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.output).toBeDefined();
    }, 15000);

    it('should accept requests with valid API key in query', async () => {
      const response = await request(apiKeyBaseUrl)
        .get('/scrape')
        .query({ url: testUrl, apiKey: testApiKey })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.output).toBeDefined();
    }, 15000);

    it('should allow health check without API key', async () => {
      const response = await request(apiKeyBaseUrl)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(baseUrl)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.data.service).toBe('lighthead-api');
    });
  });
});