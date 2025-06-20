import { getFileExtension } from '../index';

describe('getFileExtension', () => {
  it('should return extension from URL path', () => {
    const url = 'https://example.com/file.pdf';
    const result = getFileExtension(url, 'application/pdf');
    expect(result).toBe('.pdf');
  });

  it('should return extension from URL path ignoring content type', () => {
    const url = 'https://example.com/document.docx';
    const result = getFileExtension(url, 'application/octet-stream');
    expect(result).toBe('.docx');
  });

  it('should return extension based on MIME type when URL has no extension', () => {
    const url = 'https://example.com/download';
    const result = getFileExtension(url, 'image/jpeg');
    expect(result).toBe('.jpg');
  });

  it('should handle PNG MIME type', () => {
    const url = 'https://example.com/image';
    const result = getFileExtension(url, 'image/png');
    expect(result).toBe('.png');
  });

  it('should handle GIF MIME type', () => {
    const url = 'https://example.com/animation';
    const result = getFileExtension(url, 'image/gif');
    expect(result).toBe('.gif');
  });

  it('should handle WebP MIME type', () => {
    const url = 'https://example.com/modern-image';
    const result = getFileExtension(url, 'image/webp');
    expect(result).toBe('.webp');
  });

  it('should handle PDF MIME type', () => {
    const url = 'https://example.com/document';
    const result = getFileExtension(url, 'application/pdf');
    expect(result).toBe('.pdf');
  });

  it('should handle ZIP MIME type', () => {
    const url = 'https://example.com/archive';
    const result = getFileExtension(url, 'application/zip');
    expect(result).toBe('.zip');
  });

  it('should handle plain text MIME type', () => {
    const url = 'https://example.com/file';
    const result = getFileExtension(url, 'text/plain');
    expect(result).toBe('.txt');
  });

  it('should handle JSON MIME type', () => {
    const url = 'https://example.com/data';
    const result = getFileExtension(url, 'application/json');
    expect(result).toBe('.json');
  });

  it('should return .bin for unknown MIME types', () => {
    const url = 'https://example.com/mystery';
    const result = getFileExtension(url, 'application/unknown');
    expect(result).toBe('.bin');
  });

  it('should return .bin for empty content type', () => {
    const url = 'https://example.com/file';
    const result = getFileExtension(url, '');
    expect(result).toBe('.bin');
  });

  it('should handle URLs with query parameters', () => {
    const url = 'https://example.com/file.jpg?v=123&size=large';
    const result = getFileExtension(url, 'image/png');
    expect(result).toBe('.jpg');
  });

  it('should handle URLs with fragments', () => {
    const url = 'https://example.com/document.pdf#page=1';
    const result = getFileExtension(url, 'text/html');
    expect(result).toBe('.pdf');
  });

  it('should handle case-insensitive extensions', () => {
    const url = 'https://example.com/FILE.PDF';
    const result = getFileExtension(url, 'text/html');
    expect(result).toBe('.pdf');
  });

  it('should handle nested paths', () => {
    const url = 'https://example.com/path/to/nested/file.txt';
    const result = getFileExtension(url, 'application/octet-stream');
    expect(result).toBe('.txt');
  });

  it('should handle URLs ending with slash', () => {
    const url = 'https://example.com/folder/';
    const result = getFileExtension(url, 'text/html');
    expect(result).toBe('.bin');
  });

  it('should handle multiple dots in filename', () => {
    const url = 'https://example.com/file.backup.txt';
    const result = getFileExtension(url, 'application/pdf');
    expect(result).toBe('.txt');
  });

  it('should handle URLs with port numbers', () => {
    const url = 'https://example.com:8080/file.json';
    const result = getFileExtension(url, 'text/plain');
    expect(result).toBe('.json');
  });

  it('should handle localhost URLs', () => {
    const url = 'http://localhost:3000/api/data.xml';
    const result = getFileExtension(url, 'application/json');
    expect(result).toBe('.xml');
  });

  it('should handle IP address URLs', () => {
    const url = 'http://192.168.1.1/config.cfg';
    const result = getFileExtension(url, 'text/plain');
    expect(result).toBe('.cfg');
  });
});