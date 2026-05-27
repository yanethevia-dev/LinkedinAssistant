// Writing Style Selector - For choosing post tone/style

export type WritingStyle =
  | 'professional'
  | 'technical'
  | 'casual'
  | 'recruiter-friendly'
  | 'founder'
  | 'concise'
  | 'storytelling';

export interface WritingStyleOption {
  id: WritingStyle;
  labelES: string;
  labelEN: string;
  descriptionES: string;
  descriptionEN: string;
  icon: string;
}

const writingStyles: WritingStyleOption[] = [
  {
    id: 'professional',
    labelES: 'Profesional',
    labelEN: 'Professional',
    descriptionES: 'Tono formal y corporativo, ideal para anuncios oficiales',
    descriptionEN: 'Formal and corporate tone, ideal for official announcements',
    icon: '💼'
  },
  {
    id: 'technical',
    labelES: 'Técnico Senior',
    labelEN: 'Technical Senior',
    descriptionES: 'Tono experto en tecnología, como Senior Engineer, con profundidad técnica',
    descriptionEN: 'Expert tech tone, like Senior Engineer, with technical depth',
    icon: '⚙️'
  },
  {
    id: 'casual',
    labelES: 'Cercano y Casual',
    labelEN: 'Friendly & Casual',
    descriptionES: 'Conversacional y accesible, evita sonar demasiado corporativo',
    descriptionEN: 'Conversational and accessible, avoids being too corporate',
    icon: '😊'
  },
  {
    id: 'recruiter-friendly',
    labelES: 'Enfocado a Recruiters',
    labelEN: 'Recruiter-Friendly',
    descriptionES: 'Optimizado para captar atención de reclutadores y empleadores',
    descriptionEN: 'Optimized to catch recruiters and employers attention',
    icon: '🎯'
  },
  {
    id: 'founder',
    labelES: 'Estilo Founder',
    labelEN: 'Founder Style',
    descriptionES: 'Visionario y motivador, comparte insights de negocio y liderazgo',
    descriptionEN: 'Visionary and motivating, shares business and leadership insights',
    icon: '🚀'
  },
  {
    id: 'concise',
    labelES: 'Conciso y Directo',
    labelEN: 'Concise & Direct',
    descriptionES: 'Breve y al punto, sin rodeos, máximo impacto en pocas palabras',
    descriptionEN: 'Brief and to the point, no fluff, maximum impact in few words',
    icon: '⚡'
  },
  {
    id: 'storytelling',
    labelES: 'Storytelling',
    labelEN: 'Storytelling',
    descriptionES: 'Narrativo y emocional, cuenta una historia que conecta con la audiencia',
    descriptionEN: 'Narrative and emotional, tells a story that connects with audience',
    icon: '📖'
  }
];

