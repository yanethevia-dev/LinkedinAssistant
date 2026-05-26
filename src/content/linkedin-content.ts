// Content Script - Injected into LinkedIn pages

import { MessageTypes } from '../shared/constants';
import { domObserver, type ObservedElement } from './dom-observer';
import { uiInjector } from './ui-injector';
import { modal } from './modal';

console.log('[LinkedIn Assistant] Content script loaded');
console.log('[LinkedIn Assistant] URL:', window.location.href);
console.log('[LinkedIn Assistant] Document state:', document.readyState);

// Test communication with background worker
console.log('[Content Script] Sending PING to background worker...');
try {
  chrome.runtime.sendMessage({ type: MessageTypes.PING }, (response) => {
    console.log('[Content Script] PING response received:', response);
    if (chrome.runtime.lastError) {
      console.error('[Content Script] Runtime error:', chrome.runtime.lastError);
    }
    if (response && response.success) {
      console.log('[Content Script] Connection to background worker: OK');
    } else {
      console.error('[Content Script] Failed to connect to background worker:', response);
    }
  });

  // Timeout check
  setTimeout(() => {
    console.log('[Content Script] 2 seconds passed since PING sent');
  }, 2000);
} catch (error) {
  console.error('[Content Script] Error sending message:', error);
}

// Simple test: Add a visual indicator that extension is loaded
function addLoadIndicator() {
  console.log('[LinkedIn Assistant] addLoadIndicator() called');

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
  console.log('[LinkedIn Assistant] Indicator added to page');
  console.log('[LinkedIn Assistant] Toast should be visible at bottom-right corner');

  // Remove after 10 seconds (increased for debugging)
  setTimeout(() => {
    console.log('[LinkedIn Assistant] Removing toast indicator...');
    indicator.style.animation = 'slideOutToRight 0.3s ease';
    setTimeout(() => {
      indicator.remove();
      console.log('[LinkedIn Assistant] Toast removed');
    }, 300);
  }, 10000);

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

  try {
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
  } catch (error) {
    console.error('[Content Script] Error initializing DOM Observer:', error);
  }
}

// Handle Generate Post button click
function handleGeneratePost(composerElement: HTMLElement) {
  console.log('[Content Script] Generate Post clicked');

  // Open modal to get post topic/idea
  modal.open({
    title: '✨ Generate Post',
    description: 'Tell me what you want to write about, and I\'ll generate a LinkedIn post for you.',
    placeholder: 'Example: "Share insights about remote work culture" or "Announce our new product launch"...',
    primaryButton: 'Generate Post',
    secondaryButton: 'Cancel',
    maxLength: 500,
    showCharCount: true,
    onPrimary: async (topic: string) => {
      console.log('[Content Script] Generating post for topic:', topic);

      // TODO: Issue #7 - Call AI service to generate post
      // For now, simulate with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Insert generated content into composer
      alert(`🎉 Post generated!\n\nTopic: ${topic}\n\n(Actual AI generation coming in Issue #7)`);
    },
    onSecondary: () => {
      console.log('[Content Script] Generate cancelled');
    },
    onClose: () => {
      console.log('[Content Script] Modal closed');
    }
  });
}

// Handle Improve Post button click
function handleImprovePost(composerElement: HTMLElement) {
  console.log('[Content Script] Improve Post clicked');
  console.log('[Content Script] Composer element:', composerElement.className);

  // Get current post text - try multiple selectors for different editor types
  let textEditor = composerElement.querySelector('.ql-editor') as HTMLElement;
  if (!textEditor) {
    textEditor = composerElement.querySelector('.tiptap') as HTMLElement; // TipTap editor (LinkedIn 2026)
  }
  if (!textEditor) {
    textEditor = composerElement.querySelector('.ProseMirror') as HTMLElement; // ProseMirror
  }
  if (!textEditor) {
    textEditor = composerElement.querySelector('[contenteditable]') as HTMLElement; // ANY contenteditable
  }

  console.log('[Content Script] Text editor found:', !!textEditor);
  console.log('[Content Script] Text editor type:', textEditor?.className);
  console.log('[Content Script] Text editor content:', textEditor?.textContent?.substring(0, 100));

  if (!textEditor) {
    alert('Could not find the text editor.\n\nPlease try again.');
    return;
  }

  const currentText = textEditor.textContent?.trim() || '';

  if (!currentText) {
    alert('Please write something first!\n\nThe Improve Post feature enhances your existing draft.');
    return;
  }

  console.log('[Content Script] Current post text:', currentText.substring(0, 50) + '...');

  // Open modal with current text
  modal.open({
    title: '🚀 Improve Post',
    description: 'I\'ll enhance your post to make it more engaging and professional. Edit if needed:',
    placeholder: 'Your post content...',
    initialValue: currentText,
    primaryButton: 'Improve Post',
    secondaryButton: 'Cancel',
    maxLength: 3000,
    showCharCount: true,
    onPrimary: async (text: string) => {
      console.log('[Content Script] Improving post:', text.substring(0, 50) + '...');

      // TODO: Issue #8 - Call AI service to improve post
      // For now, simulate with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace text in composer with improved version
      alert(`🎉 Post improved!\n\nOriginal: ${text.substring(0, 50)}...\n\n(Actual AI improvement coming in Issue #8)`);
    },
    onSecondary: () => {
      console.log('[Content Script] Improve cancelled');
    },
    onClose: () => {
      console.log('[Content Script] Modal closed');
    }
  });
}

// Wait for page to be ready
console.log('[LinkedIn Assistant] Initializing... readyState:', document.readyState);

if (document.readyState === 'loading') {
  console.log('[LinkedIn Assistant] Waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[LinkedIn Assistant] DOMContentLoaded fired');
    addLoadIndicator();
    initializeDOMObserver();
  });
} else {
  console.log('[LinkedIn Assistant] Document already ready, initializing now');
  addLoadIndicator();
  initializeDOMObserver();
}
