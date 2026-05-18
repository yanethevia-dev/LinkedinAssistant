// Options page script

import { MessageTypes } from '../shared/constants';
import type { UserSettings } from '../shared/types';

console.log('[Options] Page loaded');

// Elements
const claudeApiKeyInput = document.getElementById('claude-api-key') as HTMLInputElement;
const claudeModelSelect = document.getElementById('claude-model') as HTMLSelectElement;
const claudeShowBtn = document.getElementById('claude-show') as HTMLButtonElement;
const claudeTestBtn = document.getElementById('claude-test') as HTMLButtonElement;
const claudeStatus = document.getElementById('claude-status') as HTMLSpanElement;
const claudeCard = document.getElementById('claude-card') as HTMLDivElement;

const openaiApiKeyInput = document.getElementById('openai-api-key') as HTMLInputElement;
const openaiModelSelect = document.getElementById('openai-model') as HTMLSelectElement;
const openaiShowBtn = document.getElementById('openai-show') as HTMLButtonElement;
const openaiTestBtn = document.getElementById('openai-test') as HTMLButtonElement;
const openaiStatus = document.getElementById('openai-status') as HTMLSpanElement;
const openaiCard = document.getElementById('openai-card') as HTMLDivElement;

const geminiApiKeyInput = document.getElementById('gemini-api-key') as HTMLInputElement;
const geminiModelSelect = document.getElementById('gemini-model') as HTMLSelectElement;
const geminiShowBtn = document.getElementById('gemini-show') as HTMLButtonElement;
const geminiTestBtn = document.getElementById('gemini-test') as HTMLButtonElement;
const geminiStatus = document.getElementById('gemini-status') as HTMLSpanElement;
const geminiCard = document.getElementById('gemini-card') as HTMLDivElement;

const defaultProviderSelect = document.getElementById('default-provider') as HTMLSelectElement;

const saveBtn = document.getElementById('save-settings') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-settings') as HTMLButtonElement;

const toast = document.getElementById('toast') as HTMLDivElement;

// State
let currentSettings: UserSettings | null = null;

// Initialize
loadSettings();

// Event Listeners

// Show/Hide API Keys
claudeShowBtn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[Options] Claude show button clicked');
  togglePasswordVisibility(claudeApiKeyInput, claudeShowBtn);
});
openaiShowBtn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[Options] OpenAI show button clicked');
  togglePasswordVisibility(openaiApiKeyInput, openaiShowBtn);
});
geminiShowBtn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[Options] Gemini show button clicked');
  togglePasswordVisibility(geminiApiKeyInput, geminiShowBtn);
});

// Test Connections
claudeTestBtn.addEventListener('click', () => testConnection('claude'));
openaiTestBtn.addEventListener('click', () => testConnection('openai'));
geminiTestBtn.addEventListener('click', () => testConnection('gemini'));

// Save & Reset
saveBtn.addEventListener('click', () => saveSettings());
resetBtn.addEventListener('click', resetSettings);

// Auto-save on API key input (after 1 second of no typing)
let saveTimeout: ReturnType<typeof setTimeout>;
[claudeApiKeyInput, openaiApiKeyInput, geminiApiKeyInput].forEach(input => {
  input.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveSettings(true); // Silent save
    }, 1000);
  });
});

// Functions

async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: MessageTypes.GET_SETTINGS });

    if (!response || !response.success) {
      throw new Error('Failed to load settings');
    }

    currentSettings = response.data as UserSettings;
    console.log('[Options] Settings loaded:', currentSettings);

    // Populate form
    claudeApiKeyInput.value = currentSettings.apiKeys.claude || '';
    claudeModelSelect.value = currentSettings.models.claude;

    openaiApiKeyInput.value = currentSettings.apiKeys.openai || '';
    openaiModelSelect.value = currentSettings.models.openai;

    geminiApiKeyInput.value = currentSettings.apiKeys.gemini || '';
    geminiModelSelect.value = currentSettings.models.gemini;

    defaultProviderSelect.value = currentSettings.defaultProvider;

    // Update status badges
    updateStatusBadges();
  } catch (error) {
    console.error('[Options] Error loading settings:', error);
    showToast('Failed to load settings', 'error');
  }
}

async function saveSettings(silent: boolean = false) {
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const updates: Partial<UserSettings> = {
      apiKeys: {
        claude: claudeApiKeyInput.value.trim() || null,
        openai: openaiApiKeyInput.value.trim() || null,
        gemini: geminiApiKeyInput.value.trim() || null
      },
      models: {
        claude: claudeModelSelect.value,
        openai: openaiModelSelect.value,
        gemini: geminiModelSelect.value
      },
      defaultProvider: defaultProviderSelect.value as 'claude' | 'openai' | 'gemini'
    };

    const response = await chrome.runtime.sendMessage({
      type: MessageTypes.UPDATE_SETTINGS,
      payload: updates
    });

    if (!response || !response.success) {
      throw new Error('Failed to save settings');
    }

    currentSettings = response.data as UserSettings;
    updateStatusBadges();

    if (!silent) {
      showToast('Settings saved successfully', 'success');
    }

    console.log('[Options] Settings saved');
  } catch (error) {
    console.error('[Options] Error saving settings:', error);
    showToast('Failed to save settings', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Settings';
  }
}

