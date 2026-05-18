# Development Guide - LinkedIn Assistant

## Quick Start

### Initial Setup
```bash
git clone https://github.com/yanethevia-dev/LinkedinAssistant.git
cd LinkedinAssistant
npm install
npm run build:chrome
```

### Load Extension
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `dist/chrome/`
4. Visit LinkedIn.com to test

**See [TESTING.md](TESTING.md) for detailed testing instructions.**

---

## Development Workflow

### Working on a GitHub Issue

Each GitHub Issue represents a small, testable deliverable. Follow this workflow:

#### 1. Start Work on Issue
```bash
# Create feature branch from issue number
git checkout -b issue-N-short-description

# Example for Issue #1
git checkout -b issue-1-storage-service
```

#### 2. Develop
```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# In another terminal, you can run tests, lint, etc.
npm run type-check
```

#### 3. Test Manually
After each change:
1. Go to `chrome://extensions/`
2. Click reload icon on LinkedIn Assistant
3. Refresh LinkedIn page
4. Follow testing steps in the GitHub Issue

#### 4. Verify Build
```bash
# Production build
npm run build:chrome

# Check for errors
npm run lint
npm run type-check
```

#### 5. Commit & Push
```bash
git add -A
git commit -m "Issue #N: Brief description of changes

- Bullet point of what was added
- Another change
- Testing confirmed"

git push origin issue-N-short-description
```

#### 6. Create Pull Request
```bash
gh pr create --title "Issue #N: Feature name" --body "Closes #N

## Changes
- List of changes

## Testing Done
- Manual testing steps completed
- Screenshots (if UI changes)

## Notes
Any important notes"
```

#### 7. Merge & Continue
After PR is merged:
```bash
git checkout main
git pull origin main
# Start next issue
```

---

## Project Structure

```
linkedin-assistant/
├── src/
│   ├── background/          # Service worker (runs in background)
│   │   ├── service-worker.ts
│   │   ├── storage-service.ts    (Issue #1)
│   │   ├── ai-service.ts         (Issue #3)
│   │   └── message-handler.ts    (Issue #7)
│   │
│   ├── content/             # Injected into LinkedIn pages
│   │   ├── linkedin-content.ts   (main entry)
│   │   ├── observers/
│   │   │   └── dom-observer.ts   (Issue #4)
│   │   ├── injectors/
│   │   │   ├── post-composer.ts  (Issue #5)
│   │   │   └── comments.ts       (Issue #9)
│   │   ├── extractors/
│   │   │   └── profile-extractor.ts (Issue #10)
│   │   └── ui/
│   │       ├── modal.ts          (Issue #6)
│   │       └── generate-post-modal.ts (Issue #7)
│   │
│   ├── popup/               # Extension popup (click icon)
│   ├── options/             # Settings page
│   ├── shared/              # Shared code
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── prompts/             # AI prompts
│       └── post-generation.ts    (Issue #7)
│
├── dist/                    # Build output (gitignored)
│   ├── chrome/
│   └── firefox/
│
├── docs/                    # Documentation
│   └── superpowers/specs/   # Design spec
│
├── TESTING.md              # Testing guide
├── DEVELOPMENT.md          # This file
└── README.md               # Project readme
```

---

## Issue Dependency Graph

Issues have dependencies. Work on them in this order:

### Phase 1: Foundation (Can work in parallel)
- **Issue #1** - Storage Service ⭐ START HERE
- **Issue #2** - Options UI (depends on #1)
- **Issue #4** - DOM Observer (independent)
- **Issue #6** - Modal Component (independent)

### Phase 2: AI Integration
- **Issue #3** - AI Service (depends on #2)

### Phase 3: First Feature
- **Issue #5** - Inject Buttons (depends on #4)
- **Issue #7** - Generate Post Feature ⭐ FIRST FULL FEATURE (depends on #3, #5, #6)

### Phase 4: More Features
- **Issue #8** - Improve Post (depends on #7)
- **Issue #9** - Comment Reply (depends on #7)
- **Issue #10** - Profile Extractor (independent, for CV features)

**Recommended Order:**
1. Issue #1 (Storage)
2. Issue #2 (Options UI)
3. Issue #3 (AI Service)
4. Issues #4, #6 in parallel (DOM Observer, Modal)
5. Issue #5 (Inject Buttons)
6. Issue #7 (Generate Post) ← **First testable feature!**
7. Issues #8, #9, #10 in any order

---

## Testing Checklist

Before marking an issue as complete:

- [ ] **Build succeeds:** `npm run build:chrome`
- [ ] **No TypeScript errors:** `npm run type-check`
- [ ] **No lint errors:** `npm run lint`
- [ ] **Manual testing:** Follow steps in GitHub Issue
- [ ] **No console errors:** Check browser console on LinkedIn
- [ ] **No regressions:** Previous features still work

---

## Common Tasks

