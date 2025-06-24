# Test Suite

This directory contains comprehensive unit tests for the Lighthead project.

## Test Structure

- **`htmlToMarkdown.test.ts`** - Core tests for Turndown-based HTML to Markdown conversion
- **`htmlToMarkdown.extended.test.ts`** - Extended tests for advanced HTML parsing, document links, and edge cases
- **`getFileExtension.test.ts`** - Tests for file extension detection from URLs and MIME types  
- **`cli.test.ts`** - Tests for command-line argument parsing and error handling
- **`scrapeUrl.test.ts`** - Tests for core scraping functionality with mocked browser
- **`error-handling.test.ts`** - Tests for network errors and edge cases
- **`core-functions.test.ts`** - Tests for validation functions (URL, format, redirects)
- **`server.integration.test.ts`** - Integration tests for REST API server endpoints
- **`setup.ts`** - Global test setup and configuration
- **`mocks/`** - Mock utilities for browser automation testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

## Test Coverage

Current test suite: **118 tests** covering:

### Unit Tests (80 tests)
- ✅ **Turndown HTML to Markdown conversion** - Comprehensive testing of Turndown library integration
- ✅ **URL absolutization** - Relative to absolute URL conversion for links and images  
- ✅ **Document link handling** - PDF, Excel, ZIP and other file format links
- ✅ **Content filtering** - Removal of scripts, styles, navigation elements
- ✅ **Edge cases** - Malformed HTML, special characters, performance stress tests
- ✅ **File extension detection** - MIME type and URL-based file extension logic
- ✅ **CLI argument parsing** - Command-line interface validation and error handling
- ✅ **Core validation functions** - URL, format, and redirect parameter validation
- ✅ **Error handling** - Network failures, timeouts, and malformed inputs

### Integration Tests (18 tests)  
- ✅ **REST API endpoints** - Full server integration with authentication
- ✅ **Content format responses** - HTML, Markdown, Text, and Binary outputs
- ✅ **Error scenarios** - Invalid URLs, unauthorized access, server failures
- ✅ **Health endpoints** - Service monitoring and status checks

## Key Features Tested

- **Turndown Library Integration** - Robust HTML parsing with proper markdown formatting
- **Generic URL Resolution** - Domain-agnostic absolute URL conversion without hardcoding
- **Document Link Extraction** - Comprehensive testing for various file formats and URL patterns
- **Performance** - Stress testing with large documents and many links
- **Security** - Content filtering and safe HTML processing

## Notes

The test strategy focuses on:
- **Quality over quantity** - Strategic testing of core functionality
- **Real-world scenarios** - Document scraping, link extraction, and content filtering
- **Turndown behavior validation** - Ensuring proper markdown output formatting
- **No domain-specific logic** - Tests avoid any references to specific websites or services