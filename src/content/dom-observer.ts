// DOM Observer - Detects LinkedIn UI elements

export type LinkedInElement =
  | 'post-composer'      // Main post creation box
  | 'post-editor'        // Edit post modal
  | 'comment-box'        // Comment input field
  | 'feed-post'          // Individual posts in feed
  | 'profile-section';   // Profile sections for CV extraction

export interface ObservedElement {
  type: LinkedInElement;
  element: HTMLElement;
  metadata?: {
    postId?: string;
    commentId?: string;
    isEditing?: boolean;
  };
}

export type ElementCallback = (observed: ObservedElement) => void;

/**
 * DOM Observer for LinkedIn
 *
 * Monitors the page for LinkedIn UI elements and notifies listeners
 * when they appear. Handles LinkedIn's SPA navigation.
 */
export class LinkedInDOMObserver {
  private observer: MutationObserver | null = null;
  private callbacks: Map<LinkedInElement, Set<ElementCallback>> = new Map();
  private observedElements: Map<HTMLElement, LinkedInElement> = new Map();

  constructor() {
    console.log('[DOMObserver] Initialized');
    this.initializeCallbackSets();
  }

  private initializeCallbackSets() {
    const types: LinkedInElement[] = [
      'post-composer',
      'post-editor',
      'comment-box',
      'feed-post',
      'profile-section'
    ];
    types.forEach(type => this.callbacks.set(type, new Set()));
  }

  /**
   * Start observing the page
   */
  start() {
    if (this.observer) {
      console.log('[DOMObserver] Already running');
      return;
    }

    console.log('[DOMObserver] Starting observer...');

    // Initial scan of existing elements
    this.scanPage();

    // Set up mutation observer for dynamic content
    this.observer = new MutationObserver((mutations) => {
      // Debounce: only scan if significant changes
      const hasSignificantChanges = mutations.some(mutation =>
        mutation.addedNodes.length > 0 ||
        mutation.removedNodes.length > 0
      );

      if (hasSignificantChanges) {
        console.log('[DOMObserver] DOM changed, rescanning...');
        this.scanPage();
      }
    });

    // Observe the entire document for changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[DOMObserver] Observer started');
  }

