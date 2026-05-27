// Content Script - Injected into LinkedIn pages

import { MessageTypes } from '../shared/constants';
import { domObserver, type ObservedElement } from './dom-observer';
import { uiInjector } from './ui-injector';
import { modal } from './modal';
import { aiHelper } from './ai-helper';

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

  // Button 1: Generate Post with AI
  const generatePostBtn = createFloatingButton({
    id: 'lia-btn-generate-post',
    text: '✨ Generar Post con IA',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    onClick: handleGeneratePostWithAI
  });

  // Button 2: Generate CV
  const generateCVBtn = createFloatingButton({
    id: 'lia-btn-generate-cv',
    text: '📄 Generar mi CV',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    shadowColor: 'rgba(67, 233, 123, 0.4)',
    onClick: handleGenerateCV
  });

  // Button 3: Improve Profile
  const improveProfileBtn = createFloatingButton({
    id: 'lia-btn-improve-profile',
    text: '🔧 Mejorar mi Perfil',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    shadowColor: 'rgba(245, 87, 108, 0.4)',
    onClick: handleImproveProfile
  });

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

  container.appendChild(generatePostBtn);
  container.appendChild(generateCVBtn);
  container.appendChild(improveProfileBtn);
  document.body.appendChild(container);

  console.log('[LinkedIn Assistant] 3 floating buttons created');
}

