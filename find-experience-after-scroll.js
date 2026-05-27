// Find experience section AFTER scrolling
console.log('=== BUSCANDO EXPERIENCIA (después de scroll) ===');
console.log('IMPORTANTE: Asegúrate de haber hecho scroll hasta ver tus trabajos\n');

const main = document.querySelector('main');

// 1. Buscar TODAS las listas
console.log('1. TODAS LAS LISTAS (<ul>):');
const allLists = main.querySelectorAll('ul');
console.log(`Total listas encontradas: ${allLists.length}\n`);

allLists.forEach((list, idx) => {
  const items = list.querySelectorAll('li');

  if (items.length > 0 && items.length < 50) { // Ignorar listas muy grandes (menús)
    console.log(`Lista ${idx + 1}: ${items.length} items`);

    // Mostrar primeros 2 items
    items.forEach((item, itemIdx) => {
      if (itemIdx < 2) {
        const text = item.textContent?.trim();
        console.log(`  Item ${itemIdx + 1}: "${text?.substring(0, 200)}"`);
      }
    });

    console.log(''); // Línea en blanco
  }
});

// 2. Buscar texto que parezca un trabajo (empresa + cargo)
console.log('\n2. BUSCANDO PATRONES DE TRABAJO:');
console.log('Buscando texto con fechas (años como 2020, 2021, etc.)\n');

const allText = Array.from(main.querySelectorAll('div, span, li, p'));
const withDates = allText.filter(el => {
  const text = el.textContent?.trim() || '';
  // Buscar patrones de fechas: "2020", "2021", "2022", etc.
  return /20\d{2}/.test(text) && text.length > 20 && text.length < 500;
});

console.log(`Elementos con años (posibles trabajos): ${withDates.length}`);
withDates.slice(0, 10).forEach((el, idx) => {
  const text = el.textContent?.trim();
  console.log(`${idx + 1}. "${text?.substring(0, 200)}"`);
  console.log(`   Tag: <${el.tagName}> Children: ${el.children.length}`);
  console.log('');
});

// 3. Buscar nombres de empresa conocidos
console.log('\n3. BUSCANDO NOMBRES DE EMPRESA:');
const companies = ['expedia', 'google', 'microsoft', 'amazon', 'facebook', 'meta',
                   'apple', 'ibm', 'oracle', 'salesforce', 'uber', 'airbnb'];

companies.forEach(company => {
  const found = allText.find(el =>
    el.textContent?.toLowerCase().includes(company)
  );

  if (found) {
    console.log(`✓ Encontrado: ${company}`);
    console.log(`  Texto: "${found.textContent?.trim().substring(0, 150)}"`);
  }
});

// 4. Buscar por estructura visual
console.log('\n4. BUSCANDO POR ESTRUCTURA:');
console.log('Elementos que tienen múltiples hijos (tarjetas de trabajo):\n');

const containers = Array.from(main.querySelectorAll('div'));
const cards = containers.filter(div => {
  const children = div.children.length;
  const text = div.textContent?.trim() || '';

  // Una tarjeta de trabajo típicamente tiene:
  // - 2-10 elementos hijos (logo, título, empresa, fechas, descripción)
  // - Texto de 50-1000 caracteres
  // - Contiene un año
  return children >= 2 && children <= 10 &&
         text.length > 50 && text.length < 1000 &&
         /20\d{2}/.test(text);
});

console.log(`Tarjetas potenciales encontradas: ${cards.length}`);
cards.slice(0, 5).forEach((card, idx) => {
  console.log(`\nTarjeta ${idx + 1}:`);
  console.log(`  Hijos: ${card.children.length}`);
  console.log(`  Texto (primeros 200): "${card.textContent?.trim().substring(0, 200)}"`);

  // Intentar extraer datos estructurados
  const lines = card.innerText?.split('\n').filter(l => l.trim());
  if (lines && lines.length > 0) {
    console.log(`  Líneas de texto:`);
    lines.slice(0, 5).forEach((line, lidx) => {
      console.log(`    ${lidx + 1}. "${line}"`);
    });
  }
});

// 5. Ver TODO el texto de main (línea por línea)
console.log('\n5. TODO EL TEXTO DE MAIN (primeras 100 líneas):');
const mainText = main.innerText || main.textContent;
const lines = mainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

console.log(`Total líneas: ${lines.length}\n`);
lines.slice(0, 100).forEach((line, idx) => {
  if (line.length < 200) { // Solo líneas no muy largas
    console.log(`${idx + 1}. "${line}"`);
  }
});

console.log('\n=== INSTRUCCIONES ===');
console.log('Mira la sección 2 y 4 para ver si aparecen tus trabajos.');
console.log('Busca en la sección 5 si hay algún título de sección.');
console.log('Copia TODO el output y envíamelo.');
console.log('\n=== FIN ===');
