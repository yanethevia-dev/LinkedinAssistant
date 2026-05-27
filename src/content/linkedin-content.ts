// Content Script - Injected into LinkedIn pages

import { MessageTypes } from '../shared/constants';
import { domObserver, type ObservedElement } from './dom-observer';
import { uiInjector } from './ui-injector';
import { modal } from './modal';
import { aiHelper } from './ai-helper';
import { downloadAsTxt, downloadAsWord, downloadAsPDF } from './cv-exporter';
import { showLanguageSelector } from './language-selector';
import { showWritingStyleSelector, type WritingStyle } from './writing-style-selector';

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

  // Step 1: Show language selector
  showLanguageSelector('post', (language) => {
    console.log('[Content Script] Language selected:', language);

    // Step 2: Show writing style selector
    showWritingStyleSelector(language, (writingStyles) => {
      console.log('[Content Script] Writing styles selected:', writingStyles);

      // Step 3: Open modal to get the topic/idea
      modal.open({
        title: language === 'es' ? '✨ Generar Post con IA' : '✨ Generate Post with AI',
        description: language === 'es'
          ? '¿Sobre qué quieres escribir? Describe tu idea o tema y generaré un post completo para LinkedIn.'
          : 'What do you want to write about? Describe your idea or topic and I\'ll generate a complete LinkedIn post.',
        placeholder: language === 'es'
          ? 'Ejemplo: "Anunciar el lanzamiento de nuestro nuevo producto" o "Compartir aprendizajes sobre trabajo remoto"...'
          : 'Example: "Announce our new product launch" or "Share insights about remote work"...',
        primaryButton: language === 'es' ? 'Generar Post' : 'Generate Post',
        secondaryButton: language === 'es' ? 'Cancelar' : 'Cancel',
        maxLength: 500,
        showCharCount: true,
        onPrimary: async (topic: string) => {
          console.log('[Content Script] Generating post for topic:', topic);

          try {
            modal.close();

            // Show loading toast
            showSuccessToast(language === 'es' ? '⏳ Generando post con IA...' : '⏳ Generating post with AI...');

            // Call AI service to generate post with selected language and styles
            const generatedPost = await aiHelper.generatePost(topic, language, writingStyles);
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
                  alert(`✅ ${language === 'es' ? 'Post generado' : 'Post generated'}:\n\n${generatedPost}\n\n❌ ${language === 'es' ? 'No se pudo insertar automáticamente. Cópialo manualmente.' : 'Could not insert automatically. Copy manually.'}`);
                }
              }, 1000);
            } else {
              alert(`✅ ${language === 'es' ? 'Post generado' : 'Post generated'}:\n\n${generatedPost}\n\n${language === 'es' ? '(Copia manualmente al compositor de LinkedIn)' : '(Copy manually to LinkedIn composer)'}`);
            }
          } catch (error: any) {
            console.error('[Content Script] Error generating post:', error);
            alert(`❌ ${language === 'es' ? 'Error al generar post' : 'Error generating post'}:\n\n${error.message}\n\n${language === 'es' ? 'Verifica tu configuración de IA en Settings.' : 'Check your AI settings in Settings.'}`);
          }
        },
        onSecondary: () => {
          console.log('[Content Script] Generate cancelled');
        },
        onClose: () => {
          console.log('[Content Script] Modal closed');
        }
      });
    });
  });
}

// Handle Generate CV (floating button)
async function handleGenerateCV() {
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

  // Show loading toast
  showSuccessToast('⏳ Preparando perfil...');

  // Auto-scroll to load all sections
  console.log('[Content Script] Auto-scrolling to load experience and education...');
  await autoScrollProfile();

  console.log('[Content Script] Extracting profile data...');

  // Extract profile data with details
  const profileData = extractProfileData(true); // true = detailed extraction

  console.log('[Content Script] Extracted name:', profileData.name);
  console.log('[Content Script] Extracted headline:', profileData.headline);
  console.log('[Content Script] Experience count:', profileData.experienceCount);
  console.log('[Content Script] Education count:', profileData.educationCount);

  if (!profileData.name) {
    alert('No se pudo extraer la información del perfil.\n\nDebug info:\n- URL: ' + window.location.pathname + '\n- Nombre encontrado: ' + (profileData.name || 'NO') + '\n\nPor favor:\n1. Asegúrate de estar en TU perfil\n2. Espera a que la página cargue completamente\n3. Intenta hacer scroll hacia abajo\n4. Abre la consola del navegador (F12) para ver más detalles');
    return;
  }

  // Check if experience data was found
  if (profileData.experienceCount === 0) {
    const retry = confirm('⚠️ No se encontraron experiencias laborales\n\nEsto puede suceder si LinkedIn no ha cargado esas secciones todavía.\n\n¿Qué hacer?\n1. Haz scroll MANUALMENTE hasta el final del perfil\n2. Asegúrate de VER tus trabajos en pantalla\n3. Espera 2-3 segundos\n4. Haz click en "Generar CV" de nuevo\n\n¿Quieres intentarlo ahora?\n\n(Click OK para volver e intentar, o Cancelar para generar CV sin experiencias)');

    if (retry) {
      alert('👇 Haz scroll hacia abajo para ver tus experiencias\n\nCuando las veas en pantalla, espera 2-3 segundos y vuelve a hacer click en "📄 Generar mi CV"');
      return;
    } else {
      // User wants to continue without experiences
      console.log('[Content Script] User chose to continue without experiences');
    }
  }

  // Show language selector first, then CV generation modal
  showLanguageSelector('cv', (language) => {
    console.log('[Content Script] Language selected for CV:', language);
    showCVGenerationModal(profileData, language);
  });
}

