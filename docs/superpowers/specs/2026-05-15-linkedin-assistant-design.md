# LinkedIn Assistant - Design Specification

**Date:** 2026-05-15  
**Version:** 1.0  
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Functionality](#core-functionality)
3. [Technical Architecture](#technical-architecture)
4. [AI Provider System](#ai-provider-system)
5. [Style Personalization](#style-personalization)
6. [Data Storage Schema](#data-storage-schema)
7. [LinkedIn Integration Points](#linkedin-integration-points)
8. [User Flows](#user-flows)
9. [Security & Privacy](#security--privacy)
10. [Error Handling](#error-handling)
11. [Project Structure](#project-structure)
12. [Technology Stack](#technology-stack)

---

## Executive Summary

### Vision

LinkedIn Assistant is a browser extension that enhances LinkedIn productivity by providing AI-powered tools for content creation, engagement, and career management. The extension integrates directly into LinkedIn's interface, offering contextual assistance without requiring users to leave the platform.

### Core Value Proposition

- **Seamless Integration:** Buttons and UI appear contextually within LinkedIn, not as a separate tool
- **User-Controlled AI:** Users provide their own API keys and choose their preferred AI provider
- **Privacy-First:** All data stored locally, zero backend, no data collection
- **Multi-Provider:** Support for Claude, OpenAI, and Gemini
- **Personalized Output:** Content matches user's writing style through analysis or presets

### Phase 1 Scope

This design covers the first 4 core functionalities:

1. **Generate Post from Idea** - Turn a concept into a full LinkedIn post
2. **Improve Post** - Optimize existing draft for engagement
3. **Respond to Comments** - Generate contextual comment responses
4. **CV Generation & Adaptation** - Create and tailor resumes

**Deferred to Phase 2:**
- Recruiter message generation
- Interview practice
- OAuth integration for posting directly

---

## Core Functionality

### 1. Generate Post from Idea

**Purpose:** Transform a brief idea or concept into a complete, engagement-optimized LinkedIn post.

**User Input:**
- Idea description (free text)
- Desired tone (preset or learned style)
- Length preference (short: ~500 chars, medium: ~1500 chars, long: ~3000 chars)
- Include hashtags (yes/no)
- Include call-to-action (yes/no)

**Output:**
- Formatted LinkedIn post with appropriate structure
- Emojis if matching user style
- Hashtags strategically placed
- Character count validation (max 3000)

**AI Prompt Strategy:**
- System prompt includes: LinkedIn best practices, engagement patterns, user's style profile
- User prompt: the idea + constraints
- Temperature: 0.7 (creative but consistent)

---

### 2. Improve Post

**Purpose:** Take an existing draft and optimize it for clarity, engagement, and LinkedIn algorithm.

**User Input:**
- Current draft text (from composer)
- Tone adjustment (optional override)
- Focus areas: clarity, engagement, SEO, brevity

**Output:**
- Improved version maintaining core message
- Side-by-side comparison (optional)
- Explanation of changes (optional)

**AI Prompt Strategy:**
- System prompt: "Maintain original message intent, improve clarity and engagement"
- Preservation of personal anecdotes and specific details
- Temperature: 0.6 (more conservative)

---

### 3. Respond to Comments

**Purpose:** Generate contextual, professional responses to comments on any LinkedIn post.

**Context Provided to AI:**
- Original post content
- Comment being responded to
- Whether it's a direct comment or reply to thread

**User Input:**
- Tone (professional, friendly, thought-provoking, brief)
- Depth (brief acknowledgment, moderate engagement, detailed response)
- Additional context or points to include (optional)

**Output:**
- Response text (max 1250 characters)
- Appropriate emoji usage matching context
- Professional yet personable tone

**AI Prompt Strategy:**
- System prompt includes: LinkedIn etiquette, relationship building
- Context awareness: differentiate between thank you, question, disagreement, insight
- Temperature: 0.7

---

### 4. CV Generation

#### 4.1 Generate CV from LinkedIn Profile

**Purpose:** Extract user's LinkedIn profile data and generate a formatted resume.

**Data Extraction:**
- Name, headline, summary
- Work experience (title, company, dates, description)
- Education (degree, institution, dates)
- Skills
- Certifications (if available)
- Languages (if available)

**User Input:**
- Template selection (Professional, Modern, Classic, Minimalist)
- Sections to include/exclude
- Additional custom sections

**Output:**
- Structured resume in HTML (for preview)
- Export options: PDF or DOCX
- ATS-friendly formatting

**AI Prompt Strategy:**
- System prompt: "Generate ATS-optimized resume, action verbs, quantifiable achievements"
- Template-specific formatting instructions
- Temperature: 0.5 (precise and professional)

#### 4.2 Adapt CV to Job Offer

**Purpose:** Customize a base CV to match specific job requirements.

**Data Extraction from Job Posting:**
- Job title and company
- Required skills and qualifications
- Preferred qualifications
- Job description keywords
- Company culture indicators

**Process:**
1. Extract job requirements
2. Analyze match with user's profile (% match score)
3. Reorder experience by relevance
4. Highlight matching skills
5. Integrate job-specific keywords naturally
6. Adjust summary to target the role

**User Input:**
- Select base CV to adapt
- Customization preferences (aggressive/conservative keyword integration)

**Output:**
- Adapted CV with highlighted changes
- Match analysis report
- Export as PDF or DOCX with naming: "CV - {JobTitle} at {Company}"

**AI Prompt Strategy:**
- System prompt: "Adapt resume to job description without fabricating experience"
- Keyword optimization without keyword stuffing
- Temperature: 0.4 (conservative for accuracy)

---

## Technical Architecture

### Component Overview

The extension consists of three main components communicating via Chrome Extension messaging API:

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Extension                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────────┐   │
│  │  Content Script  │◄───────►│  Background Service     │   │
│  │  (linkedin-*.ts) │  msgs   │  Worker                 │   │
│  │                  │         │  (service-worker.ts)    │   │
│  │  - DOM Observer  │         │                         │   │
│  │  - UI Injectors  │         │  - AI Service           │   │
│  │  - Extractors    │         │  - Storage Service      │   │
│  │  - Event Handlers│         │  - Message Router       │   │
│  └──────────────────┘         └─────────────────────────┘   │
│         ▲                                  ▲                 │
│         │                                  │                 │
│         ▼                                  ▼                 │
│  ┌──────────────────┐         ┌─────────────────────────┐   │
│  │  Sidebar Panel   │         │  Popup / Options        │   │
│  │  (sidebar.html)  │         │  (popup.html)           │   │
│  └──────────────────┘         └─────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   AI Provider APIs   │
                   │  Claude/OpenAI/Gemini│
                   └──────────────────────┘
```

### Content Script (linkedin-content.ts)

**Responsibilities:**
- Inject UI elements (buttons, modals, sidebar) into LinkedIn DOM
- Observe DOM changes (MutationObserver) for dynamically loaded content
- Extract data from LinkedIn pages (profile, posts, job listings)
- Handle user interactions with injected UI
- Send requests to background service worker
- Display responses from background worker

**Key Modules:**
- **DOM Observer:** Watches for LinkedIn content changes, re-injects UI as needed
- **Injectors:** Context-specific UI injection (composer, comments, profile, job pages)
- **Extractors:** Parse LinkedIn data structures
- **UI Components:** Modals, sidebars, buttons, toasts

**Communication:**
```typescript
// Send to background
chrome.runtime.sendMessage({
  type: 'GENERATE_POST',
  payload: { idea: string, tone: string, length: number }
});

// Receive from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'POST_GENERATED') {
    // Handle response
  }
});
```

---

### Background Service Worker (service-worker.ts)

**Responsibilities:**
- Handle API calls to AI providers
- Manage IndexedDB storage operations
- Route messages between content scripts and other components
- Maintain configuration state
- Cache responses to avoid redundant API calls

**Key Modules:**

#### AI Service (ai-service.ts)

```typescript
interface AIRequest {
  provider: 'claude' | 'openai' | 'gemini';
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

class AIService {
  async generateContent(request: AIRequest): Promise<string>;
  async testConnection(provider: string, apiKey: string): Promise<boolean>;
  private callClaude(request: AIRequest, apiKey: string): Promise<string>;
  private callOpenAI(request: AIRequest, apiKey: string): Promise<string>;
  private callGemini(request: AIRequest, apiKey: string): Promise<string>;
}
```

**Unified API abstraction:**
- Single interface for all providers
- Provider-specific implementations
- Error handling and retry logic
- Response validation

#### Storage Service (storage-service.ts)

```typescript
class StorageService {
  // Settings
  async getSettings(): Promise<UserSettings>;
  async updateSettings(partial: Partial<UserSettings>): Promise<void>;
  
  // Content history
  async saveGeneratedContent(content: GeneratedContent): Promise<string>;
  async getHistory(type?: ContentType): Promise<GeneratedContent[]>;
  
  // CVs
  async saveCV(cv: CVDocument): Promise<string>;
  async getCVs(): Promise<CVDocument[]>;
  async getCV(id: string): Promise<CVDocument | null>;
  
  // Profile cache
  async cacheProfile(data: ProfileData): Promise<void>;
  async getCachedProfile(): Promise<ProfileData | null>;
  
  // Export/Import
  async exportData(): Promise<string>; // JSON string
  async importData(jsonString: string): Promise<void>;
}
```

**IndexedDB wrapper:**
- Type-safe operations
- Automatic cache invalidation (TTL)
- Transaction handling
- Error recovery

---

### Popup & Options UI

**Popup (popup.html):**
- Quick status check (connected providers, API status)
- Shortcuts to common actions
- "Open Sidebar" button
- Link to full options page

**Options Page (options.html):**
- Multi-step configuration interface
- API key management with test connection
- Style configuration (presets + learned style analysis)
- Provider preferences per feature
- Export/import settings
- Privacy information
- Clear history/data options

**Sidebar Panel (sidebar.html):**
- Injected into LinkedIn as overlay
- Tabs: Quick Actions, History, My CVs, Settings
- Context-aware (shows relevant tools based on current LinkedIn page)
- Persistent across LinkedIn navigation

---

## AI Provider System

### Supported Providers

#### 1. Claude (Anthropic)

**Models:**
- `claude-3-5-sonnet-20241022` (default, best balance)
- `claude-3-opus-20240229` (highest quality)
- `claude-3-haiku-20240307` (fastest, cheapest)

**API Endpoint:** `https://api.anthropic.com/v1/messages`

**Authentication:** `x-api-key` header

**Request Format:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 2048,
  "temperature": 0.7,
  "system": "System prompt here",
  "messages": [
    {"role": "user", "content": "User prompt here"}
  ]
}
```

#### 2. OpenAI

**Models:**
- `gpt-4-turbo` (default)
- `gpt-4` (high quality)
- `gpt-3.5-turbo` (fast, cheap)

**API Endpoint:** `https://api.openai.com/v1/chat/completions`

**Authentication:** `Authorization: Bearer {api_key}`

**Request Format:**
```json
{
  "model": "gpt-4-turbo",
  "messages": [
    {"role": "system", "content": "System prompt"},
    {"role": "user", "content": "User prompt"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

#### 3. Gemini (Google)

**Models:**
- `gemini-pro` (default)
- `gemini-ultra` (highest capability, when available)

**API Endpoint:** `https://generativelanguage.googleapis.com/v1/models/{model}:generateContent`

**Authentication:** `?key={api_key}` query parameter

**Request Format:**
```json
{
  "contents": [{
    "parts": [{
      "text": "System prompt + User prompt combined"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

### Configuration Interface

**In Options Page:**

```
┌─────────────────────────────────────────────────────────┐
│  AI Provider Configuration                              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Default Provider: [Claude ▼]                            │
│                                                           │
│  ┌─ Claude (Anthropic) ─────────────────────────────┐   │
│  │  API Key: [••••••••••••••••••] [Show] [Test]     │   │
│  │  Status: ✓ Connected                              │   │
│  │  Model: [claude-3-5-sonnet-20241022 ▼]           │   │
│  │  [Get API Key] → https://console.anthropic.com    │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ OpenAI ──────────────────────────────────────────┐   │
│  │  API Key: [Not configured] [Test]                 │   │
│  │  Status: ⚠ Not configured                         │   │
│  │  Model: [gpt-4-turbo ▼]                           │   │
│  │  [Get API Key] → https://platform.openai.com      │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ Gemini (Google) ─────────────────────────────────┐   │
│  │  API Key: [Not configured] [Test]                 │   │
│  │  Status: ⚠ Not configured                         │   │
│  │  Model: [gemini-pro ▼]                            │   │
│  │  [Get API Key] → https://makersuite.google.com    │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  Advanced: Provider per Feature                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Posts:     [Use Default ▼]                        │   │
│  │ Comments:  [Use Default ▼]                        │   │
│  │ CVs:       [Use Default ▼]                        │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│                               [Save Configuration]       │
└─────────────────────────────────────────────────────────┘
```

### Prompt System

**Centralized Prompt Management** (`src/prompts/`)

Each feature has a dedicated prompt builder function:

```typescript
// src/prompts/post-generation.ts
export function buildPostGenerationPrompt(
  idea: string,
  options: {
    tone: string;
    length: 'short' | 'medium' | 'long';
    includeHashtags: boolean;
    includeCTA: boolean;
    styleProfile?: string;
    language?: string;
  }
): { system: string; user: string } {
  
  const systemPrompt = `
You are a LinkedIn content expert helping professionals create engaging posts.

Style Guidelines:
${options.styleProfile || getPresetStyle(options.tone)}

Best Practices:
- Start with a hook that grabs attention
- Use short paragraphs for readability
- Include relevant emojis naturally (not forced)
- ${options.includeHashtags ? 'Add 3-5 relevant hashtags at the end' : 'No hashtags'}
- ${options.includeCTA ? 'End with a clear call-to-action' : 'Natural conclusion'}

Length: ${getLengthGuideline(options.length)}

${options.language ? `Respond in ${options.language}.` : 'Detect language from input and respond in the same language.'}
`;

  const userPrompt = `
Generate a LinkedIn post based on this idea:

${idea}

Requirements:
- Make it engaging and professional
- Follow the style guidelines
- Stay within the character limit
`;

  return { system: systemPrompt, user: userPrompt };
}
```

Similar builders for:
- `buildPostImprovementPrompt()`
- `buildCommentResponsePrompt()`
- `buildCVGenerationPrompt()`
- `buildCVAdaptationPrompt()`
- `buildStyleAnalysisPrompt()`

---

## Style Personalization

### Two-Mode System

Users can choose between:
1. **Preset Styles** - Predefined professional tones
2. **Learned Style** - Analyzed from user's LinkedIn posts
3. **Hybrid** - Learned style with preset adjustments

### Preset Styles

**Available Presets:**

| Preset | Description | Use Cases | Characteristics |
|--------|-------------|-----------|-----------------|
| **Professional Formal** | Corporate, executive tone | Official announcements, thought leadership | No emojis, formal vocabulary, third-person perspective |
| **Professional Casual** | Friendly yet professional | Daily updates, team highlights | Minimal emojis, conversational, first-person |
| **Inspirational** | Motivational storytelling | Personal journey, lessons learned | Emotional, story arcs, empowering language |
| **Technical Expert** | Data-driven, precise | Industry insights, technical tutorials | Jargon-appropriate, metrics, specific terminology |
| **Thought Leader** | Bold opinions, perspectives | Controversial takes, industry trends | Strong statements, questioning norms, provocative |
| **Educational** | Teaching and explaining | How-to content, knowledge sharing | Clear structure, examples, step-by-step |

**Implementation:**

```typescript
// src/prompts/presets.ts
export const STYLE_PRESETS: Record<string, string> = {
  'professional-formal': `
    - Use formal business language
    - Avoid emojis and casual expressions
    - Third-person perspective when appropriate
    - Clear, concise sentences
    - Focus on facts and achievements
  `,
  'professional-casual': `
    - Conversational yet professional tone
    - Occasional emojis (1-2 per post)
    - First-person perspective
    - Balance between formal and friendly
    - Relatable examples
  `,
  // ... other presets
};
```

### Learned Style Analysis

**Process:**

1. **User initiates analysis** (Options page → "Analyze my LinkedIn style")
2. **Content script extracts recent posts:**
   - Navigate to user's profile activity
   - Extract last 10-20 posts (text only)
   - Filter out reposts/shares (only original content)
3. **Send to AI for analysis:**

```typescript
// src/prompts/style-analysis.ts
export function buildStyleAnalysisPrompt(posts: string[]): string {
  return `
Analyze these LinkedIn posts and create a detailed style profile.

Posts:
${posts.map((p, i) => `\n--- Post ${i + 1} ---\n${p}\n`).join('')}

Provide analysis in this JSON format:
{
  "tone": "description of overall tone",
  "vocabulary_level": "casual | professional | technical | executive",
  "emoji_usage": "none | minimal | moderate | frequent",
  "sentence_structure": "short and punchy | varied | long and detailed",
  "paragraph_style": "single paragraph | multiple short | structured sections",
  "storytelling": "data-driven | anecdotal | mixed",
  "engagement_tactics": ["questions", "calls-to-action", "personal anecdotes"],
  "hashtag_pattern": "none | minimal (1-3) | moderate (4-6) | many (7+)",
  "formatting": "plain text | bullet points | line breaks | structured",
  "voice": "first-person | third-person | mixed",
  "style_summary": "A concise paragraph describing the unique writing style"
}

Be specific and detailed to capture the authentic voice.
`;
}
```

4. **Store style profile:**
   - Save AI response as JSON in IndexedDB
   - Use `style_summary` in future system prompts

5. **Apply learned style:**

```typescript
const systemPrompt = `
You are ghostwriting for a LinkedIn user with this writing style:

${userSettings.learnedStyle.style_summary}

Specific characteristics:
- Tone: ${userSettings.learnedStyle.tone}
- Emoji usage: ${userSettings.learnedStyle.emoji_usage}
- Sentence structure: ${userSettings.learnedStyle.sentence_structure}
- Engagement tactics: ${userSettings.learnedStyle.engagement_tactics.join(', ')}

Mimic this style naturally while creating the requested content.
`;
```

### Style Configuration UI

```
┌──────────────────────────────────────────────────────────┐
│  Content Style Configuration                             │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Style Mode:                                              │
│  ( ) Use Preset Style                                     │
│      └─ [Professional Casual ▼]                           │
│          Preview: "I'm excited to share that..."          │
│                                                            │
│  (•) Use My Learned Style                                 │
│      Status: ✓ Analyzed May 14, 2026                      │
│      [View Style Profile] [Re-analyze]                    │
│      Summary: "Conversational and authentic, uses         │
│      personal anecdotes, 1-2 emojis per post, asks        │
│      thought-provoking questions..."                      │
│                                                            │
│  ( ) Hybrid (Learned + Adjustments)                       │
│      Base: My Learned Style                               │
│      Adjust: [More Professional ◄──●────► More Casual]    │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Custom Style Instructions (Optional)               │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ Always mention sustainability when relevant  │   │   │
│  │ │ Avoid corporate jargon                       │   │   │
│  │ │                                               │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Per-Feature Override:                                    │
│  ☐ Allow manual style selection when generating content   │
│                                                            │
│                                          [Save Settings]  │
└──────────────────────────────────────────────────────────┘
```

### Language Detection

**Automatic language detection:**

```typescript
// src/shared/language-detector.ts
import { franc } from 'franc-min'; // Lightweight language detection

export function detectLanguage(text: string): string {
  const langCode = franc(text);
  
  const langMap: Record<string, string> = {
    'spa': 'Spanish',
    'eng': 'English',
    'por': 'Portuguese',
    'fra': 'French',
    // ... more languages
  };
  
  return langMap[langCode] || 'English';
}
```

**Applied in prompt:**
```typescript
const detectedLang = detectLanguage(userInput);
const systemPrompt = `
...
Respond in ${detectedLang}.
`;
```

---

## Data Storage Schema

### IndexedDB Structure

**Database Name:** `linkedin-assistant-db`  
**Version:** 1

**Object Stores:**

#### 1. `settings`

```typescript
interface UserSettings {
  id: 'user-config'; // singleton
  
  // AI Configuration
  apiKeys: {
    claude: string | null;
    openai: string | null;
    gemini: string | null;
  };
  defaultProvider: 'claude' | 'openai' | 'gemini';
  providerByFeature: {
    posts: 'default' | 'claude' | 'openai' | 'gemini';
    comments: 'default' | 'claude' | 'openai' | 'gemini';
    cv: 'default' | 'claude' | 'openai' | 'gemini';
  };
  models: {
    claude: string;
    openai: string;
    gemini: string;
  };
  
  // Style Configuration
  styleMode: 'preset' | 'learned' | 'hybrid';
  selectedPreset: string | null;
  learnedStyle: StyleProfile | null;
  customInstructions: string;
  
  // Preferences
  language: 'auto' | 'es' | 'en' | 'pt' | 'fr';
  autoDetectLanguage: boolean;
  
  // Meta
  lastStyleAnalysis: string | null; // ISO date
  onboardingCompleted: boolean;
  version: string;
}

interface StyleProfile {
  tone: string;
  vocabulary_level: string;
  emoji_usage: string;
  sentence_structure: string;
  paragraph_style: string;
  storytelling: string;
  engagement_tactics: string[];
  hashtag_pattern: string;
  formatting: string;
  voice: string;
  style_summary: string;
  analyzed_at: string; // ISO date
}
```

**Index:** None (singleton record)

---

#### 2. `generated-content`

```typescript
interface GeneratedContent {
  id: string; // UUID
  type: 'post-from-idea' | 'post-improvement' | 'comment-response';
  
  // Input/Output
  input: string;
  output: string;
  
  // Context
  context: {
    linkedinUrl?: string;
    postContext?: string; // For comment responses
    jobTitle?: string; // If relevant
  };
  
  // AI Details
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  
  // Meta
  timestamp: string; // ISO date
  wasUsed: boolean; // Did user actually use this?
  userRating?: 1 | 2 | 3 | 4 | 5; // Optional feedback
}
```

**Indexes:**
- `type` (for filtering by content type)
- `timestamp` (for chronological queries)

---

#### 3. `cvs`

```typescript
interface CVDocument {
  id: string; // UUID
  name: string; // "CV Base" | "CV - Software Engineer at Google"
  type: 'base' | 'adapted';
  
  // Source Data
  sourceProfileData: {
    name: string;
    headline: string;
    summary: string;
    location?: string;
    experiences: Experience[];
    education: Education[];
    skills: string[];
    certifications?: Certification[];
    languages?: Language[];
  };
  
  // Generated Content
  generatedContent: string; // HTML markup of CV
  template: string; // 'professional' | 'modern' | 'classic' | 'minimalist'
  
  // Adaptation Details (if type === 'adapted')
  adaptedFor?: {
    jobTitle: string;
    company: string;
    jobUrl: string;
    jobDescription: string;
    matchScore: number; // 0-100
    highlightedSkills: string[];
  };
  
  // Meta
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  lastExportedAt?: string; // ISO date
  exportCount: number;
}

interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string; // "Jan 2020"
  endDate: string | null; // null = current
  description: string;
  achievements?: string[];
}

interface Education {
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate: string;
  description?: string;
}

interface Certification {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface Language {
  name: string;
  proficiency: string; // "Native", "Professional", "Limited"
}
```

**Indexes:**
- `type` (base vs adapted)
- `createdAt` (chronological)

---

#### 4. `linkedin-profile-cache`

```typescript
interface ProfileCache {
  id: 'cached-profile'; // singleton
  profileData: {
    name: string;
    headline: string;
    summary: string;
    location?: string;
    experiences: Experience[];
    education: Education[];
    skills: string[];
    certifications?: Certification[];
    languages?: Language[];
  };
  lastFetched: string; // ISO date
  ttl: number; // milliseconds (24 hours = 86400000)
}
```

**Cache Invalidation:**
- TTL of 24 hours
- Manual refresh button in sidebar
- Auto-refresh if user navigates to profile page

**Index:** None (singleton)

---

#### 5. `user-posts-cache`

```typescript
interface PostCache {
  id: string; // LinkedIn post URL or unique ID
  content: string;
  postedAt: string; // ISO date
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  cachedAt: string; // ISO date
}
```

**Purpose:** Store user's posts for style analysis

**Indexes:**
- `postedAt` (chronological)
- `cachedAt` (for cleanup of old cache)

---

### Storage Service API

```typescript
// src/background/storage-service.ts

class StorageService {
  private db: IDBDatabase;
  
  // Initialization
  async init(): Promise<void>;
  
  // Settings
  async getSettings(): Promise<UserSettings>;
  async updateSettings(partial: Partial<UserSettings>): Promise<void>;
  async resetSettings(): Promise<void>;
  
  // Generated Content
  async saveGeneratedContent(content: Omit<GeneratedContent, 'id' | 'timestamp'>): Promise<string>;
  async getGeneratedContent(id: string): Promise<GeneratedContent | null>;
  async getContentHistory(options?: {
    type?: GeneratedContent['type'];
    limit?: number;
    offset?: number;
  }): Promise<GeneratedContent[]>;
  async deleteGeneratedContent(id: string): Promise<void>;
  async clearHistory(type?: GeneratedContent['type']): Promise<void>;
  
  // CVs
  async saveCV(cv: Omit<CVDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  async updateCV(id: string, updates: Partial<CVDocument>): Promise<void>;
  async getCV(id: string): Promise<CVDocument | null>;
  async getAllCVs(type?: 'base' | 'adapted'): Promise<CVDocument[]>;
  async deleteCV(id: string): Promise<void>;
  
  // Profile Cache
  async cacheProfile(data: ProfileCache['profileData']): Promise<void>;
  async getCachedProfile(): Promise<ProfileCache | null>;
  async invalidateProfileCache(): Promise<void>;
  
  // Posts Cache
  async cachePosts(posts: Omit<PostCache, 'cachedAt'>[]): Promise<void>;
  async getCachedPosts(limit?: number): Promise<PostCache[]>;
  async clearPostsCache(): Promise<void>;
  
  // Export/Import
  async exportData(options?: {
    includeHistory?: boolean;
    includeCVs?: boolean;
    includeApiKeys?: boolean;
  }): Promise<string>; // JSON string
  async importData(jsonString: string, options?: {
    overwrite?: boolean;
  }): Promise<void>;
  
  // Utilities
  async getDatabaseSize(): Promise<number>; // bytes
  async clearAllData(): Promise<void>;
}
```

---

## LinkedIn Integration Points

### Content Script Injection

**Manifest V3 declaration:**

```json
{
  "content_scripts": [{
    "matches": ["https://*.linkedin.com/*"],
    "js": ["content/linkedin-content.js"],
    "css": ["content/linkedin-styles.css"],
    "run_at": "document_idle"
  }]
}
```

### DOM Observation Strategy

**Challenge:** LinkedIn is a Single Page Application (SPA) that loads content dynamically.

**Solution:** MutationObserver watches for DOM changes and re-injects UI.

```typescript
// src/content/observers/dom-observer.ts

class LinkedInObserver {
  private observer: MutationObserver;
  private injectors: Map<string, Function>;
  
  start() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          this.handleNewNodes(mutation.addedNodes);
        }
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Initial injection
    this.injectAll();
  }
  
  private handleNewNodes(nodes: NodeList) {
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // Check if this element matches any injection contexts
        if (this.isPostComposer(element)) {
          this.injectors.get('post-composer')?.();
        }
        if (this.isCommentSection(element)) {
          this.injectors.get('comments')?.();
        }
        // ... other contexts
      }
    });
  }
  
  private isPostComposer(element: Element): boolean {
    // Multiple selectors for robustness
    return element.querySelector('.share-box') !== null ||
           element.querySelector('[data-test-share-box]') !== null ||
           element.classList.contains('share-creation-state');
  }
  
  // Debounce to avoid excessive re-injection
  private debounce(fn: Function, delay: number) {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }
}
```

---

### Integration Point 1: Post Composer

**Context:** User clicks "Start a post" or "Write article"

**Selectors (multiple fallbacks):**
```typescript
const COMPOSER_SELECTORS = [
  '.share-creation-state__text-editor',
  '[data-test-share-box-text]',
  '.ql-editor[contenteditable="true"]',
  '.share-box__text-editor'
];
```

**UI Injection:**

```typescript
// src/content/injectors/post-composer.ts

export function injectPostComposerButtons() {
  const composer = findComposer();
  if (!composer) return;
  
  // Check if already injected
  if (composer.querySelector('.lia-post-composer-buttons')) return;
  
  // Find toolbar
  const toolbar = composer.querySelector('.share-box__bottom-bar') ||
                  composer.querySelector('[data-test-share-box-footer]');
  
  if (!toolbar) return;
  
  // Create button container
  const container = document.createElement('div');
  container.className = 'lia-post-composer-buttons';
  container.style.cssText = `
    display: inline-flex;
    gap: 8px;
    margin-left: 12px;
  `;
  
  // Generate from Idea button
  const generateBtn = createButton({
    text: '✨ Generate from Idea',
    className: 'lia-btn-generate',
    onClick: () => openGenerateModal()
  });
  
  // Improve Post button
  const improveBtn = createButton({
    text: '🚀 Improve Post',
    className: 'lia-btn-improve',
    onClick: () => openImproveModal()
  });
  
  container.append(generateBtn, improveBtn);
  toolbar.prepend(container);
}

function openGenerateModal() {
  const modal = new GeneratePostModal();
  modal.show();
}

function openImproveModal() {
  const currentText = extractComposerText();
  if (!currentText.trim()) {
    showToast('Please write a draft first', 'warning');
    return;
  }
  const modal = new ImprovePostModal(currentText);
  modal.show();
}
```

**Modal UI:**

```typescript
// src/content/ui/modal.ts

class GeneratePostModal {
  private overlay: HTMLElement;
  private modal: HTMLElement;
  
  constructor() {
    this.buildModal();
  }
  
  private buildModal() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'lia-modal-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'lia-modal';
    this.modal.innerHTML = `
      <div class="lia-modal-header">
        <h2>Generate Post from Idea</h2>
        <button class="lia-modal-close">&times;</button>
      </div>
      <div class="lia-modal-body">
        <label>Describe your idea:</label>
        <textarea id="lia-idea-input" rows="4" placeholder="Example: I want to share my experience with remote work..."></textarea>
        
        <label>Tone:</label>
        <select id="lia-tone-select">
          <option value="my-style">My Style</option>
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="inspirational">Inspirational</option>
        </select>
        
        <label>Length:</label>
        <div class="lia-length-slider">
          <input type="range" id="lia-length" min="1" max="3" value="2">
          <div class="lia-length-labels">
            <span>Short</span>
            <span>Medium</span>
            <span>Long</span>
          </div>
        </div>
        
        <label>
          <input type="checkbox" id="lia-hashtags"> Include hashtags
        </label>
        <label>
          <input type="checkbox" id="lia-cta"> Include call-to-action
        </label>
      </div>
      <div class="lia-modal-footer">
        <button class="lia-btn-secondary" id="lia-cancel">Cancel</button>
        <button class="lia-btn-primary" id="lia-generate">Generate</button>
      </div>
    `;
    
    this.overlay.appendChild(this.modal);
    
    // Event listeners
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    const closeBtn = this.modal.querySelector('.lia-modal-close');
    const cancelBtn = this.modal.querySelector('#lia-cancel');
    const generateBtn = this.modal.querySelector('#lia-generate');
    
    closeBtn?.addEventListener('click', () => this.hide());
    cancelBtn?.addEventListener('click', () => this.hide());
    generateBtn?.addEventListener('click', () => this.handleGenerate());
    
    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
  }
  
  private async handleGenerate() {
    const idea = (document.getElementById('lia-idea-input') as HTMLTextAreaElement).value;
    const tone = (document.getElementById('lia-tone-select') as HTMLSelectElement).value;
    const length = parseInt((document.getElementById('lia-length') as HTMLInputElement).value);
    const hashtags = (document.getElementById('lia-hashtags') as HTMLInputElement).checked;
    const cta = (document.getElementById('lia-cta') as HTMLInputElement).checked;
    
    if (!idea.trim()) {
      showToast('Please describe your idea', 'warning');
      return;
    }
    
    // Show loading state
    const generateBtn = this.modal.querySelector('#lia-generate') as HTMLButtonElement;
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    try {
      // Send to background worker
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_POST',
        payload: { idea, tone, length, hashtags, cta }
      });
      
      if (response.success) {
        // Show preview modal
        this.showPreview(response.content);
      } else {
        showToast(response.error || 'Generation failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
      console.error('Generate error:', error);
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate';
    }
  }
  
  private showPreview(content: string) {
    // Replace modal body with preview
    const modalBody = this.modal.querySelector('.lia-modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
      <div class="lia-preview">
        <label>Generated Post:</label>
        <div class="lia-preview-content">${escapeHtml(content)}</div>
        <div class="lia-preview-meta">
          <span>${content.length} characters</span>
        </div>
      </div>
      <div class="lia-preview-actions">
        <button class="lia-btn-secondary" id="lia-regenerate">🔄 Regenerate</button>
        <button class="lia-btn-secondary" id="lia-edit">✏️ Edit</button>
        <button class="lia-btn-primary" id="lia-use">✓ Use This Post</button>
      </div>
    `;
    
    // Update footer
    const footer = this.modal.querySelector('.lia-modal-footer');
    if (footer) footer.innerHTML = '';
    
    // Event listeners for preview actions
    modalBody.querySelector('#lia-regenerate')?.addEventListener('click', () => {
      this.buildModal(); // Reset to input form
      this.handleGenerate(); // Re-generate
    });
    
    modalBody.querySelector('#lia-edit')?.addEventListener('click', () => {
      // Make content editable
      const previewDiv = modalBody.querySelector('.lia-preview-content') as HTMLElement;
      previewDiv.contentEditable = 'true';
      previewDiv.focus();
    });
    
    modalBody.querySelector('#lia-use')?.addEventListener('click', () => {
      this.applyToComposer(content);
      this.hide();
      showToast('Post inserted successfully', 'success');
    });
  }
  
  private applyToComposer(content: string) {
    const composer = findComposer();
    if (!composer) return;
    
    // LinkedIn uses a complex editor, need to trigger proper events
    const editor = composer.querySelector('.ql-editor') as HTMLElement;
    if (editor) {
      editor.innerHTML = content.replace(/\n/g, '<br>');
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  show() {
    document.body.appendChild(this.overlay);
  }
  
  hide() {
    this.overlay.remove();
  }
}
```

---

### Integration Point 2: Comments

**Context:** User wants to respond to a comment on any post

**Selectors:**
```typescript
const COMMENT_SELECTORS = [
  '.comments-comment-item',
  '[data-test-comment-item]',
  '.comment-entity'
];
```

**UI Injection:**

```typescript
// src/content/injectors/comments.ts

export function injectCommentButtons() {
  const comments = document.querySelectorAll(COMMENT_SELECTORS.join(','));
  
  comments.forEach((comment) => {
    // Skip if already injected
    if (comment.querySelector('.lia-comment-ai-btn')) return;
    
    // Find actions bar
    const actionsBar = comment.querySelector('.comment-actions') ||
                       comment.querySelector('[data-test-comment-actions]');
    
    if (!actionsBar) return;
    
    // Create AI reply button
    const aiBtn = document.createElement('button');
    aiBtn.className = 'lia-comment-ai-btn';
    aiBtn.innerHTML = '💬 AI Reply';
    aiBtn.style.cssText = `
      background: none;
      border: none;
      color: #0a66c2;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 8px;
    `;
    
    aiBtn.addEventListener('click', () => {
      const commentText = extractCommentText(comment as HTMLElement);
      const postContext = extractPostContext(comment as HTMLElement);
      openCommentReplyModal(commentText, postContext);
    });
    
    actionsBar.appendChild(aiBtn);
  });
}

function extractCommentText(commentElement: HTMLElement): string {
  const textElement = commentElement.querySelector('.comment-body__text') ||
                      commentElement.querySelector('[data-test-comment-body]');
  return textElement?.textContent?.trim() || '';
}

function extractPostContext(commentElement: HTMLElement): string {
  // Walk up DOM to find original post
  const postElement = commentElement.closest('.feed-shared-update-v2') ||
                      commentElement.closest('[data-test-feed-update]');
  
  if (!postElement) return '';
  
  const postText = postElement.querySelector('.feed-shared-text__text-view') ||
                   postElement.querySelector('[data-test-post-text]');
  
  return postText?.textContent?.trim() || '';
}

function openCommentReplyModal(commentText: string, postContext: string) {
  const modal = new CommentReplyModal(commentText, postContext);
  modal.show();
}
```

**Comment Reply Modal:** (Similar structure to GeneratePostModal, adapted for comments)

---

### Integration Point 3: Profile - Generate CV

**Context:** User on their own profile page

**URL Pattern:** `https://www.linkedin.com/in/{username}/`

**Detection:**
```typescript
function isOwnProfile(): boolean {
  // Check if viewing own profile vs someone else's
  const editButton = document.querySelector('[data-control-name="edit_topcard"]');
  return editButton !== null;
}
```

**UI Injection:**

```typescript
// src/content/injectors/profile.ts

export function injectProfileCVButton() {
  if (!isOwnProfile()) return;
  
  // Check if already injected
  if (document.querySelector('.lia-profile-cv-btn')) return;
  
  // Create floating action button
  const fabContainer = document.createElement('div');
  fabContainer.className = 'lia-profile-cv-btn';
  fabContainer.style.cssText = `
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 9999;
  `;
  
  const fabButton = document.createElement('button');
  fabButton.innerHTML = '📄 Generate CV';
  fabButton.style.cssText = `
    background: #0a66c2;
    color: white;
    border: none;
    border-radius: 24px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: transform 0.2s;
  `;
  
  fabButton.addEventListener('mouseenter', () => {
    fabButton.style.transform = 'scale(1.05)';
  });
  
  fabButton.addEventListener('mouseleave', () => {
    fabButton.style.transform = 'scale(1)';
  });
  
  fabButton.addEventListener('click', async () => {
    // Extract profile data
    showToast('Extracting profile data...', 'info');
    
    const profileData = await extractProfileData();
    
    if (!profileData) {
      showToast('Failed to extract profile data', 'error');
      return;
    }
    
    // Open sidebar with CV generator
    openSidebarWithCV(profileData);
  });
  
  fabContainer.appendChild(fabButton);
  document.body.appendChild(fabContainer);
}
```

**Profile Data Extraction:**

```typescript
// src/content/extractors/profile-extractor.ts

export async function extractProfileData(): Promise<ProfileData | null> {
  try {
    const data: ProfileData = {
      name: extractName(),
      headline: extractHeadline(),
      summary: extractSummary(),
      location: extractLocation(),
      experiences: await extractExperiences(),
      education: await extractEducation(),
      skills: await extractSkills(),
      certifications: await extractCertifications(),
      languages: await extractLanguages()
    };
    
    return data;
  } catch (error) {
    console.error('Profile extraction error:', error);
    return null;
  }
}

function extractName(): string {
  const nameElement = document.querySelector('.pv-text-details__left-panel h1') ||
                      document.querySelector('[data-test-profile-name]');
  return nameElement?.textContent?.trim() || '';
}

function extractHeadline(): string {
  const headlineElement = document.querySelector('.pv-text-details__left-panel .text-body-medium') ||
                         document.querySelector('[data-test-profile-headline]');
  return headlineElement?.textContent?.trim() || '';
}

function extractSummary(): string {
  // Click "Show more" if summary is collapsed
  const showMoreBtn = document.querySelector('#line-clamp-show-more-button');
  if (showMoreBtn) {
    (showMoreBtn as HTMLElement).click();
    // Wait for expansion
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const summaryElement = document.querySelector('.pv-about__summary-text') ||
                        document.querySelector('[data-test-profile-about]');
  return summaryElement?.textContent?.trim() || '';
}

async function extractExperiences(): Promise<Experience[]> {
  const experiences: Experience[] = [];
  
  // Navigate to experience section
  const expSection = document.querySelector('#experience');
  if (!expSection) return experiences;
  
  // Find all experience items
  const expItems = expSection.parentElement?.querySelectorAll('.pvs-list__item--line-separated') || [];
  
  expItems.forEach((item) => {
    const title = item.querySelector('.mr1.hoverable-link-text')?.textContent?.trim() || '';
    const company = item.querySelector('.t-14.t-normal span[aria-hidden="true"]')?.textContent?.trim() || '';
    const dateRange = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]')?.textContent?.trim() || '';
    const description = item.querySelector('.pvs-list__outer-container')?.textContent?.trim() || '';
    
    // Parse date range
    const [startDate, endDate] = parseDateRange(dateRange);
    
    experiences.push({
      title,
      company,
      startDate,
      endDate,
      description
    });
  });
  
  return experiences;
}

function parseDateRange(dateStr: string): [string, string | null] {
  // Example: "Jan 2020 - Present" or "Jan 2020 - Dec 2022"
  const parts = dateStr.split(' - ');
  const startDate = parts[0]?.trim() || '';
  const endDate = parts[1]?.trim() === 'Present' ? null : parts[1]?.trim() || null;
  return [startDate, endDate];
}

// Similar functions for education, skills, etc.
```

---

### Integration Point 4: Job Listings - Adapt CV

**Context:** User viewing a specific job posting

**URL Pattern:** `https://www.linkedin.com/jobs/view/{job-id}/`

**UI Injection:**

```typescript
// src/content/injectors/job-listing.ts

export function injectJobCVButton() {
  // Check if on job detail page
  if (!window.location.pathname.startsWith('/jobs/view/')) return;
  
  // Check if already injected
  if (document.querySelector('.lia-job-cv-btn')) return;
  
  // Find the apply button section
  const applySection = document.querySelector('.jobs-apply-button') ||
                       document.querySelector('[data-test-job-apply]');
  
  if (!applySection) return;
  
  // Create AI CV button
  const cvButton = document.createElement('button');
  cvButton.className = 'lia-job-cv-btn';
  cvButton.innerHTML = '🎯 Adapt My CV';
  cvButton.style.cssText = `
    background: #057642;
    color: white;
    border: none;
    border-radius: 24px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-left: 8px;
  `;
  
  cvButton.addEventListener('click', async () => {
    showToast('Analyzing job description...', 'info');
    
    const jobData = await extractJobData();
    
    if (!jobData) {
      showToast('Failed to extract job data', 'error');
      return;
    }
    
    // Open sidebar with CV adaptation
    openSidebarWithCVAdaptation(jobData);
  });
  
  applySection.appendChild(cvButton);
}
```

**Job Data Extraction:**

```typescript
// src/content/extractors/job-extractor.ts

export async function extractJobData(): Promise<JobData | null> {
  try {
    const data: JobData = {
      jobId: extractJobId(),
      jobTitle: extractJobTitle(),
      company: extractCompany(),
      location: extractLocation(),
      jobDescription: extractJobDescription(),
      skills: extractRequiredSkills(),
      qualifications: extractQualifications()
    };
    
    return data;
  } catch (error) {
    console.error('Job extraction error:', error);
    return null;
  }
}

function extractJobId(): string {
  const match = window.location.pathname.match(/\/jobs\/view\/(\d+)/);
  return match?.[1] || '';
}

function extractJobTitle(): string {
  const titleElement = document.querySelector('.jobs-unified-top-card__job-title') ||
                       document.querySelector('[data-test-job-title]');
  return titleElement?.textContent?.trim() || '';
}

function extractJobDescription(): string {
  // Click "Show more" if description is collapsed
  const showMoreBtn = document.querySelector('.jobs-description__footer-button');
  if (showMoreBtn) {
    (showMoreBtn as HTMLElement).click();
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const descElement = document.querySelector('.jobs-description__content') ||
                     document.querySelector('[data-test-job-description]');
  return descElement?.textContent?.trim() || '';
}

function extractRequiredSkills(): string[] {
  const skills: string[] = [];
  
  // LinkedIn sometimes shows skills in a separate section
  const skillsSection = document.querySelector('.jobs-unified-top-card__skills');
  
  if (skillsSection) {
    const skillElements = skillsSection.querySelectorAll('.jobs-unified-top-card__job-insight-text');
    skillElements.forEach((el) => {
      const skill = el.textContent?.trim();
      if (skill) skills.push(skill);
    });
  }
  
  // Also extract from description using AI (send to background worker)
  // This is done in the adaptation process
  
  return skills;
}
```

---

### Sidebar Component

**Purpose:** Persistent panel for complex interactions (CV generation, history, settings)

**Implementation:**

```typescript
// src/content/ui/sidebar.ts

class Sidebar {
  private container: HTMLElement;
  private isOpen: boolean = false;
  
  constructor() {
    this.buildSidebar();
  }
  
  private buildSidebar() {
    this.container = document.createElement('div');
    this.container.className = 'lia-sidebar';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: -500px;
      width: 500px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
    `;
    
    this.container.innerHTML = `
      <div class="lia-sidebar-header">
        <h2>LinkedIn Assistant</h2>
        <button class="lia-sidebar-close">&times;</button>
      </div>
      <div class="lia-sidebar-tabs">
        <button class="lia-tab active" data-tab="actions">Quick Actions</button>
        <button class="lia-tab" data-tab="history">History</button>
        <button class="lia-tab" data-tab="cvs">My CVs</button>
        <button class="lia-tab" data-tab="settings">Settings</button>
      </div>
      <div class="lia-sidebar-content">
        <div class="lia-tab-content active" data-content="actions">
          <!-- Quick Actions -->
        </div>
        <div class="lia-tab-content" data-content="history">
          <!-- History -->
        </div>
        <div class="lia-tab-content" data-content="cvs">
          <!-- CVs -->
        </div>
        <div class="lia-tab-content" data-content="settings">
          <!-- Settings -->
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Close button
    const closeBtn = this.container.querySelector('.lia-sidebar-close');
    closeBtn?.addEventListener('click', () => this.close());
    
    // Tab switching
    const tabs = this.container.querySelectorAll('.lia-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        this.switchTab(tabName!);
      });
    });
  }
  
  private switchTab(tabName: string) {
    // Deactivate all tabs
    this.container.querySelectorAll('.lia-tab').forEach(t => t.classList.remove('active'));
    this.container.querySelectorAll('.lia-tab-content').forEach(c => c.classList.remove('active'));
    
    // Activate selected tab
    const tab = this.container.querySelector(`[data-tab="${tabName}"]`);
    const content = this.container.querySelector(`[data-content="${tabName}"]`);
    
    tab?.classList.add('active');
    content?.classList.add('active');
  }
  
  open(tabName: string = 'actions') {
    this.isOpen = true;
    this.container.style.right = '0';
    this.switchTab(tabName);
  }
  
  close() {
    this.isOpen = false;
    this.container.style.right = '-500px';
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  // Content population methods
  async loadHistory() {
    const response = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
    // Render history items
  }
  
  async loadCVs() {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CVS' });
    // Render CV list
  }
}

// Singleton instance
export const sidebar = new Sidebar();
```

---

## User Flows

### Onboarding Flow

**Trigger:** First-time extension installation

**Steps:**

1. **Welcome Screen**
   ```
   ┌────────────────────────────────────────────┐
   │  Welcome to LinkedIn Assistant!            │
   │                                            │
   │  Enhance your LinkedIn with AI:            │
   │  ✓ Generate engaging posts                 │
   │  ✓ Respond to comments intelligently       │
   │  ✓ Create professional CVs                 │
   │  ✓ Adapt resumes to job postings           │
   │                                            │
   │              [Get Started]                 │
   └────────────────────────────────────────────┘
   ```

2. **AI Provider Setup**
   ```
   ┌────────────────────────────────────────────┐
   │  Step 1: Choose Your AI Provider           │
   │                                            │
   │  Select an AI service to power the         │
   │  assistant. You'll need an API key.        │
   │                                            │
   │  ┌──────────────────────────────────────┐ │
   │  │ [●] Claude (Recommended)             │ │
   │  │     Best for professional content    │ │
   │  │     [Get API Key →]                  │ │
   │  │                                      │ │
   │  │ [ ] OpenAI                           │ │
   │  │     Popular, versatile               │ │
   │  │     [Get API Key →]                  │ │
   │  │                                      │ │
   │  │ [ ] Gemini                           │ │
   │  │     Google's AI                      │ │
   │  │     [Get API Key →]                  │ │
   │  └──────────────────────────────────────┘ │
   │                                            │
   │  API Key: [____________________]           │
   │  [Test Connection]                         │
   │                                            │
   │  [← Back]              [Continue →]       │
   └────────────────────────────────────────────┘
   ```

3. **Style Configuration**
   ```
   ┌────────────────────────────────────────────┐
   │  Step 2: Choose Your Writing Style         │
   │                                            │
   │  How should the AI write for you?          │
   │                                            │
   │  [●] Use a preset style                    │
   │      [Professional Casual ▼]               │
   │                                            │
   │      Preview:                              │
   │      "I'm excited to share an insight      │
   │       about remote work... 🚀"             │
   │                                            │
   │  [ ] Analyze my LinkedIn posts             │
   │      (Recommended for authentic voice)     │
   │                                            │
   │  [← Back]              [Continue →]       │
   └────────────────────────────────────────────┘
   ```

4. **Ready Screen**
   ```
   ┌────────────────────────────────────────────┐
   │  You're All Set! 🎉                        │
   │                                            │
   │  Visit LinkedIn to start using the         │
   │  assistant. You'll see new buttons and     │
   │  options throughout LinkedIn.              │
   │                                            │
   │  Look for:                                 │
   │  • "✨ Generate" in post composer          │
   │  • "💬 AI Reply" on comments               │
   │  • "📄 Generate CV" on your profile        │
   │  • "🎯 Adapt CV" on job postings           │
   │                                            │
   │  [☐] Don't show this again                 │
   │                                            │
   │              [Go to LinkedIn]              │
   └────────────────────────────────────────────┘
   ```

---

### Flow: Generate Post from Idea

**Starting Point:** User on LinkedIn feed

1. **Initiate**
   - User clicks "Start a post" → LinkedIn composer opens
   - Extension buttons appear: "✨ Generate from Idea" | "🚀 Improve Post"

2. **Input Idea**
   - User clicks "✨ Generate from Idea"
   - Modal opens with:
     - Textarea: "Describe your idea..."
     - Tone: Dropdown (My Style, Professional, Casual, etc.)
     - Length: Slider (Short / Medium / Long)
     - Checkboxes: Include hashtags, Include CTA

3. **Generate**
   - User fills form and clicks "Generate"
   - Modal shows spinner: "Generating your post..."
   - Background worker:
     - Retrieves user settings (API key, style profile)
     - Builds prompt with idea + options
     - Calls AI provider API
     - Receives generated post

4. **Preview & Refine**
   - Modal displays preview:
     ```
     ┌──────────────────────────────────────┐
     │  Generated Post:                     │
     │  ┌────────────────────────────────┐  │
     │  │ [Post content here]            │  │
     │  │ ...                            │  │
     │  │ #Leadership #RemoteWork        │  │
     │  └────────────────────────────────┘  │
     │  1,247 characters                    │
     │                                      │
     │  [🔄 Regenerate] [✏️ Edit] [✓ Use]  │
     └──────────────────────────────────────┘
     ```
   - User options:
     - **Regenerate:** Generate again with same params
     - **Edit:** Make content editable inline
     - **Use:** Apply to LinkedIn composer

5. **Apply**
   - User clicks "✓ Use"
   - Content inserted into LinkedIn composer
   - Modal closes
   - Toast: "Post inserted successfully"
   - User can edit further or publish

---

### Flow: Adapt CV to Job

**Starting Point:** User viewing job posting

1. **Initiate**
   - User on job detail page: `/jobs/view/123456/`
   - Sees "🎯 Adapt My CV" button near Apply button
   - Clicks button

2. **Extract Job Data**
   - Content script extracts:
     - Job title, company, location
     - Job description
     - Required/preferred qualifications
   - Shows toast: "Analyzing job description..."

3. **Sidebar Opens - Analysis**
   ```
   ┌─────────────────────────────────────────┐
   │  Adapt CV to Job                        │
   ├─────────────────────────────────────────┤
   │                                         │
   │  📋 Job Analysis                        │
   │  ──────────────────────────────────────│
   │  Title: Senior Software Engineer        │
   │  Company: Google                        │
   │                                         │
   │  Key Requirements:                      │
   │  ✓ Python, Go                           │
   │  ✓ Distributed systems                  │
   │  ✓ 5+ years experience                  │
   │  ⚠ Kubernetes (you have limited exp)   │
   │                                         │
   │  Match Score: 78%                       │
   │  ──────────────────────────────────────│
   │                                         │
   │  Select Base CV:                        │
   │  [CV Base ▼]                            │
   │                                         │
   │  Customization:                         │
   │  [✓] Highlight relevant experience      │
   │  [✓] Integrate job keywords             │
   │  [✓] Reorder for relevance              │
   │                                         │
   │           [Generate Adapted CV]         │
   └─────────────────────────────────────────┘
   ```

4. **Generate Adapted CV**
   - User clicks "Generate Adapted CV"
   - Shows spinner: "Adapting your CV..."
   - Background worker:
     - Retrieves base CV from IndexedDB
     - Sends job data + CV to AI
     - Prompt: "Adapt this resume to match the job description without fabricating experience"
     - Receives adapted CV

5. **Preview Adapted CV**
   ```
   ┌─────────────────────────────────────────┐
   │  Adapted CV Preview                     │
   ├─────────────────────────────────────────┤
   │                                         │
   │  [Full CV Preview - Scrollable]         │
   │                                         │
   │  Highlighted Changes:                   │
   │  • Reordered Python project to top      │
   │  • Added "distributed systems" keyword  │
   │  • Emphasized leadership experience     │
   │                                         │
   │  [Compare with Original]                │
   │  [🔄 Regenerate] [💾 Save] [⬇ Export]  │
   └─────────────────────────────────────────┘
   ```

6. **Export**
   - User clicks "⬇ Export"
   - Modal: Choose format (PDF / DOCX)
   - Enter filename (pre-filled: "CV - Senior Software Engineer at Google")
   - Click "Download"
   - File downloads to user's system

7. **Save for Future**
   - User clicks "💾 Save"
   - CV saved to IndexedDB as adapted version
   - Available in "My CVs" tab for future reference

---

## Security & Privacy

### Data Privacy Principles

**Zero Backend Architecture:**
- No proprietary servers
- All data stored locally in browser
- No analytics or tracking
- No telemetry

**User Data Flows:**
```
User Input → Extension → AI Provider API → Extension → User
         ↓
   IndexedDB (local)
```

**What We Store:**
- API keys (encrypted by browser)
- User settings
- Generated content history
- Saved CVs
- Cached profile data

**What We DON'T Store or Transmit:**
- LinkedIn credentials
- Session tokens
- Personal data beyond what user provides
- Browsing history

---

### API Key Security

**Storage:**
- Stored in `chrome.storage.local` (browser-encrypted)
- Not included in default exports
- User must explicitly opt-in to export API keys

**Transmission:**
- Only sent to official AI provider endpoints:
  - `https://api.anthropic.com/*`
  - `https://api.openai.com/*`
  - `https://generativelanguage.googleapis.com/*`
- Sent via HTTPS only
- Never logged or cached in plain text

**Validation:**
- API keys validated on input
- Test connection before saving
- Clear error messages if invalid

---

### Permissions

**Manifest V3 Permissions:**

```json
{
  "manifest_version": 3,
  "permissions": [
    "storage",        // For IndexedDB and chrome.storage
    "activeTab"       // For content script on active LinkedIn tab
  ],
  "host_permissions": [
    "https://*.linkedin.com/*"  // Only LinkedIn domains
  ],
  "optional_host_permissions": [
    "https://api.anthropic.com/*",
    "https://api.openai.com/*",
    "https://generativelanguage.googleapis.com/*"
  ]
}
```

**Why We Need Each:**
- `storage`: Save settings and data locally
- `activeTab`: Inject UI into LinkedIn pages
- LinkedIn host: Read and modify LinkedIn DOM
- AI API hosts: Make API requests to generate content

**What We DON'T Request:**
- `<all_urls>`: No access to other websites
- `cookies`: Don't access LinkedIn session
- `webRequest`: Don't intercept network traffic
- `history`: Don't track browsing history

---

### Content Security Policy

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com"
  }
}
```

**Implications:**
- No inline scripts (security best practice)
- Only extension's own scripts can execute
- Network requests limited to AI provider APIs

---

### Input Sanitization

**All user inputs sanitized before:**
- Displaying in UI (prevent XSS)
- Storing in database
- Sending to AI APIs

```typescript
// src/shared/utils.ts

export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
```

---

### Privacy Disclosures

**In Options Page - Privacy Section:**

```markdown
## Privacy & Data Usage

### What We Collect
- **API Keys:** Stored encrypted in your browser
- **User Settings:** Style preferences, provider choices
- **Generated Content:** Stored locally for history
- **Cached Profile:** Temporary cache of your LinkedIn profile (24h TTL)

### What We DON'T Collect
- We do NOT collect, transmit, or store your data on external servers
- We do NOT track your usage or behavior
- We do NOT access your LinkedIn credentials
- We do NOT share your data with third parties

### Data Storage
- All data stored locally using IndexedDB
- You can export or delete your data at any time
- Uninstalling the extension removes all data

### Third-Party Services
- Your API keys are sent ONLY to your chosen AI provider (Claude, OpenAI, or Gemini)
- These providers have their own privacy policies:
  - [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
  - [OpenAI Privacy Policy](https://openai.com/privacy)
  - [Google AI Privacy](https://ai.google/responsibility/principles/)

### Data Portability
- Export your settings and CVs anytime (Options → Export Data)
- Import on another device or browser

### Questions?
Contact: [support email or GitHub issues]
```

---

## Error Handling

### Error Categories

#### 1. AI Provider Errors

**Invalid API Key:**
```typescript
{
  error: 'INVALID_API_KEY',
  message: 'The API key for Claude is invalid or expired.',
  action: 'redirect_to_settings',
  provider: 'claude'
}
```

**User Experience:**
- Toast notification: "Invalid API key for Claude. Please check your settings."
- Redirect to Options page
- Highlight API key field in red
- Show "Test Connection" button

---

**Rate Limit Exceeded:**
```typescript
{
  error: 'RATE_LIMIT',
  message: 'Rate limit exceeded for OpenAI. Try again in 30 seconds.',
  retryAfter: 30,
  provider: 'openai'
}
```

**User Experience:**
- Toast: "Rate limit reached. Try again in 30s or switch provider."
- Temporary button: "Use Claude Instead"
- Countdown timer in UI

---

**Network Error:**
```typescript
{
  error: 'NETWORK_ERROR',
  message: 'Failed to connect to Gemini API. Check your internet connection.',
  provider: 'gemini'
}
```

**User Experience:**
- Toast: "Connection failed. Check your internet."
- Retry button
- Option to copy prompt for manual use

---

**Invalid Response:**
```typescript
{
  error: 'INVALID_RESPONSE',
  message: 'The AI returned an unexpected response.',
  rawResponse: '...'
}
```

**User Experience:**
- Toast: "Unexpected response. Please try again."
- "Regenerate" button
- Log error for debugging

---

#### 2. LinkedIn Integration Errors

**Selector Not Found:**
```typescript
{
  error: 'SELECTOR_NOT_FOUND',
  message: 'Could not find LinkedIn post composer.',
  context: 'post-composer-injection'
}
```

**User Experience:**
- Silent fallback: Open generic sidebar instead of contextual injection
- Log warning for debugging
- Continue gracefully without blocking user

---

**Extraction Failed:**
```typescript
{
  error: 'EXTRACTION_FAILED',
  message: 'Failed to extract profile data from LinkedIn.',
  context: 'profile-extraction',
  partialData: { ... }
}
```

**User Experience:**
- Toast: "Partial profile data extracted. Please review."
- Show editable form with partial data
- Allow manual completion
- Option to retry extraction

---

#### 3. Storage Errors

**Quota Exceeded:**
```typescript
{
  error: 'QUOTA_EXCEEDED',
  message: 'Storage quota exceeded. Please clear history.',
  currentUsage: 50000000, // 50MB
  quota: 52428800 // 50MB limit
}
```

**User Experience:**
- Modal: "Storage almost full. Clear history or export data."
- Button: "Clear Old History (keeps last 30 days)"
- Button: "Export All Data"
- Show current usage

---

**Data Corruption:**
```typescript
{
  error: 'DATA_CORRUPTION',
  message: 'Failed to read settings from storage.',
  context: 'settings-load'
}
```

**User Experience:**
- Modal: "Settings corrupted. Reset to defaults?"
- Buttons: "Reset" | "Try Recovery"
- If reset: Clear corrupted data, load defaults
- Log error for support

---

### Error Recovery Strategies

**Automatic Retry:**
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const content = await withRetry(() => aiService.generate(request));
```

---

**Graceful Degradation:**
```typescript
// If specific feature fails, fall back to generic alternative
async function generatePost(idea: string): Promise<string> {
  try {
    // Try with user's learned style
    return await generateWithStyle(idea, userStyle);
  } catch (error) {
    console.warn('Learned style failed, falling back to preset', error);
    try {
      // Fall back to preset style
      return await generateWithStyle(idea, 'professional');
    } catch (error2) {
      console.error('Both attempts failed', error2);
      // Last resort: return formatted input
      return formatAsPost(idea);
    }
  }
}
```

---

**User Notification System:**

```typescript
// src/content/ui/toast.ts

type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const toast = document.createElement('div');
  toast.className = `lia-toast lia-toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: ${getToastColor(type)};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10001;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastColor(type: ToastType): string {
  const colors = {
    success: '#057642',
    error: '#cc1016',
    warning: '#f5b000',
    info: '#0a66c2'
  };
  return colors[type];
}
```

---

### Logging & Debugging

**Development Mode:**
```typescript
// src/shared/constants.ts
export const DEBUG = process.env.NODE_ENV === 'development';

// Usage
if (DEBUG) {
  console.log('[LIA] Generating post with params:', params);
}
```

**Error Logging:**
```typescript
// src/shared/error-logger.ts

interface ErrorLog {
  timestamp: string;
  error: string;
  context: string;
  stack?: string;
  userAgent: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs: number = 100;
  
  log(error: Error, context: string) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      context,
      stack: error.stack,
      userAgent: navigator.userAgent
    };
    
    this.logs.push(errorLog);
    
    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Store in chrome.storage for persistence
    chrome.storage.local.set({ errorLogs: this.logs });
    
    if (DEBUG) {
      console.error('[LIA Error]', errorLog);
    }
  }
  
  async exportLogs(): Promise<string> {
    return JSON.stringify(this.logs, null, 2);
  }
  
  clearLogs() {
    this.logs = [];
    chrome.storage.local.remove('errorLogs');
  }
}

export const errorLogger = new ErrorLogger();
```

**In Options Page:**
- Section: "Troubleshooting"
- Button: "Export Error Logs" (for support)
- Button: "Clear Logs"

---

## Project Structure

```
linkedin-assistant/
├── src/
│   ├── manifest.json
│   │
│   ├── background/
│   │   ├── service-worker.ts          # Main service worker entry
│   │   ├── ai-service.ts              # AI provider abstraction
│   │   ├── storage-service.ts         # IndexedDB wrapper
│   │   ├── message-handler.ts         # Message routing
│   │   └── cache-manager.ts           # Response caching
│   │
│   ├── content/
│   │   ├── linkedin-content.ts        # Main content script entry
│   │   │
│   │   ├── injectors/
│   │   │   ├── post-composer.ts       # Post composer buttons
│   │   │   ├── comments.ts            # Comment reply buttons
│   │   │   ├── profile.ts             # Profile CV button
│   │   │   └── job-listing.ts         # Job CV adaptation button
│   │   │
│   │   ├── extractors/
│   │   │   ├── profile-extractor.ts   # Extract LinkedIn profile
│   │   │   ├── job-extractor.ts       # Extract job details
│   │   │   └── post-extractor.ts      # Extract user posts
│   │   │
│   │   ├── ui/
│   │   │   ├── modal.ts               # Base modal component
│   │   │   ├── generate-post-modal.ts
│   │   │   ├── improve-post-modal.ts
│   │   │   ├── comment-reply-modal.ts
│   │   │   ├── sidebar.ts             # Sidebar panel
│   │   │   ├── button-factory.ts      # Button creation utility
│   │   │   └── toast.ts               # Toast notifications
│   │   │
│   │   └── observers/
│   │       └── dom-observer.ts        # MutationObserver for SPA
│   │
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   │
│   ├── options/
│   │   ├── options.html
│   │   ├── options.ts
│   │   ├── options.css
│   │   └── onboarding.html            # First-time setup
│   │
│   ├── sidebar/
│   │   ├── sidebar.html
│   │   ├── sidebar.ts
│   │   └── sidebar.css
│   │
│   ├── shared/
│   │   ├── types.ts                   # TypeScript interfaces
│   │   ├── constants.ts               # App constants
│   │   ├── utils.ts                   # Utility functions
│   │   ├── language-detector.ts       # Language detection
│   │   ├── validators.ts              # Input validation
│   │   ├── error-logger.ts            # Error logging
│   │   └── sanitizer.ts               # Input sanitization
│   │
│   ├── prompts/
│   │   ├── post-generation.ts         # Post generation prompts
│   │   ├── post-improvement.ts        # Post improvement prompts
│   │   ├── comment-response.ts        # Comment reply prompts
│   │   ├── cv-generation.ts           # CV generation prompts
│   │   ├── cv-adaptation.ts           # CV adaptation prompts
│   │   ├── style-analysis.ts          # Style analysis prompt
│   │   └── presets.ts                 # Style preset definitions
│   │
│   ├── cv/
│   │   ├── templates/
│   │   │   ├── professional.ts        # CV template - Professional
│   │   │   ├── modern.ts              # CV template - Modern
│   │   │   ├── classic.ts             # CV template - Classic
│   │   │   └── minimalist.ts          # CV template - Minimalist
│   │   ├── renderer.ts                # CV HTML renderer
│   │   └── exporter.ts                # PDF/DOCX export (using libraries)
│   │
│   └── assets/
│       ├── icons/
│       │   ├── icon-16.png
│       │   ├── icon-48.png
│       │   └── icon-128.png
│       └── images/
│           └── logo.svg
│
├── dist/                              # Build output (gitignored)
│   ├── chrome/                        # Chrome/Edge build
│   └── firefox/                       # Firefox build
│
├── package.json
├── tsconfig.json
├── webpack.config.js
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── README.md
```

---

## Technology Stack

### Core Technologies

**Language:**
- TypeScript 5.x
- Target: ES2020
- Strict mode enabled

**Build System:**
- Webpack 5.x
- webpack-cli
- ts-loader for TypeScript compilation

**Browser APIs:**
- Manifest V3 Extension APIs
- IndexedDB for storage
- MutationObserver for DOM watching
- Fetch API for network requests

---

### Dependencies

**Production:**

```json
{
  "dependencies": {
    "franc-min": "^6.0.0",           // Language detection
    "jspdf": "^2.5.0",                // PDF generation
    "jspdf-autotable": "^3.6.0",      // Tables in PDF
    "docx": "^8.0.0",                 // DOCX generation
    "dompurify": "^3.0.0",            // HTML sanitization
    "uuid": "^9.0.0"                  // UUID generation
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "ts-loader": "^9.5.0",
    "copy-webpack-plugin": "^11.0.0", // Copy assets
    "css-loader": "^6.8.0",
    "style-loader": "^3.3.0",
    "html-webpack-plugin": "^5.5.0",
    "@types/chrome": "^0.0.253",      // Chrome API types
    "@types/uuid": "^9.0.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "prettier": "^3.1.0"
  }
}
```

---

### Build Configuration

**webpack.config.js:**

```javascript
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  const target = env.target || 'chrome'; // chrome or firefox
  
  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? false : 'inline-source-map',
    
    entry: {
      'background/service-worker': './src/background/service-worker.ts',
      'content/linkedin-content': './src/content/linkedin-content.ts',
      'popup/popup': './src/popup/popup.ts',
      'options/options': './src/options/options.ts',
      'sidebar/sidebar': './src/sidebar/sidebar.ts'
    },
    
    output: {
      path: path.resolve(__dirname, `dist/${target}`),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    
    resolve: {
      extensions: ['.ts', '.js']
    },
    
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'src/manifest.json',
            to: 'manifest.json',
            transform(content) {
              const manifest = JSON.parse(content.toString());
              // Firefox-specific adjustments
              if (target === 'firefox') {
                manifest.browser_specific_settings = {
                  gecko: {
                    id: 'linkedin-assistant@example.com'
                  }
                };
              }
              return JSON.stringify(manifest, null, 2);
            }
          },
          { from: 'src/assets', to: 'assets' }
        ]
      }),
      new HtmlWebpackPlugin({
        template: 'src/popup/popup.html',
        filename: 'popup/popup.html',
        chunks: ['popup/popup']
      }),
      new HtmlWebpackPlugin({
        template: 'src/options/options.html',
        filename: 'options/options.html',
        chunks: ['options/options']
      }),
      new HtmlWebpackPlugin({
        template: 'src/sidebar/sidebar.html',
        filename: 'sidebar/sidebar.html',
        chunks: ['sidebar/sidebar']
      })
    ]
  };
};
```

---

### TypeScript Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["chrome"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Browser Compatibility

**Chrome:**
- Minimum version: 109 (Manifest V3 stable)
- Full support for all features

**Edge:**
- Minimum version: 109 (Chromium-based)
- Identical to Chrome (same manifest)

**Firefox:**
- Minimum version: 109
- Manifest V3 support
- Minor differences:
  - `browser_specific_settings` in manifest
  - `browser.runtime` instead of `chrome.runtime` (but polyfilled)

**Build Targets:**
- Separate builds for Chrome and Firefox
- 95%+ shared code
- Target-specific adjustments in build process

---

## Development Workflow

### Local Development

**Setup:**
```bash
npm install
```

**Development Build (with watch):**
```bash
npm run dev
# Outputs to dist/chrome/ with source maps
```

**Load in Browser:**
1. Chrome: `chrome://extensions/` → "Load unpacked" → select `dist/chrome/`
2. Firefox: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on" → select `dist/firefox/manifest.json`