### Add a new message type
```typescript
// src/shared/constants.ts
export const MessageTypes = {
  PING: 'PING',
  NEW_TYPE: 'NEW_TYPE'  // Add here
} as const;

// src/background/service-worker.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MessageTypes.NEW_TYPE:
      handleNewType(message, sendResponse);
      return true;
  }
});
```

### Add a new TypeScript type
```typescript
// src/shared/types.ts
export interface NewType {
  id: string;
  // fields...
}
```

### Add a new AI prompt
```typescript
// src/prompts/feature-name.ts
export function buildPrompt(input: string): { system: string; user: string } {
  return {
    system: 'System prompt...',
    user: `User prompt with ${input}`
  };
}
```

### Inject a new UI element
```typescript
// src/content/injectors/feature-name.ts
export function injectFeature() {
  const element = document.createElement('button');
  element.textContent = 'Feature';
  element.addEventListener('click', () => {
    // Handle click
  });
  
  // Find target location in LinkedIn DOM
  const target = document.querySelector('.target-selector');
  target?.appendChild(element);
}
```

---

## Debugging

### View Console Logs

**Content Script (runs on LinkedIn page):**
1. F12 on LinkedIn page
2. Console tab
3. Look for `[LinkedIn Assistant]` logs

**Background Worker (runs in background):**
1. Go to `chrome://extensions/`
2. Find LinkedIn Assistant
3. Click "service worker" link
4. Console opens

**Popup (extension icon):**
1. Right-click extension icon
2. "Inspect popup"
3. Console tab

### Common Issues

**Issue:** Buttons don't appear on LinkedIn
- **Check:** Did content script load? (Console logs)
- **Fix:** Reload extension, refresh LinkedIn

**Issue:** Build fails with TypeScript errors
- **Check:** `npm run type-check` for details
- **Fix:** Fix type errors, usually in types.ts

**Issue:** AI generation fails
- **Check:** Background worker console for errors
- **Check:** API key configured? (Options page)
- **Check:** Network tab for API calls

**Issue:** Changes not applying
- **Fix:** 
  1. Stop `npm run dev`
  2. Reload extension in `chrome://extensions/`
  3. Refresh LinkedIn page
  4. Restart `npm run dev`

### Debugging Content Script

```javascript
// In LinkedIn page console
// Check if extension loaded
console.log('Extension:', window.linkedInAssistant);

// Test message to background
chrome.runtime.sendMessage({ type: 'PING' }, console.log);

// Inspect injected elements
document.querySelectorAll('[class*="lia-"]');
```

### Debugging Background Worker

```javascript
// In service worker console (chrome://extensions/)
// Check storage
chrome.storage.local.get(null, console.log);

// Test AI service (after Issue #3)
const result = await aiService.generateContent({
  provider: 'claude',
  prompt: 'test'
});
console.log(result);
```

---

## Code Style

### TypeScript
- Use strict mode
- Explicit types for public APIs
- Infer types for local variables
- Use interfaces for data shapes
- Use const for constants

### Naming
- Files: kebab-case (`storage-service.ts`)
- Classes: PascalCase (`StorageService`)
- Functions: camelCase (`getSettings`)
- Constants: SCREAMING_SNAKE_CASE (`MESSAGE_TYPES`)

### Comments
- Why, not what (code shows what)
- Edge cases and gotchas
- TODOs with issue numbers: `// TODO(#42): description`

### Commits
- Prefix with issue number: `Issue #N: Description`
- Use imperative mood: "Add feature" not "Added feature"
- Include testing notes

---

## Release Process

When ready to release a version:

1. Update version in:
   - `package.json`
   - `src/manifest.json`

2. Create tag:
```bash
git tag v0.2.0
git push origin v0.2.0
```

3. Build for distribution:
```bash
npm run build:chrome
npm run build:firefox
```

4. Zip builds:
```bash
cd dist/chrome && zip -r ../../linkedin-assistant-chrome-v0.2.0.zip . && cd ../..
cd dist/firefox && zip -r ../../linkedin-assistant-firefox-v0.2.0.zip . && cd ../..
```

5. Create GitHub release with zipped builds

---

## Getting Help

- **Design Spec:** See `docs/superpowers/specs/2026-05-15-linkedin-assistant-design.md`
- **Testing Guide:** See `TESTING.md`
- **GitHub Issues:** Each issue has detailed specs and testing steps
- **Stuck?** Comment on the GitHub Issue or open a discussion

---

## Current Status

**✅ v0.1.0** - Initial setup (foundation only, no features)

**Next Milestones:**
- v0.2.0 - Storage + Options + AI Service (Issues #1, #2, #3)
- v0.3.0 - Generate Post feature (Issue #7) ← **First usable feature**
- v0.4.0 - Improve Post + Comment Reply (Issues #8, #9)
- v0.5.0 - CV Generation (Issues #10+)

Track progress in GitHub Issues and Milestones.