// Handle Improve Profile (floating button)
async function handleImproveProfile() {
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

  // Show loading and auto-scroll
  showSuccessToast('⏳ Preparando perfil...');
  await autoScrollProfile();

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

  // Show language selector first
  showLanguageSelector('profile', (language) => {
    console.log('[Content Script] Language selected for profile:', language);

    // Show profile sections selection modal
    showProfileSectionsModal(profileData, language);
  });
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

  // Step 1: Show language selector
  showLanguageSelector('post', (language) => {
    console.log('[Content Script] Language selected for improvement:', language);

    // Step 2: Show writing style selector
    showWritingStyleSelector(language, (writingStyles) => {
      console.log('[Content Script] Writing styles selected for improvement:', writingStyles);

      // Step 3: Open modal with current text
      modal.open({
        title: language === 'es' ? '🚀 Mejorar Post' : '🚀 Improve Post',
        description: language === 'es'
          ? 'Mejoraré tu post para hacerlo más atractivo y profesional. Edita si es necesario:'
          : 'I\'ll enhance your post to make it more engaging and professional. Edit if needed:',
        placeholder: language === 'es' ? 'Tu contenido...' : 'Your post content...',
        initialValue: currentText,
        primaryButton: language === 'es' ? 'Mejorar Post' : 'Improve Post',
        secondaryButton: language === 'es' ? 'Cancelar' : 'Cancel',
        maxLength: 3000,
        showCharCount: true,
        onPrimary: async (text: string) => {
          console.log('[Content Script] Improving post:', text.substring(0, 50) + '...');

          try {
            modal.close();

            // Show loading toast
            showSuccessToast(language === 'es' ? '⏳ Mejorando post con IA...' : '⏳ Improving post with AI...');

            // Call AI service to improve post with language and styles
            const improvedPost = await aiHelper.improvePost(text, language, writingStyles);
            console.log('[Content Script] Post improved successfully');

            // Replace text in composer with improved version
            textEditor.textContent = improvedPost;
            const inputEvent = new Event('input', { bubbles: true });
            textEditor.dispatchEvent(inputEvent);

            // Show success notification
            showSuccessToast(language === 'es' ? '✅ Post mejorado con IA' : '✅ Post improved with AI');
          } catch (error: any) {
            console.error('[Content Script] Error improving post:', error);
            alert(`❌ ${language === 'es' ? 'Error al mejorar post' : 'Error improving post'}:\n\n${error.message}\n\n${language === 'es' ? 'Verifica tu configuración de IA en Settings.' : 'Check your AI settings in Settings.'}`);
          }
        },
        onSecondary: () => {
          console.log('[Content Script] Improve cancelled');
        },
        onClose: () => {
          console.log('[Content Script] Modal closed');
        }
      });
    });
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

    // Experience - NEW approach: Find by date patterns
    console.log('[Content Script] Looking for Experience items...');

    // LinkedIn's new structure: experiences are in DIVs with dates
    // Pattern: DIV with 2-3 children, containing text with years (20XX)
    const mainContent = document.querySelector('main');

    if (mainContent) {
      const allDivs = Array.from(mainContent.querySelectorAll('div'));

      // Filter DIVs that look like experience cards
      const experienceCards = allDivs.filter(div => {
        const text = div.textContent?.trim() || '';
        const childCount = div.children.length;

        // Experience card characteristics:
        // - Has 2-3 children (usually: title+company, dates, maybe description)
        // - Contains date pattern (year in format 20XX)
        // - Length is reasonable (50-500 chars for summary)
        // - Not too nested (direct experience card, not parent container)
        return childCount >= 2 &&
               childCount <= 4 &&
               /20\d{2}/.test(text) &&
               text.length > 30 &&
               text.length < 600;
      });

      // Remove duplicates (parent and child both matching)
      const uniqueExperiences = experienceCards.filter(card => {
        // Keep only if no ancestor in the list
        return !experienceCards.some(other =>
          other !== card && other.contains(card)
        );
      });

      data.experienceCount = uniqueExperiences.length;
      console.log('[Content Script] Found', uniqueExperiences.length, 'experience items');

      if (detailed) {
        uniqueExperiences.forEach((card) => {
          const text = card.textContent?.trim() || '';
          const lines = card.innerText?.split('\n').map(l => l.trim()).filter(l => l);

          if (lines && lines.length >= 2) {
            // First line usually: "TitleCompany" (concatenated)
            // Second line: dates
            const firstLine = lines[0] || '';
            const secondLine = lines[1] || '';

            // Try to parse title and company from first line
            // LinkedIn concatenates them: "TitleCompany"
            let title = firstLine;
            let company = '';
            let duration = secondLine;

            // Strategy 1: Look for company suffixes (Group, Inc, Ltd, S.L., etc.)
            const companySuffixes = [
              'Group', 'Inc', 'Ltd', 'LLC', 'Corp', 'Corporation',
              'S\\.L\\.', 'S\\.A\\.', 'S\\.L', 'S\\.A',
              'GmbH', 'AG', 'Limited', 'Ltda',
              'Technologies', 'Technology', 'Tech',
              'Systems', 'Solutions', 'Services',
              'Consulting', 'Consultancy'
            ];

            const suffixRegex = new RegExp(`^(.+?)((?:${companySuffixes.join('|')})(?:\\s|$).*)`, 'i');
            const suffixMatch = firstLine.match(suffixRegex);

            if (suffixMatch) {
              title = suffixMatch[1].trim();
              company = suffixMatch[2].trim();
            } else {
              // Strategy 2: Look for job title keywords at the start
              const jobTitles = [
                'Senior', 'Junior', 'Lead', 'Chief', 'Head of', 'Director',
                'Manager', 'Engineer', 'Developer', 'Designer', 'Architect',
                'Analyst', 'Consultant', 'Specialist', 'Coordinator',
                'Ingeniero', 'Desarrollador', 'Gerente', 'Director',
                'Especialista', 'Analista', 'Consultor'
              ];

              // Find where job title ends
              let titleEndPos = -1;
              for (const jobTitle of jobTitles) {
                const pos = firstLine.toLowerCase().indexOf(jobTitle.toLowerCase());
                if (pos >= 0) {
                  // Find the end of this job title phrase
                  // Usually ends before next capital letter sequence
                  const afterTitle = firstLine.substring(pos + jobTitle.length);
                  const capitalMatch = afterTitle.match(/^[\s\w-]*?([A-Z][a-z]+[A-Z]|[A-Z]{2,})/);

                  if (capitalMatch && capitalMatch.index !== undefined) {
                    titleEndPos = pos + jobTitle.length + capitalMatch.index;
                    break;
                  }
                }
              }

              if (titleEndPos > 0) {
                title = firstLine.substring(0, titleEndPos).trim();
                company = firstLine.substring(titleEndPos).trim();
              } else {
                // Strategy 3: If can't parse, use first 60% as title, rest as company
                const splitPoint = Math.floor(firstLine.length * 0.6);
                const lastSpace = firstLine.lastIndexOf(' ', splitPoint);

                if (lastSpace > 0) {
                  title = firstLine.substring(0, lastSpace).trim();
                  company = firstLine.substring(lastSpace).trim();
                } else {
                  // Give up, keep everything as title
                  title = firstLine;
                  company = '';
                }
              }
            }

            data.experiences.push({
              title: title || firstLine.substring(0, 100),
              company: company,
              duration: duration,
              description: lines.slice(2).join(' ') || ''
            });
          } else {
            // Fallback: just store the full text
            data.experiences.push({
              title: text.substring(0, 100),
              company: '',
              duration: '',
              description: text
            });
          }
        });

        console.log('[Content Script] Extracted', data.experiences.length, 'detailed experiences');
      }
    } else {
      console.log('[Content Script] ⚠️ Main content not found');
    }

    // Education - Same approach as Experience
    console.log('[Content Script] Looking for Education items...');

    if (mainContent) {
      const allDivs = Array.from(mainContent.querySelectorAll('div'));

      // Filter DIVs that look like education cards
      // Education typically has years (20XX or 19XX) and institution keywords
      const educationKeywords = ['universidad', 'university', 'college', 'instituto',
                                 'escuela', 'school', 'polytechnic', 'académica'];

      const educationCards = allDivs.filter(div => {
        const text = div.textContent?.trim().toLowerCase() || '';
        const childCount = div.children.length;

        // Education card characteristics:
        // - Has 2-3 children
        // - Contains year pattern
        // - Contains education keyword
        // - Reasonable length
        const hasYear = /(?:19|20)\d{2}/.test(text);
        const hasEduKeyword = educationKeywords.some(keyword => text.includes(keyword));

        return childCount >= 2 &&
               childCount <= 4 &&
               hasYear &&
               hasEduKeyword &&
               text.length > 20 &&
               text.length < 500;
      });

      // Remove duplicates
      const uniqueEducation = educationCards.filter(card => {
        return !educationCards.some(other =>
          other !== card && other.contains(card)
        );
      });

      data.educationCount = uniqueEducation.length;
      console.log('[Content Script] Found', uniqueEducation.length, 'education items');

      if (detailed) {
        uniqueEducation.forEach((card) => {
          const text = card.textContent?.trim() || '';
          const lines = card.innerText?.split('\n').map(l => l.trim()).filter(l => l);

          if (lines && lines.length >= 2) {
            // First line: usually institution name
            // Second line: degree or year
            const institution = lines[0] || '';
            const degreeOrYear = lines[1] || '';

            // Try to find year in any line
            const yearMatch = text.match(/(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}|(?:19|20)\d{2}/);
            const year = yearMatch ? yearMatch[0] : '';

            data.education.push({
              degree: degreeOrYear.includes('20') ? '' : degreeOrYear, // If has year, it's not the degree
              institution: institution,
              year: year || degreeOrYear
            });
          } else {
            data.education.push({
              degree: text.substring(0, 100),
              institution: '',
              year: ''
            });
          }
        });

        console.log('[Content Script] Extracted', data.education.length, 'detailed education');
      }
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

// Helper: Show CV generation modal with job posting option
function showCVGenerationModal(profileData: any, language: 'es' | 'en') {
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

  const modalContainer = document.createElement('div');
  modalContainer.style.cssText = `
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
    <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">📄 Generar CV con IA</h2>
    <p style="margin: 8px 0 0; color: #666; font-size: 14px;">La IA optimizará tu CV para hacerlo más profesional y atractivo</p>
  `;

  // Content
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  `;

  // Profile summary
  const summary = document.createElement('div');
  summary.style.cssText = `
    background: #f0f7ff;
    border: 1px solid #c5e1ff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  `;
  summary.innerHTML = `
    <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0a66c2;">📋 Datos Extraídos</h3>
    <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
      <li><strong>Nombre:</strong> ${profileData.name}</li>
      <li><strong>Título:</strong> ${profileData.headline || 'No disponible'}</li>
      <li><strong>Experiencias:</strong> ${profileData.experienceCount} posiciones</li>
      <li><strong>Educación:</strong> ${profileData.educationCount} entradas</li>
    </ul>
  `;
  content.appendChild(summary);

  // Option selector
  const optionSelector = document.createElement('div');
  optionSelector.style.cssText = `
    margin-bottom: 20px;
  `;
  optionSelector.innerHTML = `
    <label style="display: block; font-weight: 600; margin-bottom: 12px; color: #333; font-size: 15px;">
      🎯 Tipo de CV
    </label>
  `;

  const radioContainer = document.createElement('div');
  radioContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  const createRadioOption = (id: string, label: string, description: string, checked: boolean = false) => {
    const option = document.createElement('label');
    option.style.cssText = `
      display: flex;
      align-items: start;
      padding: 14px;
      border: 2px solid ${checked ? '#0a66c2' : '#e0e0e0'};
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: ${checked ? '#f0f7ff' : 'white'};
    `;

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'cvType';
    radio.id = id;
    radio.checked = checked;
    radio.style.cssText = `
      margin-top: 2px;
      margin-right: 12px;
      cursor: pointer;
    `;

    const textContainer = document.createElement('div');
    textContainer.innerHTML = `
      <div style="font-weight: 600; color: #333; margin-bottom: 4px; font-size: 14px;">${label}</div>
      <div style="color: #666; font-size: 13px; line-height: 1.4;">${description}</div>
    `;

    option.appendChild(radio);
    option.appendChild(textContainer);

    // Update styling on change
    radio.onchange = () => {
      document.querySelectorAll('label[data-radio-option]').forEach(opt => {
        const optEl = opt as HTMLElement;
        const radioEl = optEl.querySelector('input[type="radio"]') as HTMLInputElement;
        if (radioEl.checked) {
          optEl.style.border = '2px solid #0a66c2';
          optEl.style.background = '#f0f7ff';
        } else {
          optEl.style.border = '2px solid #e0e0e0';
          optEl.style.background = 'white';
        }
      });

      // Show/hide job posting textarea
      const jobPostingArea = document.getElementById('jobPostingArea');
      if (radio.id === 'cvTargeted' && jobPostingArea) {
        jobPostingArea.style.display = 'block';
      } else if (jobPostingArea) {
        jobPostingArea.style.display = 'none';
      }
    };

    option.setAttribute('data-radio-option', 'true');
    return option;
  };

  const generalOption = createRadioOption(
    'cvGeneral',
    '📄 CV General Optimizado',
    'La IA mejorará tu CV de forma general: formato profesional, resumen impactante, logros destacados',
    true
  );

  const targetedOption = createRadioOption(
    'cvTargeted',
    '🎯 CV Adaptado a Oferta de Empleo',
    'Pega una oferta de empleo y la IA adaptará tu CV específicamente para esa posición'
  );

  radioContainer.appendChild(generalOption);
  radioContainer.appendChild(targetedOption);
  optionSelector.appendChild(radioContainer);
  content.appendChild(optionSelector);

  // Job posting textarea (hidden by default)
  const jobPostingArea = document.createElement('div');
  jobPostingArea.id = 'jobPostingArea';
  jobPostingArea.style.cssText = `
    display: none;
    margin-top: 16px;
  `;
  jobPostingArea.innerHTML = `
    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
      📋 Pega la Oferta de Empleo
    </label>
    <textarea
      id="jobPostingText"
      placeholder="Pega aquí la descripción completa del trabajo, incluyendo:&#10;• Título del puesto&#10;• Requisitos y habilidades&#10;• Responsabilidades&#10;• Experiencia necesaria&#10;&#10;La IA analizará esto para adaptar tu CV..."
      style="
        width: 100%;
        min-height: 200px;
        padding: 12px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-family: inherit;
        font-size: 13px;
        line-height: 1.5;
        resize: vertical;
        box-sizing: border-box;
      "
    ></textarea>
    <p style="margin: 8px 0 0; color: #666; font-size: 12px; font-style: italic;">
      💡 Tip: Incluye toda la descripción del trabajo para mejores resultados
    </p>
  `;
  content.appendChild(jobPostingArea);

  modalContainer.appendChild(header);
  modalContainer.appendChild(content);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 12px;
  `;

  const generateBtn = document.createElement('button');
  generateBtn.textContent = '✨ Generar CV con IA';
  generateBtn.style.cssText = `
    flex: 1;
    padding: 14px 24px;
    background: #0a66c2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  generateBtn.onmouseenter = () => generateBtn.style.background = '#004182';
  generateBtn.onmouseleave = () => generateBtn.style.background = '#0a66c2';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.style.cssText = `
    padding: 14px 24px;
    background: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  cancelBtn.onmouseenter = () => cancelBtn.style.background = '#e0e0e0';
  cancelBtn.onmouseleave = () => cancelBtn.style.background = '#f0f0f0';

  generateBtn.onclick = async () => {
    const cvType = (document.querySelector('input[name="cvType"]:checked') as HTMLInputElement)?.id;
    const jobPosting = (document.getElementById('jobPostingText') as HTMLTextAreaElement)?.value || '';

    if (cvType === 'cvTargeted' && !jobPosting.trim()) {
      alert('⚠️ Por favor, pega la oferta de empleo antes de continuar.');
      return;
    }

    // Close modal and generate
    overlay.remove();
    showSuccessToast('⏳ Generando CV optimizado con IA...');

    try {
      let cvText: string;

      if (cvType === 'cvTargeted' && jobPosting.trim()) {
        // Generate targeted CV
        cvText = await aiHelper.generateTargetedCV(profileData, jobPosting, language);
      } else {
        // Generate optimized general CV
        cvText = await aiHelper.generateOptimizedCV(profileData, language);
      }

      console.log('[Content Script] CV generated successfully');
      showCVWithDownloadOptions(cvText, profileData.name);
      showSuccessToast(language === 'es' ? '✅ CV generado con IA' : '✅ CV generated with AI');
    } catch (error: any) {
      console.error('[Content Script] Error generating CV:', error);
      alert(`❌ ${language === 'es' ? 'Error al generar CV' : 'Error generating CV'}:\n\n${error.message}\n\n${language === 'es' ? 'Verifica tu configuración de IA en Settings.' : 'Check your AI settings in Settings.'}`);
    }
  };

  cancelBtn.onclick = () => {
    overlay.remove();
  };

  footer.appendChild(generateBtn);
  footer.appendChild(cancelBtn);
  modalContainer.appendChild(footer);

  overlay.appendChild(modalContainer);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      cancelBtn.click();
    }
  };

  // Close on Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelBtn.click();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  document.body.appendChild(overlay);
}

// Helper: Show CV with download options
function showCVWithDownloadOptions(cvText: string, userName: string) {
  // Create custom modal with CV preview and download buttons
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

  const modalContainer = document.createElement('div');
  modalContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    animation: slideUp 0.3s ease;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 24px;
    border-bottom: 1px solid #e0e0e0;
  `;
  header.innerHTML = `
    <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">📄 Tu CV Generado</h2>
    <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Revisa, copia o descarga en tu formato preferido</p>
  `;

  // CV Content (scrollable)
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: #f9f9f9;
  `;

  const cvPreview = document.createElement('pre');
  cvPreview.style.cssText = `
    white-space: pre-wrap;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    line-height: 1.6;
    color: #333;
    margin: 0;
    background: white;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  `;
  cvPreview.textContent = cvText;
  content.appendChild(cvPreview);

  // Footer with buttons
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 20px 24px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  // Download buttons row
  const downloadRow = document.createElement('div');
  downloadRow.style.cssText = `
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  `;

  const createButton = (text: string, bgColor: string, icon: string) => {
    const btn = document.createElement('button');
    btn.textContent = `${icon} ${text}`;
    btn.style.cssText = `
      flex: 1;
      min-width: 140px;
      padding: 12px 20px;
      background: ${bgColor};
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    btn.onmouseenter = () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };
    btn.onmouseleave = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = 'none';
    };
    return btn;
  };

  const pdfBtn = createButton('Descargar PDF', '#e74c3c', '📕');
  const wordBtn = createButton('Descargar Word', '#2980b9', '📘');
  const txtBtn = createButton('Descargar TXT', '#27ae60', '📗');

  pdfBtn.onclick = () => {
    downloadAsPDF(cvText, `CV_${userName.replace(/\s+/g, '_')}`);
    showSuccessToast('📕 Abriendo diálogo de impresión...');
  };

  wordBtn.onclick = () => {
    downloadAsWord(cvText, `CV_${userName.replace(/\s+/g, '_')}`);
    showSuccessToast('📘 CV descargado en formato Word');
  };

  txtBtn.onclick = () => {
    downloadAsTxt(cvText, `CV_${userName.replace(/\s+/g, '_')}`);
    showSuccessToast('📗 CV descargado en formato texto');
  };

  downloadRow.appendChild(pdfBtn);
  downloadRow.appendChild(wordBtn);
  downloadRow.appendChild(txtBtn);

  // Action buttons row
  const actionRow = document.createElement('div');
  actionRow.style.cssText = `
    display: flex;
    gap: 12px;
  `;

  const copyBtn = createButton('Copiar al Portapapeles', '#0a66c2', '📋');
  const closeBtn = createButton('Cerrar', '#666', '✕');

  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(cvText);
      showSuccessToast('✅ CV copiado al portapapeles');
    } catch (error) {
      alert('No se pudo copiar automáticamente. Por favor, selecciona y copia manualmente.');
    }
  };

  closeBtn.onclick = () => {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => overlay.remove(), 200);
  };

  actionRow.appendChild(copyBtn);
  actionRow.appendChild(closeBtn);

  footer.appendChild(downloadRow);
  footer.appendChild(actionRow);

  modalContainer.appendChild(header);
  modalContainer.appendChild(content);
  modalContainer.appendChild(footer);
  overlay.appendChild(modalContainer);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeBtn.click();
    }
  };

  // Close on Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeBtn.click();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(overlay);
}

