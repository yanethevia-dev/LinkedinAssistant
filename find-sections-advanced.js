// Advanced section finder - includes elements with children
console.log('=== ADVANCED SECTION SEARCH ===');

// 1. Get ALL elements and their text (including those with children)
const allElements = Array.from(document.querySelectorAll('h2, h3, div, section, span'));

// Keywords to search for
const keywords = {
  experience: ['experiencia', 'experience', 'trabajo', 'work'],
  education: ['educación', 'education', 'formación', 'estudios'],
  skills: ['habilidad', 'skill', 'competencia'],
  about: ['acerca de', 'about']
};

console.log('\n1. SEARCHING BY KEYWORDS IN TEXT CONTENT:');

Object.entries(keywords).forEach(([section, words]) => {
  console.log(`\n--- ${section.toUpperCase()} ---`);

  words.forEach(keyword => {
    const found = allElements.filter(el => {
      const text = el.textContent?.trim().toLowerCase() || '';
      const ownText = el.innerText?.trim().toLowerCase() || '';
      return text.includes(keyword) || ownText.includes(keyword);
    });

    if (found.length > 0) {
      console.log(`\n  Keyword "${keyword}" found in ${found.length} elements:`);

      // Show first 3
      found.slice(0, 3).forEach((el, idx) => {
        const text = el.textContent?.trim();
        console.log(`    ${idx + 1}. <${el.tagName}> children: ${el.children.length}`);
        console.log(`       Text (first 100): "${text?.substring(0, 100)}"`);
        console.log(`       Class: "${el.className.substring(0, 50)}"`);

        // If it has children, check if any child has the keyword alone
        if (el.children.length > 0) {
          Array.from(el.children).forEach((child, cidx) => {
            const childText = child.textContent?.trim().toLowerCase();
            if (childText === keyword || childText?.includes(keyword)) {
              console.log(`         ↳ Child ${cidx + 1}: <${child.tagName}> "${child.textContent?.trim()}"`);
            }
          });
        }
      });
    }
  });
});

// 2. Look for sections by structure
console.log('\n\n2. LOOKING FOR SECTION STRUCTURE:');

// Find elements that look like section headers (have siblings with lists)
const potentialHeaders = allElements.filter(el => {
  const text = el.textContent?.trim() || '';

  // Section headers are usually:
  // - Short-ish text (but allow up to 200 for localized versions)
  // - Have siblings or parent siblings with list items
  if (text.length < 3 || text.length > 200) return false;

  // Check if parent or nearby elements have list items
  const parent = el.parentElement;
  if (!parent) return false;

  // Check current element and nearby siblings for lists
  const hasNearbyList =
    parent.querySelector('ul, ol') ||
    el.nextElementSibling?.querySelector('ul, ol') ||
    el.querySelector('ul, ol');

  return hasNearbyList;
});

console.log(`Found ${potentialHeaders.length} elements near lists:`);
potentialHeaders.slice(0, 10).forEach((el, idx) => {
  const text = el.textContent?.trim();
  console.log(`${idx + 1}. <${el.tagName}> "${text?.substring(0, 80)}"`);
});

// 3. Get ALL text content from main and look for section patterns
console.log('\n\n3. ALL TEXT IN MAIN (looking for section patterns):');

const main = document.querySelector('main');
if (main) {
  const mainText = main.innerText || main.textContent;

  // Split by newlines and look for standalone words that might be section titles
  const lines = mainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  console.log('Lines that might be section titles (short, common keywords):');
  const sectionKeywords = ['experiencia', 'experience', 'educación', 'education', 'formación',
                          'habilidades', 'skills', 'acerca', 'about', 'trabajo', 'estudios'];

  const possibleSections = lines.filter(line => {
    const lower = line.toLowerCase();
    return sectionKeywords.some(k => lower.includes(k)) && line.length < 100;
  });

  const unique = [...new Set(possibleSections)];
  unique.slice(0, 20).forEach((line, idx) => {
    console.log(`  ${idx + 1}. "${line}"`);
  });
}

// 4. Check if using aria-labels or data attributes
console.log('\n\n4. CHECKING ARIA-LABELS AND DATA ATTRIBUTES:');

const elementsWithAria = document.querySelectorAll('[aria-label*="xperience"], [aria-label*="ducation"], [data-section]');
console.log(`Elements with aria-label or data-section: ${elementsWithAria.length}`);

elementsWithAria.forEach((el, idx) => {
  if (idx < 5) {
    console.log(`  ${idx + 1}. <${el.tagName}> aria-label="${el.getAttribute('aria-label')}" data-section="${el.getAttribute('data-section')}"`);
  }
});

console.log('\n=== INSTRUCTIONS ===');
console.log('Look at section 3 for the actual section titles LinkedIn uses.');
console.log('They might be in a different language or format than expected.');
console.log('\n=== END ===');
