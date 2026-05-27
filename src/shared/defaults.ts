// Default values and constants

import type { UserSettings } from './types';
import { APP_VERSION } from './constants';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  id: 'user-config',
  version: APP_VERSION,
  onboardingCompleted: false,

  // AI Providers
  apiKeys: {
    claude: null,
    openai: null,
    gemini: null,
    groq: null
  },
  defaultProvider: 'groq',
  providerByFeature: {
    posts: 'default',
    comments: 'default',
    cv: 'default'
  },
  models: {
    claude: 'claude-3-5-sonnet-20241022',
    openai: 'gpt-4-turbo',
    gemini: 'gemini-pro',
    groq: 'llama-3.1-8b-instant'
  },

  // Style
  styleMode: 'preset',
  selectedPreset: 'professional-casual',
  customInstructions: '',

  // Preferences
  language: 'auto',
  autoDetectLanguage: true,

  // Metadata
  lastStyleAnalysis: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
