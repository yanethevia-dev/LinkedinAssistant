// Popup script

import { MessageTypes } from '../shared/constants';

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
    const response = await chrome.runtime.sendMessage({ type: MessageTypes.PING });

    if (response && response.success) {
      statusElement.textContent = '✓ Connected';
      statusElement.style.color = '#057642';

      setTimeout(() => {
        checkStatus();
      }, 2000);
    } else {
      statusElement.textContent = '✗ Error';
      statusElement.style.color = '#cc1016';
    }
  } catch (error) {
    console.error('Connection test failed:', error);
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
      statusElement.textContent = '✓ Ready';
      statusElement.style.color = '#057642';
    } else {
      statusElement.textContent = '⚠ Unknown';
      statusElement.style.color = '#f5b000';
    }
  } catch (error) {
    statusElement.textContent = '✗ Disconnected';
    statusElement.style.color = '#cc1016';
  }
}
