// UI Injector - Injects buttons and UI elements into LinkedIn

export interface InjectedButton {
  element: HTMLButtonElement;
  type: 'generate' | 'improve';
  composerElement: HTMLElement;
  cleanup: () => void;
}

/**
 * UI Injector for LinkedIn Assistant
 *
 * Responsible for injecting buttons, tooltips, and UI elements
 * into LinkedIn's interface without breaking their layout.
 */
export class UIInjector {
  private injectedButtons: Map<HTMLElement, InjectedButton[]> = new Map();
  private buttonIdCounter = 0;

  constructor() {
    console.log('[UIInjector] Initialized');
  }

  /**
   * Inject Generate & Improve buttons into a post composer
   */
  injectPostComposerButtons(
    composerElement: HTMLElement,
    callbacks: {
      onGenerate: () => void;
      onImprove: () => void;
    }
  ): boolean {
    // Check if already injected
    if (this.injectedButtons.has(composerElement)) {
      console.log('[UIInjector] Buttons already injected for this composer');
      return false;
    }

    console.log('[UIInjector] Injecting buttons into post composer');

    // Find the best place to inject buttons
    const injectionPoint = this.findPostComposerInjectionPoint(composerElement);

    if (!injectionPoint) {
      console.warn('[UIInjector] Could not find injection point in composer');
      return false;
    }

    // Create button container
    const container = this.createButtonContainer();

    // Create Generate button
    const generateBtn = this.createButton({
      text: '✨ Generate Post',
      type: 'generate',
      onClick: callbacks.onGenerate
    });

    // Create Improve button
    const improveBtn = this.createButton({
      text: '🚀 Improve Post',
      type: 'improve',
      onClick: callbacks.onImprove
    });

    // Add buttons to container
    container.appendChild(generateBtn.element);
    container.appendChild(improveBtn.element);

    // Inject into DOM
    injectionPoint.appendChild(container);

    // Track injected buttons
    this.injectedButtons.set(composerElement, [generateBtn, improveBtn]);

    console.log('[UIInjector] Buttons injected successfully');
    return true;
  }

  /**
   * Remove buttons from a composer
   */
  removePostComposerButtons(composerElement: HTMLElement): boolean {
    const buttons = this.injectedButtons.get(composerElement);

    if (!buttons) {
      return false;
    }

    // Cleanup each button
    buttons.forEach(btn => btn.cleanup());

    // Remove from tracking
    this.injectedButtons.delete(composerElement);

    console.log('[UIInjector] Buttons removed from composer');
    return true;
  }

  /**
   * Find the best place to inject buttons in a post composer
   */
  private findPostComposerInjectionPoint(composerElement: HTMLElement): HTMLElement | null {
    // Strategy 1: Look for footer/action bar
    const footerSelectors = [
      '.share-creation-state__footer',
      '.share-box-footer',
      '.share-actions__footer',
      '[class*="share"][class*="footer"]'
    ];

    for (const selector of footerSelectors) {
      const footer = composerElement.querySelector(selector) as HTMLElement;
      if (footer) {
        console.log('[UIInjector] Found footer for injection:', selector);
        return footer;
      }
    }

    // Strategy 2: Look for button container
    const buttonContainerSelectors = [
      '.share-actions',
      '.share-box-footer__buttons',
      '[class*="share"][class*="action"]'
    ];

    for (const selector of buttonContainerSelectors) {
      const container = composerElement.querySelector(selector) as HTMLElement;
      if (container) {
        console.log('[UIInjector] Found button container for injection:', selector);
        return container;
      }
    }

    // Strategy 3: Create our own container at the end
    console.log('[UIInjector] Creating custom injection point');
    return composerElement;
  }

  /**
   * Create a button container
   */
  private createButtonContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'lia-button-container';
    container.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      margin: 8px 0;
      flex-wrap: wrap;
    `;
    return container;
  }

  /**
   * Create a button element
   */
  private createButton(config: {
    text: string;
    type: 'generate' | 'improve';
    onClick: () => void;
  }): InjectedButton {
    const buttonId = `lia-btn-${config.type}-${++this.buttonIdCounter}`;
    const button = document.createElement('button');

    button.id = buttonId;
    button.className = `lia-button lia-button-${config.type}`;
    button.textContent = config.text;
    button.type = 'button'; // Prevent form submission

    // Styling
    button.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      ${config.type === 'generate'
        ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;'
        : 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;'
      }
    `;

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });

    // Click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(`[UIInjector] ${config.type} button clicked`);
      config.onClick();
    });

    // Cleanup function
    const cleanup = () => {
      button.remove();
      const container = button.parentElement;
      if (container && container.className === 'lia-button-container' && container.children.length === 0) {
        container.remove();
      }
    };

    return {
      element: button,
      type: config.type,
      composerElement: button, // Will be set by caller
      cleanup
    };
  }

  /**
   * Update button state (loading, disabled, etc.)
   */
  updateButtonState(
    composerElement: HTMLElement,
    type: 'generate' | 'improve',
    state: {
      loading?: boolean;
      disabled?: boolean;
      text?: string;
    }
  ) {
    const buttons = this.injectedButtons.get(composerElement);
    if (!buttons) return;

    const button = buttons.find(btn => btn.type === type);
    if (!button) return;

    const btnElement = button.element;

    if (state.loading !== undefined) {
      if (state.loading) {
        btnElement.disabled = true;
        btnElement.style.opacity = '0.7';
        btnElement.style.cursor = 'wait';
        const originalText = btnElement.textContent;
        btnElement.setAttribute('data-original-text', originalText || '');
        btnElement.textContent = '⏳ Working...';
      } else {
        btnElement.disabled = false;
        btnElement.style.opacity = '1';
        btnElement.style.cursor = 'pointer';
        const originalText = btnElement.getAttribute('data-original-text');
        if (originalText) {
          btnElement.textContent = originalText;
        }
      }
    }

    if (state.disabled !== undefined) {
      btnElement.disabled = state.disabled;
      btnElement.style.opacity = state.disabled ? '0.5' : '1';
      btnElement.style.cursor = state.disabled ? 'not-allowed' : 'pointer';
    }

    if (state.text !== undefined) {
      btnElement.textContent = state.text;
    }
  }

  /**
   * Get all injected buttons
   */
  getAllInjectedButtons(): Map<HTMLElement, InjectedButton[]> {
    return this.injectedButtons;
  }

  /**
   * Cleanup all injected buttons
   */
  cleanupAll() {
    console.log('[UIInjector] Cleaning up all injected buttons');

    this.injectedButtons.forEach(buttons => {
      buttons.forEach(btn => btn.cleanup());
    });

    this.injectedButtons.clear();
  }

  /**
   * Check if composer has buttons injected
   */
  hasButtons(composerElement: HTMLElement): boolean {
    return this.injectedButtons.has(composerElement);
  }
}

// Export singleton instance
export const uiInjector = new UIInjector();
