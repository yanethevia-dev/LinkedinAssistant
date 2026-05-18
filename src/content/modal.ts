// Modal Component - Reusable modal for AI interactions

export interface ModalConfig {
  title: string;
  description?: string;
  placeholder?: string;
  initialValue?: string;
  primaryButton: string;
  secondaryButton?: string;
  maxLength?: number;
  showCharCount?: boolean;
  onPrimary: (value: string) => void | Promise<void>;
  onSecondary?: () => void;
  onClose?: () => void;
}

export interface ModalState {
  isOpen: boolean;
  isLoading: boolean;
  value: string;
  error: string | null;
}

/**
 * Modal Component for LinkedIn Assistant
 *
 * A beautiful, reusable modal dialog for AI interactions.
 * Handles user input, loading states, validation, and callbacks.
 */
export class Modal {
  private container: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private textarea: HTMLTextAreaElement | null = null;
  private primaryBtn: HTMLButtonElement | null = null;
  private secondaryBtn: HTMLButtonElement | null = null;
  private charCount: HTMLSpanElement | null = null;
  private errorDisplay: HTMLDivElement | null = null;

  private state: ModalState = {
    isOpen: false,
    isLoading: false,
    value: '',
    error: null
  };

  private config: ModalConfig | null = null;

  constructor() {
    console.log('[Modal] Initialized');
  }

  /**
   * Open the modal with given configuration
   */
  open(config: ModalConfig) {
    if (this.state.isOpen) {
      console.warn('[Modal] Modal already open');
      return;
    }

    console.log('[Modal] Opening modal:', config.title);
    this.config = config;
    this.state = {
      isOpen: true,
      isLoading: false,
      value: config.initialValue || '',
      error: null
    };

    this.render();
    this.attachEventListeners();
    this.focusTextarea();
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.state.isOpen) {
      return;
    }

    console.log('[Modal] Closing modal');
    this.state.isOpen = false;

    // Call onClose callback
    if (this.config?.onClose) {
      this.config.onClose();
    }

    // Animate out and remove
    if (this.overlay) {
      this.overlay.style.opacity = '0';
    }
    if (this.modal) {
      this.modal.style.transform = 'scale(0.95)';
      this.modal.style.opacity = '0';
    }