// Helper to create a floating button
function createFloatingButton(config: {
  id: string;
  text: string;
  gradient: string;
  shadowColor: string;
  onClick: () => void;
}): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = config.id;
  btn.innerHTML = config.text;
  btn.style.cssText = `
    padding: 14px 24px;
    background: ${config.gradient};
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px ${config.shadowColor};
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    white-space: nowrap;
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-3px)';
    btn.style.boxShadow = `0 6px 20px ${config.shadowColor.replace('0.4', '0.6')}`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = `0 4px 15px ${config.shadowColor}`;
  });

  btn.addEventListener('click', config.onClick);

  return btn;
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

// Handle Generate Post with AI (floating button)
function handleGeneratePostWithAI() {
  console.log('[Content Script] Generate Post with AI clicked');

  // Open modal to get the topic/idea
  modal.open({
    title: '✨ Generar Post con IA',
    description: '¿Sobre qué quieres escribir? Describe tu idea o tema y generaré un post completo para LinkedIn.',
    placeholder: 'Ejemplo: "Anunciar el lanzamiento de nuestro nuevo producto" o "Compartir aprendizajes sobre trabajo remoto"...',
    primaryButton: 'Generar Post',
    secondaryButton: 'Cancelar',
    maxLength: 500,
    showCharCount: true,
    onPrimary: async (topic: string) => {
      console.log('[Content Script] Generating post for topic:', topic);

      try {
        modal.close();

        // Show loading toast
        showSuccessToast('⏳ Generando post con IA...');

        // Call AI service to generate post
        const generatedPost = await aiHelper.generatePost(topic);
        console.log('[Content Script] Post generated successfully');

        // Open LinkedIn composer
        const startPostBtn = document.querySelector('[aria-label*="Start a post"], [aria-label*="Crear publicación"]') as HTMLElement;

        if (startPostBtn) {
          startPostBtn.click();
          console.log('[Content Script] LinkedIn composer opened');

          // Wait for composer to open and insert text
          setTimeout(() => {
            const success = insertTextIntoComposer(generatedPost);
            if (!success) {
              alert(`✅ Post generado:\n\n${generatedPost}\n\n❌ No se pudo insertar automáticamente. Cópialo manualmente.`);
            }
          }, 1000);
        } else {
          alert(`✅ Post generado:\n\n${generatedPost}\n\n(Copia manualmente al compositor de LinkedIn)`);
        }
      } catch (error: any) {
        console.error('[Content Script] Error generating post:', error);
        alert(`❌ Error al generar post:\n\n${error.message}\n\nVerifica tu configuración de IA en Settings.`);
      }
    },
    onSecondary: () => {
      console.log('[Content Script] Generate cancelled');
    },
    onClose: () => {
      console.log('[Content Script] Modal closed');
    }
  });
}

// Handle Generate CV (floating button)
function handleGenerateCV() {
  console.log('[Content Script] Generate CV clicked');
  console.log('[Content Script] Current URL:', window.location.href);
  console.log('[Content Script] Pathname:', window.location.pathname);

  // Check if we're on a profile page
  const isProfilePage = window.location.pathname.includes('/in/');
  console.log('[Content Script] Is profile page:', isProfilePage);

  if (!isProfilePage) {
    alert('📄 Generar CV\n\nPor favor, ve a tu perfil de LinkedIn primero.\n\nURL actual: ' + window.location.pathname + '\n\nDebes estar en una URL como: /in/tu-nombre/');
    return;
  }

  console.log('[Content Script] Extracting profile data...');

  // Extract profile data with details
  const profileData = extractProfileData(true); // true = detailed extraction

  console.log('[Content Script] Extracted name:', profileData.name);
  console.log('[Content Script] Extracted headline:', profileData.headline);

  if (!profileData.name) {
    alert('No se pudo extraer la información del perfil.\n\nDebug info:\n- URL: ' + window.location.pathname + '\n- Nombre encontrado: ' + (profileData.name || 'NO') + '\n\nPor favor:\n1. Asegúrate de estar en TU perfil\n2. Espera a que la página cargue completamente\n3. Intenta hacer scroll hacia abajo\n4. Abre la consola del navegador (F12) para ver más detalles');
    return;
  }

  // Show confirmation and generate CV
  modal.open({
    title: '📄 Generar mi CV',
    description: `He extraído tu perfil:\n\n• Nombre: ${profileData.name}\n• Título: ${profileData.headline}\n• Experiencias: ${profileData.experienceCount}\n• Educación: ${profileData.educationCount}\n\n¿Generar CV profesional con IA?`,
    placeholder: 'Agrega notas adicionales (opcional)...',
    primaryButton: 'Generar CV',
    secondaryButton: 'Cancelar',
    maxLength: 500,
    showCharCount: false,
    onPrimary: async (notes: string) => {
      console.log('[Content Script] Generating CV...');

      try {
        modal.close();

        // Show loading toast
        showSuccessToast('⏳ Generando CV con IA...');

        // Call AI service to generate CV
        const cvText = await aiHelper.generateCV(profileData);
        console.log('[Content Script] CV generated successfully');

        // Show CV in a new modal
        modal.open({
          title: '📄 Tu CV Generado',
          description: 'CV generado con IA. Copia el texto o descarga como archivo:',
          placeholder: '',
          initialValue: cvText,
          primaryButton: 'Copiar al Portapapeles',
          secondaryButton: 'Cerrar',
          maxLength: 5000,
          showCharCount: false,
          onPrimary: async (text: string) => {
            // Copy to clipboard
            try {
              await navigator.clipboard.writeText(text);
              showSuccessToast('✅ CV copiado al portapapeles');
            } catch (error) {
              alert('No se pudo copiar automáticamente. Por favor, selecciona y copia manualmente.');
            }
          },
          onSecondary: () => {
            console.log('[Content Script] CV modal closed');
          },
          onClose: () => {
            console.log('[Content Script] CV modal closed');
          }
        });

        showSuccessToast('✅ CV generado con IA');
      } catch (error: any) {
        console.error('[Content Script] Error generating CV:', error);
        alert(`❌ Error al generar CV:\n\n${error.message}\n\nVerifica tu configuración de IA en Settings.`);
      }
    },
    onSecondary: () => {
      console.log('[Content Script] CV generation cancelled');
    },
    onClose: () => {
      console.log('[Content Script] Modal closed');
    }
  });
}

// Handle Improve Profile (floating button)
function handleImproveProfile() {
  console.log('[Content Script] Improve Profile clicked');
  console.log('[Content Script] Current URL:', window.location.href);
  console.log('[Content Script] Pathname:', window.location.pathname);

  // Check if we're on a profile page
  const isProfilePage = window.location.pathname.includes('/in/');
  console.log('[Content Script] Is profile page:', isProfilePage);

  if (!isProfilePage) {
    alert('🔧 Mejorar mi Perfil\n\nPor favor, ve a tu perfil de LinkedIn primero.\n\nURL actual: ' + window.location.pathname + '\n\nDebes estar en una URL como: /in/tu-nombre/');
    return;
  }

  console.log('[Content Script] Extracting profile data for improvement...');

  // Extract profile data
  const profileData = extractProfileData();

  console.log('[Content Script] Extracted name:', profileData.name);
  console.log('[Content Script] Extracted headline:', profileData.headline);

  if (!profileData.name) {
    alert('No se pudo extraer la información del perfil.\n\nDebug info:\n- URL: ' + window.location.pathname + '\n- Nombre encontrado: ' + (profileData.name || 'NO') + '\n\nPor favor:\n1. Asegúrate de estar en TU perfil\n2. Espera a que la página cargue completamente\n3. Intenta hacer scroll hacia abajo\n4. Abre la consola del navegador (F12) para ver más detalles');
    return;
  }

  // Show what will be improved
  const sectionsToImprove = [];
  if (profileData.about) sectionsToImprove.push('Acerca de');
  if (profileData.experienceCount > 0) sectionsToImprove.push(`${profileData.experienceCount} Experiencias`);

  const confirmMessage = `🔧 Mejorar Perfil\n\nVoy a mejorar estas secciones:\n${sectionsToImprove.map(s => `• ${s}`).join('\n')}\n\n¿Continuar?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  console.log('[Content Script] Starting profile improvement...');

  // Show loading toast
  showSuccessToast('⏳ Analizando perfil con IA...');

  // Call AI service to analyze and improve profile
  (async () => {
    try {
      // Generate analysis and suggestions
      const analysis = await aiHelper.analyzeProfile(profileData);
      console.log('[Content Script] Profile analysis complete');

      // If there's an About section, improve it
      let improvedAbout = '';
      if (profileData.about) {
        showSuccessToast('⏳ Mejorando sección "Acerca de"...');
        improvedAbout = await aiHelper.improveAbout(profileData.about, profileData.headline);
        console.log('[Content Script] About section improved');
      }

      // Show results in modal
      let resultsText = '📊 ANÁLISIS DE PERFIL\n\n';
      resultsText += analysis;
      resultsText += '\n\n━━━━━━━━━━━━━━━━━━━━\n\n';

      if (improvedAbout) {
        resultsText += '✨ SECCIÓN "ACERCA DE" MEJORADA\n\n';
        resultsText += improvedAbout;
        resultsText += '\n\n━━━━━━━━━━━━━━━━━━━━\n\n';
        resultsText += '💡 CÓMO APLICAR:\n';
        resultsText += '1. Ve a tu sección "Acerca de"\n';
        resultsText += '2. Click en el ícono de editar (✏️)\n';
        resultsText += '3. Copia y pega el texto mejorado\n';
        resultsText += '4. Guarda los cambios\n\n';
        resultsText += '⚠️ La edición automática estará disponible próximamente.';
      }

      modal.open({
        title: '✨ Tu Perfil Mejorado con IA',
        description: 'Análisis completo y secciones mejoradas. Copia y aplica las sugerencias manualmente:',
        placeholder: '',
        initialValue: resultsText,
        primaryButton: 'Copiar Todo',
        secondaryButton: 'Cerrar',
        maxLength: 5000,
        showCharCount: false,
        onPrimary: async (text: string) => {
          // Copy to clipboard
          try {
            await navigator.clipboard.writeText(text);
            showSuccessToast('✅ Sugerencias copiadas al portapapeles');
          } catch (error) {
            alert('No se pudo copiar automáticamente. Por favor, selecciona y copia manualmente.');
          }
        },
        onSecondary: () => {
          console.log('[Content Script] Profile improvements modal closed');
        },
        onClose: () => {
          console.log('[Content Script] Modal closed');
        }
      });

      showSuccessToast('✅ Análisis de perfil completado');
    } catch (error: any) {
      console.error('[Content Script] Error improving profile:', error);
      alert(`❌ Error al mejorar perfil:\n\n${error.message}\n\nVerifica tu configuración de IA en Settings.`);
    }
  })();
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

      try {
        modal.close();

        // Show loading toast
        showSuccessToast('⏳ Mejorando post con IA...');

        // Call AI service to improve post
        const improvedPost = await aiHelper.improvePost(text);
        console.log('[Content Script] Post improved successfully');

        // Replace text in composer with improved version
        textEditor.textContent = improvedPost;
        const inputEvent = new Event('input', { bubbles: true });
        textEditor.dispatchEvent(inputEvent);

        // Show success notification
        showSuccessToast('✅ Post mejorado con IA');
      } catch (error: any) {
        console.error('[Content Script] Error improving post:', error);
        alert(`❌ Error al mejorar post:\n\n${error.message}\n\nVerifica tu configuración de IA en Settings.`);
      }
    },
    onSecondary: () => {
      console.log('[Content Script] Improve cancelled');
    },
    onClose: () => {
      console.log('[Content Script] Modal closed');
    }
  });
}

