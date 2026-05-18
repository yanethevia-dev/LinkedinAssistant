// Background Service Worker

import { MessageTypes, DEBUG } from '../shared/constants';
import type { Message, MessageResponse, UserSettings } from '../shared/types';
import { storageService } from './storage-service';

console.log('[LinkedIn Assistant] Service worker initialized');

// Initialize storage on startup
initializeServiceWorker();

async function initializeServiceWorker() {
  try {
    await storageService.init();
    console.log('[Service Worker] Initialization complete');

    // Log storage info (always show for debugging)
    const info = await storageService.getStorageInfo();
    console.log('[Service Worker] Storage:', {
      used: `${(info.bytesInUse / 1024).toFixed(2)} KB`,
      quota: `${(info.quota / 1024 / 1024).toFixed(2)} MB`
    });
  } catch (error) {
    console.error('[Service Worker] Initialization failed:', error);
  }
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse: (response: MessageResponse) => void) => {
    // Always log messages for debugging
    console.log('[Service Worker] Received message:', message.type, message.payload);

    switch (message.type) {
      case MessageTypes.PING:
        sendResponse({ success: true, data: 'pong' });
        break;

      case MessageTypes.GET_SETTINGS:
        handleGetSettings(sendResponse);
        return true; // Async response

      case MessageTypes.UPDATE_SETTINGS:
        handleUpdateSettings(message.payload, sendResponse);
        return true; // Async response

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }
);

async function handleGetSettings(sendResponse: (response: MessageResponse) => void) {
  try {
    const settings = await storageService.getSettings();
    sendResponse({ success: true, data: settings });
  } catch (error) {
    console.error('[Service Worker] Error getting settings:', error);
    sendResponse({ success: false, error: 'Failed to get settings' });
  }
}

async function handleUpdateSettings(
  updates: Partial<UserSettings>,
  sendResponse: (response: MessageResponse) => void
) {
  try {
    await storageService.updateSettings(updates);
    const settings = await storageService.getSettings();
    sendResponse({ success: true, data: settings });
  } catch (error) {
    console.error('[Service Worker] Error updating settings:', error);
    sendResponse({ success: false, error: 'Failed to update settings' });
  }
}

// Extension installed/updated
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[LinkedIn Assistant] Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First install - initialize storage and open onboarding
    await storageService.init();
    chrome.tabs.create({ url: 'options/options.html' });
  } else if (details.reason === 'update') {
    // Update - ensure settings are merged with any new defaults
    await storageService.init();
  }
});