// Show Profile Sections Selection Modal
function showProfileSectionsModal(profileData: any, language: 'es' | 'en') {
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

  const modalContainer = document.createElement('div');
  modalContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
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
    <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">
      ${language === 'es' ? '🔧 Mejorar mi Perfil con IA' : '🔧 Improve My Profile with AI'}
    </h2>
    <p style="margin: 8px 0 0; color: #666; font-size: 14px;">
      ${language === 'es'
        ? 'Selecciona las secciones que quieres mejorar'
        : 'Select the sections you want to improve'}
    </p>
  `;

  // Content
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 24px;
  `;

  // Profile summary
  const summary = document.createElement('div');
  summary.style.cssText = `
    background: #f0f7ff;
    border: 1px solid #c5e1ff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  `;
  summary.innerHTML = `
    <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0a66c2;">
      ${language === 'es' ? '📋 Datos Actuales' : '📋 Current Data'}
    </h3>
    <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
      <li><strong>${language === 'es' ? 'Nombre' : 'Name'}:</strong> ${profileData.name}</li>
      <li><strong>${language === 'es' ? 'Título' : 'Headline'}:</strong> ${profileData.headline || (language === 'es' ? 'No disponible' : 'Not available')}</li>
      ${profileData.about ? `<li><strong>${language === 'es' ? 'Acerca de' : 'About'}:</strong> ${profileData.about.substring(0, 100)}...</li>` : ''}
    </ul>
  `;
  content.appendChild(summary);

  // Checkboxes for sections
  const sectionsContainer = document.createElement('div');
  sectionsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  `;

  const createCheckbox = (id: string, label: string, enabled: boolean = true) => {
    const container = document.createElement('label');
    container.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: ${enabled ? 'pointer' : 'not-allowed'};
      transition: all 0.2s;
      background: ${enabled ? 'white' : '#f5f5f5'};
      opacity: ${enabled ? '1' : '0.6'};
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = enabled;
    checkbox.disabled = !enabled;
    checkbox.style.cssText = `
      width: 18px;
      height: 18px;
      margin-right: 12px;
      cursor: ${enabled ? 'pointer' : 'not-allowed'};
    `;

    if (enabled) {
      checkbox.onchange = () => {
        if (checkbox.checked) {
          container.style.border = '2px solid #0a66c2';
          container.style.background = '#f0f7ff';
        } else {
          container.style.border = '2px solid #e0e0e0';
          container.style.background = 'white';
        }
      };

      container.onmouseenter = () => {
        if (!checkbox.checked) {
          container.style.border = '2px solid #0a66c2';
        }
      };
      container.onmouseleave = () => {
        if (!checkbox.checked) {
          container.style.border = '2px solid #e0e0e0';
        }
      };
    }

    const labelText = document.createElement('span');
    labelText.style.cssText = `
      font-size: 15px;
      font-weight: 500;
      color: ${enabled ? '#333' : '#999'};
    `;
    labelText.textContent = label;

    container.appendChild(checkbox);
    container.appendChild(labelText);
    return container;
  };

  const analysisCheckbox = createCheckbox(
    'improveAnalysis',
    language === 'es' ? '📊 Análisis de Perfil (siempre incluido)' : '📊 Profile Analysis (always included)'
  );
  analysisCheckbox.querySelector('input')!.disabled = true;
  analysisCheckbox.querySelector('input')!.checked = true;
  sectionsContainer.appendChild(analysisCheckbox);

  if (profileData.headline) {
    const headlineCheckbox = createCheckbox(
      'improveHeadline',
      language === 'es' ? '✨ Mejorar Titular / Headline' : '✨ Improve Headline'
    );
    sectionsContainer.appendChild(headlineCheckbox);
  }

  if (profileData.about) {
    const aboutCheckbox = createCheckbox(
      'improveAbout',
      language === 'es' ? '✨ Mejorar Sección "Acerca de" / About' : '✨ Improve "About" Section'
    );
    sectionsContainer.appendChild(aboutCheckbox);
  }

  content.appendChild(sectionsContainer);
  modalContainer.appendChild(header);
  modalContainer.appendChild(content);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 12px;
  `;

  const generateBtn = document.createElement('button');
  generateBtn.textContent = language === 'es' ? '✨ Mejorar con IA' : '✨ Improve with AI';
  generateBtn.style.cssText = `
    flex: 1;
    padding: 14px 24px;
    background: #0a66c2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  generateBtn.onmouseenter = () => generateBtn.style.background = '#004182';
  generateBtn.onmouseleave = () => generateBtn.style.background = '#0a66c2';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = language === 'es' ? 'Cancelar' : 'Cancel';
  cancelBtn.style.cssText = `
    padding: 14px 24px;
    background: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  cancelBtn.onmouseenter = () => cancelBtn.style.background = '#e0e0e0';
  cancelBtn.onmouseleave = () => cancelBtn.style.background = '#f0f0f0';

  generateBtn.onclick = async () => {
    const improveHeadline = (document.getElementById('improveHeadline') as HTMLInputElement)?.checked || false;
    const improveAbout = (document.getElementById('improveAbout') as HTMLInputElement)?.checked || false;

    // Close modal
    overlay.remove();

    // Show loading toast
    showSuccessToast(language === 'es' ? '⏳ Analizando perfil con IA...' : '⏳ Analyzing profile with AI...');

    try {
      // Always generate analysis
      const analysis = await aiHelper.analyzeProfile(profileData, language);
      console.log('[Content Script] Profile analysis complete');

      // Generate improved sections
      let improvedHeadline = '';
      let improvedAboutText = '';

      if (improveHeadline && profileData.headline) {
        showSuccessToast(language === 'es' ? '⏳ Mejorando titular...' : '⏳ Improving headline...');
        improvedHeadline = await aiHelper.improveHeadline(profileData.headline, language);
        console.log('[Content Script] Headline improved');
      }

      if (improveAbout && profileData.about) {
        showSuccessToast(language === 'es' ? '⏳ Mejorando sección "Acerca de"...' : '⏳ Improving "About" section...');
        improvedAboutText = await aiHelper.improveAbout(profileData.about, language, profileData.headline);
        console.log('[Content Script] About section improved');
      }

      // Show results in new modal with sections
      showProfileImprovementResults({
        analysis,
        improvedHeadline,
        improvedAbout: improvedAboutText,
        language
      });

      showSuccessToast(language === 'es' ? '✅ Análisis completado' : '✅ Analysis complete');
    } catch (error: any) {
      console.error('[Content Script] Error improving profile:', error);
      alert(`❌ ${language === 'es' ? 'Error al mejorar perfil' : 'Error improving profile'}:\n\n${error.message}\n\n${language === 'es' ? 'Verifica tu configuración de IA en Settings.' : 'Check your AI settings in Settings.'}`);
    }
  };

  cancelBtn.onclick = () => {
    overlay.remove();
  };

  footer.appendChild(generateBtn);
  footer.appendChild(cancelBtn);
  modalContainer.appendChild(footer);
  overlay.appendChild(modalContainer);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      cancelBtn.click();
    }
  };

  // Close on Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelBtn.click();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  document.body.appendChild(overlay);
}

