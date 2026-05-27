// Language Selector - For choosing output language

export function showLanguageSelector(
  feature: 'post' | 'cv' | 'profile',
  onSelect: (language: 'es' | 'en') => void
) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    animation: fadeIn 0.2s ease;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 450px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  `;

  const featureTitles = {
    post: { es: 'Generar Post', en: 'Generate Post' },
    cv: { es: 'Generar CV', en: 'Generate CV' },
    profile: { es: 'Mejorar Perfil', en: 'Improve Profile' }
  };

  modal.innerHTML = `
    <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 600; color: #333; text-align: center;">
      🌍 ${featureTitles[feature].es} / ${featureTitles[feature].en}
    </h2>
    <p style="margin: 0 0 28px; color: #666; font-size: 14px; text-align: center; line-height: 1.5;">
      Elige el idioma en el que quieres generar el contenido<br>
      <span style="font-size: 12px; font-style: italic;">Choose the language for the generated content</span>
    </p>
  `;

  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.cssText = `
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  `;

  const createButton = (lang: 'es' | 'en', flag: string, label: string, sublabel: string) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      flex: 1;
      padding: 20px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    `;

    btn.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 8px;">${flag}</div>
      <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px;">${label}</div>
      <div style="font-size: 12px; color: #666;">${sublabel}</div>
    `;

    btn.onmouseenter = () => {
      btn.style.border = '2px solid #0a66c2';
      btn.style.background = '#f0f7ff';
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    };

    btn.onmouseleave = () => {
      btn.style.border = '2px solid #e0e0e0';
      btn.style.background = 'white';
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = 'none';
    };

    btn.onclick = () => {
      overlay.remove();
      onSelect(lang);
    };

    return btn;
  };

  const esBtn = createButton('es', '🇪🇸', 'Español', 'Spanish');
  const enBtn = createButton('en', '🇬🇧', 'English', 'Inglés');

  buttonsContainer.appendChild(esBtn);
  buttonsContainer.appendChild(enBtn);
  modal.appendChild(buttonsContainer);

  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancelar / Cancel';
  cancelBtn.style.cssText = `
    width: 100%;
    padding: 12px;
    background: #f0f0f0;
    color: #666;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  cancelBtn.onmouseenter = () => cancelBtn.style.background = '#e0e0e0';
  cancelBtn.onmouseleave = () => cancelBtn.style.background = '#f0f0f0';
  cancelBtn.onclick = () => overlay.remove();

  modal.appendChild(cancelBtn);
  overlay.appendChild(modal);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  };

  // Close on Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(overlay);
}
