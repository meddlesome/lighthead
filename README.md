# 🚀 Lighthead

A lightweight, TypeScript-powered headless web scraper that bypasses modern bot detection while maintaining minimal resource usage. Perfect for data extraction, content migration, and automated testing.

## ✨ Key Features

- **🛡️ Bot Detection Evasion** - Bypass Akamai, Cloudflare, and other protection systems
- **⚡ High Performance** - Minimal footprint using `playwright-core`
- **📝 Multiple Formats** - Output as HTML, Markdown, or plain text
- **📁 Binary Support** - Download PDFs, images, and other files
- **🔗 Smart Redirects** - Automatic redirect following with tracking
- **🍪 Session Management** - Persistent cookie storage
- **🔍 Verbose Debugging** - Detailed HTTP request/response logging
- **🌐 REST API** - Built-in Express server for integration
- **📊 TypeScript** - Full type safety with comprehensive testing

## 🚀 Quick Start

```bash
# Install and setup
npm install
npx playwright install chromium

# Basic scraping
npm start -- https://example.com

# Advanced usage with stealth mode
npm start -- -v https://protected-site.com --format markdown --cookies auth.json
```

## 💻 CLI Usage

### CLI Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `<url>` | string | **required** | Target URL to scrape |
| `--format <format>` | string | `html` | Output format: `html`, `markdown`, `text` |
| `--output <file>` | string | `stdout` | Save output to file instead of stdout |
| `--download` | flag | `false` | Download binary files (PDFs, images, etc.) |
| `--cookies <file>` | string | `none` | Load/save cookies from/to JSON file |
| `--no-redirects` | flag | `false` | Don't follow HTTP redirects (default: follow) |
| `--max-redirects <n>` | number | `10` | Maximum number of redirects to follow |
| `--no-stealth` | flag | `false` | Disable stealth mode (default: enabled) |
| `-v, --verbose` | flag | `false` | Enable verbose mode (show HTTP details) |
| `-h, --help` | flag | - | Show help message and exit |

### CLI Examples

```bash
# Output formats
npm start -- https://example.com --format markdown
npm start -- https://example.com --format text --output content.txt

# Binary file downloads
npm start -- https://example.com/document.pdf --download

# Session management
npm start -- https://example.com --cookies session.json

# Debugging and options
npm start -- -v https://example.com --no-redirects --max-redirects 5
```

## 🛡️ Bot Detection Evasion

Lighthead bypasses modern protection systems through:

- **Browser Fingerprinting** - Realistic Chrome user agent and headers
- **JavaScript Stealth** - Hides automation indicators
- **Human Behavior** - Random mouse movements and delays
- **Proper Headers** - Sec-Fetch headers matching real browsers

✅ **Tested Against:** Akamai Bot Manager, Cloudflare Bot Management, and more

## 🌐 REST API

Start the built-in server for easy integration:

```bash
# Production server
npm run server

# Development server (with auto-reload)
npm run server:dev

# Configure (optional)
cp .env.example .env
```

### Quick API Examples

```bash
# Basic scraping (returns markdown by default)
curl "http://localhost:3005/scrape?url=https://example.com"

# Get specific formats
curl "http://localhost:3005/scrape?url=https://example.com&format=html"
curl "http://localhost:3005/scrape?url=https://example.com&format=text"

# Download PDF as binary
curl "http://localhost:3005/scrape?url=https://example.com/doc.pdf&format=binary" -o doc.pdf
```

### API Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | **required** | Target URL to scrape |
| `format` | string | `markdown` | Output format: `html`, `markdown`, `text`, `binary` |
| `followRedirects` | boolean | `true` | Follow HTTP redirects automatically (`true`/`false`) |
| `maxRedirects` | number | `10` | Maximum number of redirects to follow |
| `stealth` | boolean | `true` | Enable bot detection evasion (`true`/`false`) |

**Authentication (optional):**
- Add `X-API-Key` header or `apiKey` query parameter if `API_KEY` is set in environment

### API Response Formats

**Supported formats:** `html`, `markdown`, `text`, `binary`

- **Default:** `markdown` (changed from `json` for better usability)
- **All responses:** JSON format with content in the `output` field
- **Binary files:** Direct download when `format=binary`, metadata when no format specified

## 🎯 Use Cases

- **Web Scraping** - Extract content from protected websites
- **Content Migration** - Convert web pages to markdown
- **Monitoring** - Track website changes with session persistence
- **API Integration** - Use as a microservice in larger applications
- **Testing** - Validate website behavior under different conditions

## 🔧 Development

```bash
# Setup
npm install
npm run build

# Development
npm run dev https://example.com
npm run server:dev  # API development server

# Testing
npm test              # Unit tests only
npm run test:integration  # Integration tests only  
npm run test:all      # All tests including integration
npm run test:coverage # Coverage report
npm run test:watch    # Watch mode for development
npm run lint          # TypeScript type checking
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm test` and `npm run lint`
5. Submit a pull request

---

⭐ **Star this repo if you find it useful!**