**Hot Reload:**
- Content scripts: Refresh LinkedIn page
- Background worker: Click "Reload" in extensions page
- Popup/Options: Close and reopen

---

### Production Build

```bash
npm run build:chrome    # → dist/chrome/
npm run build:firefox   # → dist/firefox/
```

**Distribution:**
- Chrome: Zip `dist/chrome/` → Upload to Chrome Web Store
- Firefox: Zip `dist/firefox/` → Submit to addons.mozilla.org

---

### Testing Strategy

**Manual Testing Checklist:**
- [ ] Post generation with each AI provider
- [ ] Post improvement
- [ ] Comment replies
- [ ] CV generation from profile
- [ ] CV adaptation to job
- [ ] Style analysis
- [ ] Settings import/export
- [ ] Error handling (invalid API key, network error)
- [ ] LinkedIn UI changes (test on multiple LinkedIn pages)

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Firefox (latest)

---

## Future Enhancements (Phase 2)

**Not in current scope, but planned:**

1. **Recruiter Message Generation**
   - Analyze job posting
   - Generate personalized outreach
   - Templates for different scenarios

2. **Interview Practice**
   - Mock interview with AI
   - Common questions for role
   - Feedback on responses

3. **OAuth Integration**
   - Direct posting to LinkedIn (with user permission)
   - Avoid copy-paste for post publishing