  /**
   * Stop observing
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log('[DOMObserver] Observer stopped');
    }
  }

  /**
   * Register a callback for when an element type is detected
   */
  on(type: LinkedInElement, callback: ElementCallback) {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      callbacks.add(callback);
      console.log(`[DOMObserver] Registered callback for: ${type}`);
    }
  }

  /**
   * Unregister a callback
   */
  off(type: LinkedInElement, callback: ElementCallback) {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      callbacks.delete(callback);
      console.log(`[DOMObserver] Unregistered callback for: ${type}`);
    }
  }

  /**
   * Scan the entire page for LinkedIn elements
   */
  private scanPage() {
    // Post Composer - Main "Start a post" button/box
    this.detectPostComposer();

    // Comment Boxes
    this.detectCommentBoxes();

    // Feed Posts
    this.detectFeedPosts();

    // Profile Sections (for CV extraction)
    this.detectProfileSections();
  }

  /**
   * Detect the main post composer
   */
  private detectPostComposer() {
    console.log('[DOMObserver] Scanning for post composer...');

    // First, check if LinkedIn is using Shadow DOM (2026 behavior)
    const shadowHost = document.querySelector('#interop-outlet[data-testid="interop-shadowdom"]');

    if (shadowHost && (shadowHost as any).shadowRoot) {
      console.log('[DOMObserver] Shadow DOM detected, scanning inside...');
      this.detectPostComposerInShadowDOM((shadowHost as any).shadowRoot);
      return;
    }

    // Fallback to regular DOM scanning (legacy LinkedIn)
    const selectors = [
      // 2026 LinkedIn selectors (tested)
      '.share-creation-state__text-editor',                    // Opened composer container
      '.ql-editor[data-test-ql-editor-contenteditable]',      // Quill editor with data-test
      '[data-test-ql-editor-contenteditable="true"]',         // Direct data-test selector
      '[role="textbox"][aria-label*="contenido"]',            // Spanish: "contenido"
      '[role="textbox"][aria-label*="content"]',              // English: "content"
      '.editor-content .ql-editor',                           // Editor content wrapper

      // Fallback selectors for "Start a post" button
      '[role="button"][aria-label*="Crear publicación"]',     // Spanish
      '[role="button"][aria-label*="Start a post"]',          // English
      '[componentkey][role="button"]',                        // Generic button with componentkey

      // Legacy selectors (may still work)
      '.share-box-feed-entry__trigger',
      '.share-box-feed-entry',
      '.share-creation-state',
      '[data-test-share-box-text-editor]',
      '.ql-editor[data-placeholder]',
      '.artdeco-modal .share-box'
    ];

    console.log('[DOMObserver] Scanning regular DOM...');

    let foundAny = false;
    const candidateElements = new Set<HTMLElement>();

    // First pass: collect all candidate elements
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`[DOMObserver]   Trying "${selector}" → found ${elements.length}`);

      elements.forEach((el) => {
        const element = el as HTMLElement;

        // Skip if already observed
        if (this.observedElements.has(element)) {
          console.log('[DOMObserver]     Already observed, skipping');
          return;
        }

        const visible = this.isVisible(element);
        const isComposer = this.isPostComposer(element);
        console.log(`[DOMObserver]     Visible: ${visible}, IsComposer: ${isComposer}`);

        if (visible && isComposer) {
          candidateElements.add(element);
        }
      });
    }

    // Second pass: filter out child elements if their parents are also candidates
    const rootElements = Array.from(candidateElements).filter(element => {
      // Check if any other candidate contains this element
      for (const otherElement of candidateElements) {
        if (otherElement !== element && otherElement.contains(element)) {
          console.log('[DOMObserver]     Skipping child element, parent already detected');
          return false; // This element is a child of another candidate
        }
      }
      return true; // This is a root element
    });

    // Third pass: notify only root elements
    rootElements.forEach(element => {
      foundAny = true;
      this.observedElements.set(element, 'post-composer');
      this.notifyCallbacks('post-composer', element);
      console.log('[DOMObserver]     ✓ Detected and notified!', element.className.substring(0, 50));
    });

    if (!foundAny) {
      console.log('[DOMObserver] No post composer found in this scan');
    }
  }

  /**
   * Detect post composer inside Shadow DOM (2026 LinkedIn)
   */
  private detectPostComposerInShadowDOM(shadowRoot: ShadowRoot) {
    // Shadow DOM selectors for LinkedIn 2026
    const shadowSelectors = [
      '.ql-editor',                                           // Quill editor
      '[contenteditable="true"]',                            // Any editable
      '[role="textbox"]',                                    // Textbox role
      '[role="textbox"][aria-label*="contenido"]',          // Spanish
      '[role="textbox"][aria-label*="content"]',            // English
      '.ql-editor.ql-blank'                                 // Empty quill editor
    ];

    let foundAny = false;
    const candidateElements = new Set<HTMLElement>();

    // First pass: collect all candidate elements
    for (const selector of shadowSelectors) {
      const elements = shadowRoot.querySelectorAll(selector);
      console.log(`[DOMObserver]   Shadow DOM trying "${selector}" → found ${elements.length}`);

      elements.forEach((el) => {
        const element = el as HTMLElement;

        // Skip if already observed
        if (this.observedElements.has(element)) {
          console.log('[DOMObserver]     Already observed, skipping');
          return;
        }

        // Check if visible
        const visible = this.isVisible(element);
        console.log(`[DOMObserver]     Visible: ${visible}`);

        // For Shadow DOM, we trust that if it's a textbox/editor, it's the composer
        const isEditor = element.hasAttribute('contenteditable') ||
                        element.getAttribute('role') === 'textbox' ||
                        element.classList.contains('ql-editor');

        if (visible && isEditor) {
          candidateElements.add(element);
        }
      });
    }

    // Second pass: filter out child elements if their parents are also candidates
    const rootElements = Array.from(candidateElements).filter(element => {
      for (const otherElement of candidateElements) {
        if (otherElement !== element && otherElement.contains(element)) {
          console.log('[DOMObserver]     Shadow DOM: Skipping child element');
          return false;
        }
      }
      return true;
    });

    // Third pass: notify only root elements
    rootElements.forEach(element => {
      foundAny = true;
      this.observedElements.set(element, 'post-composer');
      this.notifyCallbacks('post-composer', element);
      console.log('[DOMObserver]     ✓ Shadow DOM composer detected and notified!', element.className.substring(0, 50));
    });

    if (!foundAny) {
      console.log('[DOMObserver] No composer found in Shadow DOM');
    }
  }

  /**
   * Detect comment input boxes
   */
  private detectCommentBoxes() {
    const selectors = [
      '.comments-comment-box__form',              // Comment form container
      '.comments-comment-texteditor',             // Comment text editor
      '[data-test-comment-box]'                   // Alternative selector
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const element = el as HTMLElement;

        if (this.observedElements.has(element)) {
          return;
        }

        if (this.isVisible(element)) {
          // Try to find post ID from parent
          const postId = this.findPostId(element);

          this.observedElements.set(element, 'comment-box');
          this.notifyCallbacks('comment-box', element, { postId });
        }
      });
    }
  }

  /**
   * Detect individual feed posts
   */
  private detectFeedPosts() {
    const selectors = [
      '.feed-shared-update-v2',                   // Main feed post container
      '[data-urn*="activity"]',                   // Posts with activity URN
      '.feed-shared-update-v2__description-wrapper' // Post content
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const element = el as HTMLElement;

        if (this.observedElements.has(element)) {
          return;
        }

        if (this.isVisible(element)) {
          const postId = this.findPostId(element);

          this.observedElements.set(element, 'feed-post');
          this.notifyCallbacks('feed-post', element, { postId });
        }
      });
    }
  }

  /**
   * Detect profile sections (for CV generation)
   */
  private detectProfileSections() {
    // Only run on profile pages
    if (!window.location.pathname.includes('/in/')) {
      return;
    }

    const selectors = [
      '#profile-content',                         // Main profile content
      '.pv-top-card',                            // Profile header card
      '.pvs-list',                               // Experience/Education lists
      '.pv-profile-section'                      // Profile sections
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const element = el as HTMLElement;

        if (this.observedElements.has(element)) {
          return;
        }

        if (this.isVisible(element)) {
          this.observedElements.set(element, 'profile-section');
          this.notifyCallbacks('profile-section', element);
        }
      });
    }
  }

  /**
   * Check if element is visible
   */
  private isVisible(element: HTMLElement): boolean {
    return !!(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }

  /**
   * Check if element is actually a post composer
   */
  private isPostComposer(element: HTMLElement): boolean {
    // For Shadow DOM elements, check if it's a textbox/editor
    const isShadowDOMEditor =
      element.getRootNode() !== document && (
        element.getAttribute('role') === 'textbox' ||
        element.classList.contains('ql-editor') ||
        element.getAttribute('contenteditable') === 'true'
      );

    if (isShadowDOMEditor) {
      console.log('[DOMObserver]     Element is in Shadow DOM and looks like an editor');
      return true;
    }

    // For regular DOM: Must be in feed or on homepage
    const isInFeed = element.closest('.feed-shared-update-v2__container') ||
                     element.closest('.share-box-feed-entry') ||
                     element.closest('.share-creation-state') ||
                     element.closest('[role="dialog"]'); // Include modals

    // Must have post-related attributes or classes
    const hasPostAttributes =
      element.getAttribute('data-test-share-box-text-editor') !== null ||
      element.getAttribute('data-test-ql-editor-contenteditable') !== null ||
      element.className.includes('share') ||
      element.className.includes('ql-editor') ||
      element.getAttribute('contenteditable') === 'true' ||
      element.getAttribute('role') === 'textbox';

    const result = !!(isInFeed || hasPostAttributes);
    console.log(`[DOMObserver]     isPostComposer check: isInFeed=${!!isInFeed}, hasPostAttributes=${!!hasPostAttributes}, result=${result}`);

    return result;
  }

  /**
   * Find post ID from element or parents
   */
  private findPostId(element: HTMLElement): string | undefined {
    // Try to find URN in element or parents
    let current: HTMLElement | null = element;

    while (current) {
      // Check data-urn attribute
      const urn = current.getAttribute('data-urn');
      if (urn && urn.includes('activity')) {
        return urn;
      }

      // Check id attribute
      const id = current.id;
      if (id && id.includes('ember')) {
        return id;
      }

      current = current.parentElement;
    }

    return undefined;
  }

  /**
   * Notify all callbacks for a given element type
   */
  private notifyCallbacks(
    type: LinkedInElement,
    element: HTMLElement,
    metadata?: ObservedElement['metadata']
  ) {
    const callbacks = this.callbacks.get(type);
    if (!callbacks || callbacks.size === 0) {
      return;
    }

    const observed: ObservedElement = {
      type,
      element,
      metadata
    };

    console.log(`[DOMObserver] Detected ${type}`, metadata || '');

    callbacks.forEach(callback => {
      try {
        callback(observed);
      } catch (error) {
        console.error(`[DOMObserver] Callback error for ${type}:`, error);
      }
    });
  }

  /**
   * Clean up elements that are no longer in the DOM
   */
  cleanupStaleElements() {
    const staleElements: HTMLElement[] = [];

    this.observedElements.forEach((type, element) => {
      if (!document.contains(element)) {
        staleElements.push(element);
      }
    });

    staleElements.forEach(element => {
      this.observedElements.delete(element);
    });

    if (staleElements.length > 0) {
      console.log(`[DOMObserver] Cleaned up ${staleElements.length} stale elements`);
    }
  }

  /**
   * Get all currently observed elements of a type
   */
  getObservedElements(type?: LinkedInElement): ObservedElement[] {
    const results: ObservedElement[] = [];

    this.observedElements.forEach((elementType, element) => {
      if (!type || elementType === type) {
        results.push({
          type: elementType,
          element
        });
      }
    });

    return results;
  }
}

// Export singleton instance
export const domObserver = new LinkedInDOMObserver();
