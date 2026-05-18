// Popup script

import { MessageTypes } from '../shared/constants';
import type { UserSettings } from '../shared/types';

const statusElement = document.getElementById('status') as HTMLElement;
const openOptionsBtn = document.getElementById('openOptions') as HTMLButtonElement;
const testConnectionBtn = document.getElementById('testConnection') as HTMLButtonElement;

// Check status on load
checkStatus();

openOptionsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

testConnectionBtn.addEventListener('click', async () => {
  testConnectionBtn.textContent = 'Testing...';
  testConnectionBtn.disabled = true;

  try {
    // Test ping
    const pingResponse = await chrome.runtime.sendMessage({ type: MessageTypes.PING });

    if (!pingResponse || !pingResponse.success) {
      throw new Error('Ping failed');
    }

    // Test settings retrieval
    const settingsResponse = await chrome.runtime.sendMessage({ type: MessageTypes.GET_SETTINGS });

    if (!settingsResponse || !settingsResponse.success) {
      throw new Error('Settings retrieval failed');
    }

    console.log('[Popup] Test successful. Settings:', settingsResponse.data);

    statusElement.textContent = '✓ Connected';
    statusElement.style.color = '#057642';

    setTimeout(() => {
      checkStatus();
    }, 2000);
  } catch (error) {
    console.error('[Popup] Connection test failed:', error);
    statusElement.textContent = '✗ Failed';
    statusElement.style.color = '#cc1016';
  } finally {
    testConnectionBtn.textContent = 'Test Connection';
    testConnectionBtn.disabled = false;
  }
});

async function checkStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: MessageTypes.PING });

    if (response && response.success) {
      // Also check if settings exist
      const settingsResponse = await chrome.runtime.sendMessage({
        type: MessageTypes.GET_SETTINGS
      });

      if (settingsResponse && settingsResponse.success) {
        const settings = settingsResponse.data as UserSettings;

        if (settings.apiKeys.claude || settings.apiKeys.openai || settings.apiKeys.gemini) {
          statusElement.textContent = '✓ Ready';
          statusElement.style.color = '#057642';
        } else {
          statusElement.textContent = '⚠ Setup Needed';
          statusElement.style.color = '#f5b000';
        }
      } else {
        statusElement.textContent = '✓ Ready';
        statusElement.style.color = '#057642';
      }
    } else {
      statusElement.textContent = '⚠ Unknown';
      statusElement.style.color = '#f5b000';
    }
  } catch (error) {
    console.error('[Popup] Status check failed:', error);
    statusElement.textContent = '✗ Disconnected';
    statusElement.style.color = '#cc1016';
  }
}
