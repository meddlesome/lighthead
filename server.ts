#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeUrl, ScrapeOptions } from './index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;
const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

// Nginx-style request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json and res.send to log response in nginx format
  const originalJson = res.json;
  const originalSend = res.send;
  
  const logResponse = (bodySize: number = 0) => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
    const clientIP = req.ip || req.connection.remoteAddress || '-';
    const userAgent = req.get('User-Agent') || '-';
    const referer = req.get('Referer') || '-';
    
    // Nginx combined log format: IP - - [timestamp] "METHOD /path HTTP/1.1" status size "referer" "user-agent" duration
    console.log(`${clientIP} - - [${timestamp}] "${req.method} ${req.originalUrl} HTTP/1.1" ${res.statusCode} ${bodySize} "${referer}" "${userAgent}" ${duration}ms`);
  };
  
  res.json = function(body) {
    const bodySize = JSON.stringify(body).length;
    logResponse(bodySize);
    return originalJson.call(this, body);
  };
  
  res.send = function(body) {
    const bodySize = body?.length || 0;
    logResponse(bodySize);
    return originalSend.call(this, body);
  };
  
  next();
});

interface ApiResponse {
  success: boolean;
  status: string;
  outputLength: number;
  output?: string;
  data?: any;
  error?: string;
  format?: string;
  contentType?: string;
  finalUrl?: string;
  redirectCount?: number;
}

// API Key middleware (optional)
const authenticateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (!API_KEY) {
    next();
    return;
  }
  
  const providedKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!providedKey || providedKey !== API_KEY) {
    res.status(401).json({
      success: false,
      status: 'error',
      outputLength: 0,
      error: 'Invalid or missing API key'
    });
    return;
  }
  
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    outputLength: 0,
    data: {
      service: 'lighthead-api',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

function validateServerUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Invalid URL format');
    }
    throw error;
  }
}

function validateServerFormat(format: string): void {
  const validFormats = ['html', 'markdown', 'md', 'text', 'txt', 'binary'];
  if (!validFormats.includes(format.toLowerCase())) {
    throw new Error(`Invalid format: ${format}. Valid formats are: ${validFormats.join(', ')}`);
  }
}

function validateServerMaxRedirects(value: string): number {
  const num = parseInt(value);
  if (isNaN(num) || num < 0 || num > 100) {
    throw new Error('maxRedirects must be a number between 0 and 100');
  }
  return num;
}

function validateServerBoolean(value: string, paramName: string): boolean {
  if (value !== 'true' && value !== 'false') {
    throw new Error(`${paramName} must be 'true' or 'false'`);
  }
  return value === 'true';
}

// GET endpoint for scraping
app.get('/scrape', authenticateApiKey, async (req, res): Promise<void> => {
  try {
    const { 
      url, 
      format = 'markdown',
      followRedirects = 'true',
      maxRedirects = '10',
      stealth = 'true' 
    } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: 'URL is required'
      });
      return;
    }

    try {
      validateServerUrl(url);
    } catch (error) {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: (error as Error).message
      });
      return;
    }

    if (typeof format !== 'string') {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: 'format must be a string'
      });
      return;
    }

    try {
      validateServerFormat(format);
    } catch (error) {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: (error as Error).message
      });
      return;
    }

    if (typeof followRedirects !== 'string') {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: 'followRedirects must be a string'
      });
      return;
    }

    let followRedirectsBool: boolean;
    try {
      followRedirectsBool = validateServerBoolean(followRedirects, 'followRedirects');
    } catch (error) {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: (error as Error).message
      });
      return;
    }

    if (typeof maxRedirects !== 'string') {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: 'maxRedirects must be a string'
      });
      return;
    }

    let maxRedirectsNum: number;
    try {
      maxRedirectsNum = validateServerMaxRedirects(maxRedirects);
    } catch (error) {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: (error as Error).message
      });
      return;
    }

    if (typeof stealth !== 'string') {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: 'stealth must be a string'
      });
      return;
    }

    let stealthBool: boolean;
    try {
      stealthBool = validateServerBoolean(stealth, 'stealth');
    } catch (error) {
      res.status(400).json({
        success: false,
        status: 'error',
        outputLength: 0,
        error: (error as Error).message
      });
      return;
    }

    const isDevMode = process.env.NODE_ENV !== 'production';
    // Check for verbose mode from server startup args or environment
    const verboseMode = process.argv.includes('--verbose') || process.argv.includes('-v') || process.env.VERBOSE === 'true';
    
    const options: ScrapeOptions = {
      verbose: verboseMode,
      followRedirects: followRedirectsBool,
      cookieFile: null,
      maxRedirects: maxRedirectsNum,
      stealth: stealthBool
    };

    const result = await scrapeUrl(url, options);
    
    let response: ApiResponse;
    
    if (result.type === 'html') {
      let output: string;
      let outputFormat: string;
      
      switch (format.toLowerCase()) {
        case 'html':
          output = result.html;
          outputFormat = 'html';
          break;
        case 'text':
        case 'txt':
          output = result.text;
          outputFormat = 'text';
          break;
        case 'markdown':
        case 'md':
        default:
          output = result.markdown;
          outputFormat = 'markdown';
          break;
      }
      
      response = {
        success: true,
        status: 'completed',
        outputLength: output.length,
        output,
        format: outputFormat,
        finalUrl: result.finalUrl,
        redirectCount: result.redirectChain.length
      };
      
    } else if (result.type === 'binary') {
      if (format.toLowerCase() === 'binary') {
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
        return;
      }
      
      response = {
        success: true,
        status: 'completed',
        outputLength: result.buffer.length,
        format: 'binary',
        contentType: result.contentType,
        finalUrl: result.finalUrl,
        redirectCount: result.redirectChain.length,
        data: {
          type: 'binary',
          filename: result.filename,
          contentType: result.contentType,
          size: result.buffer.length,
          url: result.url,
          finalUrl: result.finalUrl,
          redirectChain: result.redirectChain,
          response: result.response,
          buffer: result.buffer.toString('base64')
        }
      };
    } else {
      throw new Error('Unknown result type');
    }
    
    res.json(response);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      status: 'error',
      outputLength: 0,
      error: errorMessage
    });
  }
});

app.listen(PORT, () => {
  const verboseMode = process.argv.includes('--verbose') || process.argv.includes('-v') || process.env.VERBOSE === 'true';
  console.log(`Lighthead API server running on port ${PORT}`);
  if (API_KEY) {
    console.log('API key authentication is enabled');
  } else {
    console.log('API key authentication is disabled');
  }
  if (verboseMode) {
    console.log('Verbose mode enabled for debugging');
  }
});