// Content Script - Injected into LinkedIn pages

import { MessageTypes } from '../shared/constants';

console.log('[LinkedIn Assistant] Content script loaded');

// Test communication with background worker
chrome.runtime.sendMessage({ type: MessageTypes.PING }, (response) => {
  if (response && response.success) {
    console.log('[Content Script] Connection to background worker: OK');
  }
});

// Simple test: Add a visual indicator that extension is loaded
function addLoadIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'lia-loaded-indicator';
  indicator.textContent = '✓ LinkedIn Assistant Loaded';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0a66c2;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideInFromRight 0.3s ease;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(indicator);

  // Remove after 3 seconds
  setTimeout(() => {
    indicator.style.animation = 'slideOutToRight 0.3s ease';
    setTimeout(() => indicator.remove(), 300);
  }, 3000);

  // Add slide out animation
  style.textContent += `
    @keyframes slideOutToRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addLoadIndicator);
} else {
  addLoadIndicator();
}
