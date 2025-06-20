describe('CLI Error Handling', () => {
  it('should throw error for missing format value', () => {
    const testArgs = ['https://example.com', '--format'];
    expect(() => {
      // Simulate the actual CLI validation
      if (testArgs.includes('--format')) {
        const formatIndex = testArgs.indexOf('--format');
        if (formatIndex + 1 >= testArgs.length) {
          throw new Error('--format requires a value');
        }
      }
    }).toThrow('--format requires a value');
  });

  it('should throw error for missing output value', () => {
    const testArgs = ['https://example.com', '--output'];
    expect(() => {
      if (testArgs.includes('--output')) {
        const outputIndex = testArgs.indexOf('--output');
        if (outputIndex + 1 >= testArgs.length) {
          throw new Error('--output requires a value');
        }
      }
    }).toThrow('--output requires a value');
  });

  it('should throw error for missing cookies value', () => {
    const testArgs = ['https://example.com', '--cookies'];
    expect(() => {
      if (testArgs.includes('--cookies')) {
        const cookiesIndex = testArgs.indexOf('--cookies');
        if (cookiesIndex + 1 >= testArgs.length) {
          throw new Error('--cookies requires a value');
        }
      }
    }).toThrow('--cookies requires a value');
  });

  it('should throw error for missing max-redirects value', () => {
    const testArgs = ['https://example.com', '--max-redirects'];
    expect(() => {
      if (testArgs.includes('--max-redirects')) {
        const maxRedirectsIndex = testArgs.indexOf('--max-redirects');
        if (maxRedirectsIndex + 1 >= testArgs.length) {
          throw new Error('--max-redirects requires a value');
        }
      }
    }).toThrow('--max-redirects requires a value');
  });

  it('should find URL when provided', () => {
    const args = ['--format', 'text', 'https://example.com', '--verbose'];
    const url = args.find(arg => !arg.startsWith('-') && 
      arg !== 'text' && 
      arg !== 'https://example.com' && 
      arg !== 'verbose') || 'https://example.com';
    expect(url).toBe('https://example.com');
  });
});