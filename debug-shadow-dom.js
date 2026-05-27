// Debug script for LinkedIn Shadow DOM detection
// Paste this in browser console while on your LinkedIn profile page

console.log('=== LINKEDIN SHADOW DOM DETECTION ===');

// 1. Find all Shadow DOM hosts
console.log('\n1. SHADOW DOM HOSTS:');
const allElements = document.querySelectorAll('*');
const shadowHosts = [];

allElements.forEach(el => {
  if (el.shadowRoot) {
    shadowHosts.push({
      element: el,
      tagName: el.tagName,
      id: el.id,
      classes: el.className
    });
  }
});

console.log(`Found ${shadowHosts.length} Shadow DOM hosts:`);
shadowHosts.forEach((host, idx) => {
  console.log(`  ${idx + 1}. <${host.tagName}> id="${host.id}" class="${host.classes}"`);
});

// 2. Search for profile data in Shadow DOM
console.log('\n2. SEARCHING IN SHADOW DOM:');

function searchInShadowDOM(root, depth = 0) {
  const indent = '  '.repeat(depth);
  const results = {
    h1s: [],
    ids: [],
    textContent: []
  };

  // Get all elements in this shadow root
  const elements = root.querySelectorAll('*');

  // Find H1s
  const h1s = root.querySelectorAll('h1');
  if (h1s.length > 0) {
    console.log(`${indent}Found ${h1s.length} H1 elements in this shadow root:`);
    h1s.forEach((h1, idx) => {
      const text = h1.textContent?.trim();
      console.log(`${indent}  H1 #${idx}: "${text?.substring(0, 80)}" | class: "${h1.className}"`);
      results.h1s.push(text);
    });
  }

  // Find elements with IDs
  const elementsWithIds = root.querySelectorAll('[id]');
  const interestingIds = ['about', 'experience', 'education', 'skills', 'profile'];
  elementsWithIds.forEach(el => {
    interestingIds.forEach(keyword => {
      if (el.id.toLowerCase().includes(keyword)) {
        console.log(`${indent}Found element with ID: ${el.id}`);
        results.ids.push(el.id);
      }
    });
  });

  // Recursively search nested shadow DOMs
  elements.forEach(el => {
    if (el.shadowRoot) {
      console.log(`${indent}Found nested shadow root in <${el.tagName}>`);
      const nestedResults = searchInShadowDOM(el.shadowRoot, depth + 1);
      results.h1s.push(...nestedResults.h1s);
      results.ids.push(...nestedResults.ids);
    }
  });

  return results;
}

const allResults = {
  h1s: [],
  ids: []
};

shadowHosts.forEach((host, idx) => {
  console.log(`\nSearching in Shadow Host #${idx + 1}: <${host.tagName}> id="${host.id}"`);
  const results = searchInShadowDOM(host.element.shadowRoot);
  allResults.h1s.push(...results.h1s);
  allResults.ids.push(...results.ids);
});

// 3. Summary
console.log('\n3. SUMMARY:');
console.log(`Total H1s found in Shadow DOM: ${allResults.h1s.length}`);
if (allResults.h1s.length > 0) {
  console.log('H1 texts:');
  allResults.h1s.forEach((text, idx) => {
    console.log(`  ${idx + 1}. "${text?.substring(0, 100)}"`);
  });
}

console.log(`\nTotal interesting IDs found: ${allResults.ids.length}`);
if (allResults.ids.length > 0) {
  console.log('IDs:', allResults.ids);
}

// 4. Check specific known Shadow DOM hosts
console.log('\n4. CHECKING KNOWN HOSTS:');

const knownHosts = [
  '#interop-outlet',
  'artdeco-gen-outlet',
  '[data-test-artdeco-gen-outlet]'
];

knownHosts.forEach(selector => {
  const host = document.querySelector(selector);
  if (host) {
    console.log(`\n✓ Found host: ${selector}`);
    console.log(`  Has shadowRoot: ${!!host.shadowRoot}`);

    if (host.shadowRoot) {
      const shadowH1s = host.shadowRoot.querySelectorAll('h1');
      console.log(`  H1 count in shadow: ${shadowH1s.length}`);

      shadowH1s.forEach((h1, idx) => {
        console.log(`    H1 #${idx}: "${h1.textContent?.trim().substring(0, 80)}"`);
      });

      // Check for main content container
      const mainSelectors = [
        'main',
        '[role="main"]',
        '.scaffold-layout__main',
        'div[class*="profile"]'
      ];

      mainSelectors.forEach(sel => {
        const elem = host.shadowRoot.querySelector(sel);
        if (elem) {
          console.log(`  ✓ Found ${sel}`);
        }
      });
    }
  } else {
    console.log(`✗ Not found: ${selector}`);
  }
});

// 5. Alternative: Check if content is in regular DOM but hidden
console.log('\n5. CHECKING REGULAR DOM (HIDDEN CONTENT):');
const allH1sRegular = document.querySelectorAll('h1');
console.log(`H1 elements in regular DOM: ${allH1sRegular.length}`);
if (allH1sRegular.length > 0) {
  console.log('Note: Found H1s in regular DOM (not shadow), but earlier scan said 0');
  console.log('This might mean the DOM changed since last check.');
  allH1sRegular.forEach((h1, idx) => {
    console.log(`  H1 #${idx}: "${h1.textContent?.trim().substring(0, 80)}" | visible: ${h1.offsetHeight > 0}`);
  });
}

// 6. Extract profile data if found
console.log('\n6. ATTEMPTING DATA EXTRACTION:');

function extractFromShadowDOM() {
  const data = {
    name: '',
    headline: '',
    found: false
  };

  shadowHosts.forEach(host => {
    if (host.element.shadowRoot) {
      // Try to find name
      const h1s = host.element.shadowRoot.querySelectorAll('h1');
      h1s.forEach(h1 => {
        const text = h1.textContent?.trim();
        if (text && text.length > 3 && text.length < 100) {
          if (!data.name && text.split(' ').length >= 2) {
            data.name = text;
            data.found = true;
            console.log(`✓ Extracted name: "${text}"`);
          }
        }
      });

      // Try to find headline (usually a div after the h1)
      if (data.name) {
        const divs = host.element.shadowRoot.querySelectorAll('div');
        divs.forEach(div => {
          const text = div.textContent?.trim();
          if (text && text.length > 10 && text.length < 200 && !data.headline) {
            // Heuristic: headline usually comes after name and is descriptive
            if (!text.includes(data.name)) {
              data.headline = text;
              console.log(`✓ Possible headline: "${text.substring(0, 100)}"`);
            }
          }
        });
      }
    }
  });

  return data;
}

const extracted = extractFromShadowDOM();

console.log('\n=== EXTRACTION RESULT ===');
if (extracted.found) {
  console.log('✅ SUCCESS!');
  console.log('Name:', extracted.name);
  console.log('Headline:', extracted.headline || 'Not found');
  console.log('\nThe extension needs to be updated to search in Shadow DOM.');
} else {
  console.log('❌ FAILED');
  console.log('Could not extract profile data from Shadow DOM.');
  console.log('\nPossible reasons:');
  console.log('1. LinkedIn is using a completely new structure');
  console.log('2. Content has not loaded yet (try scrolling down)');
  console.log('3. Need to inspect Shadow DOM manually');
}

console.log('\n=== END DEBUG ===');