export function showWritingStyleSelector(
  language: 'es' | 'en',
  onSelect: (styles: WritingStyle[]) => void
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
    max-width: 700px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e0e0e0;
  `;
  header.innerHTML = `
    <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #333;">
      ${language === 'es' ? '✍️ Elige tu Estilo de Escritura' : '✍️ Choose Your Writing Style'}
    </h2>
    <p style="margin: 0; color: #666; font-size: 14px;">
      ${language === 'es'
        ? 'Selecciona uno o varios estilos para combinarlos'
        : 'Select one or multiple styles to combine them'}
    </p>
    <p style="margin: 4px 0 0; color: #0a66c2; font-size: 12px; font-weight: 600;">
      ${language === 'es'
        ? '💡 Puedes combinar estilos (ej: Technical + Casual = técnico pero cercano)'
        : '💡 You can combine styles (e.g., Technical + Casual = technical but friendly)'}
    </p>
  `;

  // Content - scrollable
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  `;

  // Track selected styles
  const selectedStyles = new Set<WritingStyle>();

  // Grid of style cards
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  `;

  writingStyles.forEach(style => {
    const card = createStyleCard(style, language, (isSelected) => {
      if (isSelected) {
        selectedStyles.add(style.id);
      } else {
        selectedStyles.delete(style.id);
      }
      // Update confirm button state
      updateConfirmButton();
    });
    grid.appendChild(card);
  });

  content.appendChild(grid);
  modal.appendChild(header);
  modal.appendChild(content);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: center;
  `;

  // Selected count
  const selectedCount = document.createElement('div');
  selectedCount.style.cssText = `
    color: #666;
    font-size: 14px;
  `;
  selectedCount.textContent = language === 'es' ? 'Ninguno seleccionado' : 'None selected';

  // Buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.cssText = `
    display: flex;
    gap: 12px;
  `;

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = language === 'es' ? 'Continuar' : 'Continue';
  confirmBtn.style.cssText = `
    padding: 12px 24px;
    background: #0a66c2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0.5;
  `;
  confirmBtn.disabled = true;

  const updateConfirmButton = () => {
    const count = selectedStyles.size;
    if (count === 0) {
      selectedCount.textContent = language === 'es' ? 'Ninguno seleccionado' : 'None selected';
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
      confirmBtn.style.cursor = 'not-allowed';
    } else {
      selectedCount.textContent = language === 'es'
        ? `${count} estilo${count > 1 ? 's' : ''} seleccionado${count > 1 ? 's' : ''}`
        : `${count} style${count > 1 ? 's' : ''} selected`;
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
    }
  };

  confirmBtn.onmouseenter = () => {
    if (!confirmBtn.disabled) {
      confirmBtn.style.background = '#004182';
    }
  };
  confirmBtn.onmouseleave = () => {
    if (!confirmBtn.disabled) {
      confirmBtn.style.background = '#0a66c2';
    }
  };
  confirmBtn.onclick = () => {
    if (selectedStyles.size > 0) {
      overlay.remove();
      onSelect(Array.from(selectedStyles));
    }
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = language === 'es' ? 'Cancelar' : 'Cancel';
  cancelBtn.style.cssText = `
    padding: 12px 24px;
    background: #f0f0f0;
    color: #333;
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

  buttonsContainer.appendChild(cancelBtn);
  buttonsContainer.appendChild(confirmBtn);

  footer.appendChild(selectedCount);
  footer.appendChild(buttonsContainer);
  modal.appendChild(footer);
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

function createStyleCard(
  style: WritingStyleOption,
  language: 'es' | 'en',
  onToggle: (isSelected: boolean) => void
): HTMLElement {
  let isSelected = false;

  const card = document.createElement('div');
  card.style.cssText = `
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
    position: relative;
  `;

  // Checkmark indicator
  const checkmark = document.createElement('div');
  checkmark.style.cssText = `
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #0a66c2;
    display: none;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: bold;
  `;
  checkmark.textContent = '✓';

  const content = document.createElement('div');
  content.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <div style="font-size: 32px; margin-right: 12px;">${style.icon}</div>
      <div style="font-size: 18px; font-weight: 600; color: #333;">
        ${language === 'es' ? style.labelES : style.labelEN}
      </div>
    </div>
    <div style="color: #666; font-size: 14px; line-height: 1.5;">
      ${language === 'es' ? style.descriptionES : style.descriptionEN}
    </div>
  `;

  card.appendChild(checkmark);
  card.appendChild(content);

  const updateCardStyle = () => {
    if (isSelected) {
      card.style.border = '2px solid #0a66c2';
      card.style.background = '#f0f7ff';
      checkmark.style.display = 'flex';
    } else {
      card.style.border = '2px solid #e0e0e0';
      card.style.background = 'white';
      checkmark.style.display = 'none';
    }
  };

  card.onmouseenter = () => {
    if (!isSelected) {
      card.style.border = '2px solid #0a66c2';
      card.style.background = '#f0f7ff';
    }
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
  };

  card.onmouseleave = () => {
    if (!isSelected) {
      card.style.border = '2px solid #e0e0e0';
      card.style.background = 'white';
    }
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
  };

  card.onclick = () => {
    isSelected = !isSelected;
    updateCardStyle();
    onToggle(isSelected);
  };

  return card;
}
