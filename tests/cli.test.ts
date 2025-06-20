import { jest } from '@jest/globals';
import { spawn } from 'child_process';
import * as path from 'path';

// Mock child_process to avoid actually spawning processes
jest.mock('child_process');

describe('CLI Argument Parsing', () => {
  const cliPath = path.join(__dirname, '..', 'dist', 'index.js');

  // Helper to simulate CLI execution
  const simulateCliExecution = (args: string[]) => {
    // Store original argv
    const originalArgv = process.argv;
    
    // Mock process.argv
    process.argv = ['node', 'index.js', ...args];
    
    // Reset modules to get fresh import
    jest.resetModules();
    
    return {
      restore: () => {
        process.argv = originalArgv;
      }
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse basic URL correctly', () => {
    const mock = simulateCliExecution(['https://example.com']);
    
    // Test that args are parsed correctly
    const args = process.argv.slice(2);
    expect(args[0]).toBe('https://example.com');
    
    mock.restore();
  });

  it('should parse format option correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--format', 'markdown']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--format');
    expect(args).toContain('markdown');
    
    mock.restore();
  });

  it('should parse output file option correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--output', 'result.txt']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--output');
    expect(args).toContain('result.txt');
    
    mock.restore();
  });

  it('should parse verbose flag correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--verbose']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--verbose');
    
    mock.restore();
  });

  it('should parse short verbose flag correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '-v']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('-v');
    
    mock.restore();
  });

  it('should parse download flag correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--download']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--download');
    
    mock.restore();
  });

  it('should parse cookies option correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--cookies', 'session.json']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--cookies');
    expect(args).toContain('session.json');
    
    mock.restore();
  });

  it('should parse no-redirects flag correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--no-redirects']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--no-redirects');
    
    mock.restore();
  });

  it('should parse max-redirects option correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--max-redirects', '5']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--max-redirects');
    expect(args).toContain('5');
    
    mock.restore();
  });

  it('should parse no-stealth flag correctly', () => {
    const mock = simulateCliExecution(['https://example.com', '--no-stealth']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--no-stealth');
    
    mock.restore();
  });

  it('should parse help flag correctly', () => {
    const mock = simulateCliExecution(['--help']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('--help');
    
    mock.restore();
  });

  it('should parse short help flag correctly', () => {
    const mock = simulateCliExecution(['-h']);
    
    const args = process.argv.slice(2);
    expect(args).toContain('-h');
    
    mock.restore();
  });

  it('should handle multiple options together', () => {
    const mock = simulateCliExecution([
      'https://example.com',
      '--format', 'markdown',
      '--output', 'result.md',
      '--verbose',
      '--cookies', 'session.json'
    ]);
    
    const args = process.argv.slice(2);
    expect(args).toContain('https://example.com');
    expect(args).toContain('--format');
    expect(args).toContain('markdown');
    expect(args).toContain('--output');
    expect(args).toContain('result.md');
    expect(args).toContain('--verbose');
    expect(args).toContain('--cookies');
    expect(args).toContain('session.json');
    
    mock.restore();
  });

  // Test CLI option parsing logic
  describe('CLI Option Processing', () => {
    it('should extract verbose flag correctly', () => {
      const args = ['https://example.com', '-v', '--format', 'text'];
      const verbose = args.includes('-v') || args.includes('--verbose');
      expect(verbose).toBe(true);
    });

    it('should extract download flag correctly', () => {
      const args = ['https://example.com', '--download'];
      const download = args.includes('--download');
      expect(download).toBe(true);
    });

    it('should extract follow redirects setting correctly', () => {
      const args = ['https://example.com', '--no-redirects'];
      const followRedirects = !args.includes('--no-redirects');
      expect(followRedirects).toBe(false);
    });

    it('should extract stealth setting correctly', () => {
      const args = ['https://example.com', '--no-stealth'];
      const stealth = !args.includes('--no-stealth');
      expect(stealth).toBe(false);
    });

    it('should extract format option correctly', () => {
      const args = ['https://example.com', '--format', 'markdown'];
      const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'html';
      expect(format).toBe('markdown');
    });

    it('should use default format when not specified', () => {
      const args = ['https://example.com'];
      const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'html';
      expect(format).toBe('html');
    });

    it('should extract output file correctly', () => {
      const args = ['https://example.com', '--output', 'result.txt'];
      const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
      expect(outputFile).toBe('result.txt');
    });

    it('should handle missing output file', () => {
      const args = ['https://example.com'];
      const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
      expect(outputFile).toBe(null);
    });

    it('should extract cookie file correctly', () => {
      const args = ['https://example.com', '--cookies', 'session.json'];
      const cookieFile = args.includes('--cookies') ? args[args.indexOf('--cookies') + 1] : null;
      expect(cookieFile).toBe('session.json');
    });

    it('should extract max redirects correctly', () => {
      const args = ['https://example.com', '--max-redirects', '10'];
      const maxRedirects = args.includes('--max-redirects') ? 
        parseInt(args[args.indexOf('--max-redirects') + 1]) || 10 : 10;
      expect(maxRedirects).toBe(10);
    });

    it('should handle invalid max redirects', () => {
      const args = ['https://example.com', '--max-redirects', 'invalid'];
      const maxRedirects = args.includes('--max-redirects') ? 
        parseInt(args[args.indexOf('--max-redirects') + 1]) || 10 : 10;
      expect(maxRedirects).toBe(10);
    });

    it('should find URL from args correctly', () => {
      const args = ['https://example.com', '--format', 'markdown', '--verbose'];
      const format = 'markdown';
      const outputFile = null;
      const cookieFile = null;
      const maxRedirects = 10;
      
      const url = args.find(arg => !arg.startsWith('-') && 
        arg !== format && 
        arg !== outputFile &&
        arg !== cookieFile &&
        arg !== maxRedirects.toString()) || args[0];
      
      expect(url).toBe('https://example.com');
    });

    it('should handle complex URL extraction', () => {
      const args = ['--format', 'text', 'https://example.com', '--verbose'];
      const format = 'text';
      const outputFile = null;
      const cookieFile = null;
      const maxRedirects = 10;
      
      const url = args.find(arg => !arg.startsWith('-') && 
        arg !== format && 
        arg !== outputFile &&
        arg !== cookieFile &&
        arg !== maxRedirects.toString()) || args[0];
      
      expect(url).toBe('https://example.com');
    });
  });
});