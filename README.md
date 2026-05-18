# LinkedIn Assistant

AI-powered browser extension to enhance LinkedIn productivity.

## Features (Phase 1)

- ✨ Generate posts from ideas
- 🚀 Improve existing posts
- 💬 Respond to comments intelligently
- 📄 Generate CVs from LinkedIn profile
- 🎯 Adapt CVs to job postings

## Tech Stack

- TypeScript
- Webpack
- Manifest V3
- Chrome/Firefox/Edge compatible

## Development

### Prerequisites

- Node.js 18+
- npm
- Chrome/Firefox browser

### Setup

```bash
# Install dependencies
npm install

# Development build (with watch)
npm run dev

# Production build
npm run build:chrome  # For Chrome/Edge
npm run build:firefox # For Firefox
```

### Load Extension

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `dist/chrome/` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `dist/firefox/manifest.json`

## Testing

See [Testing Guide](docs/superpowers/specs/2026-05-15-linkedin-assistant-design.md#testing-guide) for detailed testing instructions.

## Project Structure

```
src/
├── background/     # Service worker
├── content/        # Content scripts
├── popup/          # Extension popup
├── options/        # Settings page
└── shared/         # Shared utilities
```

## Documentation

- [Design Specification](docs/superpowers/specs/2026-05-15-linkedin-assistant-design.md)

## Contributing

See GitHub issues for planned features and tasks.

## License

MIT
