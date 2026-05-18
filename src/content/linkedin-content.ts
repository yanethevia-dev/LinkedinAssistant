// Content Script - Injected into LinkedIn pages

import { MessageTypes } from '../shared/constants';
import { domObserver, type ObservedElement } from './dom-observer';
import { uiInjector } from './ui-injector';

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

// Initialize DOM Observer and UI Injection
function initializeDOMObserver() {
  console.log('[Content Script] Initializing DOM Observer...');

  // Register callback for post composers
  domObserver.on('post-composer', (observed: ObservedElement) => {
    console.log('[Content Script] Post composer detected:', observed.element);

    // Inject buttons into the composer
    const injected = uiInjector.injectPostComposerButtons(observed.element, {
      onGenerate: () => handleGeneratePost(observed.element),
      onImprove: () => handleImprovePost(observed.element)
    });

    if (injected) {
      console.log('[Content Script] Buttons injected into composer');
    }
  });

  // Register callback for comment boxes (future use)
  domObserver.on('comment-box', (observed: ObservedElement) => {
    console.log('[Content Script] Comment box detected:', observed.metadata?.postId);
    // Future: Inject "Reply" button
  });

  // Register callback for feed posts (future use)
  domObserver.on('feed-post', (observed: ObservedElement) => {
    console.log('[Content Script] Feed post detected:', observed.metadata?.postId);
    // Future: Can be used for post analysis or context
  });

  // Register callback for profile sections (future use)
  domObserver.on('profile-section', (observed: ObservedElement) => {
    console.log('[Content Script] Profile section detected');
    // Future: Extract data for CV generation
  });

  // Start observing
  domObserver.start();

  // Clean up stale elements every 30 seconds
  setInterval(() => {
    domObserver.cleanupStaleElements();
  }, 30000);

  console.log('[Content Script] DOM Observer started');
}

// Handle Generate Post button click
function handleGeneratePost(composerElement: HTMLElement) {
  console.log('[Content Script] Generate Post clicked');

  // Update button to loading state
  uiInjector.updateButtonState(composerElement, 'generate', { loading: true });

  // TODO: Issue #7 - Open modal to get user input, call AI service
  // For now, just show placeholder
  setTimeout(() => {
    alert('Generate Post feature coming in Issue #7!\n\nThis will:\n1. Ask for post topic/idea\n2. Call AI service\n3. Insert generated post into composer');
    uiInjector.updateButtonState(composerElement, 'generate', { loading: false });
  }, 500);
}

// Handle Improve Post button click
function handleImprovePost(composerElement: HTMLElement) {
  console.log('[Content Script] Improve Post clicked');

  // Get current post text
  const textEditor = composerElement.querySelector('.ql-editor, [contenteditable="true"]') as HTMLElement;

  if (!textEditor || !textEditor.textContent?.trim()) {
    alert('Please write something first!\n\nThe Improve Post feature enhances your existing draft.');
    return;
  }

  const currentText = textEditor.textContent.trim();
  console.log('[Content Script] Current post text:', currentText.substring(0, 50) + '...');

  // Update button to loading state
  uiInjector.updateButtonState(composerElement, 'improve', { loading: true });

  // TODO: Issue #8 - Send text to AI service, replace with improved version
  // For now, just show placeholder
  setTimeout(() => {
    alert(`Improve Post feature coming in Issue #8!\n\nThis will:\n1. Take your draft: "${currentText.substring(0, 50)}..."\n2. Send to AI service\n3. Replace with improved version`);
    uiInjector.updateButtonState(composerElement, 'improve', { loading: false });
  }, 500);
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addLoadIndicator();
    initializeDOMObserver();
  });
} else {
  addLoadIndicator();
  initializeDOMObserver();
}
