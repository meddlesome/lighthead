#!/usr/bin/env node

import { chromium, Browser, BrowserContext, Page, Response } from 'playwright-core';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

interface RedirectInfo {
  from: string;
  to: string;
  status: number;
}

interface ResponseInfo {
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ScrapeOptions {
  verbose?: boolean;
  followRedirects?: boolean;
  cookieFile?: string | null;
  maxRedirects?: number;
  stealth?: boolean;
}

interface HtmlResult {
  type: 'html';
  html: string;
  text: string;
  markdown: string;
  url: string;
  finalUrl: string;
  redirectChain: RedirectInfo[];
  response: ResponseInfo;
}

interface BinaryResult {
  type: 'binary';
  buffer: Buffer;
  filename: string;
  contentType: string;
  url: string;
  finalUrl: string;
  redirectChain: RedirectInfo[];
  response: ResponseInfo;
}

type ScrapeResult = HtmlResult | BinaryResult;

export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => '#'.repeat(parseInt(level)) + ' ' + text.trim() + '\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

export function getFileExtension(url: string, contentType: string): string {
  const urlPath = new URL(url).pathname;
  const urlExt = path.extname(urlPath).toLowerCase();
  
  if (urlExt) return urlExt;
  
  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'text/plain': '.txt',
    'application/json': '.json'
  };
  
  return mimeMap[contentType] || '.bin';
}