4. **Analytics Dashboard**
   - Track engagement of AI-generated vs manual posts
   - A/B testing different styles

5. **Team Features**
   - Share style profiles with team
   - Collaborative CV templates

6. **Multi-Language Support**
   - UI in multiple languages (currently English)
   - Better language detection

7. **Advanced CV Features**
   - Cover letter generation
   - LinkedIn profile optimization suggestions

---

## Success Metrics

**User Engagement:**
- Daily Active Users (DAU)
- Feature usage breakdown (posts vs CVs vs comments)
- Retention rate (7-day, 30-day)

**Performance:**
- Average generation time
- API error rate
- User-reported issues

**User Satisfaction:**
- Chrome Web Store rating
- User reviews and feedback
- Feature requests

---

## Appendix

### AI Prompt Examples

**Full Example: Generate Post from Idea**

```typescript
// System Prompt
const systemPrompt = `
You are a LinkedIn content strategist helping professionals create engaging posts.

User's Writing Style:
${userStyleProfile || 'Professional and approachable. Uses personal anecdotes, 1-2 emojis per post, asks questions to drive engagement.'}

LinkedIn Best Practices:
- Hook readers in the first line
- Use short paragraphs (2-3 lines max)
- Include white space for readability
- End with a question or call-to-action
- Hashtags at the end (3-5 relevant tags)
- Aim for authenticity over perfection