// Show Profile Improvement Results with Sections
function showProfileImprovementResults(data: {
  analysis: string;
  improvedHeadline?: string;
  improvedAbout?: string;
  language: 'es' | 'en';
}) {
  const { analysis, improvedHeadline, improvedAbout, language } = data;

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

  const modalContainer = document.createElement('div');
  modalContainer.style.cssText = `
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
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
    <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">
      ${language === 'es' ? '✨ Tu Perfil Mejorado con IA' : '✨ Your AI-Improved Profile'}
    </h2>
    <p style="margin: 8px 0 0; color: #666; font-size: 14px;">
      ${language === 'es'
        ? 'Copia las secciones mejoradas y aplícalas manualmente a tu perfil'
        : 'Copy the improved sections and apply them manually to your profile'}
    </p>
  `;

  // Content
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  `;

  // Analysis section
  const analysisSection = document.createElement('div');
  analysisSection.style.cssText = `
    margin-bottom: 24px;
    padding: 16px;
    background: #f0f7ff;
    border: 1px solid #c5e1ff;
    border-radius: 8px;
  `;
  analysisSection.innerHTML = `
    <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #0a66c2;">
      📊 ${language === 'es' ? 'Análisis de Perfil' : 'Profile Analysis'}
    </h3>
    <div style="color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${analysis}</div>
  `;
  content.appendChild(analysisSection);

  // Helper function to create section with copy button
  const createSection = (title: string, text: string, sectionId: string) => {
    const section = document.createElement('div');
    section.style.cssText = `
      margin-bottom: 20px;
      padding: 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
    `;

    const sectionHeader = document.createElement('div');
    sectionHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    `;

    const sectionTitle = document.createElement('h3');
    sectionTitle.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    `;
    sectionTitle.textContent = title;

    const copyBtn = document.createElement('button');
    copyBtn.textContent = language === 'es' ? '📋 Copiar' : '📋 Copy';
    copyBtn.style.cssText = `
      padding: 8px 16px;
      background: #0a66c2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    copyBtn.onmouseenter = () => copyBtn.style.background = '#004182';
    copyBtn.onmouseleave = () => copyBtn.style.background = '#0a66c2';
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = language === 'es' ? '✅ Copiado' : '✅ Copied';
        setTimeout(() => {
          copyBtn.textContent = language === 'es' ? '📋 Copiar' : '📋 Copy';
        }, 2000);
      } catch (error) {
        alert(language === 'es'
          ? 'No se pudo copiar. Selecciona el texto manualmente.'
          : 'Could not copy. Select the text manually.');
      }
    };

    sectionHeader.appendChild(sectionTitle);
    sectionHeader.appendChild(copyBtn);

    const sectionContent = document.createElement('div');
    sectionContent.style.cssText = `
      color: #333;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
    `;
    sectionContent.textContent = text;

    section.appendChild(sectionHeader);
    section.appendChild(sectionContent);
    return section;
  };

  // Add improved sections if available
  if (improvedHeadline) {
    const headlineSection = createSection(
      language === 'es' ? '✨ Titular Mejorado' : '✨ Improved Headline',
      improvedHeadline,
      'headline'
    );
    content.appendChild(headlineSection);
  }

  if (improvedAbout) {
    const aboutSection = createSection(
      language === 'es' ? '✨ Sección "Acerca de" Mejorada' : '✨ Improved "About" Section',
      improvedAbout,
      'about'
    );
    content.appendChild(aboutSection);
  }

  modalContainer.appendChild(header);
  modalContainer.appendChild(content);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 12px;
  `;

  const copyAllBtn = document.createElement('button');
  copyAllBtn.textContent = language === 'es' ? '📋 Copiar Todo' : '📋 Copy All';
  copyAllBtn.style.cssText = `
    flex: 1;
    padding: 14px 24px;
    background: #0a66c2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  copyAllBtn.onmouseenter = () => copyAllBtn.style.background = '#004182';
  copyAllBtn.onmouseleave = () => copyAllBtn.style.background = '#0a66c2';
  copyAllBtn.onclick = async () => {
    let allText = `${language === 'es' ? '📊 ANÁLISIS DE PERFIL' : '📊 PROFILE ANALYSIS'}\n\n${analysis}\n\n`;
    if (improvedHeadline) {
      allText += `━━━━━━━━━━━━━━━━━━━━\n\n${language === 'es' ? '✨ TITULAR MEJORADO' : '✨ IMPROVED HEADLINE'}\n\n${improvedHeadline}\n\n`;
    }
    if (improvedAbout) {
      allText += `━━━━━━━━━━━━━━━━━━━━\n\n${language === 'es' ? '✨ SECCIÓN "ACERCA DE" MEJORADA' : '✨ IMPROVED "ABOUT" SECTION'}\n\n${improvedAbout}\n\n`;
    }

    try {
      await navigator.clipboard.writeText(allText);
      showSuccessToast(language === 'es' ? '✅ Todo copiado' : '✅ All copied');
    } catch (error) {
      alert(language === 'es'
        ? 'No se pudo copiar. Usa los botones individuales.'
        : 'Could not copy. Use individual copy buttons.');
    }
  };

  const closeBtn = document.createElement('button');
  closeBtn.textContent = language === 'es' ? 'Cerrar' : 'Close';
  closeBtn.style.cssText = `
    padding: 14px 24px;
    background: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  `;
  closeBtn.onmouseenter = () => closeBtn.style.background = '#e0e0e0';
  closeBtn.onmouseleave = () => closeBtn.style.background = '#f0f0f0';
  closeBtn.onclick = () => overlay.remove();

  footer.appendChild(copyAllBtn);
  footer.appendChild(closeBtn);
  modalContainer.appendChild(footer);
  overlay.appendChild(modalContainer);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeBtn.click();
    }
  };

  // Close on Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeBtn.click();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  document.body.appendChild(overlay);
}

// Helper: Auto-scroll profile to load lazy-loaded sections
async function autoScrollProfile(): Promise<void> {
  return new Promise((resolve) => {
    console.log('[Content Script] Starting auto-scroll...');

    const scrollStep = 300; // pixels per step
    const scrollDelay = 100; // ms between steps
    let currentPosition = 0;
    const maxScroll = document.documentElement.scrollHeight;

    const scrollInterval = setInterval(() => {
      currentPosition += scrollStep;
      window.scrollTo({ top: currentPosition, behavior: 'smooth' });

      // Check if reached bottom
      if (currentPosition >= maxScroll - window.innerHeight) {
        clearInterval(scrollInterval);

        // Wait a bit at the bottom for content to load
        setTimeout(() => {
          console.log('[Content Script] Auto-scroll complete');
          // Scroll back to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => resolve(), 500);
        }, 1500);
      }
    }, scrollDelay);
  });
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
