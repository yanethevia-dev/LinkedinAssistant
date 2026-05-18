// Shared TypeScript types and interfaces

export interface UserSettings {
  id: 'user-config';
  version: string;
  onboardingCompleted: boolean;
}

export interface Message {
  type: string;
  payload?: any;
}

export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}
