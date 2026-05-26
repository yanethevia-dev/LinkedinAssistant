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
   * Find the best place to inject buttons - SIMPLIFIED
   */
  private findPostComposerInjectionPoint(composerElement: HTMLElement): HTMLElement | null {
    console.log('[UIInjector] Finding injection point...');

    // Look for the editor inside the dialog
    const editor = composerElement.querySelector('[contenteditable="true"], .ql-editor') as HTMLElement;

    if (editor) {
      console.log('[UIInjector] Found editor, inserting after it');
      return editor.parentElement || composerElement;
    }

    console.log('[UIInjector] Using dialog itself');
    return composerElement;
  }

  /**
   * Create a button container
   */
  private createButtonContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'lia-button-container';
    container.id = `lia-container-${++this.buttonIdCounter}`;
    container.style.cssText = `
      display: flex !important;
      gap: 8px;
      align-items: center;
      margin: 12px 0;
      padding: 8px;
      flex-wrap: wrap;
      background: rgba(0, 102, 194, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(0, 102, 194, 0.2);
      z-index: 999;
      position: relative;
    `;
    console.log('[UIInjector] Created button container:', container.id);
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
    const buttonId = `lia-btn-${config.type}-${this.buttonIdCounter}`;
    const button = document.createElement('button');

    button.id = buttonId;
    button.className = `lia-button lia-button-${config.type}`;
    button.textContent = config.text;
    button.type = 'button'; // Prevent form submission

    // Styling with !important to override LinkedIn styles
    button.style.cssText = `
      padding: 10px 20px !important;
      border: none !important;
      border-radius: 20px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      min-height: 40px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      position: relative !important;
      z-index: 1000 !important;
      white-space: nowrap !important;
      ${config.type === 'generate'
        ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; color: white !important;'
        : 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important; color: white !important;'
      }
    `;

    console.log('[UIInjector] Created button:', buttonId, config.text);

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