export async function scrapeUrl(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
  const { verbose = false, followRedirects = true, cookieFile = null, maxRedirects = 10, stealth = true } = options;
  let browser: Browser | undefined;
  
  try {
    if (verbose) {
      console.error('\n=== BROWSER LAUNCH ===');
      console.error('Launching Chromium with headless mode...');
    }
    
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--window-size=1920,1080',
      '--start-maximized'
    ];
    
    if (stealth) {
      launchArgs.push(
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-hang-monitor',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--force-fieldtrials=*BackgroundTracing/default/'
      );
    }
    
    browser = await chromium.launch({
      headless: true,
      args: launchArgs
    });
    
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    const contextOptions: any = {
      userAgent: userAgent,
      viewport: { width: 1920, height: 1080 },
      screen: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1'
      }
    };
    
    if (cookieFile && fs.existsSync(cookieFile)) {
      try {
        const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
        contextOptions.storageState = { cookies };
        if (verbose) {
          console.error('Loaded', cookies.length, 'cookies from', cookieFile);
        }
      } catch (error) {
        if (verbose) {
          console.error('Failed to load cookies:', (error as Error).message);
        }
      }
    }
    
    const context: BrowserContext = await browser.newContext(contextOptions);
    
    const page: Page = await context.newPage();
    
    // Handle PDF downloads
    let downloadInfo: any = null;
    page.on('download', async (download) => {
      if (verbose) {
        console.error('Download started:', download.url());
      }
      try {
        const downloadPath = await download.path();
        const buffer = downloadPath ? fs.readFileSync(downloadPath) : Buffer.alloc(0);
        downloadInfo = {
          buffer,
          filename: download.suggestedFilename(),
          url: download.url()
        };
        if (verbose) {
          console.error('Download completed:', downloadInfo.filename);
        }
      } catch (error) {
        if (verbose) {
          console.error('Download error:', (error as Error).message);
        }
      }
    });
    
    if (stealth) {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        (window.navigator as any).chrome = {
          runtime: {},
        };
        
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
        
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
        
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: (Notification as any).permission } as any) :
            originalQuery(parameters)
        );
        
        delete (navigator as any).__proto__.webdriver;
      });
      
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });
    }
    
    if (verbose) {
      console.error('\n=== HTTP REQUEST ===');
      console.error('URL:', url);
      console.error('Method: GET');
      console.error('User-Agent:', userAgent);
      console.error('Stealth mode:', stealth);
      console.error('Viewport:', '1920x1080');
      console.error('Headers:');
      Object.entries(contextOptions.extraHTTPHeaders).forEach(([key, value]) => {
        console.error(`  ${key}: ${value}`);
      });
    }
    
    page.on('request', request => {
      if (verbose && request.url() === url) {
        console.error('\n=== REQUEST DETAILS ===');
        console.error('Method:', request.method());
        console.error('Headers:', JSON.stringify(request.headers(), null, 2));
        const postData = request.postData();
        if (postData) {
          console.error('Body:', postData);
        }
      }
    });
    
    let redirectCount = 0;
    const redirectChain: RedirectInfo[] = [];
    
    page.on('response', response => {
      if (verbose) {
        const status = response.status();
        const isRedirect = status >= 300 && status < 400;
        
        if (isRedirect) {
          redirectCount++;
          const location = response.headers()['location'] || 'unknown';
          redirectChain.push({ from: response.url(), to: location, status });
          console.error(`\n=== REDIRECT ${redirectCount} ===`);
          console.error('From:', response.url());
          console.error('To:', location);
          console.error('Status:', status, response.statusText());
        } else if (response.url() === url || redirectChain.length > 0) {
          console.error('\n=== HTTP RESPONSE ===');
          console.error('Status:', response.status(), response.statusText());
          console.error('Headers:', JSON.stringify(response.headers(), null, 2));
          if (redirectChain.length > 0) {
            console.error('Redirect chain:', redirectChain.length, 'redirects');
          }
        }
      }
    });
    
    const gotoOptions: any = {
      waitUntil: 'networkidle',
      timeout: 60000
    };
    
    if (!followRedirects) {
      gotoOptions.waitUntil = 'commit';
    }
    
    // For PDF URLs, use 'commit' to avoid ERR_ABORTED
    if (url.toLowerCase().includes('.pdf')) {
      gotoOptions.waitUntil = 'commit';
    }
    
    if (stealth) {
      await page.setExtraHTTPHeaders({
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      });
    }
    
    let response: Response | null = null;
    try {
      response = await page.goto(url, gotoOptions);
    } catch (error) {
      // For PDFs, ERR_ABORTED might be expected when download is triggered
      if (url.toLowerCase().includes('.pdf') && (error as Error).message.includes('ERR_ABORTED')) {
        if (verbose) {
          console.error('Navigation aborted (expected for PDF download)');
        }
        // Wait for download to complete
        await page.waitForTimeout(3000);
        
        if (downloadInfo) {
          // Create a mock response for the download case
          response = {
            url: () => url,
            status: () => 200,
            statusText: () => 'OK',
            headers: () => ({ 'content-type': 'application/pdf' })
          } as any;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    if (!response) {
      throw new Error('Failed to load page');
    }
    
    // Wait a bit for download to complete if triggered
    if (url.toLowerCase().includes('.pdf')) {
      await page.waitForTimeout(1000);
    }
    
    if (stealth) {
      await page.waitForTimeout(Math.random() * 2000 + 1000);
      
      await page.mouse.move(Math.random() * 100, Math.random() * 100);
      
      try {
        await page.evaluate(() => {
          window.scrollTo(0, Math.random() * 100);
        });
      } catch (e) {}
    }
    
    if (verbose && redirectChain.length > 0) {
      console.error('\n=== REDIRECT SUMMARY ===');
      console.error('Total redirects:', redirectChain.length);
      redirectChain.forEach((redirect, i) => {
        console.error(`${i + 1}. ${redirect.status} ${redirect.from} -> ${redirect.to}`);
      });
      console.error('Final URL:', response.url());
    }
    
    // Check if we have download info from the download event
    if (downloadInfo) {
      if (verbose) {
        console.error('\n=== DOWNLOAD COMPLETED ===');
        console.error('Downloaded file:', downloadInfo.filename);
        console.error('Buffer size:', downloadInfo.buffer.length, 'bytes');
      }
      
      const result: BinaryResult = {
        type: 'binary',
        buffer: downloadInfo.buffer,
        filename: downloadInfo.filename || `download_${Date.now()}.pdf`,
        contentType: 'application/pdf',
        url,
        finalUrl: response.url(),
        redirectChain,
        response: {
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers()
        }
      };
      
      if (cookieFile) {
        try {
          const cookies = await context.cookies();
          fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
          if (verbose) {
            console.error('Saved', cookies.length, 'cookies to', cookieFile);
          }
        } catch (error) {
          if (verbose) {
            console.error('Failed to save cookies:', (error as Error).message);
          }
        }
      }
      
      return result;
    }
    
    const contentType = response.headers()['content-type'] || '';
    
    if (verbose) {
      console.error('\n=== RESPONSE ANALYSIS ===');
      console.error('Content-Type:', contentType);
      console.error('Content-Length:', response.headers()['content-length'] || 'unknown');
    }
    
    if (contentType.includes('text/html')) {
      if (verbose) {
        console.error('Processing HTML content...');
      }
      
      const html = await page.content();
      const textContent = await page.textContent('body') || '';
      const markdown = htmlToMarkdown(html);
      
      if (verbose) {
        console.error('HTML size:', html.length, 'characters');
        console.error('Text content size:', textContent.length, 'characters');
        console.error('Markdown size:', markdown.length, 'characters');
      }
      
      const result: HtmlResult = {
        type: 'html',
        html,
        text: textContent,
        markdown,
        url,
        finalUrl: response.url(),
        redirectChain,
        response: {
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers()
        }
      };
      
      if (cookieFile) {
        try {
          const cookies = await context.cookies();
          fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
          if (verbose) {
            console.error('Saved', cookies.length, 'cookies to', cookieFile);
          }
        } catch (error) {
          if (verbose) {
            console.error('Failed to save cookies:', (error as Error).message);
          }
        }
      }
      
      return result;
    } else {
      if (verbose) {
        console.error('Processing binary content...');
      }
      
      const buffer = await response.body();
      const extension = getFileExtension(url, contentType);
      const filename = `download_${Date.now()}${extension}`;
      
      if (verbose) {
        console.error('Binary size:', buffer.length, 'bytes');
        console.error('Suggested filename:', filename);
      }
      
      const result: BinaryResult = {
        type: 'binary',
        buffer,
        filename,
        contentType,
        url,
        finalUrl: response.url(),
        redirectChain,
        response: {
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers()
        }
      };
      
      if (cookieFile) {
        try {
          const cookies = await context.cookies();
          fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
          if (verbose) {
            console.error('Saved', cookies.length, 'cookies to', cookieFile);
          }
        } catch (error) {
          if (verbose) {
            console.error('Failed to save cookies:', (error as Error).message);
          }
        }
      }
      
      return result;
    }
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function validateUrl(url: string): void {
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

function validateFormat(format: string): void {
  const validFormats = ['html', 'markdown', 'md', 'text', 'txt'];
  if (!validFormats.includes(format.toLowerCase())) {
    throw new Error(`Invalid format: ${format}. Valid formats are: ${validFormats.join(', ')}`);
  }
}

function validateMaxRedirects(value: string): number {
  const num = parseInt(value);
  if (isNaN(num) || num < 0 || num > 100) {
    throw new Error('max-redirects must be a number between 0 and 100');
  }
  return num;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Lighthead - Lightweight headless web scraper

Usage: lighthead <url> [options]

Options:
  --format <format>    Output format: html, markdown, text (default: html)
  --output <file>      Save output to file
  --download           Download binary files
  --cookies <file>     Load/save cookies from/to JSON file
  --no-redirects       Don't follow HTTP redirects
  --max-redirects <n>  Maximum number of redirects to follow (default: 10)
  --no-stealth         Disable stealth mode (bot detection evasion)
  -v, --verbose        Enable verbose mode (show HTTP details)
  --help, -h           Show this help message

Examples:
  lighthead https://example.com
  lighthead https://example.com --format markdown
  lighthead https://example.com --format text --output content.txt
  lighthead https://example.com/file.pdf --download
  lighthead https://example.com -v --format markdown
  lighthead https://example.com --cookies session.json
  lighthead https://example.com --no-redirects --max-redirects 5
  lighthead https://protected-site.com --no-stealth
    `);
    return;
  }
  
  const verbose = args.includes('-v') || args.includes('--verbose');
  const download = args.includes('--download');
  const followRedirects = !args.includes('--no-redirects');
  const stealth = !args.includes('--no-stealth');
  
  let format = 'html';
  if (args.includes('--format')) {
    const formatIndex = args.indexOf('--format');
    if (formatIndex + 1 >= args.length) {
      throw new Error('--format requires a value');
    }
    format = args[formatIndex + 1];
    validateFormat(format);
  }
  
  let outputFile: string | null = null;
  if (args.includes('--output')) {
    const outputIndex = args.indexOf('--output');
    if (outputIndex + 1 >= args.length) {
      throw new Error('--output requires a file path');
    }
    outputFile = args[outputIndex + 1];
  }
  
  let cookieFile: string | null = null;
  if (args.includes('--cookies')) {
    const cookiesIndex = args.indexOf('--cookies');
    if (cookiesIndex + 1 >= args.length) {
      throw new Error('--cookies requires a file path');
    }
    cookieFile = args[cookiesIndex + 1];
  }
  
  let maxRedirects = 10;
  if (args.includes('--max-redirects')) {
    const maxRedirectsIndex = args.indexOf('--max-redirects');
    if (maxRedirectsIndex + 1 >= args.length) {
      throw new Error('--max-redirects requires a number');
    }
    maxRedirects = validateMaxRedirects(args[maxRedirectsIndex + 1]);
  }
  
  const url = args.find(arg => !arg.startsWith('-') && 
    arg !== format && 
    arg !== outputFile &&
    arg !== cookieFile &&
    arg !== maxRedirects.toString());
  
  if (!url) {
    throw new Error('URL is required');
  }
  
  validateUrl(url);
  
  try {
    if (verbose) {
      console.error('=== LIGHTHEAD VERBOSE MODE ===');
      console.error('Target URL:', url);
      console.error('Output format:', format);
      console.error('Output file:', outputFile || 'stdout');
      console.error('Download mode:', download);
      console.error('Follow redirects:', followRedirects);
      console.error('Max redirects:', maxRedirects);
      console.error('Cookie file:', cookieFile || 'none');
      console.error('Stealth mode:', stealth);
      console.error('Verbose mode: enabled');
    } else {
      console.error('Scraping:', url);
    }
    
    const options: ScrapeOptions = { verbose, followRedirects, cookieFile, maxRedirects, stealth };
    const result = await scrapeUrl(url, options);
    
    if (verbose) {
      console.error('\n=== SCRAPING COMPLETED ===');
      console.error('Result type:', result.type);
      if (result.response) {
        console.error('Final status:', result.response.status, result.response.statusText);
      }
    }
    
    if (result.type === 'html') {
      let output: string;
      
      switch (format) {
        case 'markdown':
        case 'md':
          output = result.markdown;
          break;
        case 'text':
        case 'txt':
          output = result.text;
          break;
        case 'html':
        default:
          output = result.html;
          break;
      }
      
      if (outputFile) {
        fs.writeFileSync(outputFile, output, 'utf8');
        console.error('Saved to:', outputFile);
      } else {
        console.log(output);
      }
      
    } else if (result.type === 'binary') {
      if (download) {
        fs.writeFileSync(result.filename, result.buffer);
        console.error('Downloaded:', result.filename);
      } else {
        console.error('Binary file detected. Use --download to save it.');
        console.error('Content-Type:', result.contentType);
        console.error('Size:', result.buffer.length, 'bytes');
      }
    }
    
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}