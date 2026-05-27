// LinkedIn DOM Diagnostic Script
// Run this in the LinkedIn page console (F12) to diagnose why buttons aren't appearing

console.log('=== LINKEDIN DOM DIAGNOSTIC ===\n');

// 1. Check for Shadow DOM
console.log('1. CHECKING FOR SHADOW DOM:');
const shadowHost = document.querySelector('#interop-outlet[data-testid="interop-shadowdom"]');
console.log('  Shadow host found:', !!shadowHost);
if (shadowHost) {
  console.log('  Has shadowRoot:', !!shadowHost.shadowRoot);
  if (shadowHost.shadowRoot) {
    console.log('  Shadow root mode:', shadowHost.shadowRoot.mode);
    console.log('  Shadow root children count:', shadowHost.shadowRoot.children.length);
  }
}

// 2. Try all post composer selectors in regular DOM
console.log('\n2. TRYING REGULAR DOM SELECTORS:');
const regularSelectors = [
  '.share-creation-state__text-editor',
  '.ql-editor[data-test-ql-editor-contenteditable]',
  '[data-test-ql-editor-contenteditable="true"]',
  '[role="textbox"][aria-label*="contenido"]',
  '[role="textbox"][aria-label*="content"]',
  '.editor-content .ql-editor',
  '[role="button"][aria-label*="Crear publicación"]',
  '[role="button"][aria-label*="Start a post"]',
  '[componentkey][role="button"]',
  '.share-box-feed-entry__trigger',
  '.share-box-feed-entry',
  '.share-creation-state',
  '[data-test-share-box-text-editor]',
  '.ql-editor[data-placeholder]',
  '.artdeco-modal .share-box'
];

regularSelectors.forEach(selector => {
  try {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`  ✓ "${selector}" → ${elements.length} found`);
      elements.forEach((el, idx) => {
        const isVisible = el.offsetWidth > 0 || el.offsetHeight > 0;
        console.log(`    [${idx}] Visible: ${isVisible}, Classes: ${el.className}`);
      });
    }
  } catch (e) {
    console.log(`  ✗ "${selector}" → ERROR: ${e.message}`);
  }
});

// 3. Try Shadow DOM selectors if shadow root exists
if (shadowHost && shadowHost.shadowRoot) {
  console.log('\n3. TRYING SHADOW DOM SELECTORS:');
  const shadowSelectors = [
    '.ql-editor',
    '[contenteditable="true"]',
    '[role="textbox"]',
    '[role="textbox"][aria-label*="contenido"]',
    '[role="textbox"][aria-label*="content"]',
    '.ql-editor.ql-blank'
  ];

  shadowSelectors.forEach(selector => {
    try {
      const elements = shadowHost.shadowRoot.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`  ✓ "${selector}" → ${elements.length} found`);
        elements.forEach((el, idx) => {
          const isVisible = el.offsetWidth > 0 || el.offsetHeight > 0;
          console.log(`    [${idx}] Visible: ${isVisible}, Classes: ${el.className}`);
        });
      }
    } catch (e) {
      console.log(`  ✗ "${selector}" → ERROR: ${e.message}`);
    }
  });
}

// 4. Look for "Start a post" button
console.log('\n4. SEARCHING FOR "START A POST" BUTTON:');
const allButtons = document.querySelectorAll('button, [role="button"]');
console.log(`  Total buttons/button-roles found: ${allButtons.length}`);
const postButtons = Array.from(allButtons).filter(btn => {
  const text = btn.textContent?.toLowerCase() || '';
  const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
  return text.includes('start') || text.includes('crear') || text.includes('publicación') ||
         ariaLabel.includes('start') || ariaLabel.includes('crear') || ariaLabel.includes('post');
});
console.log(`  Buttons related to posting: ${postButtons.length}`);
postButtons.forEach((btn, idx) => {
  console.log(`    [${idx}] Text: "${btn.textContent?.trim()}", Aria-label: "${btn.getAttribute('aria-label')}"`);
});

// 5. Look for contenteditable elements
console.log('\n5. ALL CONTENTEDITABLE ELEMENTS:');
const editables = document.querySelectorAll('[contenteditable="true"]');
console.log(`  Found ${editables.length} contenteditable elements`);
editables.forEach((el, idx) => {
  const isVisible = el.offsetWidth > 0 || el.offsetHeight > 0;
  const role = el.getAttribute('role');
  const ariaLabel = el.getAttribute('aria-label');
  console.log(`    [${idx}] Visible: ${isVisible}, Role: ${role}, Aria-label: "${ariaLabel}", Classes: ${el.className}`);
});

// 6. Check if extension is loaded
console.log('\n6. EXTENSION STATUS:');
const extensionIndicator = document.getElementById('lia-loaded-indicator');
console.log('  Extension toast element:', !!extensionIndicator);
const extensionButtons = document.querySelectorAll('.lia-button');
console.log('  Extension buttons found:', extensionButtons.length);
if (extensionButtons.length > 0) {
  extensionButtons.forEach((btn, idx) => {
    const isVisible = btn.offsetWidth > 0 || btn.offsetHeight > 0;
    console.log(`    [${idx}] Visible: ${isVisible}, Text: "${btn.textContent}", ID: ${btn.id}`);
  });
}

// 7. Check for modal/composer that might be open
console.log('\n7. CHECKING FOR OPEN COMPOSER/MODAL:');
const modals = document.querySelectorAll('[role="dialog"], .artdeco-modal, .share-modal');
console.log(`  Modals found: ${modals.length}`);
modals.forEach((modal, idx) => {
  const isVisible = modal.offsetWidth > 0 || modal.offsetHeight > 0;
  console.log(`    [${idx}] Visible: ${isVisible}, Classes: ${modal.className}`);
  if (isVisible) {
    const editors = modal.querySelectorAll('[contenteditable="true"], .ql-editor');
    console.log(`      Editors inside: ${editors.length}`);
  }
});

console.log('\n=== DIAGNOSTIC COMPLETE ===');
console.log('\nNEXT STEPS:');
console.log('1. If Shadow DOM exists with mode="closed", we need a different approach');
console.log('2. Look for selectors with ✓ that have Visible: true');
console.log('3. Try clicking "Start a post" and run this script again');
console.log('4. Share these results for further diagnosis');
