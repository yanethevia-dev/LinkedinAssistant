# Issue #4 Testing Guide - DOM Observer

## Overview
This guide will help you test the DOM Observer that detects LinkedIn UI elements in real-time.

**Branch:** `issue-4-dom-observer`

## What This Does

The DOM Observer monitors LinkedIn pages and automatically detects:
- 📝 **Post Composers** - Where you write new posts
- 💬 **Comment Boxes** - Where you reply to posts
- 📄 **Feed Posts** - Individual posts in your feed
- 👤 **Profile Sections** - For CV extraction (future)

It uses a MutationObserver to handle LinkedIn's Single Page Application (SPA) navigation.

## Build & Install

1. **Build the extension:**
   ```bash
   npm run build:chrome
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - If already loaded, click the **Reload** button (🔄)
   - Otherwise:
     - Enable "Developer mode"
     - Click "Load unpacked"
     - Select `dist/chrome` folder

3. **Open LinkedIn:**
   - Go to https://www.linkedin.com/
   - Log in if needed

## Testing Plan

### Test 1: Content Script Loads

**What to test:** Verify DOM Observer initializes

**Steps:**
1. Open LinkedIn homepage
2. Open Chrome DevTools → Console
3. Look for initialization logs:
   ```
   [LinkedIn Assistant] Content script loaded
   [Content Script] Connection to background worker: OK
   [DOMObserver] Initialized
   [Content Script] Initializing DOM Observer...
   [DOMObserver] Starting observer...
   [DOMObserver] Observer started
   ```
4. You should also see a blue toast in bottom-right: "✓ LinkedIn Assistant Loaded"

**Expected:** All logs present, no errors, toast appears for 3 seconds

---

### Test 2: Post Composer Detection

**What to test:** Detects the "Start a post" area

**Steps:**
1. On LinkedIn homepage/feed
2. Find the "Start a post" box (usually at top of feed)
3. Check console for:
   ```
   [DOMObserver] Detected post-composer
   [Content Script] Post composer detected: <element>
   ```

**If not detected immediately:**
- Click inside the "Start a post" input field
- Type something (opens the full composer)
- Check console again - should detect the opened editor

**Expected:** Console logs show post-composer detected

---

### Test 3: Post Composer - Full Editor

**What to test:** Detects expanded post editor

**Steps:**
1. Click "Start a post" to open the full editor modal
2. Check console for new detection:
   ```
   [DOMObserver] Detected post-composer
   [Content Script] Post composer detected: <element>
   ```
3. Close the modal (click X or Cancel)
4. Open it again - should detect again

**Expected:** Each time you open the editor, it's detected

---

### Test 4: Comment Box Detection

**What to test:** Detects comment input fields

**Steps:**
1. Scroll through your LinkedIn feed
2. Click "Comment" on any post to open comment box
3. Check console for:
   ```
   [DOMObserver] Detected comment-box urn:li:activity:...
   [Content Script] Comment box detected: urn:li:activity:...
   ```
4. Try opening comment boxes on different posts
5. Each should be detected with its unique post ID

**Expected:** Each comment box is detected with correct post ID

---

### Test 5: Feed Post Detection

**What to test:** Detects individual posts in feed

**Steps:**
1. On LinkedIn feed/homepage
2. Check console for multiple detections:
   ```
   [DOMObserver] Detected feed-post urn:li:activity:...
   [Content Script] Feed post detected: urn:li:activity:...
   [DOMObserver] Detected feed-post urn:li:activity:...
   [Content Script] Feed post detected: urn:li:activity:...
   (multiple times)
   ```
3. Scroll down to load more posts
4. New posts should be detected automatically

**Expected:** All visible posts are detected, new posts detected on scroll

---

### Test 6: SPA Navigation Handling

**What to test:** Observer survives page navigation

**Steps:**
1. Start on LinkedIn feed - verify detections
2. Navigate to Messages (top nav)
3. Check console - observer still running
4. Navigate back to Feed
5. Check console - detections resume
6. Try navigating to:
   - Notifications
   - Jobs
   - Back to Feed
7. Each time, verify observer still works

**Expected:** Observer continues working after navigation, no errors

---

### Test 7: Profile Section Detection

**What to test:** Detects profile elements

**Steps:**
1. Navigate to your LinkedIn profile:
   - Click "Me" → "View Profile"
   - Or go to: `https://www.linkedin.com/in/your-username/`
