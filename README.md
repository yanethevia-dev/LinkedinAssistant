# LinkedIn Assistant

AI-powered browser extension to enhance LinkedIn productivity.

## Features (Planned)

- ✨ Generate posts from ideas
- 🚀 Improve existing posts
- 💬 Respond to comments intelligently
- 📄 Generate CVs from LinkedIn profile
- 🎯 Adapt CVs to job postings

**Current Status:** v0.1.0 - Foundation only (no features yet)

## Quick Start

### For Users (Testing)

See [TESTING.md](TESTING.md) for detailed installation and testing instructions.

**Quick version:**
```bash
git clone https://github.com/yanethevia-dev/LinkedinAssistant.git
cd LinkedinAssistant
npm install
npm run build:chrome
# Load dist/chrome/ in chrome://extensions/ (Developer mode)
```

### For Developers

See [DEVELOPMENT.md](DEVELOPMENT.md) for full development workflow.

**To start contributing:**
1. Read [DEVELOPMENT.md](DEVELOPMENT.md)
2. Check [GitHub Issues](https://github.com/yanethevia-dev/LinkedinAssistant/issues)
3. Start with Issue #1 (Storage Service)
4. Follow the workflow in DEVELOPMENT.md

## Tech Stack

- **Language:** TypeScript 5.x
- **Build:** Webpack 5.x
- **Extension:** Manifest V3
- **Browsers:** Chrome, Firefox, Edge
- **AI:** Claude, OpenAI, Gemini (user provides API keys)
- **Storage:** IndexedDB (local-first, privacy-focused)

## Project Structure

```
linkedin-assistant/
├── src/
│   ├── background/      # Service worker (AI calls, storage)
│   ├── content/         # Injected into LinkedIn
│   ├── popup/           # Extension popup UI
│   ├── options/         # Settings page
│   ├── shared/          # Shared types and utils
│   └── prompts/         # AI prompt templates
├── docs/                # Documentation
│   └── superpowers/specs/  # Design specification
├── TESTING.md           # Testing guide
├── DEVELOPMENT.md       # Development workflow
└── README.md            # This file
```

## Documentation

- **[Testing Guide](TESTING.md)** - How to test the extension
- **[Development Guide](DEVELOPMENT.md)** - Development workflow and contributing
- **[Design Specification](docs/superpowers/specs/2026-05-15-linkedin-assistant-design.md)** - Complete design document
- **[GitHub Issues](https://github.com/yanethevia-dev/LinkedinAssistant/issues)** - Task breakdown

## Roadmap

### Phase 1: Foundation ✅ DONE (v0.1.0)
- [x] Project setup
- [x] Build system
- [x] Basic extension structure

### Phase 2: Core Infrastructure (v0.2.0)
- [ ] Issue #1: Storage Service
- [ ] Issue #2: Options UI
- [ ] Issue #3: AI Service

### Phase 3: First Feature (v0.3.0)
- [ ] Issue #4: DOM Observer
- [ ] Issue #5: Post Composer Injection
- [ ] Issue #6: Modal Component
- [ ] Issue #7: Generate Post Feature ⭐ **First usable feature**

### Phase 4: More Features (v0.4.0+)
- [ ] Issue #8: Improve Post
- [ ] Issue #9: Comment Reply
- [ ] Issue #10: Profile Extractor
- [ ] CV Generation and Adaptation

## Contributing

We welcome contributions! Here's how to get started:

1. **Read the docs:**
   - [DEVELOPMENT.md](DEVELOPMENT.md) for workflow
   - [Design Spec](docs/superpowers/specs/2026-05-15-linkedin-assistant-design.md) for architecture

2. **Pick an issue:**
   - Check [open issues](https://github.com/yanethevia-dev/LinkedinAssistant/issues)
   - Start with Issue #1 if you're new
   - Comment on the issue to claim it

3. **Follow the workflow:**
   - Create branch: `git checkout -b issue-N-description`
   - Develop and test (see DEVELOPMENT.md)
   - Create PR referencing the issue

4. **Testing:**
   - Manual testing steps are in each GitHub Issue
   - See [TESTING.md](TESTING.md) for general testing guide

## Privacy

- **Local-first:** All data stored locally in your browser
- **No backend:** We don't have servers, can't access your data
- **Your API keys:** You provide your own AI API keys
- **Open source:** Code is public, audit it yourself

## License

MIT

---

**Status:** 🚧 In active development

**Current Version:** v0.1.0 (foundation only)

**Next Milestone:** v0.2.0 (Storage + Options + AI Service)

Follow progress: [GitHub Issues](https://github.com/yanethevia-dev/LinkedinAssistant/issues) | [Milestones](https://github.com/yanethevia-dev/LinkedinAssistant/milestones)
