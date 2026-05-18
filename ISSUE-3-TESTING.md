# Issue #3 Testing Guide - AI Service

## Overview
This guide will help you test the AI Service implementation with real API connections to Claude, OpenAI, and Gemini.

**Branch:** `issue-3-ai-service`

## Prerequisites

Before testing, you'll need API keys from at least one provider:

### Get API Keys

**Claude (Anthropic):**
1. Visit https://console.anthropic.com/
2. Sign up/login
3. Go to API Keys section
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

**OpenAI:**
1. Visit https://platform.openai.com/api-keys
2. Sign up/login
3. Create a new API key
4. Copy the key (starts with `sk-`)

**Gemini (Google):**
1. Visit https://makersuite.google.com/app/apikey
2. Sign up/login with Google account
3. Create API key
4. Copy the key

## Build & Install

1. **Build the extension:**
   ```bash
   npm run build:chrome
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist/chrome` folder

3. **Verify installation:**
   - Extension icon should appear in toolbar
   - Click icon → popup should show "⚠ Setup Needed"

## Testing Plan

### Test 1: Service Worker Integration

**What to test:** Verify AI Service is properly loaded in service worker

**Steps:**
1. Open Chrome DevTools → Console
2. Type: `chrome.runtime.getBackgroundPage()`
3. Click the result to open Service Worker console
4. Look for initialization logs:
   ```
   [LinkedIn Assistant] Service worker initialized
   [Service Worker] Initialization complete
   [Service Worker] Storage: {used: "X KB", quota: "10.00 MB"}
   ```

**Expected:** All logs present, no errors

---

### Test 2: Claude API Connection

**What to test:** Real API call to Claude

**Steps:**
1. Click extension icon → "Settings"
2. Find the **Claude** card
3. Enter your Claude API key (from Prerequisites)
4. Select model: `claude-3-5-sonnet-20241022` (default)
5. Click "Test Connection"

**Expected behavior:**
- Button changes to "Testing..."
- Status badge shows "Testing..." (yellow background)
- After 1-3 seconds:
  - Status badge shows "Connected ✓" (green background)
  - Toast notification: "claude connection successful"
  - Card gets green border
- Check Service Worker console for:
  ```
  [Service Worker] Testing AI connection: claude
  [AIService] Generating content with claude
  [AIService] Test successful for claude: success
  [Service Worker] Test successful: claude
  ```

**If it fails:**
- Status badge shows "Error" (red background)
- Toast shows error message
- Check console for specific error:
  - `invalid_api_key` → Wrong API key format
  - `authentication_error` → API key not valid
  - `NETWORK_ERROR` → Check internet connection
  - Other errors → Check console for details

---

### Test 3: OpenAI API Connection

**What to test:** Real API call to OpenAI

**Steps:**
1. In Settings, find the **OpenAI** card
2. Enter your OpenAI API key
3. Select model: `gpt-4-turbo` (default) or `gpt-3.5-turbo`
4. Click "Test Connection"

**Expected behavior:**
- Same flow as Claude test
- Status → "Testing..." → "Connected ✓"
- Green border on card
- Toast: "openai connection successful"
- Console logs:
  ```
  [Service Worker] Testing AI connection: openai
  [AIService] Generating content with openai
  [AIService] Test successful for openai: success
  [Service Worker] Test successful: openai
  ```

**Common OpenAI errors:**
- `insufficient_quota` → Need to add billing/credits
- `model_not_found` → Try different model
- `rate_limit_exceeded` → Wait a minute, try again

---

### Test 4: Gemini API Connection

**What to test:** Real API call to Google Gemini

**Steps:**
1. In Settings, find the **Gemini** card
2. Enter your Gemini API key
3. Select model: `gemini-pro` (default)
4. Click "Test Connection"

**Expected behavior:**
- Same flow as other providers
- Status → "Testing..." → "Connected ✓"
- Green border on card
- Toast: "gemini connection successful"
- Console logs:
  ```
  [Service Worker] Testing AI connection: gemini
  [AIService] Generating content with gemini
  [AIService] Test successful for gemini: success
  [Service Worker] Test successful: gemini
  ```

**Common Gemini errors:**
- `API_KEY_INVALID` → Wrong key format
- `PERMISSION_DENIED` → API not enabled for project
- Model errors → Try `gemini-1.5-pro` or `gemini-1.5-flash`

