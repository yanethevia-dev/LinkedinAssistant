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

// Create floating action buttons in the feed
function createFloatingButtons() {
  console.log('[LinkedIn Assistant] Creating floating action buttons...');

  // Check if already created
  if (document.getElementById('lia-floating-buttons')) {
    console.log('[LinkedIn Assistant] Floating buttons already exist');
    return;
  }

  // Container for floating buttons
  const container = document.createElement('div');
  container.id = 'lia-floating-buttons';
  container.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 9999;
    animation: slideInFromRight 0.3s ease;
  `;

  // Button 1: Create Post
  const createPostBtn = document.createElement('button');
  createPostBtn.id = 'lia-btn-create-post';
  createPostBtn.innerHTML = '✨ Crear Post';
  createPostBtn.style.cssText = `
    padding: 14px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    white-space: nowrap;
  `;

  createPostBtn.addEventListener('mouseenter', () => {
    createPostBtn.style.transform = 'translateY(-3px)';
    createPostBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
  });

  createPostBtn.addEventListener('mouseleave', () => {
    createPostBtn.style.transform = 'translateY(0)';
    createPostBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
  });

  createPostBtn.addEventListener('click', handleCreatePostClick);

  // Button 2: Review Profile
  const reviewProfileBtn = document.createElement('button');
  reviewProfileBtn.id = 'lia-btn-review-profile';
  reviewProfileBtn.innerHTML = '👤 Revisar Perfil';
  reviewProfileBtn.style.cssText = `
    padding: 14px 24px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    white-space: nowrap;
  `;

  reviewProfileBtn.addEventListener('mouseenter', () => {
    reviewProfileBtn.style.transform = 'translateY(-3px)';
    reviewProfileBtn.style.boxShadow = '0 6px 20px rgba(245, 87, 108, 0.5)';
  });

  reviewProfileBtn.addEventListener('mouseleave', () => {
    reviewProfileBtn.style.transform = 'translateY(0)';
    reviewProfileBtn.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.4)';
  });

  reviewProfileBtn.addEventListener('click', handleReviewProfileClick);

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

  container.appendChild(createPostBtn);
  container.appendChild(reviewProfileBtn);
  document.body.appendChild(container);

  console.log('[LinkedIn Assistant] Floating buttons created');
}

// Initialize DOM Observer and UI Injection
function initializeDOMObserver() {
  console.log('[Content Script] Initializing DOM Observer...');

  try {
    // Register callback for post composers (modal opened)
    domObserver.on('post-composer', (observed: ObservedElement) => {
    console.log('[Content Script] Post composer detected (modal opened)');

    // Inject ONLY "Improve Post" button into the composer
    const injected = uiInjector.injectImproveButton(observed.element, {
      onImprove: () => handleImprovePost(observed.element)
    });

    if (injected) {
      console.log('[Content Script] Improve button injected into composer');
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

// Handle Create Post button click (floating button)
function handleCreatePostClick() {
  console.log('[Content Script] Create Post clicked - opening LinkedIn composer');

  // Find the "Start a post" button in LinkedIn and click it
  const startPostBtn = document.querySelector('[aria-label*="Start a post"], [aria-label*="Crear publicación"]') as HTMLElement;

  if (startPostBtn) {
    startPostBtn.click();
    console.log('[Content Script] LinkedIn composer opened');
  } else {
    console.error('[Content Script] Could not find Start a post button');
    alert('No se pudo abrir el editor de LinkedIn. Por favor, abre manualmente.');
  }
}

// Handle Review Profile button click (floating button)
function handleReviewProfileClick() {
  console.log('[Content Script] Review Profile clicked');

  // TODO: Issue #10 - Extract profile and generate CV
  alert('👤 Revisar Perfil\n\nEsta función extraerá tu perfil de LinkedIn y generará un CV profesional.\n\n(Funcionalidad próximamente)');
}

// Handle Improve Post button click
function handleImprovePost(composerElement: HTMLElement) {
  console.log('[Content Script] Improve Post clicked');
  console.log('[Content Script] Composer element (editor):', composerElement.className.substring(0, 50));

  // The composerElement IS the editor now
  const textEditor = composerElement;

  console.log('[Content Script] Text editor content:', textEditor.textContent?.substring(0, 100));

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
    createFloatingButtons();
    initializeDOMObserver();
  });
} else {
  console.log('[LinkedIn Assistant] Document already ready, initializing now');
  createFloatingButtons();
  initializeDOMObserver();
}
