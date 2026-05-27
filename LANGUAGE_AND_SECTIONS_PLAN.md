# Plan: Language Selector + Profile Sections

## Features to Implement:

### 1. Language Selector for All Features ✅ COMPLETED
- [x] Create language-selector.ts with modal
- [x] Update handleGeneratePostWithAI() to use selector
- [x] Update handleGenerateCV() to use selector  
- [x] Update handleImproveProfile() to use selector
- [x] Update AI Helper methods to accept language parameter
  - [x] generatePost(topic, language)
  - [x] generateOptimizedCV(profileData, language)
  - [x] generateTargetedCV(profileData, jobPosting, language)
  - [x] improveAbout(currentAbout, language, role)
  - [x] improveHeadline(currentHeadline, language) - NEW
  - [x] analyzeProfile(profileData, language)

### 2. Profile Improvement with Section Selection ✅ COMPLETED
- [x] Create new modal for profile improvement with:
  - Analysis section (always shown)
  - Checkboxes for sections to improve:
    - [x] About / Acerca de
    - [x] Headline / Titular
  - Separate copy buttons for each improved section
  - "Copy All" button

### Structure:
```
showProfileImprovementResults({
  analysis: string,
  improvedAbout?: string,
  improvedHeadline?: string,
  language: 'es' | 'en'
})
```

## Implementation Order:
1. ✅ Create language-selector.ts
2. ✅ Update generatePost with language
3. ✅ Update handleGeneratePostWithAI to show selector
4. ✅ Update CV generation with language
5. ✅ Create profile sections modal
6. ✅ Update improve profile with sections

## Files Modified:
- src/content/language-selector.ts (NEW) ✅
- src/content/linkedin-content.ts ✅
  - Updated handleGeneratePostWithAI() with language selector
  - Updated handleGenerateCV() with language selector
  - Updated handleImproveProfile() with language selector
  - Added showProfileSectionsModal() function
  - Added showProfileImprovementResults() function
- src/content/ai-helper.ts ✅
  - Updated all methods to accept language parameter
  - Added improveHeadline() method
  - Bilingual prompts (Spanish/English) for all methods

## ✅ IMPLEMENTATION COMPLETE

All features now support Spanish and English:
- **Generate Post**: Shows language selector → generates post in selected language
- **Generate CV**: Shows language selector → CV modal → generates optimized/targeted CV in selected language
- **Improve Profile**: Shows language selector → section selection modal → shows results with individual copy buttons

Profile improvement now has:
- Analysis (always included)
- Optional headline improvement
- Optional about section improvement
- Individual copy buttons for each section
- Copy All button for complete results

Build status: ✅ Compiled successfully (339 KB with warnings - same as before)
