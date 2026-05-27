// Find profile sections (headline, about, experience, education)
console.log('=== FINDING PROFILE SECTIONS ===');

const main = document.querySelector('main');
if (!main) {
  console.error('❌ No <main> element found!');
} else {
  console.log('✓ Found <main> element');
  console.log('Children count:', main.children.length);

  // 1. Find headline (text after name)
  console.log('\n1. FINDING HEADLINE (text after name):');

  const nameH2 = Array.from(document.querySelectorAll('h2')).find(h2 =>
    h2.textContent?.includes('Yanet') || h2.textContent?.includes('Hevia')
  );

  if (nameH2) {
    console.log('✓ Found name H2:', nameH2.textContent?.trim());
    console.log('Parent:', nameH2.parentElement?.tagName, nameH2.parentElement?.className.substring(0, 50));

    // Check next siblings
    console.log('\nNext siblings after name H2:');
    let sibling = nameH2.nextElementSibling;
    let count = 0;
    while (sibling && count < 5) {
      const text = sibling.textContent?.trim();
      if (text && text.length > 10 && text.length < 300 && text !== nameH2.textContent?.trim()) {
        console.log(`  Sibling ${count + 1}: <${sibling.tagName}> class="${sibling.className.substring(0, 50)}"`);
        console.log(`    Text: "${text.substring(0, 100)}"`);
      }
      sibling = sibling.nextElementSibling;
      count++;
    }

    // Check children of parent
    console.log('\nSiblings in parent container:');
    const parent = nameH2.parentElement;
    if (parent) {
      Array.from(parent.children).forEach((child, idx) => {
        if (child !== nameH2 && child.textContent && child.textContent.length > 10) {
          console.log(`  Child ${idx}: <${child.tagName}> class="${child.className.substring(0, 50)}"`);
          console.log(`    Text: "${child.textContent.trim().substring(0, 100)}"`);
        }
      });
    }
  } else {
    console.log('❌ Name H2 not found');
  }

  // 2. Search for section IDs
  console.log('\n2. SEARCHING FOR SECTION IDS:');

  const sectionIds = ['about', 'experience', 'education', 'skills', 'certifications'];
  sectionIds.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      console.log(`✓ Found #${id}`);
      console.log(`  Tag: <${elem.tagName}> class="${elem.className.substring(0, 50)}"`);
      console.log(`  Text (first 100): "${elem.textContent?.trim().substring(0, 100)}"`);
      console.log(`  Parent: <${elem.parentElement?.tagName}>`);
    } else {
      console.log(`✗ #${id} not found`);
    }
  });

  // 3. Search by text content
  console.log('\n3. SEARCHING BY SECTION TITLES:');

  const sectionTitles = {
    'about': ['Acerca de', 'About', 'Información'],
    'experience': ['Experiencia', 'Experience'],
    'education': ['Educación', 'Education', 'Formación']
  };

  Object.entries(sectionTitles).forEach(([section, titles]) => {
    console.log(`\nLooking for "${section}" section with titles:`, titles);

    titles.forEach(title => {
      const elements = Array.from(document.querySelectorAll('h2, h3, div, span'));
      const found = elements.filter(el => {
        const text = el.textContent?.trim();
        return text === title || text?.toLowerCase() === title.toLowerCase();
      });

      if (found.length > 0) {
        console.log(`  ✓ Found "${title}" in ${found.length} elements:`);
        found.slice(0, 3).forEach((el, idx) => {
          console.log(`    ${idx + 1}. <${el.tagName}> class="${el.className.substring(0, 50)}"`);
          console.log(`       Parent: <${el.parentElement?.tagName}> id="${el.parentElement?.id}"`);

          // Try to get content after this title
          const parent = el.parentElement;
          if (parent) {
            const nextDiv = parent.querySelector('div[class*="show-more"], div[class*="text"], div > span');
            if (nextDiv) {
              console.log(`       Content (first 100): "${nextDiv.textContent?.trim().substring(0, 100)}"`);
            }
          }
        });
      }
    });
  });

  // 4. Look for list items (experience/education entries)
  console.log('\n4. SEARCHING FOR LIST ITEMS (experiences/education):');

  const listSelectors = [
    'ul li',
    'ol li',
    '[role="list"] > *',
    'li[class*="list"]',
    'div[class*="list-item"]'
  ];

  listSelectors.forEach(selector => {
    const items = main.querySelectorAll(selector);
    if (items.length > 0) {
      console.log(`✓ Found ${items.length} items with selector: ${selector}`);

      // Show first 2
      Array.from(items).slice(0, 2).forEach((item, idx) => {
        const text = item.textContent?.trim().substring(0, 150);
        console.log(`  Item ${idx + 1}: "${text}"`);
      });
    }
  });

  // 5. Dump main structure
  console.log('\n5. MAIN STRUCTURE (first level children):');
  Array.from(main.children).forEach((child, idx) => {
    console.log(`Child ${idx + 1}: <${child.tagName}> class="${child.className.substring(0, 50)}" id="${child.id}"`);
    console.log(`  Text length: ${child.textContent?.length || 0}`);
    console.log(`  Direct children: ${child.children.length}`);

    // If this child has few children, show them too
    if (child.children.length > 0 && child.children.length < 5) {
      Array.from(child.children).forEach((grandchild, gidx) => {
        console.log(`    ${gidx + 1}. <${grandchild.tagName}> class="${grandchild.className.substring(0, 40)}"`);
      });
    }
  });
}

console.log('\n=== INSTRUCTIONS ===');
console.log('Look at sections 1-3 to find where the headline, about, experience, and education are located.');
console.log('Copy all the output above and share it.');
console.log('\n=== END ===');
