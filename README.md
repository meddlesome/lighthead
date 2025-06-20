# Lighthead

Lightweight headless web scraper with minimal resource usage using Playwright. Designed to bypass modern bot detection systems while maintaining optimal performance. Built with TypeScript for enhanced reliability and type safety.

## Features

- **TypeScript**: Full TypeScript implementation with type safety and comprehensive testing
- **Lightweight**: Uses `playwright-core` for minimal footprint
- **Multiple Output Formats**: HTML, Markdown, and plain text
- **Binary File Support**: Download PDFs, images, and other files
- **Bot Detection Evasion**: Built-in stealth mode to bypass Akamai and similar protections
- **Redirect Handling**: Automatic redirect following with detailed tracking
- **Cookie Management**: Persistent cookie storage and session management
- **Verbose Debugging**: Detailed HTTP request/response logging
- **Headless Operation**: Optimized for low-resource servers
- **Comprehensive Testing**: Unit tests with Jest and coverage reporting

## Installation

```bash
npm install
npx playwright install chromium
npm run build  # Compile TypeScript to JavaScript
```

## Usage

### Basic Usage
```bash
# Basic HTML scraping
npm start -- https://example.com

# Output as Markdown
npm start -- https://example.com --format markdown

# Save to file
npm start -- https://example.com --format text --output content.txt

# Download binary files
npm start -- https://example.com/document.pdf --download
```

### Development Usage
```bash
# Run directly from TypeScript (development)
npm run dev https://example.com

# Or use the compiled version
node dist/index.js https://example.com
```

### Advanced Features
```bash
# Verbose mode (shows HTTP details)
npm start -- -v https://example.com

# Use persistent cookies
npm start -- https://example.com --cookies session.json

# Disable redirect following
npm start -- https://example.com --no-redirects

# Disable stealth mode
npm start -- https://example.com --no-stealth

# Combine multiple options
npm start -- -v https://protected-site.com --format markdown --cookies auth.json
```

### Command Line Options
```
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
```

## Bot Detection Evasion

Lighthead includes advanced stealth capabilities to bypass modern bot detection systems:

- **Browser Fingerprinting**: Realistic Chrome user agent and headers
- **JavaScript Modification**: Hides automation indicators (`navigator.webdriver`)
- **Human-like Behavior**: Random mouse movements, scrolling, and delays
- **Proper Headers**: Sec-Fetch headers matching real browsers
- **Viewport Simulation**: Realistic screen resolution and device properties

Successfully tested against:
- Akamai Bot Manager
- Cloudflare Bot Management
- Other common protection systems

## Output Formats

- `html` - Raw HTML content (default)
- `markdown` - Converted to Markdown format with proper formatting
- `text` - Plain text content only

## Advanced Features

### Cookie Management
```bash
# Save cookies for future requests
npm start -- https://login-site.com --cookies session.json

# Use saved cookies
npm start -- https://protected-area.com --cookies session.json
```

### Redirect Handling
```bash
# Follow redirects (default behavior)
npm start -- https://short.url/redirect

# Don't follow redirects
npm start -- https://short.url/redirect --no-redirects

# Limit redirect depth
npm start -- https://site.com --max-redirects 3
```

### Verbose Debugging
The verbose mode (`-v`) provides detailed information about:
- Browser launch process
- HTTP request headers and method
- Response status and headers
- Redirect chain tracking
- Content processing steps
- Cookie operations

## Performance Optimizations

- Uses `playwright-core` instead of full Playwright package
- Optimized browser launch arguments for minimal resource usage
- Automatic browser cleanup and memory management
- Efficient HTML to Markdown conversion without external dependencies
- Network idle detection for faster scraping
- Configurable timeouts and wait conditions

## Binary File Handling

When scraping binary files (PDFs, images, etc.), use the `--download` flag to save them locally. Without this flag, the tool will show file information instead of downloading.

```bash
# Download a PDF file
npm start -- https://example.com/document.pdf --download

# Get binary file info without downloading
npm start -- https://example.com/image.jpg
```

## Use Cases

- **Web Scraping**: Extract content from websites with bot protection
- **Content Migration**: Convert web pages to markdown for documentation
- **Monitoring**: Check website content changes with cookie persistence
- **Data Extraction**: Scrape protected sites that require session management
- **Testing**: Validate website behavior under different conditions

## Development

### Building and Testing

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Type checking without compilation
npm run lint

# Development mode (TypeScript directly)
npm run dev https://example.com
```

### Project Structure

```
lighthead/
├── index.ts              # Main TypeScript source file
├── dist/                 # Compiled JavaScript output
├── tests/                # Comprehensive test suite
│   ├── htmlToMarkdown.test.ts
│   ├── getFileExtension.test.ts
│   ├── cli.test.ts
│   └── scrapeUrl.test.ts
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest testing configuration
└── package.json          # Dependencies and scripts
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Build and run the compiled version
- `npm run dev` - Run directly from TypeScript source
- `npm test` - Run the test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - CI-friendly test execution
- `npm run lint` - Type check without compilation

### Testing

The project includes comprehensive unit tests covering:
- HTML to Markdown conversion (20+ test cases)
- File extension detection (20+ test cases)
- CLI argument parsing (25+ test cases)
- Error handling and edge cases
- Type safety validation

Coverage reports are generated in the `coverage/` directory.