import { getFileExtension } from '../index';

describe('getFileExtension', () => {
  describe('URL extension priority', () => {
    it('should prioritize URL extension over MIME type', () => {
      const url = 'https://example.com/file.pdf';
      const result = getFileExtension(url, 'text/html');
      expect(result).toBe('.pdf');
    });

    it('should fallback to MIME type when URL has no extension', () => {
      const url = 'https://example.com/download';
      const result = getFileExtension(url, 'image/jpeg');
      expect(result).toBe('.jpg');
    });
  });

  describe('MIME type mapping', () => {
    it('should map common MIME types to extensions', () => {
      const testCases = [
        ['image/jpeg', '.jpg'],
        ['image/png', '.png'],
        ['image/gif', '.gif'],
        ['image/webp', '.webp'],
        ['application/pdf', '.pdf'],
        ['application/zip', '.zip'],
        ['text/plain', '.txt'],
        ['application/json', '.json']
      ];

      testCases.forEach(([mimeType, expectedExt]) => {
        const result = getFileExtension('https://example.com/file', mimeType);
        expect(result).toBe(expectedExt);
      });
    });
  });

  describe('fallback behavior', () => {
    it('should return .bin for unknown MIME types and empty content type', () => {
      const testCases = [
        ['application/unknown'],
        [''],
        ['invalid/type']
      ];

      testCases.forEach(([contentType]) => {
        const result = getFileExtension('https://example.com/file', contentType);
        expect(result).toBe('.bin');
      });
    });
  });

  describe('URL parsing edge cases', () => {
    it('should handle complex URL structures', () => {
      const testCases = [
        ['https://example.com/file.jpg?v=123&size=large', '.jpg'],
        ['https://example.com/document.pdf#page=1', '.pdf'],
        ['https://example.com/FILE.PDF', '.pdf'], // case insensitive
        ['https://example.com/path/to/nested/file.txt', '.txt'],
        ['https://example.com/file.backup.txt', '.txt'], // multiple dots
        ['https://example.com:8080/file.json', '.json'], // with port
        ['http://localhost:3000/api/data.xml', '.xml'], // localhost
        ['http://192.168.1.1/config.cfg', '.cfg'] // IP address
      ];

      testCases.forEach(([url, expectedExt]) => {
        const result = getFileExtension(url, 'text/plain');
        expect(result).toBe(expectedExt);
      });
    });

    it('should return .bin for URLs without extensions', () => {
      const result = getFileExtension('https://example.com/folder/', 'text/html');
      expect(result).toBe('.bin');
    });
  });
});