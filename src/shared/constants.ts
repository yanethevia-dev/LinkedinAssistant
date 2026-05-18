// Application constants

export const APP_VERSION = '0.1.0';
export const DEBUG = process.env.NODE_ENV === 'development';

// Message types
export const MessageTypes = {
  PING: 'PING',
  GET_SETTINGS: 'GET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
} as const;