async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults? This will clear your API keys.')) {
    return;
  }

  try {
    resetBtn.disabled = true;
    resetBtn.textContent = 'Resetting...';

    // TODO: Add RESET_SETTINGS message handler in service worker
    // For now, just clear API keys
    const updates: Partial<UserSettings> = {
      apiKeys: {
        claude: null,
        openai: null,
        gemini: null
      }
    };

    const response = await chrome.runtime.sendMessage({
      type: MessageTypes.UPDATE_SETTINGS,
      payload: updates
    });

    if (!response || !response.success) {
      throw new Error('Failed to reset settings');
    }

    // Reload page to show defaults
    location.reload();
  } catch (error) {
    console.error('[Options] Error resetting settings:', error);
    showToast('Failed to reset settings', 'error');
  } finally {
    resetBtn.disabled = false;
    resetBtn.textContent = 'Reset to Defaults';
  }
}

async function testConnection(provider: 'claude' | 'openai' | 'gemini') {
  const btnMap = {
    claude: claudeTestBtn,
    openai: openaiTestBtn,
    gemini: geminiTestBtn
  };

  const statusMap = {
    claude: claudeStatus,
    openai: openaiStatus,
    gemini: geminiStatus
  };

  const keyMap = {
    claude: claudeApiKeyInput.value.trim(),
    openai: openaiApiKeyInput.value.trim(),
    gemini: geminiApiKeyInput.value.trim()
  };

  const modelMap = {
    claude: claudeModelSelect.value,
    openai: openaiModelSelect.value,
    gemini: geminiModelSelect.value
  };

  const btn = btnMap[provider];
  const status = statusMap[provider];
  const apiKey = keyMap[provider];
  const model = modelMap[provider];

  if (!apiKey) {
    showToast(`Please enter ${provider} API key first`, 'warning');
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = 'Testing...';
    status.textContent = 'Testing...';
    status.className = 'status-badge testing';

    console.log(`[Options] Testing ${provider} connection...`);

    // Call the real AI service through service worker
    const response = await chrome.runtime.sendMessage({
      type: MessageTypes.TEST_AI_CONNECTION,
      payload: {
        provider,
        apiKey,
        model
      }
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Connection test failed');
    }

    status.textContent = 'Connected ✓';
    status.className = 'status-badge configured';
    showToast(`${provider} connection successful`, 'success');

    console.log(`[Options] ${provider} test passed`);
  } catch (error: any) {
    console.error(`[Options] ${provider} test failed:`, error);
    status.textContent = 'Error';
    status.className = 'status-badge error';

    // Show user-friendly error message
    const errorMsg = error.message || `${provider} connection failed`;
    showToast(errorMsg, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Test Connection';
  }
}

function updateStatusBadges() {
  if (!currentSettings) return;

  // Claude
  if (currentSettings.apiKeys.claude) {
    claudeStatus.textContent = 'Configured ✓';
    claudeStatus.className = 'status-badge configured';
    claudeCard.classList.add('configured');
  } else {
    claudeStatus.textContent = 'Not Configured';
    claudeStatus.className = 'status-badge';
    claudeCard.classList.remove('configured');
  }

  // OpenAI
  if (currentSettings.apiKeys.openai) {
    openaiStatus.textContent = 'Configured ✓';
    openaiStatus.className = 'status-badge configured';
    openaiCard.classList.add('configured');
  } else {
    openaiStatus.textContent = 'Not Configured';
    openaiStatus.className = 'status-badge';
    openaiCard.classList.remove('configured');
  }

  // Gemini
  if (currentSettings.apiKeys.gemini) {
    geminiStatus.textContent = 'Configured ✓';
    geminiStatus.className = 'status-badge configured';
    geminiCard.classList.add('configured');
  } else {
    geminiStatus.textContent = 'Not Configured';
    geminiStatus.className = 'status-badge';
    geminiCard.classList.remove('configured');
  }
}

function togglePasswordVisibility(input: HTMLInputElement, button: HTMLButtonElement) {
  console.log('[Options] Toggle password visibility for:', input.id, 'Current type:', input.type);

  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈'; // Change icon to "hide"
    console.log('[Options] Changed to text (visible)');
  } else {
    input.type = 'password';
    button.textContent = '👁️'; // Change icon to "show"
    console.log('[Options] Changed to password (hidden)');
  }
}

function showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;

  // Force reflow for animation
  void toast.offsetWidth;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

