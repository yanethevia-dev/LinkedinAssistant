// Deep Shadow DOM structure inspector
// Paste this in browser console on your LinkedIn profile page

console.log('=== DEEP SHADOW DOM STRUCTURE ===');

const shadowHost = document.querySelector('#interop-outlet');

if (!shadowHost) {
  console.error('❌ #interop-outlet not found!');
} else if (!shadowHost.shadowRoot) {
  console.error('❌ #interop-outlet has no shadowRoot!');
} else {
  console.log('✓ Found #interop-outlet with shadowRoot');

  const shadowRoot = shadowHost.shadowRoot;

  // 1. Count all elements
  console.log('\n1. ELEMENT COUNT:');
  const allElements = shadowRoot.querySelectorAll('*');
  console.log(`Total elements in shadow: ${allElements.length}`);

  if (allElements.length === 0) {
    console.error('❌ Shadow DOM is EMPTY!');
    console.log('\nPossible reasons:');
    console.log('1. Content has not loaded yet');
    console.log('2. LinkedIn is loading content dynamically');
    console.log('3. Try scrolling down to trigger loading');
    console.log('\nRECOMMENDATION: Wait 3-5 seconds and run this script again');
  } else {
    console.log(`✓ Found ${allElements.length} elements`);

    // 2. Show top-level structure
    console.log('\n2. TOP-LEVEL STRUCTURE:');
    const topLevel = shadowRoot.children;
    console.log(`Direct children: ${topLevel.length}`);

    for (let i = 0; i < Math.min(topLevel.length, 10); i++) {
      const child = topLevel[i];
      console.log(`  ${i + 1}. <${child.tagName}> id="${child.id}" class="${child.className.substring(0, 50)}"`);
    }

    // 3. Find all unique tag names
    console.log('\n3. UNIQUE TAG NAMES:');
    const tagNames = new Set();
    allElements.forEach(el => tagNames.add(el.tagName));
    console.log(`Found ${tagNames.size} unique tags:`, Array.from(tagNames).sort().join(', '));

    // 4. Find text-bearing elements
    console.log('\n4. TEXT-BEARING ELEMENTS (first 20):');
    let textCount = 0;
    allElements.forEach((el, idx) => {
      if (textCount >= 20) return;

      const text = el.textContent?.trim();
      const hasOwnText = text && el.children.length === 0; // Has text and no children

      if (hasOwnText && text.length > 3 && text.length < 200) {
        console.log(`  ${textCount + 1}. <${el.tagName}> class="${el.className.substring(0, 40)}"`);
        console.log(`     Text: "${text.substring(0, 100)}"`);
        textCount++;
      }
    });

    // 5. Search for specific patterns
    console.log('\n5. SEARCHING FOR SPECIFIC PATTERNS:');

    // Profile name patterns
    const namePatterns = [
      { selector: 'h1', description: 'H1 tags' },
      { selector: 'h2', description: 'H2 tags' },
      { selector: '[class*="profile"]', description: 'Profile classes' },
      { selector: '[class*="name"]', description: 'Name classes' },
      { selector: '[class*="heading"]', description: 'Heading classes' },
      { selector: '[data-test*="profile"]', description: 'Profile test attributes' }
    ];

    namePatterns.forEach(pattern => {
      const elements = shadowRoot.querySelectorAll(pattern.selector);
      console.log(`  ${pattern.description}: ${elements.length} found`);

      if (elements.length > 0 && elements.length <= 5) {
        elements.forEach((el, idx) => {
          const text = el.textContent?.trim().substring(0, 80);
          console.log(`    ${idx + 1}. "${text}" | tag: <${el.tagName}> | class: "${el.className.substring(0, 40)}"`);
        });
      }
    });

    // 6. Search for section IDs or anchors
    console.log('\n6. SEARCHING FOR SECTIONS:');
    const sectionKeywords = ['about', 'experience', 'education', 'skills', 'activity'];

    sectionKeywords.forEach(keyword => {
      // Search in IDs
      const byId = shadowRoot.querySelectorAll(`[id*="${keyword}"]`);
      if (byId.length > 0) {
        console.log(`  ✓ Found ${byId.length} elements with id containing "${keyword}"`);
        byId.forEach((el, idx) => {
          if (idx < 3) {
            console.log(`    ${idx + 1}. id="${el.id}" tag=<${el.tagName}>`);
          }
        });
      }

      // Search in href (for section links)
      const byHref = shadowRoot.querySelectorAll(`[href*="${keyword}"]`);
      if (byHref.length > 0) {
        console.log(`  ✓ Found ${byHref.length} links to "${keyword}" section`);
      }
    });

    // 7. Get the actual HTML structure (first 500 chars)
    console.log('\n7. HTML STRUCTURE SAMPLE:');
    const innerHTML = shadowRoot.innerHTML;
    if (innerHTML) {
      console.log('First 1000 characters of shadow DOM HTML:');
      console.log(innerHTML.substring(0, 1000));
      console.log(`\n... (total length: ${innerHTML.length} chars)`);
    }

    // 8. Try to find main container
    console.log('\n8. MAIN CONTAINER SEARCH:');
    const mainSelectors = [
      'main',
      '[role="main"]',
      '.scaffold-layout__main',
      '[class*="scaffold"]',
      '[class*="container"]',
      'div[class*="profile"]'
    ];

    mainSelectors.forEach(selector => {
      const elem = shadowRoot.querySelector(selector);
      if (elem) {
        console.log(`  ✓ Found: ${selector}`);
        console.log(`    Children: ${elem.children.length}`);
        console.log(`    Classes: ${elem.className}`);

        // Show first few children
        if (elem.children.length > 0) {
          console.log(`    First 3 children:`);
          for (let i = 0; i < Math.min(3, elem.children.length); i++) {
            const child = elem.children[i];
            console.log(`      ${i + 1}. <${child.tagName}> class="${child.className.substring(0, 50)}"`);
          }
        }
      }
    });
  }
}

// 9. Check if we need to wait for content
console.log('\n9. LOADING STATE CHECK:');
const loadingIndicators = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
console.log(`Loading indicators found: ${loadingIndicators.length}`);

if (loadingIndicators.length > 0) {
  console.log('⏳ Page is still loading. Wait a few seconds and run this script again.');
}

console.log('\n=== INSTRUCTIONS ===');
console.log('If you see "Shadow DOM is EMPTY" or very few elements:');
console.log('1. Wait 5 seconds');
console.log('2. Scroll down on the page');
console.log('3. Run this script again');
console.log('\nIf you see many elements but no profile data:');
console.log('4. Look at the HTML STRUCTURE SAMPLE section above');
console.log('5. Copy that entire output');
console.log('6. Share it so we can find the correct selectors');

console.log('\n=== END DEBUG ===');
