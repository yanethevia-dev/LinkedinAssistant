// Shared TypeScript types and interfaces

// ============================================================================
// Settings
// ============================================================================

export interface UserSettings {
  id: 'user-config'; // Singleton key
  version: string;
  onboardingCompleted: boolean;

  // AI Provider Configuration
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
  customInstructions: string;

  // Preferences
  language: 'auto' | 'es' | 'en' | 'pt' | 'fr';
  autoDetectLanguage: boolean;

  // Metadata
  lastStyleAnalysis: string | null; // ISO date
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// ============================================================================
// Messages
// ============================================================================

export interface Message {
  type: string;
  payload?: any;
}

export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// ============================================================================
// Storage
// ============================================================================

export type StorageKey = 'settings' | 'generated-content' | 'cvs' | 'profile-cache' | 'posts-cache';

export interface StorageData {
  settings?: UserSettings;
  [key: string]: any;
}
