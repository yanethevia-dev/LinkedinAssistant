# Testing LinkedIn Assistant - AI Features

Complete testing guide for all 4 AI-powered features.

## Pre-requisites

### 1. Install Extension
```bash
npm run build:chrome
```

Then load `dist/chrome` in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `dist/chrome` folder

### 2. Configure AI Provider

**REQUIRED before testing ANY AI feature**

1. Click extension icon in Chrome toolbar
2. Click "Options" or "Settings"
3. Configure AI provider:
   - **Provider**: Select one (Claude, OpenAI, Gemini, or Groq recommended for free tier)
   - **API Key**: Enter your API key
   - **Model**: Select model (e.g., `claude-3-5-sonnet-20241022` or `llama-3.3-70b-versatile`)
4. Click "Test Connection"
5. Verify "✅ Connected" appears
6. Save settings

**Free option:** Groq provides free API keys with fast Llama 3 models  
Get API key at: https://console.groq.com/keys

---

## Feature 1: Generate Post with AI

**Test Case:** Create a professional LinkedIn post from a topic

### Steps:
1. Go to LinkedIn feed: `https://www.linkedin.com/feed/`
2. Wait 1-2 seconds for extension to load
3. Look for floating button: **"✨ Generar Post con IA"** (purple/blue button)
4. Click the button
5. Modal appears: "¿Sobre qué quieres escribir?"
6. Enter a topic, e.g.: `"Anunciar el lanzamiento de mi nuevo producto SaaS"`
7. Click "Generar" or press Enter
8. Wait 2-5 seconds (toast shows "Generando post...")
9. LinkedIn composer opens automatically
10. AI-generated post appears in the editor

### Expected Result:
- Professional post with:
  - ✅ Engaging hook (first line captures attention)
  - ✅ 150-300 words
  - ✅ 3-4 strategic emojis
  - ✅ Line breaks for readability
  - ✅ Call-to-action at the end
  - ✅ 3-5 relevant hashtags
  - ✅ Ready to publish (no editing needed, though you can)

### Validation:
- [ ] Button appears on feed page
- [ ] Modal opens on click
- [ ] Toast shows loading state
- [ ] LinkedIn composer opens automatically
- [ ] Generated text appears in editor
- [ ] Text is professional and well-structured
- [ ] User can publish immediately

---

## Feature 2: Improve Post with AI

**Test Case:** Enhance an existing draft post

