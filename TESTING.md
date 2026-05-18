# Testing Instructions for LinkedIn Assistant

## How to Load and Test the Extension

### Prerequisites
- Chrome, Firefox, or Edge browser
- Node.js 18+ installed
- LinkedIn account (free tier is fine)

### Installation Steps

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/yanethevia-dev/LinkedinAssistant.git
cd LinkedinAssistant
npm install
```

2. **Build the Extension**
```bash
# For Chrome/Edge
npm run build:chrome

# For Firefox
npm run build:firefox
```

3. **Load in Browser**

**Chrome/Edge:**
- Open `chrome://extensions/` (or `edge://extensions/`)
- Enable "Developer mode" (toggle in top-right corner)
- Click "Load unpacked"
- Navigate to and select the `dist/chrome/` folder
- Extension should appear with "LinkedIn Assistant" name

**Firefox:**
- Open `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on..."
- Navigate to `dist/firefox/` and select `manifest.json`
- Extension loads (note: temporary, will be removed on browser restart)

### Testing Each Release

#### v0.1.0 - Initial Setup (Current)

**What to Test:**
1. Extension loads without errors
2. Extension icon appears in browser toolbar
3. Content script injects into LinkedIn

**Steps:**
1. After loading extension, click the extension icon
2. Popup should open showing:
   - Status: "✓ Ready" (green)
   - Version: 0.1.0
   - Two buttons: "Settings" and "Test Connection"
3. Click "Test Connection" - should show "Testing..." then "✓ Connected"
4. Click "Settings" - options page should open
5. Go to [https://www.linkedin.com](https://www.linkedin.com)
6. Look for blue notification in bottom-right corner: "✓ LinkedIn Assistant Loaded"
7. Notification should appear for 3 seconds then slide out
8. Open browser console (F12 → Console tab)
9. Should see logs:
   - `[LinkedIn Assistant] Content script loaded`
   - `[Content Script] Connection to background worker: OK`

**Expected Result:**
- ✅ No console errors
- ✅ Popup works
- ✅ Options page loads
- ✅ Notification appears on LinkedIn
- ✅ Connection test passes

**Common Issues:**
- Notification doesn't appear → Refresh LinkedIn page
- Console errors → Check if build completed successfully
- Popup doesn't open → Check extension is enabled in `chrome://extensions/`

### Debugging

**View Console Logs:**
- **Content Script:** F12 on LinkedIn page → Console tab
- **Background Worker:** Go to `chrome://extensions/` → Click "service worker" link under LinkedIn Assistant
- **Popup:** Right-click extension icon → "Inspect popup"

**Check Extension State:**
```javascript
// In LinkedIn page console
console.log('Extension loaded:', !!document.getElementById('lia-loaded-indicator'));
```

**Reload Extension:**
- Go to `chrome://extensions/`
- Find LinkedIn Assistant
- Click reload icon (circular arrow)
- Refresh LinkedIn page

### Development Mode

For active development with hot reload:

```bash
# Terminal 1: Watch mode (rebuilds on file changes)
npm run dev

# Terminal 2: When files change
# Manually reload extension in chrome://extensions/
# Then refresh LinkedIn page
```

### Reporting Issues

When reporting a bug, include:

1. **Environment:**
   - Browser name and version
   - Extension version (visible in popup)
   - Operating system

2. **Steps to Reproduce:**
   - Exact sequence of actions
   - Screenshots if relevant

3. **Console Errors:**
   - Content script console (F12 on LinkedIn)
   - Background worker console (`chrome://extensions/` → service worker)
   - Screenshot of errors

4. **Expected vs Actual:**
   - What you expected to happen
   - What actually happened

**Template:**
```
## Bug Report

**Environment:**
- Browser: Chrome 121.0.6167.85
- Extension: v0.1.0
- OS: macOS 14.2

**Steps:**
1. Load extension
2. Go to LinkedIn
3. ...

**Expected:** [describe]
**Actual:** [describe]

**Console Errors:**
[paste or screenshot]
```

### Next Versions

Check each GitHub Issue for specific testing instructions as new features are added.
