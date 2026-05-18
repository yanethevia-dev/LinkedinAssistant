// Application constants

export const APP_VERSION = '0.1.0';
export const DEBUG = process.env.NODE_ENV === 'development';

// Message types
export const MessageTypes = {
  PING: 'PING',
  GET_SETTINGS: 'GET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  GET_STORAGE_INFO: 'GET_STORAGE_INFO'
} as const;

// Style presets
export const STYLE_PRESETS = {
  'professional-formal': 'Professional Formal',
  'professional-casual': 'Professional Casual',
  'inspirational': 'Inspirational',
  'technical': 'Technical Expert',
  'thought-leader': 'Thought Leader',
  'educational': 'Educational'
} as const;