### Steps:
1. Go to LinkedIn feed: `https://www.linkedin.com/feed/`
2. Click "Start a post" button (LinkedIn's native button)
3. LinkedIn composer modal opens
4. Write a basic draft, e.g.:
   ```
   Hoy lanzamos nuestro nuevo producto. Es una herramienta para desarrolladores. Estamos muy contentos.
   ```
5. Look inside the modal for button: **"🚀 Mejorar Post"** (blue button)
6. Click "Mejorar Post"
7. Wait 2-5 seconds (button shows "Mejorando...")
8. Text is automatically replaced with improved version

### Expected Result:
- Improved post with:
  - ✅ Better hook (more attention-grabbing)
  - ✅ More professional tone
  - ✅ Added strategic emojis
  - ✅ Better structure (line breaks, spacing)
  - ✅ Clearer message
  - ✅ Suggested hashtags
  - ✅ Same core message (not changed drastically)

### Validation:
- [ ] Button appears inside composer modal
- [ ] Button shows loading state during processing
- [ ] Text is replaced automatically (no manual copy-paste)
- [ ] Improved version is better than original
- [ ] Original message intent is preserved
- [ ] Toast confirms success

---

## Feature 3: Generate CV with AI

**Test Case:** Generate professional CV from LinkedIn profile

### Steps:
1. Go to your LinkedIn profile: `https://www.linkedin.com/in/your-username/`
2. Wait 1-2 seconds for page to load completely
3. Look for floating button: **"📄 Generar mi CV"** (green button)
4. Click the button
5. Modal shows: "Datos extraídos del perfil" with preview of:
   - Name
   - Headline
   - About section
   - Number of experiences
   - Number of education entries
6. Click "Generar CV"
7. Wait 3-8 seconds (toast shows "Generando CV...")
8. Modal shows generated CV

### Expected Result:
- Professional CV with:
  - ✅ Professional Summary (2-3 impactful lines)
  - ✅ Work Experience (chronological, most recent first)
  - ✅ Education
  - ✅ Key Skills
  - ✅ Notable Achievements (if applicable)
  - ✅ Clear formatting with sections in CAPITALS
  - ✅ Bullet points (•) for lists
  - ✅ Achievement-oriented (not just responsibilities)
  - ✅ Quantified when possible (%, numbers, results)
  - ✅ ATS-optimized (Applicant Tracking Systems)

### Validation:
- [ ] Button appears ONLY on your profile page (not on feed)
- [ ] Modal shows extracted data before generation
- [ ] CV is generated in 3-8 seconds
- [ ] CV is well-structured and professional
- [ ] All profile sections are included
- [ ] "Copy to Clipboard" button works
- [ ] Toast confirms "CV copiado al portapapeles"

### Profile Requirements:
Your LinkedIn profile should have:
- Complete "About" section
- At least 1-2 work experiences
- At least 1 education entry

**Note:** If profile is incomplete, CV will still generate but will be shorter.

---

## Feature 4: Improve Profile with AI

**Test Case:** Get AI analysis and improvement suggestions for profile

### Steps:
1. Go to your LinkedIn profile: `https://www.linkedin.com/in/your-username/`
2. Wait 1-2 seconds for page to load
3. Look for floating button: **"🔧 Mejorar mi Perfil"** (pink/rose button)
4. Click the button
5. Modal shows: "Datos del perfil que se analizarán" with preview
6. Click "Analizar Perfil"
7. Wait 5-10 seconds (toast shows "Analizando perfil...")
8. Modal shows two sections:
   - **Analysis:** What's good, what to improve, specific suggestions
   - **Improved "About" section:** AI-generated better version

### Expected Result:

**Analysis Section:**
- ✅ What's working well in profile
- ⚠️ What needs improvement
- 💡 Specific, actionable suggestions for each section:
  - Headline
  - About
  - Experiences
  - Completeness
  - Keywords/SEO

**Improved About Section:**
- ✅ Strong hook (first 1-2 lines capture attention)
- ✅ Clear value proposition
- ✅ Relevant keywords for LinkedIn SEO
- ✅ Shows personality and authenticity
- ✅ Ends with clear call-to-action
- ✅ 150-250 words
- ✅ Professional but personal tone

### Validation:
- [ ] Button appears ONLY on your profile page
- [ ] Modal shows profile data preview
- [ ] Analysis is detailed and specific
- [ ] Suggestions are actionable (not generic)
- [ ] Improved "About" is better than original
- [ ] "Copy All" button works
- [ ] Toast confirms copy success

### How to Apply Improvements:
1. Click "Copiar Todo" in modal
2. Go to your LinkedIn profile
3. Click "Edit" (✏️) next to "About" section
4. Paste improved version
5. Review and adjust to your voice
6. Click "Save"

**Note:** Auto-editing (automatic application) is planned for future version.

---

## Common Issues and Solutions

### Issue 1: Buttons Don't Appear

**Symptoms:** No floating buttons on LinkedIn feed or profile

**Solutions:**
1. Refresh the page (Cmd+R / Ctrl+R)
2. Wait 2-3 seconds after page loads
3. Check console for errors:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for `[LinkedIn Assistant]` logs
4. Verify extension is enabled in `chrome://extensions/`
5. Rebuild extension: `npm run build:chrome` and reload

### Issue 2: AI Not Responding / Timeout

**Symptoms:** "Generando..." loading forever, or error toast

**Solutions:**
1. Check API configuration:
   - Go to extension Options
   - Click "Test Connection"
   - Verify "Connected" status
2. Check API key is valid (not expired)
3. Check API provider status:
   - Groq: https://status.groq.com/
   - OpenAI: https://status.openai.com/
   - Anthropic: https://status.anthropic.com/
4. Try different provider (Groq is fastest)
5. Check browser console for detailed error

### Issue 3: Generated Content is Generic

**Symptoms:** AI output is not personalized or low quality

**Solutions:**
1. For "Generate Post": Be more specific with topic
   - Bad: `"producto nuevo"`
   - Good: `"Lanzamiento de plataforma SaaS para automatizar onboarding de clientes B2B"`
2. For "Improve Post": Write more substantial draft (3-5 sentences minimum)
3. For "Generate CV": Complete your LinkedIn profile more thoroughly
4. Try different AI model:
   - Claude: Best for creative writing
   - GPT-4: Best for structure
   - Gemini: Balanced
   - Groq (Llama 3): Fast and free

### Issue 4: Button Inside Modal Not Visible

**Symptoms:** "Mejorar Post" button doesn't appear in composer

**Solutions:**
1. Make sure you opened composer from LinkedIn's "Start a post" button
2. Wait 1-2 seconds for modal to fully load
3. Check if Shadow DOM is being used (modern LinkedIn):
   - Open DevTools
   - Check if `#interop-outlet` exists
   - Extension should auto-detect
4. Try scrolling inside the modal
5. Close and reopen the composer

### Issue 5: Profile Extraction Incomplete

**Symptoms:** CV or Profile Analysis missing sections

**Solutions:**
1. Ensure you're on your OWN profile (not someone else's)
2. Scroll down to load all sections (LinkedIn lazy-loads content)
3. Make sure sections are expanded (click "Show more" if collapsed)
4. Check LinkedIn's section IDs haven't changed:
   - `#about`
   - `#experience`
   - `#education`
