# Test Suite

This directory contains comprehensive unit tests for the Lighthead project.

## Test Structure

- **`htmlToMarkdown.test.ts`** - Tests for HTML to Markdown conversion functionality
- **`getFileExtension.test.ts`** - Tests for file extension detection from URLs and MIME types  
- **`cli.test.ts`** - Tests for command-line argument parsing
- **`scrapeUrl.test.ts`** - Integration test placeholders (requires complex playwright mocking)
- **`setup.ts`** - Global test setup and configuration
- **`mocks/`** - Mock utilities for testing

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

## Coverage

The test suite provides good coverage for:
- ✅ HTML to Markdown conversion (100% function coverage)
- ✅ File extension detection (100% function coverage)
- ✅ CLI argument parsing (100% function coverage)
- ⚠️ Browser automation (requires integration testing setup)

## Notes

Integration tests for the main `scrapeUrl` function require more complex setup with:
- Playwright test infrastructure
- Mock servers or test containers
- Proper browser automation mocking

For production use, consider adding:
- End-to-end tests with real websites
- Performance tests
- Browser compatibility tests
- Error scenario testing