    setTimeout(() => {
      this.cleanup();
    }, 200);
  }

  /**
   * Update modal state
   */
  setState(updates: Partial<ModalState>) {
    this.state = { ...this.state, ...updates };
    this.updateUI();
  }

  /**
   * Render the modal
   */
  private render() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'lia-modal-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = 'lia-modal';
    this.modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.95);
      opacity: 0;
      transition: all 0.2s ease;
    `;

    // Header
    const header = this.createHeader();
    this.modal.appendChild(header);

    // Body
    const body = this.createBody();
    this.modal.appendChild(body);

    // Footer
    const footer = this.createFooter();
    this.modal.appendChild(footer);

    // Add to DOM
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);

    // Animate in
    requestAnimationFrame(() => {
      if (this.overlay) this.overlay.style.opacity = '1';
      if (this.modal) {
        this.modal.style.transform = 'scale(1)';
        this.modal.style.opacity = '1';
      }
    });
  }

  /**
   * Create modal header
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'lia-modal-header';
    header.style.cssText = `
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    `;

    // Title and description
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = 'flex: 1;';

    const title = document.createElement('h2');
    title.textContent = this.config?.title || 'LinkedIn Assistant';
    title.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      color: #000;
      margin: 0 0 8px 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    titleContainer.appendChild(title);

    if (this.config?.description) {
      const description = document.createElement('p');
      description.textContent = this.config.description;
      description.style.cssText = `
        font-size: 14px;
        color: #666;
        margin: 0;
        line-height: 1.5;
      `;
      titleContainer.appendChild(description);
    }

    header.appendChild(titleContainer);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lia-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.type = 'button';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 32px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
      margin-left: 16px;
      flex-shrink: 0;
    `;
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#f0f0f0';
      closeBtn.style.color = '#333';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
      closeBtn.style.color = '#999';
    });
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(closeBtn);

    return header;
  }

  /**
   * Create modal body
   */
  private createBody(): HTMLElement {
    const body = document.createElement('div');
    body.className = 'lia-modal-body';
    body.style.cssText = `
      padding: 24px;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Textarea
    this.textarea = document.createElement('textarea');
    this.textarea.className = 'lia-modal-textarea';
    this.textarea.placeholder = this.config?.placeholder || 'Enter your text here...';
    this.textarea.value = this.state.value;
    this.textarea.style.cssText = `
      width: 100%;
      min-height: 120px;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      resize: vertical;
      transition: border-color 0.2s ease;
      outline: none;
    `;

    this.textarea.addEventListener('focus', () => {
      if (this.textarea) {
        this.textarea.style.borderColor = '#0a66c2';
      }
    });

    this.textarea.addEventListener('blur', () => {
      if (this.textarea) {
        this.textarea.style.borderColor = '#e0e0e0';
      }
    });

    this.textarea.addEventListener('input', () => {
      this.state.value = this.textarea?.value || '';
      this.updateCharCount();
      this.validateInput();
    });

    if (this.config?.maxLength) {
      this.textarea.maxLength = this.config.maxLength;
    }

    body.appendChild(this.textarea);

    // Character count
    if (this.config?.showCharCount) {
      this.charCount = document.createElement('span');
      this.charCount.className = 'lia-modal-char-count';
      this.charCount.style.cssText = `
        font-size: 12px;
        color: #666;
        text-align: right;
      `;
      this.updateCharCount();
      body.appendChild(this.charCount);
    }

    // Error display
    this.errorDisplay = document.createElement('div');
    this.errorDisplay.className = 'lia-modal-error';
    this.errorDisplay.style.cssText = `
      padding: 12px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      color: #c33;
      font-size: 14px;
      display: none;
    `;
    body.appendChild(this.errorDisplay);

    return body;
  }

  /**
   * Create modal footer
   */
  private createFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'lia-modal-footer';
    footer.style.cssText = `
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    // Secondary button (if configured)
    if (this.config?.secondaryButton) {
      this.secondaryBtn = document.createElement('button');
      this.secondaryBtn.className = 'lia-modal-btn lia-modal-btn-secondary';
      this.secondaryBtn.textContent = this.config.secondaryButton;
      this.secondaryBtn.type = 'button';
      this.secondaryBtn.style.cssText = `
        padding: 10px 20px;
        border: 1px solid #d0d0d0;
        border-radius: 20px;
        background: white;
        color: #666;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      `;
      this.secondaryBtn.addEventListener('mouseenter', () => {
        if (this.secondaryBtn) {
          this.secondaryBtn.style.background = '#f5f5f5';
        }
      });
      this.secondaryBtn.addEventListener('mouseleave', () => {
        if (this.secondaryBtn) {
          this.secondaryBtn.style.background = 'white';
        }
      });
      footer.appendChild(this.secondaryBtn);
    }

    // Primary button
    this.primaryBtn = document.createElement('button');
    this.primaryBtn.className = 'lia-modal-btn lia-modal-btn-primary';
    this.primaryBtn.textContent = this.config?.primaryButton || 'Confirm';
    this.primaryBtn.type = 'button';
    this.primaryBtn.style.cssText = `
      padding: 10px 24px;
      border: none;
      border-radius: 20px;
      background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    this.primaryBtn.addEventListener('mouseenter', () => {
      if (this.primaryBtn && !this.state.isLoading) {
        this.primaryBtn.style.transform = 'translateY(-1px)';
        this.primaryBtn.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.3)';
      }
    });
    this.primaryBtn.addEventListener('mouseleave', () => {
      if (this.primaryBtn) {
        this.primaryBtn.style.transform = 'translateY(0)';
        this.primaryBtn.style.boxShadow = 'none';
      }
    });

    footer.appendChild(this.primaryBtn);

    return footer;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners() {
    // Overlay click to close
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    // Escape key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.close();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Primary button
    if (this.primaryBtn) {
      this.primaryBtn.addEventListener('click', () => this.handlePrimary());
    }

    // Secondary button
    if (this.secondaryBtn) {
      this.secondaryBtn.addEventListener('click', () => this.handleSecondary());
    }

    // Enter key in textarea (Ctrl/Cmd + Enter)
    if (this.textarea) {
      this.textarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.handlePrimary();
        }
      });
    }
  }

  /**
   * Handle primary button click
   */
  private async handlePrimary() {
    if (this.state.isLoading || !this.config) {
      return;
    }

    // Validate
    const validation = this.validateInput();
    if (!validation.valid) {
      this.setState({ error: validation.error || 'Invalid input' });
      return;
    }

    // Set loading state
    this.setState({ isLoading: true, error: null });

    try {
      // Call callback
      await this.config.onPrimary(this.state.value);

      // Success - close modal
      this.close();
    } catch (error: any) {
      console.error('[Modal] Primary action failed:', error);
      this.setState({
        isLoading: false,
        error: error.message || 'An error occurred'
      });
    }
  }

  /**
   * Handle secondary button click
   */
  private handleSecondary() {
    if (this.state.isLoading) {
      return;
    }

    if (this.config?.onSecondary) {
      this.config.onSecondary();
    }

    this.close();
  }

  /**
   * Validate input
   */
  private validateInput(): { valid: boolean; error?: string } {
    const value = this.state.value.trim();

    if (!value) {
      return { valid: false, error: 'Please enter some text' };
    }

    if (this.config?.maxLength && value.length > this.config.maxLength) {
      return {
        valid: false,
        error: `Text is too long (max ${this.config.maxLength} characters)`
      };
    }

    return { valid: true };
  }

  /**
   * Update character count
   */
  private updateCharCount() {
    if (!this.charCount || !this.config?.showCharCount) {
      return;
    }

    const length = this.state.value.length;
    const max = this.config.maxLength;

    if (max) {
      this.charCount.textContent = `${length} / ${max}`;
      if (length > max * 0.9) {
        this.charCount.style.color = '#c33';
      } else {
        this.charCount.style.color = '#666';
      }
    } else {
      this.charCount.textContent = `${length} characters`;
    }
  }

  /**
   * Update UI based on state
   */
  private updateUI() {
    // Update primary button
    if (this.primaryBtn) {
      if (this.state.isLoading) {
        this.primaryBtn.disabled = true;
        this.primaryBtn.textContent = '⏳ Working...';
        this.primaryBtn.style.opacity = '0.7';
        this.primaryBtn.style.cursor = 'wait';
      } else {
        this.primaryBtn.disabled = false;
        this.primaryBtn.textContent = this.config?.primaryButton || 'Confirm';
        this.primaryBtn.style.opacity = '1';
        this.primaryBtn.style.cursor = 'pointer';
      }
    }

    // Update secondary button
    if (this.secondaryBtn) {
      this.secondaryBtn.disabled = this.state.isLoading;
      this.secondaryBtn.style.opacity = this.state.isLoading ? '0.5' : '1';
    }

    // Update textarea
    if (this.textarea) {
      this.textarea.disabled = this.state.isLoading;
    }

    // Update error display
    if (this.errorDisplay) {
      if (this.state.error) {
        this.errorDisplay.textContent = this.state.error;
        this.errorDisplay.style.display = 'block';
      } else {
        this.errorDisplay.style.display = 'none';
      }
    }
  }

  /**
   * Focus textarea
   */
  private focusTextarea() {
    setTimeout(() => {
      if (this.textarea) {
        this.textarea.focus();
        // Move cursor to end if there's initial value
        if (this.state.value) {
          this.textarea.setSelectionRange(this.state.value.length, this.state.value.length);
        }
      }
    }, 100);
  }

  /**
   * Cleanup
   */
  private cleanup() {
    if (this.overlay) {
      this.overlay.remove();
    }

    this.container = null;
    this.overlay = null;
    this.modal = null;
    this.textarea = null;
    this.primaryBtn = null;
    this.secondaryBtn = null;
    this.charCount = null;
    this.errorDisplay = null;
    this.config = null;
  }
}

// Export singleton instance
export const modal = new Modal();
