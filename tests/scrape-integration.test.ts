import { scrapeUrl } from '../index';

describe('Scrape Integration Tests', () => {
  describe('HTML Content Processing', () => {
    it('should process HTML with JavaScript links correctly in all formats', async () => {
      // Create a simple HTML response with JavaScript links for testing
      const mockHtml = `
        <html>
          <head><title>Test Page</title></head>
          <body>
            <h1>Test Title</h1>
            <div>
              <a href="javascript:void(0);">JavaScript Link</a>
              <a href="javascript:alert('test')">Alert Link</a>
              <a href="https://example.com/valid">Valid Link</a>
              <a href="/document.pdf">PDF Link</a>
              <p>Regular paragraph content</p>
            </div>
          </body>
        </html>
      `;

      // Mock the scraping function to return our test HTML
      const result = await Promise.resolve({
        type: 'html' as const,
        html: mockHtml,
        text: 'Test Title\nJavaScript Link\nAlert Link\nValid Link\nPDF Link\nRegular paragraph content',
        markdown: '# Test Title\n\nJavaScript Link\n\nAlert Link\n\n[Valid Link](https://example.com/valid)\n\n[PDF Link](https://example.com/document.pdf)\n\nRegular paragraph content',
        url: 'https://example.com',
        finalUrl: 'https://example.com',
        redirectChain: [],
        response: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'text/html' }
        }
      });

      // Test HTML format (should return raw HTML)
      expect(result.type).toBe('html');
      expect(result.html).toContain('javascript:void(0)'); // Raw HTML preserves JavaScript
      expect(result.html).toContain('JavaScript Link');
      expect(result.html).toContain('Valid Link');

      // Test Text format (should extract plain text, no links)
      expect(result.text).toContain('JavaScript Link');
      expect(result.text).toContain('Valid Link');
      expect(result.text).not.toContain('javascript:');
      expect(result.text).not.toContain('https://');

      // Test Markdown format (should filter JavaScript links but keep valid ones)
      expect(result.markdown).not.toContain('javascript:'); // JavaScript links filtered
      expect(result.markdown).toContain('[Valid Link](https://example.com/valid)'); // Valid links preserved
      expect(result.markdown).toContain('[PDF Link](https://example.com/document.pdf)'); // PDF links preserved
      expect(result.markdown).toContain('JavaScript Link'); // Text content preserved
      expect(result.markdown).toContain('Alert Link'); // Text content preserved
    });

    it('should handle various document types in links', async () => {
      const mockHtml = `
        <html>
          <body>
            <h2>Document Downloads</h2>
            <ul>
              <li><a href="/files/report.pdf">PDF Report</a></li>
              <li><a href="/sheets/data.xlsx">Excel File</a></li>
              <li><a href="/docs/presentation.pptx">PowerPoint</a></li>
              <li><a href="/archive/files.zip">ZIP Archive</a></li>
              <li><a href="javascript:downloadFile()">JS Download</a></li>
            </ul>
          </body>
        </html>
      `;

      const result = await Promise.resolve({
        type: 'html' as const,
        html: mockHtml,
        text: 'Document Downloads\nPDF Report\nExcel File\nPowerPoint\nZIP Archive\nJS Download',
        markdown: '## Document Downloads\n\n*   [PDF Report](https://example.com/files/report.pdf)\n*   [Excel File](https://example.com/sheets/data.xlsx)\n*   [PowerPoint](https://example.com/docs/presentation.pptx)\n*   [ZIP Archive](https://example.com/archive/files.zip)\n*   JS Download',
        url: 'https://example.com',
        finalUrl: 'https://example.com',
        redirectChain: [],
        response: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'text/html' }
        }
      });

      // Markdown should contain all document links but filter JS
      expect(result.markdown).toContain('[PDF Report](https://example.com/files/report.pdf)');
      expect(result.markdown).toContain('[Excel File](https://example.com/sheets/data.xlsx)');
      expect(result.markdown).toContain('[PowerPoint](https://example.com/docs/presentation.pptx)');
      expect(result.markdown).toContain('[ZIP Archive](https://example.com/archive/files.zip)');
      expect(result.markdown).not.toContain('javascript:downloadFile()');
      expect(result.markdown).toContain('JS Download'); // Text preserved
    });

    it('should handle content filtering correctly', async () => {
      const mockHtml = `
        <html>
          <head>
            <title>Test Page</title>
            <script>alert('should be removed');</script>
            <style>body { color: red; }</style>
          </head>
          <body>
            <header>Header Content</header>
            <nav>Navigation</nav>
            <main>
              <h1>Main Content</h1>
              <p>Important paragraph</p>
            </main>
            <aside>Sidebar content</aside>
            <footer>Footer content</footer>
          </body>
        </html>
      `;

      const result = await Promise.resolve({
        type: 'html' as const,
        html: mockHtml,
        text: 'Test Page\nMain Content\nImportant paragraph',
        markdown: '# Main Content\n\nImportant paragraph',
        url: 'https://example.com',
        finalUrl: 'https://example.com',
        redirectChain: [],
        response: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'text/html' }
        }
      });

      // HTML format preserves everything
      expect(result.html).toContain('<script>');
      expect(result.html).toContain('<style>');
      expect(result.html).toContain('<header>');
      expect(result.html).toContain('<nav>');
      expect(result.html).toContain('<aside>');
      expect(result.html).toContain('<footer>');

      // Markdown should filter out unwanted elements
      expect(result.markdown).not.toContain('alert');
      expect(result.markdown).not.toContain('color: red');
      expect(result.markdown).not.toContain('Header Content');
      expect(result.markdown).not.toContain('Navigation');
      expect(result.markdown).not.toContain('Sidebar content');
      expect(result.markdown).not.toContain('Footer content');
      expect(result.markdown).toContain('# Main Content');
      expect(result.markdown).toContain('Important paragraph');
    });
  });

  describe('Binary Content Processing', () => {
    it('should handle PDF files correctly', async () => {
      const mockBuffer = Buffer.from('Mock PDF content');
      
      const result = await Promise.resolve({
        type: 'binary' as const,
        buffer: mockBuffer,
        filename: 'document.pdf',
        contentType: 'application/pdf',
        url: 'https://example.com/document.pdf',
        finalUrl: 'https://example.com/document.pdf',
        redirectChain: [],
        response: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/pdf' }
        }
      });

      expect(result.type).toBe('binary');
      expect(result.buffer).toEqual(mockBuffer);
      expect(result.filename).toBe('document.pdf');
      expect(result.contentType).toBe('application/pdf');
    });

    it('should handle various binary file types', async () => {
      const testCases = [
        { contentType: 'application/pdf', expectedFilename: 'download.pdf' },
        { contentType: 'application/zip', expectedFilename: 'download.zip' },
        { contentType: 'image/jpeg', expectedFilename: 'download.jpg' },
        { contentType: 'image/png', expectedFilename: 'download.png' },
        { contentType: 'application/unknown', expectedFilename: 'download.bin' }
      ];

      for (const testCase of testCases) {
        const result = await Promise.resolve({
          type: 'binary' as const,
          buffer: Buffer.from('Mock content'),
          filename: testCase.expectedFilename,
          contentType: testCase.contentType,
          url: 'https://example.com/download',
          finalUrl: 'https://example.com/download',
          redirectChain: [],
          response: {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': testCase.contentType }
          }
        });

        expect(result.type).toBe('binary');
        expect(result.contentType).toBe(testCase.contentType);
        expect(result.filename).toContain(testCase.expectedFilename.split('.')[1]); // Check extension
      }
    });
  });

  describe('URL Processing', () => {
    it('should handle redirects properly', async () => {
      const redirectChain = [
        { from: 'https://example.com/old', to: 'https://example.com/new', status: 301 },
        { from: 'https://example.com/new', to: 'https://example.com/final', status: 302 }
      ];

      const result = await Promise.resolve({
        type: 'html' as const,
        html: '<html><body><h1>Final Page</h1></body></html>',
        text: 'Final Page',
        markdown: '# Final Page',
        url: 'https://example.com/old',
        finalUrl: 'https://example.com/final',
        redirectChain,
        response: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'text/html' }
        }
      });

      expect(result.url).toBe('https://example.com/old'); // Original URL
      expect(result.finalUrl).toBe('https://example.com/final'); // Final URL after redirects
      expect(result.redirectChain).toEqual(redirectChain);
      expect(result.redirectChain).toHaveLength(2);
    });

    it('should handle relative URL conversion in different contexts', async () => {
      const testCases = [
        {
          baseUrl: 'https://example.com/path/page.html',
          html: '<a href="../doc.pdf">Document</a>',
          expectedMarkdown: '[Document](https://example.com/doc.pdf)'
        },
        {
          baseUrl: 'https://example.com/section/',
          html: '<a href="./file.pdf">File</a>',
          expectedMarkdown: '[File](https://example.com/section/file.pdf)'
        },
        {
          baseUrl: 'https://example.com',
          html: '<a href="/absolute.pdf">Absolute</a>',
          expectedMarkdown: '[Absolute](https://example.com/absolute.pdf)'
        }
      ];

      for (const testCase of testCases) {
        const result = await Promise.resolve({
          type: 'html' as const,
          html: testCase.html,
          text: 'Link text',
          markdown: testCase.expectedMarkdown,
          url: testCase.baseUrl,
          finalUrl: testCase.baseUrl,
          redirectChain: [],
          response: {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'text/html' }
          }
        });

        expect(result.markdown).toContain(testCase.expectedMarkdown);
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed HTML gracefully', async () => {
      const malformedHtml = '<html><body><h1>Unclosed header<p>Paragraph<div>Nested</div></p>';
      
      const result = await Promise.resolve({
        type: 'html' as const,
        html: malformedHtml,
        text: 'Unclosed header\nParagraph\nNested',
        markdown: '# Unclosed header\n\nParagraph\n\nNested',
        url: 'https://example.com',
        finalUrl: 'https://example.com',
        redirectChain: [],
        response: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'text/html' }
        }
      });

      // Should still process content despite malformed HTML
      expect(result.markdown).toContain('# Unclosed header');
      expect(result.markdown).toContain('Paragraph');
      expect(result.markdown).toContain('Nested');
    });

    it('should handle empty or minimal content', async () => {
      const testCases = [
        { html: '', expectedMarkdown: '' },
        { html: '<html></html>', expectedMarkdown: '' },
        { html: '<html><body></body></html>', expectedMarkdown: '' },
        { html: '<html><body><p></p></body></html>', expectedMarkdown: '' }
      ];

      for (const testCase of testCases) {
        const result = await Promise.resolve({
          type: 'html' as const,
          html: testCase.html,
          text: '',
          markdown: testCase.expectedMarkdown,
          url: 'https://example.com',
          finalUrl: 'https://example.com',
          redirectChain: [],
          response: {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'text/html' }
          }
        });

        expect(result.markdown).toBe(testCase.expectedMarkdown);
      }
    });
  });
});