---

### Test 5: Auto-save on API Key Entry

**What to test:** Settings save automatically while typing

**Steps:**
1. In Settings, pick any provider
2. Start typing an API key (or paste one)
3. Wait 1 second without typing
4. Check Service Worker console for:
   ```
   [Service Worker] Received message: UPDATE_SETTINGS
   [Storage Service] Updating settings
   [Storage Service] Settings saved successfully
   ```

**Expected:**
- Settings saved automatically after 1 second pause
- No toast notification (silent save)
- Status badge updates if key is valid format

---

### Test 6: Show/Hide API Key Toggle

**What to test:** Eye icon toggles password visibility

**Steps:**
1. Enter an API key in any provider field
2. Key should be hidden (dots/bullets)
3. Click the eye icon (👁️) button
4. Key should become visible (plain text)
5. Icon changes to 🙈
6. Click again → key hidden, icon back to 👁️

**Expected:**
- Clicking toggles visibility smoothly
- Icon changes appropriately
- No page reload or form submission

---

### Test 7: Multiple Provider Configuration

**What to test:** Configure all three providers

**Steps:**
1. Add API keys for all three providers
2. Test connection for each one
3. All three should show "Connected ✓"
4. All three cards should have green borders

**Expected:**
- Can configure multiple providers simultaneously
- Each test is independent
- All settings persist after page reload

---

### Test 8: Settings Persistence

**What to test:** Settings survive browser restart

**Steps:**
1. Configure at least one API key
2. Test connection (should succeed)
3. Close Chrome completely
4. Reopen Chrome
5. Go to extension Settings

**Expected:**
- API key still present (hidden but saved)
- Status badge shows "Configured ✓"
- Test connection still works
- No need to re-enter keys

---

### Test 9: Error Handling - No API Key

**What to test:** User-friendly error when key missing

**Steps:**
1. Pick any provider card
2. Clear/remove the API key (leave it empty)
3. Click "Test Connection"

**Expected:**
- Warning toast: "Please enter [provider] API key first"
- Status badge doesn't change
- No error in console
- Button doesn't get stuck in "Testing..." state

---

### Test 10: Error Handling - Invalid API Key

**What to test:** Clear error message for wrong key

**Steps:**
1. Enter a fake/invalid API key:
   - Claude: `sk-ant-invalid123`
   - OpenAI: `sk-invalid123`
   - Gemini: `invalid123`
2. Click "Test Connection"

**Expected:**
- Status badge shows "Error" (red)
- Toast shows specific error message
- Console shows detailed error
- Can retry without reloading page

---

## Success Criteria

Issue #3 is complete when:

- ✅ All three AI providers can connect successfully
- ✅ Test Connection button works for each provider
- ✅ API keys are securely stored (not visible in logs)
- ✅ Error messages are clear and helpful
- ✅ Settings persist across browser restarts
- ✅ Auto-save works correctly
- ✅ Show/hide password toggle works
- ✅ No console errors in normal operation
- ✅ Service Worker logs show proper message flow

## Troubleshooting

**Problem: "Service worker registration failed"**
- Check manifest.json syntax
- Verify service-worker.js exists in dist/chrome/background/
- Try: Remove extension, rebuild, reload

**Problem: "Cannot read property 'sendMessage'"**
- Service worker not initialized
- Check Service Worker console for errors
- Try: Reload extension

**Problem: Test hangs at "Testing..."**
- Check network connection
- Check Service Worker console for errors
- Verify API endpoint is accessible
- Try: Reload extension and retry

**Problem: API key not saving**
- Check Storage Service logs
- Verify chrome.storage permission in manifest
- Check quota: Should show in Service Worker logs

**Problem: All tests fail immediately**
- Check if aiService is imported correctly
- Verify build completed without errors
- Check for TypeScript errors in console

## Next Steps

After Issue #3 is complete:
- **Issue #4:** DOM Observer (detect LinkedIn UI elements)
- **Issue #5:** Post Composer Injection (add buttons to LinkedIn)
- **Issue #6:** Modal UI Component

---

**Testing Tip:** Keep the Service Worker console open while testing. It shows the complete message flow and makes debugging much easier!