// Helper: Extract profile data from LinkedIn
function extractProfileData(detailed = false) {
  console.log('[Content Script] Extracting profile data (detailed:', detailed, ')...');

  const data: any = {
    name: '',
    headline: '',
    about: '',
    experienceCount: 0,
    educationCount: 0,
    experiences: [],
    education: []
  };

  try {
    // Name (main profile name) - LinkedIn uses H2, not H1 now!
    const nameSelectors = [
      'main h2',                        // Most common: H2 inside main
      'h2.text-heading-xlarge',         // Legacy
      'h1.text-heading-xlarge',         // Even older legacy
      'h2[class*="profile"]',
      'h1[class*="profile"]',
      'div[class*="pv-text-details"] h2',
      'div[class*="pv-text-details"] h1'
    ];

    for (const selector of nameSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        data.name = element.textContent.trim();
        console.log('[Content Script] Name found with selector:', selector);
        break;
      }
    }

    // If still no name, scan ALL h1 AND h2 tags
    if (!data.name) {
      const allHeadings = Array.from(document.querySelectorAll('h1, h2'));
      console.log('[Content Script] Scanning', allHeadings.length, 'headings for name...');

      for (const heading of allHeadings) {
        const text = heading.textContent?.trim() || '';
        // Name usually has 2-4 words and is not too long
        if (text && text.split(' ').length >= 2 && text.length < 100 && !text.includes('LinkedIn')) {
          data.name = text;
          console.log('[Content Script] Name found from heading scan:', text.substring(0, 50));
          break;
        }
      }
    }

    // Last resort: find ANY element with visible text that looks like a name
    if (!data.name) {
      console.log('[Content Script] Trying last resort: scanning all elements...');
      const mainContent = document.querySelector('main');
      if (mainContent) {
        const allElements = Array.from(mainContent.querySelectorAll('h1, h2, h3, div, span'));
        for (const el of allElements) {
          // Only elements with direct text (no children)
          if (el.children.length === 0) {
            const text = el.textContent?.trim() || '';
            // First visible element that looks like a name
            if (text && text.split(' ').length >= 2 && text.split(' ').length <= 5 &&
                text.length > 5 && text.length < 100 &&
                !text.includes('LinkedIn') &&
                (el as HTMLElement).offsetHeight > 0) {
              data.name = text;
              console.log('[Content Script] Name found from main content scan:', text.substring(0, 50));
              break;
            }
          }
        }
      }
    }

    // Headline (professional title) - NEW LinkedIn structure
    // The headline is in a text block near the name, typically 100-300 chars with job description
    console.log('[Content Script] Looking for headline...');

    if (data.name) {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        // Find text blocks that look like a headline
        const allElements = Array.from(mainContent.querySelectorAll('div, span, p'));

        for (const el of allElements) {
          const text = el.textContent?.trim() || '';

          // Headline characteristics:
          // - 50-300 chars (job title + description)
          // - Contains job-related keywords (Engineer, Manager, Developer, etc.)
          // - No or few children (direct text content)
          // - Not the name itself
          if (text &&
              text.length > 50 &&
              text.length < 300 &&
              text !== data.name &&
              !text.includes(data.name) &&
              el.children.length < 3) {

            // Check if it contains job-related keywords
            const jobKeywords = ['engineer', 'developer', 'manager', 'architect', 'designer', 'analyst',
                                'consultant', 'specialist', 'lead', 'director', 'senior', 'junior',
                                'coordinator', 'administrator', 'scientist', 'researcher'];

            const lowerText = text.toLowerCase();
            const hasJobKeyword = jobKeywords.some(keyword => lowerText.includes(keyword));

            if (hasJobKeyword) {
              data.headline = text;
              console.log('[Content Script] Headline found:', text.substring(0, 80));
              break;
            }
          }
        }
      }
    }

    if (!data.headline) {
      console.log('[Content Script] ⚠️ Headline not found');
    }

    // About section - NEW LinkedIn structure (no IDs anymore)
    console.log('[Content Script] Looking for About section...');

    // Find "Acerca de" or "About" title
    const allElements = Array.from(document.querySelectorAll('h2, h3, div'));
    const aboutTitle = allElements.find(el => {
      const text = el.textContent?.trim();
      return text === 'Acerca de' || text === 'About';
    });

    if (aboutTitle) {
      console.log('[Content Script] Found About title');

      // Strategy 1: Look for next sibling
      let sibling = aboutTitle.nextElementSibling;
      let attempts = 0;

      while (sibling && attempts < 5) {
        const text = sibling.textContent?.trim();
        if (text && text.length > 50 && text !== 'Acerca de' && text !== 'About') {
          data.about = text;
          console.log('[Content Script] About content found (next sibling):', text.substring(0, 80));
          break;
        }
        sibling = sibling.nextElementSibling;
        attempts++;
      }

      // Strategy 2: Look in parent's next sibling
      if (!data.about && aboutTitle.parentElement) {
        const parentSibling = aboutTitle.parentElement.nextElementSibling;
        if (parentSibling) {
          const text = parentSibling.textContent?.trim();
          if (text && text.length > 50) {
            data.about = text;
            console.log('[Content Script] About content found (parent sibling):', text.substring(0, 80));
          }
        }
      }

      // Strategy 3: Look in parent's children
      if (!data.about && aboutTitle.parentElement) {
        const parent = aboutTitle.parentElement;
        for (const child of Array.from(parent.children)) {
          if (child !== aboutTitle) {
            const text = child.textContent?.trim();
            if (text && text.length > 50 && !text.startsWith('Acerca de') && !text.startsWith('About')) {
              data.about = text;
              console.log('[Content Script] About content found (parent child):', text.substring(0, 80));
              break;
            }
          }
        }
      }
    } else {
      console.log('[Content Script] ⚠️ About title not found');
    }

    if (!data.about) {
      console.log('[Content Script] ⚠️ About content not found');
    }

    // Experience - Find by section title
    console.log('[Content Script] Looking for Experience section...');

    const experienceTitle = allElements.find(el => {
      const text = el.textContent?.trim();
      return text === 'Experiencia' || text === 'Experience';
    });

    if (experienceTitle) {
      console.log('[Content Script] Found Experience title');

      // Find the container with list items
      let container = experienceTitle.parentElement;
      let searchDepth = 0;

      while (container && searchDepth < 5) {
        const listItems = container.querySelectorAll('ul li, ol li, li');
        if (listItems.length > 0) {
          data.experienceCount = listItems.length;
          console.log('[Content Script] Found', listItems.length, 'experience items');

          if (detailed) {
            Array.from(listItems).forEach((item) => {
              // Try to extract job title, company, duration
              const allText = item.textContent?.trim() || '';

              // For now, just store the raw text
              // TODO: Parse structured data (title, company, dates)
              if (allText.length > 10) {
                data.experiences.push({
                  title: allText.substring(0, 100), // First 100 chars as title
                  company: '',
                  duration: '',
                  description: allText
                });
              }
            });
          }
          break;
        }

        container = container.parentElement;
        searchDepth++;
      }
    } else {
      console.log('[Content Script] ⚠️ Experience title not found');
    }

    // Education - Find by section title
    console.log('[Content Script] Looking for Education section...');

    const educationTitle = allElements.find(el => {
      const text = el.textContent?.trim();
      return text === 'Educación' || text === 'Education' || text === 'Formación';
    });

    if (educationTitle) {
      console.log('[Content Script] Found Education title');

      // Find the container with list items
      let container = educationTitle.parentElement;
      let searchDepth = 0;

      while (container && searchDepth < 5) {
        const listItems = container.querySelectorAll('ul li, ol li, li');
        if (listItems.length > 0) {
          data.educationCount = listItems.length;
          console.log('[Content Script] Found', listItems.length, 'education items');

          if (detailed) {
            Array.from(listItems).forEach((item) => {
              const allText = item.textContent?.trim() || '';

              // For now, just store the raw text
              // TODO: Parse structured data (degree, institution, year)
              if (allText.length > 10) {
                data.education.push({
                  degree: allText.substring(0, 100),
                  institution: '',
                  year: allText
                });
              }
            });
          }
          break;
        }

        container = container.parentElement;
        searchDepth++;
      }
    } else {
      console.log('[Content Script] ⚠️ Education title not found');
    }

    console.log('[Content Script] Profile data extracted:', {
      name: data.name,
      experienceCount: data.experienceCount,
      educationCount: data.educationCount,
      detailedExperiences: data.experiences.length,
      detailedEducation: data.education.length
    });
  } catch (error) {
    console.error('[Content Script] Error extracting profile data:', error);
  }

  return data;
}

