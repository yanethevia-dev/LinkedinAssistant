// Background Service Worker

import { MessageTypes, DEBUG } from '../shared/constants';
import type { Message, MessageResponse, UserSettings, AIProvider } from '../shared/types';
import { storageService } from './storage-service';
import { aiService } from './ai-service';

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

      case MessageTypes.TEST_AI_CONNECTION:
        handleTestAIConnection(message.payload, sendResponse);
        return true; // Async response

      case MessageTypes.GENERATE_CONTENT:
        handleGenerateContent(message.payload, sendResponse);
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

async function handleTestAIConnection(
  payload: { provider: AIProvider; apiKey: string; model: string },
  sendResponse: (response: MessageResponse) => void
) {
  try {
    console.log('[Service Worker] Testing AI connection:', payload.provider);
    const result = await aiService.testConnection(
      payload.provider,
      payload.apiKey,
      payload.model
    );
    console.log('[Service Worker] Test successful:', payload.provider);
    sendResponse({ success: true, data: { connected: result } });
  } catch (error: any) {
    console.error('[Service Worker] Test failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Connection test failed',
      data: error
    });
  }
}

async function handleGenerateContent(
  payload: any,
  sendResponse: (response: MessageResponse) => void
) {
  try {
    console.log('[Service Worker] Generating content...');

    // Get settings to determine provider and API key
    const settings = await storageService.getSettings();

    const selectedProvider = settings.selectedProvider;
    if (!selectedProvider) {
      throw new Error('No AI provider configured. Please configure in settings.');
    }

    const apiKeys = settings.apiKeys || {};
    const apiKey = apiKeys[selectedProvider];
    if (!apiKey) {
      throw new Error(`No API key for ${selectedProvider}. Please add in settings.`);
    }

    const models = settings.models || {};
    const model = models[selectedProvider] || 'default';

    // Build AI request with provider and model from settings
    const aiRequest = {
      provider: selectedProvider,
      model: model,
      systemPrompt: payload.systemPrompt,
      userPrompt: payload.userPrompt,
      temperature: payload.temperature ?? 0.7,
      maxTokens: payload.maxTokens ?? 2048
    };

    console.log('[Service Worker] Using provider:', aiRequest.provider, 'model:', aiRequest.model);

    const response = await aiService.generateContent(aiRequest, apiKey);
    console.log('[Service Worker] Content generated successfully');
    sendResponse({ success: true, data: response });
  } catch (error: any) {
    console.error('[Service Worker] Generation failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Content generation failed'
    });
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
