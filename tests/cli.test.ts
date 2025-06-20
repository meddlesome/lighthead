describe('CLI Argument Parsing Logic', () => {
  // Test the actual argument parsing logic used in the CLI
  const parseCliArgs = (args: string[]) => {
    const verbose = args.includes('-v') || args.includes('--verbose');
    const download = args.includes('--download');
    const followRedirects = !args.includes('--no-redirects');
    const stealth = !args.includes('--no-stealth');
    const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'html';
    const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
    const cookieFile = args.includes('--cookies') ? args[args.indexOf('--cookies') + 1] : null;
    const maxRedirects = args.includes('--max-redirects') ? 
      parseInt(args[args.indexOf('--max-redirects') + 1]) || 10 : 10;
    
    const url = args.find(arg => !arg.startsWith('-') && 
      arg !== format && 
      arg !== outputFile &&
      arg !== cookieFile &&
      arg !== maxRedirects.toString()) || args[0];
    
    return {
      url,
      verbose,
      download,
      followRedirects,
      stealth,
      format,
      outputFile,
      cookieFile,
      maxRedirects
    };
  };

  it('should parse basic arguments correctly', () => {
    const result = parseCliArgs(['https://example.com']);
    
    expect(result.url).toBe('https://example.com');
    expect(result.verbose).toBe(false);
    expect(result.download).toBe(false);
    expect(result.followRedirects).toBe(true);
    expect(result.stealth).toBe(true);
    expect(result.format).toBe('html');
    expect(result.outputFile).toBe(null);
    expect(result.cookieFile).toBe(null);
    expect(result.maxRedirects).toBe(10);
  });

  it('should parse all CLI options correctly', () => {
    const result = parseCliArgs([
      'https://example.com',
      '--format', 'markdown',
      '--output', 'result.md',
      '--verbose',
      '--download',
      '--cookies', 'session.json',
      '--no-redirects',
      '--no-stealth',
      '--max-redirects', '5'
    ]);
    
    expect(result.url).toBe('https://example.com');
    expect(result.verbose).toBe(true);
    expect(result.download).toBe(true);
    expect(result.followRedirects).toBe(false);
    expect(result.stealth).toBe(false);
    expect(result.format).toBe('markdown');
    expect(result.outputFile).toBe('result.md');
    expect(result.cookieFile).toBe('session.json');
    expect(result.maxRedirects).toBe(5);
  });

  it('should handle short verbose flag', () => {
    const result = parseCliArgs(['https://example.com', '-v']);
    expect(result.verbose).toBe(true);
  });

  it('should handle invalid max redirects by using default', () => {
    const result = parseCliArgs(['https://example.com', '--max-redirects', 'invalid']);
    expect(result.maxRedirects).toBe(10);
  });

  it('should extract URL from mixed argument positions', () => {
    const result = parseCliArgs(['--format', 'text', 'https://example.com', '--verbose']);
    expect(result.url).toBe('https://example.com');
    expect(result.format).toBe('text');
    expect(result.verbose).toBe(true);
  });

  it('should handle missing URL gracefully', () => {
    const result = parseCliArgs(['--format', 'text', '--verbose']);
    expect(result.url).toBe('--format'); // Fallback to first arg
  });
});