// Helper: Show success toast notification
function showSuccessToast(message: string) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 30px;
    background: #0a66c2;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideInFromRight 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutToRight 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Helper: Insert text into LinkedIn composer
function insertTextIntoComposer(text: string) {
  console.log('[Content Script] Inserting text into composer...');

  try {
    // Try to find the editor in Shadow DOM
    const shadowHost = document.querySelector('#interop-outlet');

    if (shadowHost && (shadowHost as any).shadowRoot) {
      const shadowRoot = (shadowHost as any).shadowRoot;
      const editor = shadowRoot.querySelector('.ql-editor, [contenteditable="true"]') as HTMLElement;

      if (editor) {
        // Insert text
        editor.focus();
        editor.textContent = text;

        // Trigger input event so LinkedIn knows content changed
        const inputEvent = new Event('input', { bubbles: true });
        editor.dispatchEvent(inputEvent);

        console.log('[Content Script] Text inserted successfully');
        return true;
      }
    }

    // Fallback: try regular DOM
    const editor = document.querySelector('.ql-editor, [contenteditable="true"]') as HTMLElement;
    if (editor) {
      editor.focus();
      editor.textContent = text;

      const inputEvent = new Event('input', { bubbles: true });
      editor.dispatchEvent(inputEvent);

      console.log('[Content Script] Text inserted successfully (regular DOM)');
      return true;
    }

    console.error('[Content Script] Could not find editor to insert text');
    return false;
  } catch (error) {
    console.error('[Content Script] Error inserting text:', error);
    return false;
  }
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
