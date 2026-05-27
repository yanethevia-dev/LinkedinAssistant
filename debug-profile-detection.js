// Debug script for LinkedIn profile detection
// Paste this in browser console while on your LinkedIn profile page

console.log('=== LINKEDIN PROFILE DETECTION DEBUG ===');

// 1. Check URL
console.log('\n1. URL CHECK:');
console.log('Current URL:', window.location.href);
console.log('Pathname:', window.location.pathname);
console.log('Includes /in/:', window.location.pathname.includes('/in/'));

// 2. Check name extraction
console.log('\n2. NAME EXTRACTION:');
const nameSelectors = [
  'h1.text-heading-xlarge',
  'h1[class*="profile-name"]',
  'h1.text-heading-xlarge.inline.t-24',
  'div.mt2.relative h1'
];

nameSelectors.forEach(selector => {
  const element = document.querySelector(selector);
  console.log(`Selector "${selector}":`, element?.textContent?.trim() || 'NOT FOUND');
});

// 3. Check headline extraction
console.log('\n3. HEADLINE EXTRACTION:');
const headlineSelectors = [
  '.text-body-medium[class*="break-words"]',
  'div[class*="profile-headline"]',
  '.text-body-medium.break-words',
  'div.text-body-medium'
];

headlineSelectors.forEach(selector => {
  const element = document.querySelector(selector);
  console.log(`Selector "${selector}":`, element?.textContent?.trim().substring(0, 50) || 'NOT FOUND');
});

// 4. Check sections
console.log('\n4. SECTIONS CHECK:');
console.log('#about exists:', !!document.querySelector('#about'));
console.log('#experience exists:', !!document.querySelector('#experience'));
console.log('#education exists:', !!document.querySelector('#education'));

// 5. Try to extract full data
console.log('\n5. FULL EXTRACTION TEST:');

const data = {
  name: '',
  headline: '',
  about: '',
  experienceCount: 0,
  educationCount: 0
};

// Name
const nameElement = document.querySelector('h1.text-heading-xlarge, h1[class*="profile-name"]');
data.name = nameElement?.textContent?.trim() || '';

// Headline
const headlineElement = document.querySelector('.text-body-medium[class*="break-words"], div[class*="profile-headline"]');
data.headline = headlineElement?.textContent?.trim() || '';

// About
const aboutSection = document.querySelector('#about')?.parentElement;
const aboutText = aboutSection?.querySelector('.inline-show-more-text, .display-flex span[aria-hidden="true"]');
data.about = aboutText?.textContent?.trim().substring(0, 100) || '';

// Experience
const experienceSection = document.querySelector('#experience')?.parentElement;
const experienceItems = experienceSection?.querySelectorAll('li.artdeco-list__item, li[class*="profile-section-card"]');
data.experienceCount = experienceItems?.length || 0;

// Education
const educationSection = document.querySelector('#education')?.parentElement;
const educationItems = educationSection?.querySelectorAll('li.artdeco-list__item, li[class*="profile-section-card"]');
data.educationCount = educationItems?.length || 0;

console.log('\nEXTRACTED DATA:');
console.log('Name:', data.name || '❌ NOT FOUND');
console.log('Headline:', data.headline || '❌ NOT FOUND');
console.log('About (first 100 chars):', data.about || '❌ NOT FOUND');
console.log('Experience count:', data.experienceCount);
console.log('Education count:', data.educationCount);

// 6. Alternative selectors (if main ones fail)
console.log('\n6. ALTERNATIVE SELECTORS:');
const allH1s = document.querySelectorAll('h1');
console.log('All H1 elements found:', allH1s.length);
allH1s.forEach((h1, idx) => {
  console.log(`  H1 #${idx}:`, h1.textContent?.trim().substring(0, 50), '|', h1.className);
});

// 7. Check if extension buttons exist
console.log('\n7. EXTENSION BUTTONS:');
console.log('Floating buttons container:', !!document.getElementById('lia-floating-buttons'));
console.log('Generate CV button:', !!document.getElementById('lia-btn-generate-cv'));
console.log('Improve Profile button:', !!document.getElementById('lia-btn-improve-profile'));

// 8. Summary
console.log('\n=== SUMMARY ===');
if (data.name) {
  console.log('✅ Profile detection should WORK');
} else {
  console.log('❌ Profile detection will FAIL');
  console.log('Reason: Cannot extract name');
  console.log('\nSUGGESTIONS:');
  console.log('1. Make sure you are on YOUR profile page (not someone else\'s)');
  console.log('2. Scroll down to load all sections');
  console.log('3. LinkedIn may have changed their HTML structure');
  console.log('4. Try refreshing the page');
}

console.log('\n=== END DEBUG ===');
