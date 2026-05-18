# Issue #1 Testing Guide - Storage Service

## What Was Implemented

- ✅ `StorageService` class with full CRUD operations
- ✅ Default settings structure with all planned fields
- ✅ Integration with service worker
- ✅ Settings persistence in chrome.storage.local
- ✅ Backwards compatibility (merging with defaults)
- ✅ Updated popup to show configuration status

## How to Test

### 1. Load the Extension

```bash
# Make sure you're on the branch
git checkout issue-1-storage-service

# Build
npm run build:chrome

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Click reload icon on LinkedIn Assistant (if already loaded)
#    OR "Load unpacked" and select dist/chrome/
```

### 2. Test Basic Functionality

#### Test A: Extension Initializes with Default Settings

1. Open `chrome://extensions/`
2. Find "LinkedIn Assistant"
3. Click "service worker" link
4. Console should show:
   ```
   [LinkedIn Assistant] Service worker initialized
   [StorageService] Initializing...
   [StorageService] First time init - creating default settings
   [Service Worker] Initialization complete
   [Service Worker] Storage: {used: "X KB", quota: "10.00 MB"}
   ```

#### Test B: Settings are Persisted

In service worker console:

```javascript
// Get settings
chrome.storage.local.get('settings', (result) => {
  console.log('Settings:', result.settings);
});

// You should see the full UserSettings object with:
// - id: 'user-config'
// - version: '0.1.0'
// - apiKeys: {claude: null, openai: null, gemini: null}
// - defaultProvider: 'claude'
// - etc.
```

#### Test C: Update Settings via Message

In service worker console:

```javascript
// Update a setting
chrome.runtime.sendMessage({
  type: 'UPDATE_SETTINGS',
  payload: {
    defaultProvider: 'openai',
    apiKeys: { claude: 'test-key-123', openai: null, gemini: null }
  }
}, (response) => {
  console.log('Update response:', response);
  // response.success should be true
  // response.data should contain updated settings
});

// Verify it persisted
chrome.storage.local.get('settings', (result) => {
  console.log('Updated settings:', result.settings);
  // defaultProvider should be 'openai'
  // apiKeys.claude should be 'test-key-123'
  // updatedAt should be a recent timestamp
});
```

#### Test D: Get Settings via Message

In service worker console:

```javascript
chrome.runtime.sendMessage({
  type: 'GET_SETTINGS'
}, (response) => {
  console.log('Get response:', response);
  // response.success should be true
  // response.data should contain full settings
});
```

### 3. Test Popup Integration

1. Click the extension icon (LinkedIn Assistant)
2. Popup should open
3. Click "Test Connection" button
4. Should show:
   - "Testing..." (briefly)
   - Then "✓ Connected" (green)
   - Status should show "⚠ Setup Needed" (orange) because no real API keys configured

### 4. Test Content Script (LinkedIn)

1. Go to https://www.linkedin.com
2. Blue notification should still appear: "✓ LinkedIn Assistant Loaded"
3. Open browser console (F12)
4. Should see:
   ```
   [LinkedIn Assistant] Content script loaded
   [Content Script] Connection to background worker: OK
   ```

### 5. Test Storage Info

In service worker console:

```javascript
// Test storage service directly (it's imported)
// This won't work in console, but shows the API exists

// Instead, check via chrome.storage API
chrome.storage.local.getBytesInUse(null, (bytes) => {
  console.log('Storage used:', bytes, 'bytes');
  console.log('Storage used:', (bytes / 1024).toFixed(2), 'KB');
});

chrome.storage.local.QUOTA_BYTES; // Should show quota (typically 10485760 = 10MB)
```

### 6. Test Settings Merge (Backwards Compatibility)

In service worker console:

```javascript
// Simulate old settings (missing new fields)
const oldSettings = {
  id: 'user-config',
  version: '0.0.1',
  onboardingCompleted: true
  // Missing apiKeys, models, etc.
};

chrome.storage.local.set({ settings: oldSettings }, () => {
  console.log('Old settings saved');
  
  // Reload extension (click reload in chrome://extensions/)
  // Then check settings again - should be merged with defaults
  chrome.storage.local.get('settings', (result) => {
    console.log('Merged settings:', result.settings);
    // Should have all new fields with defaults
    // But onboardingCompleted should still be true (preserved)
  });
});
```

## Expected Results

### ✅ Success Criteria

- [ ] Extension loads without errors
- [ ] Service worker console shows initialization logs
- [ ] Settings are created with default values
- [ ] `chrome.storage.local.get('settings')` returns full UserSettings object
- [ ] UPDATE_SETTINGS message works
- [ ] GET_SETTINGS message works
- [ ] Settings persist after browser restart
- [ ] Popup "Test Connection" works
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build:chrome`)

### ❌ Common Issues

**Issue:** Service worker not initializing
- **Fix:** Go to chrome://extensions/, click "Errors" button, check for errors
- **Fix:** Click reload icon on extension

**Issue:** Settings not persisting
- **Check:** Do you have storage permission? (manifest.json should have "storage" in permissions)
- **Check:** Is chrome.storage.local available? Test in console: `chrome.storage.local`

**Issue:** "updatedAt is not defined"
- **Fix:** Rebuild: `npm run build:chrome`, reload extension

## Manual Testing Checklist

Copy this checklist and mark as you test:

```
## Issue #1 Testing - Storage Service

### Build & Load
- [ ] `npm run type-check` passes
- [ ] `npm run build:chrome` succeeds
- [ ] Extension loads in chrome://extensions/

### Service Worker
- [ ] Initialization logs appear in service worker console
- [ ] No errors in console
- [ ] Storage info shows usage

### Storage Operations
- [ ] GET_SETTINGS returns default settings
- [ ] UPDATE_SETTINGS updates and persists
- [ ] Settings survive extension reload
- [ ] Settings survive browser restart

### Integration
- [ ] Popup works and shows status
- [ ] Test Connection succeeds
- [ ] Content script still loads on LinkedIn

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Code follows project structure
```

## Next Steps

After confirming all tests pass:

1. ✅ Mark all checklist items
2. 📸 Take screenshots of:
   - Service worker console showing settings
   - Popup with "✓ Connected" status
3. 💬 Comment on GitHub Issue #1 with test results
4. 🔀 Create PR: `gh pr create --title "Issue #1: Storage Service" --body "Closes #1"`

## Debugging Commands

```javascript
// In service worker console (chrome://extensions/)

// 1. Check if storageService is initialized
console.log('Service worker loaded');

// 2. View all storage
chrome.storage.local.get(null, console.log);

// 3. Clear storage (reset)
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  // Reload extension to reinitialize
});

// 4. Manually set a test setting
chrome.storage.local.set({
  settings: {
    id: 'user-config',
    version: '0.1.0',
    apiKeys: { claude: 'test', openai: null, gemini: null }
  }
}, () => console.log('Test settings saved'));

// 5. Test message passing
chrome.runtime.sendMessage({ type: 'PING' }, console.log);
chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, console.log);
```

---

**Status:** ✅ Ready for testing
**Branch:** `issue-1-storage-service`
**Files Changed:** 5 files (2 new, 3 modified)
