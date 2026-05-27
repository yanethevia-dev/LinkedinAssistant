// Check if profile data is in REGULAR DOM, not Shadow DOM
console.log('=== CHECKING REGULAR DOM ===');

// 1. Look for your name anywhere
console.log('\n1. SEARCHING FOR NAME IN REGULAR DOM:');

const bodyText = document.body.textContent;
const hasYourName = bodyText.includes('Yanet') || bodyText.includes('Hevia');
console.log('Body contains "Yanet" or "Hevia":', hasYourName);

// 2. Look for all H1s in regular DOM
console.log('\n2. ALL H1 TAGS IN REGULAR DOM:');
const allH1s = document.querySelectorAll('h1');
console.log('Total H1s found:', allH1s.length);

allH1s.forEach((h1, idx) => {
  const text = h1.textContent?.trim();
  console.log(`  ${idx + 1}. Text: "${text?.substring(0, 100)}"`);
  console.log(`     Class: "${h1.className}"`);
  console.log(`     Visible: ${h1.offsetHeight > 0}`);
  console.log(`     Parent: <${h1.parentElement?.tagName}> class="${h1.parentElement?.className?.substring(0, 50)}"`);
});

// 3. Look for divs with your name
console.log('\n3. ELEMENTS CONTAINING YOUR NAME:');
const allDivs = document.querySelectorAll('div, span, h1, h2, h3');
let foundCount = 0;

allDivs.forEach(el => {
  const text = el.textContent?.trim();
  if (text && (text.includes('Yanet') || text.includes('Hevia')) && el.children.length === 0) {
    if (foundCount < 10) {
      console.log(`  ${foundCount + 1}. <${el.tagName}> class="${el.className?.substring(0, 50)}"`);
      console.log(`     Text: "${text.substring(0, 100)}"`);
      console.log(`     Visible: ${el.offsetHeight > 0}`);
      foundCount++;
    }
  }
});

console.log(`\nTotal elements with your name: ${foundCount}+`);

// 4. Look for meta tags or JSON-LD with profile data
console.log('\n4. META TAGS AND STRUCTURED DATA:');

const metaTags = document.querySelectorAll('meta[property*="profile"], meta[name*="profile"], meta[property*="og:"]');
console.log(`Meta tags found: ${metaTags.length}`);
metaTags.forEach(meta => {
  console.log(`  ${meta.getAttribute('property') || meta.getAttribute('name')}: ${meta.getAttribute('content')?.substring(0, 100)}`);
});

const scripts = document.querySelectorAll('script[type="application/ld+json"]');
console.log(`\nJSON-LD scripts found: ${scripts.length}`);
scripts.forEach((script, idx) => {
  if (idx < 3) {
    console.log(`  Script ${idx + 1}:`, script.textContent?.substring(0, 200));
  }
});

// 5. Check if LinkedIn is using a SPA framework
console.log('\n5. SPA DETECTION:');
console.log('React root:', !!document.querySelector('[data-reactroot], #react-root, [data-react-app]'));
console.log('Vue app:', !!document.querySelector('[data-v-app], #app[data-v-]'));
console.log('Ember app:', !!document.querySelector('[class*="ember"]'));

// 6. Look for main content container
console.log('\n6. MAIN CONTENT CONTAINERS:');
const containers = [
  'main',
  '[role="main"]',
  '.scaffold-layout__main',
  '.profile',
  '#profile-content',
  '.pv-top-card'
];

containers.forEach(selector => {
  const elem = document.querySelector(selector);
  if (elem) {
    console.log(`  ✓ Found: ${selector}`);
    console.log(`    Text length: ${elem.textContent?.length || 0}`);
    console.log(`    Contains name: ${elem.textContent?.includes('Yanet') || elem.textContent?.includes('Hevia')}`);
    console.log(`    Children: ${elem.children.length}`);
  }
});

console.log('\n=== RECOMMENDATION ===');
console.log('If the regular DOM has NO profile data:');
console.log('→ ALL content is in Shadow DOM');
console.log('→ Extension needs to extract from Shadow DOM');
console.log('\nIf the regular DOM HAS profile data:');
console.log('→ Can extract from regular DOM (easier)');
console.log('→ Shadow DOM is only for some components');

console.log('\n=== END ===');