Length Guideline: ${length === 'short' ? '500-800 characters' : length === 'medium' ? '1200-1800 characters' : '2500-3000 characters'}

Respond in ${detectedLanguage}.
`;

// User Prompt
const userPrompt = `
Generate a LinkedIn post based on this idea:

"${idea}"

Requirements:
- Match my writing style
- Make it engaging and professional
- ${includeHashtags ? 'Include 3-5 relevant hashtags' : 'No hashtags'}
- ${includeCTA ? 'End with a clear call-to-action or question' : 'Natural conclusion'}
- Stay within character limit
`;
```

**Example Output:**
```
Last week, I made a mistake that cost us two days of work. 😅

We were migrating a database and I forgot to check one critical dependency. The rollback was painful, but the lesson was invaluable.

Here's what I learned:

→ Checklists aren't just for beginners
→ Pressure doesn't justify skipping steps
→ A 5-minute review beats a 2-day rollback

The best engineers aren't the ones who never make mistakes—they're the ones who learn from them and share what they learned.

What's a mistake that taught you something valuable?

#SoftwareEngineering #Leadership #LessonsLearned #TechCommunity
```

---

### CV Template Example

**Professional Template (HTML):**

```typescript
// src/cv/templates/professional.ts

export function renderProfessionalTemplate(data: CVData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      border-bottom: 3px solid #0a66c2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      color: #000;
    }
    .header .headline {
      font-size: 18px;
      color: #666;
      margin-top: 5px;
    }
    .header .contact {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 20px;
      color: #0a66c2;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .experience-item {
      margin-bottom: 20px;
    }
    .experience-item .title {
      font-size: 16px;
      font-weight: bold;
      color: #000;
    }
    .experience-item .company {
      font-size: 14px;
      color: #666;
      margin-top: 2px;
    }
    .experience-item .dates {
      font-size: 13px;
      color: #999;
      font-style: italic;
    }
    .experience-item .description {
      margin-top: 8px;
      font-size: 14px;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .skill-tag {
      background: #e8f4f8;
      color: #0a66c2;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.name}</h1>
    <div class="headline">${data.headline}</div>
    <div class="contact">${data.location || ''}</div>
  </div>
  
  ${data.summary ? `
  <div class="section">
    <h2>Summary</h2>
    <p>${data.summary}</p>
  </div>
  ` : ''}
  
  ${data.experiences && data.experiences.length > 0 ? `
  <div class="section">
    <h2>Experience</h2>
    ${data.experiences.map(exp => `
      <div class="experience-item">
        <div class="title">${exp.title}</div>
        <div class="company">${exp.company}</div>
        <div class="dates">${exp.startDate} - ${exp.endDate || 'Present'}</div>
        <div class="description">${exp.description}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${data.education && data.education.length > 0 ? `
  <div class="section">
    <h2>Education</h2>
    ${data.education.map(edu => `
      <div class="experience-item">
        <div class="title">${edu.degree}</div>
        <div class="company">${edu.institution}</div>
        <div class="dates">${edu.endDate}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${data.skills && data.skills.length > 0 ? `
  <div class="section">
    <h2>Skills</h2>
    <div class="skills">
      ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>
  `;
}
```

---

## Conclusion

This design specification provides a comprehensive blueprint for building the LinkedIn Assistant browser extension. The architecture prioritizes:

1. **User Privacy:** Local-first data storage, no backend
2. **Flexibility:** Multiple AI providers, style customization
3. **Seamless Integration:** Contextual UI within LinkedIn
4. **Reliability:** Error handling, graceful degradation
5. **Extensibility:** Modular structure for future features

The implementation follows modern web extension best practices using Manifest V3, TypeScript for type safety, and a clean separation of concerns between content scripts, background workers, and UI components.

---

## Testing Guide

### Manual Testing Setup

#### Prerequisites
1. **Node.js & npm** installed (v18+ recommended)
2. **Chrome/Edge or Firefox** browser
3. **LinkedIn account** (free account works)
4. **AI Provider API Key** (at least one):
   - Claude: https://console.anthropic.com
   - OpenAI: https://platform.openai.com
   - Gemini: https://makersuite.google.com

#### Initial Setup

**Step 1: Clone and Install**
```bash
git clone <repository-url>
cd LinkedinAssistant
npm install
```

**Step 2: Build Extension**
```bash
# For development (with watch mode)
npm run dev

# For production testing
npm run build:chrome  # or build:firefox
```

**Step 3: Load Extension in Browser**

**Chrome/Edge:**
1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/chrome/` folder
5. Extension should appear in your extensions list

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `dist/firefox/` and select `manifest.json`
4. Extension loads (note: temporary, removed on browser restart)

**Step 4: Configure Extension**
1. Click extension icon in browser toolbar
2. Click "Options" or right-click extension → "Options"
3. Complete onboarding:
   - Add at least one API key
   - Test connection
   - Choose style (preset for quick testing)
4. Visit LinkedIn.com

---

### Feature Testing Checklist

#### Test 1: Post Generation from Idea

**Objective:** Verify AI can generate a LinkedIn post from a brief idea

**Steps:**
1. Go to LinkedIn.com feed
2. Click "Start a post" button
3. Verify extension buttons appear in composer:
   - "✨ Generate from Idea"
   - "🚀 Improve Post"
4. Click "✨ Generate from Idea"
5. Modal should open
6. Enter test idea: "I just learned about Test-Driven Development"
7. Select tone: "Professional Casual"
8. Select length: "Medium"
9. Check "Include hashtags"
10. Click "Generate"
11. Wait for loading spinner
12. Verify post appears in preview
13. Check character count is displayed
14. Click "✏️ Edit" - verify content becomes editable
15. Click "🔄 Regenerate" - verify new version generates
16. Click "✓ Use" - verify content inserted into LinkedIn composer
17. Verify you can manually edit the inserted content
18. (Optional) Publish or discard

**Expected Results:**
- ✅ Buttons inject properly
- ✅ Modal opens and displays correctly
- ✅ Generation completes within 10 seconds
- ✅ Generated post is coherent and relevant to idea
- ✅ Post includes hashtags (since checked)
- ✅ Character count is accurate
- ✅ Edit mode works
- ✅ Regenerate creates different content
- ✅ Content successfully inserts into composer

**Common Issues:**
- Buttons don't appear → Refresh page, check console for errors
- Generation fails → Check API key in options, check console
- Content doesn't insert → LinkedIn may have changed DOM structure

---

#### Test 2: Post Improvement

**Objective:** Verify AI can enhance an existing draft

**Steps:**
1. Go to LinkedIn.com feed
2. Click "Start a post"
3. Write a draft: "Today I worked on a new feature"
4. Click "🚀 Improve Post"
5. Modal opens with draft pre-filled
6. (Optional) Adjust tone
7. Click "Improve"
8. Verify improved version appears
9. Compare with original
10. Click "✓ Use"
11. Verify improved content replaces draft

**Expected Results:**
- ✅ Draft is correctly extracted
- ✅ Improved version maintains original meaning
- ✅ Quality is noticeably better (grammar, structure, engagement)
- ✅ Content replaces draft correctly

---

#### Test 3: Comment Response

**Objective:** Generate contextual replies to comments

**Steps:**
1. Find any post on LinkedIn feed (yours or someone else's)
2. Scroll to comments section
3. Hover over a comment
4. Verify "💬 AI Reply" button appears
5. Click button
6. Modal opens showing:
   - Original post context (collapsed/summary)
   - The comment you're replying to (highlighted)
7. Select tone: "Professional"
8. Select length: "Moderate"
9. (Optional) Add context: "Mention that I have experience with this"
10. Click "Generate Response"
11. Verify response is contextually appropriate
12. Click "Insert"
13. Verify response appears in comment input field
14. (Optional) Post or discard

**Expected Results:**
- ✅ Button appears on hover
- ✅ Context is correctly extracted
- ✅ Response is relevant to the comment
- ✅ Response maintains professional tone
- ✅ Inserts correctly into comment field

**Edge Cases to Test:**
- Reply to a reply (nested comment)
- Comment on a post with images/video
- Comment in different language (should detect and match)

---

#### Test 4: CV Generation from Profile

**Objective:** Extract LinkedIn profile and generate CV

**Steps:**
1. Go to your LinkedIn profile (`linkedin.com/in/your-name/`)
2. Verify "📄 Generate CV" button appears (floating, bottom-right)
3. Click button
4. Verify toast: "Extracting profile data..."
5. Sidebar opens from right side
6. Verify extracted data displays:
   - Name, headline
   - Work experience (titles, companies, dates)
   - Education
   - Skills
7. Click "Edit extracted data" (optional, verify modal opens)
8. Select template: "Professional"
9. Check sections to include (all by default)
10. Click "Generate CV"
11. Verify loading state
12. Preview shows formatted CV
13. Scroll through preview - check all sections render
14. Click "Export"
15. Select format: "PDF"
16. Enter filename: "Test_CV"
17. Click "Download"
18. Verify PDF downloads to your system
19. Open PDF and verify:
    - Formatting is clean
    - All sections present
    - Text is readable
    - No encoding issues

**Expected Results:**
- ✅ Button appears on own profile only
- ✅ Data extraction completes within 5 seconds
- ✅ Extracted data is accurate and complete
- ✅ Preview renders correctly
- ✅ PDF exports successfully
- ✅ PDF is properly formatted and ATS-friendly

**Edge Cases:**
- Profile with many experiences (10+)
- Profile with special characters in name/company
- Profile with missing sections (no certifications)

---

#### Test 5: CV Adaptation to Job

**Objective:** Customize CV for specific job posting

**Steps:**
1. Go to LinkedIn Jobs: `linkedin.com/jobs/`
2. Find any job posting (or search for one)
3. Click on a job to view details
4. Verify "🎯 Adapt My CV" button appears near "Apply" button
5. Click button
6. Verify toast: "Analyzing job description..."
7. Sidebar opens with job analysis:
   - Job title, company
   - Key requirements listed
   - Match score (percentage)
8. Verify match score is calculated (0-100%)
9. Select base CV: "CV Base" (or create one first)
10. Check customization options:
    - Highlight relevant experience
    - Integrate job keywords
    - Reorder for relevance
11. Click "Generate Adapted CV"
12. Verify loading state
13. Preview shows adapted CV
14. Verify "Highlighted Changes" section shows what changed
15. Click "Compare with Original" - verify comparison view
16. Click "💾 Save"
17. Verify saved as "CV - {Job Title} at {Company}"
18. Click "⬇ Export" and test export

**Expected Results:**
- ✅ Button appears on job detail pages
- ✅ Job data correctly extracted
- ✅ Match score is reasonable (not always 100% or 0%)
- ✅ Adapted CV emphasizes relevant experience
- ✅ Keywords from job appear naturally in CV
- ✅ Changes are highlighted clearly
- ✅ Save and export work correctly

**Edge Cases:**
- Job with minimal description
- Job in different language
- Job requiring skills you don't have (should handle gracefully)

---

#### Test 6: Style Learning & Customization

**Objective:** Analyze user's writing style from posts

**Steps:**
1. Go to Options page (extension → right-click → Options)
2. Navigate to "Style Configuration" section
3. Select "Use My Learned Style"
4. Click "Analyze my LinkedIn posts"
5. Verify toast: "Analyzing your writing style..."
6. Wait for analysis (may take 15-30 seconds)
7. Verify success message and analysis date
8. Click "View Style Profile"
9. Verify modal shows analysis:
   - Tone description
   - Emoji usage
   - Sentence structure
   - Engagement tactics
10. Close modal
11. Go to LinkedIn feed
12. Generate a post using learned style
13. Compare output to your actual posts
14. Verify style feels authentic

**Expected Results:**
- ✅ Analysis completes successfully
- ✅ Style profile captures your writing characteristics
- ✅ Generated content matches your voice
- ✅ Emoji usage matches your pattern

**Edge Cases:**
- User with very few posts (should handle gracefully)
- User with posts in multiple languages

---

#### Test 7: Settings Import/Export

**Objective:** Backup and restore settings

**Steps:**
1. Go to Options page
2. Configure:
   - API keys for 2+ providers
   - Custom style settings
   - Generate at least one CV
3. Scroll to "Data Management" section
4. Click "Export Data"
5. Check options:
   - Include history: ✓
   - Include CVs: ✓
   - Include API keys: ✓
6. Click "Export"
7. Verify JSON file downloads
8. Open JSON in text editor - verify structure
9. In Options, click "Clear All Data" (warning modal appears)
10. Confirm clear
11. Verify settings reset to defaults
12. Click "Import Data"
13. Select the exported JSON file
14. Verify import success
15. Check that all settings restored:
    - API keys
    - Style preferences
    - CVs

**Expected Results:**
- ✅ Export creates valid JSON
- ✅ JSON contains expected data
- ✅ Clear data works (with confirmation)
- ✅ Import restores all data correctly

---

#### Test 8: Error Handling

**Objective:** Verify graceful error handling

**Test 8a: Invalid API Key**
1. Go to Options
2. Enter invalid API key for Claude: "sk-invalid-key-12345"
3. Click "Test Connection"
4. Verify error toast: "Invalid API key for Claude"
5. Try to generate a post
6. Verify error toast with actionable message

**Test 8b: Network Failure**
1. Disconnect internet (or use browser DevTools to simulate offline)
2. Try to generate a post
3. Verify error: "Connection failed. Check your internet."
4. Verify "Retry" button appears
5. Reconnect internet
6. Click "Retry"
7. Verify generation succeeds

**Test 8c: Rate Limit**
(Hard to test without actually hitting rate limit)
1. If rate limit error occurs, verify:
   - Clear message about rate limit
   - Estimated time to retry
   - Option to switch to alternate provider

**Expected Results:**
- ✅ All errors show clear, actionable messages
- ✅ No silent failures
- ✅ Retry mechanisms work
- ✅ Errors logged (check console)

---

#### Test 9: Multi-Language Support

**Objective:** Verify language detection and matching

**Steps:**
1. Generate a post with Spanish idea: "Quiero compartir mi experiencia con trabajo remoto"
2. Verify output is in Spanish
3. Generate post with English idea: "I want to share my experience with remote work"
4. Verify output is in English
5. Try other languages if you know them (Portuguese, French, etc.)

**Expected Results:**
- ✅ Language correctly detected
- ✅ Output matches input language
- ✅ Quality maintained across languages

---

#### Test 10: Browser Compatibility

**Objective:** Verify extension works across browsers

**Steps:**
1. Test all above features in Chrome
2. Build Firefox version: `npm run build:firefox`
3. Load in Firefox
4. Test all above features in Firefox
5. Test in Edge (uses same build as Chrome)

**Expected Results:**
- ✅ All features work in Chrome
- ✅ All features work in Firefox
- ✅ All features work in Edge
- ✅ UI renders correctly in all browsers

---

### Performance Testing

**Metrics to Monitor:**

1. **Extension Load Time**
   - Initial load: < 500ms
   - Content script injection: < 200ms

2. **UI Injection**
   - Buttons appear within 1 second of page load
   - Sidebar opens smoothly (< 300ms animation)

3. **Generation Times**
   - Post generation: 3-10 seconds (depends on AI provider)
   - CV generation: 5-15 seconds
   - Style analysis: 15-30 seconds

4. **Storage Usage**
   - Check in Options → Storage Info
   - Should stay under 50MB even with extensive use

**How to Check:**
```javascript
// In browser console (on LinkedIn page)
// Check if content script loaded
console.log(window.linkedInAssistant);

// Check storage usage
chrome.storage.local.getBytesInUse(null, (bytes) => {
  console.log('Storage used:', bytes / 1024 / 1024, 'MB');
});
```

---

### Debugging Tips

**Common Issues:**

**Issue: Buttons don't appear**
- **Check:** Is the extension enabled? (`chrome://extensions/`)
- **Check:** Console errors? (F12 → Console tab)
- **Solution:** Reload extension and refresh LinkedIn page

**Issue: Generation fails silently**
- **Check:** Background service worker console (`chrome://extensions/` → "service worker" link)
- **Check:** API key configured correctly?
- **Solution:** Check error logs in Options → Troubleshooting

**Issue: Content doesn't insert into composer**
- **Likely cause:** LinkedIn changed their DOM structure
- **Solution:** Update selectors in `src/content/injectors/post-composer.ts`

**Issue: Profile extraction incomplete**
- **Check:** Did LinkedIn fully load before extraction?
- **Solution:** Add delays, improve wait logic in extractor

**Debugging Tools:**

1. **Chrome DevTools:**
   - F12 on LinkedIn page → check Console for content script errors
   - Sources tab → check if scripts loaded

2. **Extension Service Worker:**
   - `chrome://extensions/` → click "service worker" link → Console

3. **Extension Storage Inspector:**
   ```javascript
   // In service worker console
   chrome.storage.local.get(null, (data) => console.log(data));
   ```

4. **Network Tab:**
   - Monitor API calls to Claude/OpenAI/Gemini
   - Check request/response payloads

---

### Test Data Preparation

**For realistic testing, prepare:**

1. **LinkedIn Profile:**
   - At least 2-3 work experiences
   - Education section filled
   - 5+ skills added
   - Profile summary

2. **Test Ideas for Posts:**
   - Short: "Just finished a great project"
   - Medium: "I want to share 3 lessons I learned about remote work"
   - Long: "A detailed story about how we migrated our infrastructure"

3. **AI Provider Credits:**
   - Each test consumes API credits
   - Budget: ~$1-2 for thorough testing
   - Claude: $5 minimum credit
   - OpenAI: $5 minimum credit

---

### Regression Testing

**After any code change, test:**

**Critical Path (Must Pass):**
- [ ] Extension loads without errors
- [ ] Buttons inject on LinkedIn
- [ ] Post generation works with default provider
- [ ] Generated content inserts into composer
- [ ] Settings save and persist

**Full Regression (Before Release):**
- [ ] All features in checklist above
- [ ] All browsers (Chrome, Firefox, Edge)
- [ ] Error handling scenarios
- [ ] Performance benchmarks

---

### Reporting Issues

**When filing a bug, include:**

1. **Environment:**
   - Browser and version
   - Extension version
   - Operating system

2. **Steps to Reproduce:**
   - Exact sequence of actions
   - Test data used

3. **Expected vs Actual:**
   - What you expected to happen
   - What actually happened

4. **Evidence:**
   - Screenshots
   - Console errors (F12 → Console)
   - Service worker errors
   - Network tab (if API-related)

5. **Workarounds:**
   - Any temporary fix you found

**Template:**
```markdown
## Bug Report

**Environment:**
- Browser: Chrome 121.0.6167.85
- Extension: v1.0.0
- OS: macOS 14.2

**Steps to Reproduce:**
1. Go to LinkedIn feed
2. Click "Start a post"
3. Click "Generate from Idea"
4. Enter "test" and click Generate

**Expected:**
Post should generate

**Actual:**
Error toast: "Invalid response from AI"

**Console Errors:**
```
Error: Unexpected token < in JSON at position 0
    at JSON.parse
```

**Screenshots:**
[Attach screenshots]
```

---

**Next Steps:**
1. Review and approve this design
2. Set up project repository and boilerplate
3. Implement core architecture (background service, storage, AI service)
4. Build content script injectors and extractors
5. Develop UI components (modals, sidebar)
6. Implement each feature incrementally
7. Test across browsers
8. Prepare for Chrome Web Store / Firefox Add-ons submission