5. If sections still missing, report issue with screenshot

---

## Testing Checklist

Use this checklist to verify all features work:

### Setup
- [ ] Extension installed in Chrome
- [ ] Extension appears in `chrome://extensions/`
- [ ] AI provider configured in Options
- [ ] "Test Connection" shows "Connected"
- [ ] LinkedIn is logged in

### Feature 1: Generate Post
- [ ] Button appears on feed page
- [ ] Modal opens with input field
- [ ] AI generates professional post
- [ ] Post appears in LinkedIn composer
- [ ] Can publish without editing

### Feature 2: Improve Post
- [ ] Button appears inside composer modal
- [ ] AI improves draft text
- [ ] Text is replaced automatically
- [ ] Improvement is noticeable

### Feature 3: Generate CV
- [ ] Button appears on profile page
- [ ] Profile data is extracted correctly
- [ ] CV is generated professionally
- [ ] Copy to clipboard works
- [ ] CV includes all sections

### Feature 4: Improve Profile
- [ ] Button appears on profile page
- [ ] Analysis is detailed and specific
- [ ] "About" section is improved
- [ ] Copy button works
- [ ] Suggestions are actionable

### Error Handling
- [ ] Clear error messages on failure
- [ ] Toast notifications are visible
- [ ] Loading states show progress
- [ ] Errors don't break the UI

---

## Performance Expectations

| Feature | Expected Time | Acceptable Range |
|---------|--------------|------------------|
| Generate Post | 2-3 seconds | 1-5 seconds |
| Improve Post | 2-3 seconds | 1-5 seconds |
| Generate CV | 4-6 seconds | 3-8 seconds |
| Improve Profile | 6-8 seconds | 5-10 seconds |

**Note:** Times depend on:
- AI provider (Groq is fastest)
- Model selected (smaller models faster)
- API server load
- Network connection

---

## Debug Mode

To enable detailed logging for troubleshooting:

1. Open `src/shared/constants.ts`
2. Set `DEBUG = true`
3. Rebuild: `npm run build:chrome`
4. Reload extension
5. Open DevTools → Console
6. Look for detailed `[Service Worker]` and `[AIHelper]` logs

**Example debug output:**
```
[LinkedIn Assistant] Content script loaded
[Service Worker] Received message: GENERATE_CONTENT
[Service Worker] Using provider: groq model: llama-3.3-70b-versatile
[AIHelper] Calling AI service...
[AIHelper] AI response received
[LinkedIn Assistant] Post generated successfully
```

---

## Next Steps After Testing

1. **If all tests pass:** Extension is ready to use! 🎉
2. **If tests fail:** Check "Common Issues" section above
3. **Report bugs:** Create issue on GitHub with:
   - Feature that failed
   - Steps to reproduce
   - Error message from console
   - Screenshot if applicable

---

## Future Features (Not Yet Implemented)

These features are documented but NOT yet functional:

- [ ] **Auto-edit Profile:** Automatically paste improved "About" section (currently manual copy-paste)
- [ ] **Export CV to PDF:** Download generated CV as PDF file (currently text only)
- [ ] **Adapt CV to Job Posting:** Customize CV for specific job description
- [ ] **Improve Individual Experiences:** AI suggestions for each work experience
- [ ] **Job Compatibility Analysis:** Match profile against job postings

---

## Support

- **Documentation:** `AI_FEATURES_COMPLETE.md` (architecture and flows)
- **Code:** `src/content/linkedin-content.ts` (main logic)
- **Prompts:** `src/prompts/linkedin-prompts.ts` (AI prompt templates)
- **Configuration:** Extension Options page

**Testing completed:** 2026-05-27  
**Version:** 0.3.0  
**Status:** All 4 AI features functional ✅
