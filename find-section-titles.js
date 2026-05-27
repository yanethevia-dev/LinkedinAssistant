// Find all possible section titles
console.log('=== FINDING ALL SECTION TITLES ===');

// Get all H2, H3, and DIVs that could be section titles
const allElements = Array.from(document.querySelectorAll('h2, h3, div'));

// Filter to elements that have short text (likely section titles)
const possibleTitles = allElements.filter(el => {
  const text = el.textContent?.trim();
  return text && text.length > 2 && text.length < 100 && el.children.length === 0;
});

console.log(`Found ${possibleTitles.length} possible section titles:`);

const uniqueTitles = new Set();

possibleTitles.forEach(el => {
  const text = el.textContent?.trim();
  if (text && !uniqueTitles.has(text)) {
    uniqueTitles.add(text);
  }
});

const titlesArray = Array.from(uniqueTitles).sort();

console.log('\nAll unique short texts (possible section titles):');
titlesArray.forEach((title, idx) => {
  console.log(`${idx + 1}. "${title}"`);
});

// Specifically look for experience-related titles
console.log('\n=== EXPERIENCE-RELATED TITLES ===');
const expKeywords = ['experiencia', 'experience', 'trabajo', 'work', 'empleo', 'career', 'profesional'];
const expTitles = titlesArray.filter(t =>
  expKeywords.some(k => t.toLowerCase().includes(k))
);

if (expTitles.length > 0) {
  console.log('Found experience-related titles:');
  expTitles.forEach(t => console.log(`  - "${t}"`));
} else {
  console.log('❌ NO experience-related titles found');
}

// Look for education-related titles
console.log('\n=== EDUCATION-RELATED TITLES ===');
const eduKeywords = ['educación', 'education', 'formación', 'estudios', 'training', 'academic'];
const eduTitles = titlesArray.filter(t =>
  eduKeywords.some(k => t.toLowerCase().includes(k))
);

if (eduTitles.length > 0) {
  console.log('Found education-related titles:');
  eduTitles.forEach(t => console.log(`  - "${t}"`));
} else {
  console.log('❌ NO education-related titles found');
}

// Look for skills-related titles
console.log('\n=== SKILLS-RELATED TITLES ===');
const skillKeywords = ['skill', 'habilidad', 'competencia', 'capacidad'];
const skillTitles = titlesArray.filter(t =>
  skillKeywords.some(k => t.toLowerCase().includes(k))
);

if (skillTitles.length > 0) {
  console.log('Found skill-related titles:');
  skillTitles.forEach(t => console.log(`  - "${t}"`));
} else {
  console.log('❌ NO skill-related titles found');
}

console.log('\n=== INSTRUCTIONS ===');
console.log('Look at the list above for titles like:');
console.log('- Experience / Experiencia / Trabajo');
console.log('- Education / Educación / Formación');
console.log('Copy the EXACT text of those titles');
console.log('\n=== END ===');
