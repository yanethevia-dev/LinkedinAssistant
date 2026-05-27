// Extract headline and About section
console.log('=== EXTRACTING HEADLINE AND ABOUT ===');

// 1. Find headline - look in the parent of the name H2
console.log('\n1. FINDING HEADLINE:');

const nameH2 = Array.from(document.querySelectorAll('h2')).find(h2 =>
  h2.textContent?.includes('Yanet')
);

if (nameH2) {
  console.log('✓ Found name H2');

  // The headline is usually in the same container, look at all text in parent
  const parent = nameH2.parentElement;
  console.log('Parent element:', parent?.tagName, parent?.className.substring(0, 50));

  // Get all text-bearing children of parent
  const allTextInParent = [];
  const collectText = (element, depth = 0) => {
    if (depth > 3) return; // Don't go too deep

    Array.from(element.children).forEach(child => {
      const text = child.textContent?.trim();
      const directText = Array.from(child.childNodes)
        .filter(node => node.nodeType === 3) // Text nodes
        .map(node => node.textContent?.trim())
        .filter(t => t)
        .join(' ');

      if (directText && directText.length > 5 && directText !== nameH2.textContent?.trim()) {
        allTextInParent.push({
          element: child.tagName,
          class: child.className.substring(0, 40),
          text: directText.substring(0, 150)
        });
      }

      // Check children of this child
      if (child.children.length > 0 && child.children.length < 10) {
        Array.from(child.children).forEach(grandchild => {
          const gText = grandchild.textContent?.trim();
          if (gText && gText.length > 10 && gText.length < 300 &&
              gText !== nameH2.textContent?.trim() &&
              !gText.includes('Yanet Hevia Quintana')) {
            allTextInParent.push({
              element: grandchild.tagName,
              class: grandchild.className.substring(0, 40),
              text: gText.substring(0, 150)
            });
          }
        });
      }
    });
  };

  if (parent) {
    collectText(parent);
  }

  console.log(`Found ${allTextInParent.length} text elements near name:`);
  allTextInParent.slice(0, 10).forEach((item, idx) => {
    console.log(`  ${idx + 1}. <${item.element}> "${item.text}"`);
  });

  // The headline is probably the first meaningful text after the name
  const possibleHeadline = allTextInParent.find(item =>
    item.text.length > 15 && item.text.length < 300
  );

  if (possibleHeadline) {
    console.log('\n✓ POSSIBLE HEADLINE:', possibleHeadline.text);
  }
}

// 2. Find About section content
console.log('\n\n2. FINDING ABOUT SECTION:');

// Find "Acerca de" title
const aboutTitles = Array.from(document.querySelectorAll('h2, h3, div')).filter(el =>
  el.textContent?.trim() === 'Acerca de' || el.textContent?.trim() === 'About'
);

console.log(`Found ${aboutTitles.length} "Acerca de" titles`);

aboutTitles.forEach((title, idx) => {
  console.log(`\nTitle ${idx + 1}:`);
  console.log('  Element:', title.tagName, title.className.substring(0, 50));
  console.log('  Parent:', title.parentElement?.tagName, title.parentElement?.className.substring(0, 50));

  // Look for content after this title
  // Try multiple strategies

  // Strategy 1: Next sibling
  let content = null;
  let sibling = title.nextElementSibling;
  let siblingCount = 0;
  while (sibling && siblingCount < 5) {
    const text = sibling.textContent?.trim();
    if (text && text.length > 50 && text !== 'Acerca de') {
      content = text;
      console.log('  ✓ Found content in next sibling:', text.substring(0, 100));
      break;
    }
    sibling = sibling.nextElementSibling;
    siblingCount++;
  }

  // Strategy 2: Look in parent's children
  if (!content && title.parentElement) {
    const parent = title.parentElement;
    Array.from(parent.children).forEach(child => {
      if (child !== title) {
        const text = child.textContent?.trim();
        if (text && text.length > 50 && !text.startsWith('Acerca de')) {
          content = text;
          console.log('  ✓ Found content in parent child:', text.substring(0, 100));
        }
      }
    });
  }

  // Strategy 3: Look in parent's next sibling
  if (!content && title.parentElement) {
    const parentSibling = title.parentElement.nextElementSibling;
    if (parentSibling) {
      const text = parentSibling.textContent?.trim();
      if (text && text.length > 50) {
        content = text;
        console.log('  ✓ Found content in parent next sibling:', text.substring(0, 100));
      }
    }
  }

  if (!content) {
    console.log('  ✗ No content found for this title');

    // Show what's around it
    console.log('  Debug - siblings:');
    let debugSibling = title.nextElementSibling;
    let debugCount = 0;
    while (debugSibling && debugCount < 3) {
      console.log(`    ${debugCount + 1}. <${debugSibling.tagName}> text length: ${debugSibling.textContent?.length || 0}`);
      debugSibling = debugSibling.nextElementSibling;
      debugCount++;
    }
  }
});

// 3. Alternative: Find any large text block that looks like "About"
console.log('\n\n3. FINDING LARGE TEXT BLOCKS (possible About content):');

const allDivs = Array.from(document.querySelectorAll('div, span, p'));
const largeTextBlocks = allDivs.filter(div => {
  const text = div.textContent?.trim();
  // Looking for text that:
  // - Is long (100+ chars)
  // - Has no or few children (it's actual content, not container)
  // - Doesn't contain the name
  return text &&
         text.length > 100 &&
         text.length < 5000 &&
         div.children.length < 5 &&
         !text.includes('Yanet Hevia Quintana');
});

console.log(`Found ${largeTextBlocks.length} large text blocks`);
largeTextBlocks.slice(0, 5).forEach((block, idx) => {
  const text = block.textContent?.trim();
  console.log(`\nBlock ${idx + 1}:`);
  console.log('  Element:', block.tagName, block.className.substring(0, 50));
  console.log('  Text length:', text?.length);
  console.log('  First 200 chars:', text?.substring(0, 200));
});

console.log('\n=== END ===');
console.log('Copy all output above and share it.');
