// Background Service Worker

import { MessageTypes } from '../shared/constants';
import type { Message, MessageResponse } from '../shared/types';

console.log('[LinkedIn Assistant] Service worker initialized');

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse: (response: MessageResponse) => void) => {
    console.log('[Service Worker] Received message:', message.type);

    switch (message.type) {
      case MessageTypes.PING:
        sendResponse({ success: true, data: 'pong' });
        break;

      case MessageTypes.GET_SETTINGS:
        handleGetSettings(sendResponse);
        return true; // Async response

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }
);

async function handleGetSettings(sendResponse: (response: MessageResponse) => void) {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {
      id: 'user-config',
      version: '0.1.0',
      onboardingCompleted: false
    };
    sendResponse({ success: true, data: settings });
  } catch (error) {
    console.error('[Service Worker] Error getting settings:', error);
    sendResponse({ success: false, error: 'Failed to get settings' });
  }
}

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[LinkedIn Assistant] Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First install - open onboarding
    chrome.tabs.create({ url: 'options/options.html' });
  }
});