2. Check console for:
   ```
   [DOMObserver] Detected profile-section
   [Content Script] Profile section detected
   (multiple times for different sections)
   ```
3. Scroll through your profile
4. Should detect multiple sections (header, experience, education, etc.)

**Expected:** Multiple profile-section detections, one for each major section

---

### Test 8: Stale Element Cleanup

**What to test:** Observer cleans up removed elements

**Steps:**
1. On LinkedIn feed
2. Open a post composer (creates detection)
3. Close it (removes element from DOM)
4. Wait 30 seconds (cleanup runs every 30s)
5. Check console for:
   ```
   [DOMObserver] Cleaned up X stale elements
   ```

**Alternative quick test:**
- Open and close 5-10 post editors rapidly
- Wait 30 seconds
- Should see cleanup log

**Expected:** Stale elements are cleaned up automatically

---

### Test 9: Multiple Element Types Simultaneously

**What to test:** Can track multiple types at once

**Steps:**
1. On LinkedIn feed with visible posts
2. Open a post composer (Start a post)
3. Scroll to a post and open a comment box
4. Check console - should show ALL active:
   - feed-post detections (multiple)
   - post-composer detection
   - comment-box detection

**Expected:** All element types can be detected simultaneously

---

### Test 10: Observer Performance

**What to test:** No performance issues or infinite loops

**Steps:**
1. Stay on LinkedIn feed for 2-3 minutes
2. Scroll up and down rapidly
3. Open and close various elements (posts, comments)
4. Check console for:
   - No repeated detections for same element
   - No excessive logging (should only log on NEW detections)
   - No errors or warnings

5. Check Performance:
   - DevTools → Performance tab
   - Record for 10 seconds while scrolling
   - Stop recording
   - Look for any red flags or long tasks

**Expected:** 
- Smooth scrolling, no lag
- No duplicate detections
- No performance warnings

---

## Success Criteria

Issue #4 is complete when:

- ✅ DOM Observer initializes on LinkedIn pages
- ✅ Post composers are detected (both initial and expanded)
- ✅ Comment boxes are detected with post IDs
- ✅ Feed posts are detected
- ✅ Profile sections are detected (on profile pages)
- ✅ Observer survives SPA navigation
- ✅ Stale elements are cleaned up
- ✅ No performance issues or excessive logging
- ✅ No console errors in normal operation
- ✅ Callbacks work correctly for all element types

## Debugging Tips

**Problem: No detections at all**
- Check if content script loaded (see Test 1)
- Verify you're on linkedin.com (not other sites)
- Check manifest.json has correct content_scripts match pattern
- Try: Reload extension and refresh LinkedIn page

**Problem: Missing some element types**
- LinkedIn frequently changes their DOM structure
- Open console, inspect the element you expect to be detected
- Check its classes/attributes
- May need to update selectors in dom-observer.ts

**Problem: Too many duplicate detections**
- Check if elements are being removed and re-added
- May need to adjust MutationObserver debouncing
- Check observedElements Map is preventing duplicates

**Problem: Observer stops after navigation**
- Check console for errors
- Verify MutationObserver.observe is targeting document.body
- LinkedIn's SPA might be replacing entire body - may need to re-observe

**Problem: Performance issues**
- Check if scanPage() is being called too frequently
- Verify debouncing in MutationObserver callback
- Consider reducing observer scope or adding throttling

## Viewing Detected Elements

Want to see exactly what's being detected?

**Console command:**
```javascript
// Run in console on LinkedIn page
chrome.runtime.sendMessage({type: 'PING'}, () => {
  console.log('Observer active, check logs above for detections');
});
```

**Or inspect the observer directly:**
```javascript
// Won't work directly, but shows the concept
// In a future issue, we can add a debug command
```

## Next Steps

After Issue #4 is complete:
- **Issue #5:** Post Composer Injection - Add "Generate Post" button to detected composers
- **Issue #6:** Modal UI Component - Reusable modal for AI interactions

---

**Pro Tip:** Keep the console open while browsing LinkedIn. You'll see in real-time what the observer detects. This helps understand how LinkedIn's UI works!
