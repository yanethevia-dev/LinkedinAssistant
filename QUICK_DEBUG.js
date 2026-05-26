// EJECUTA ESTO EN LA CONSOLA DE LINKEDIN (con el modal abierto)

console.log('=== QUICK DEBUG ===\n');

// 1. ¿Extension cargada?
console.log('1. Extension loaded?');
console.log('   Toast exists:', !!document.getElementById('lia-loaded-indicator'));
console.log('   Buttons exist:', document.querySelectorAll('.lia-button').length);

// 2. ¿Hay dialogs?
console.log('\n2. Dialogs:');
const dialogs = document.querySelectorAll('[role="dialog"]');
console.log('   Total dialogs:', dialogs.length);
dialogs.forEach((d, i) => {
  const visible = d.offsetWidth > 0;
  const hasEditor = d.querySelector('[contenteditable="true"], .ql-editor');
  console.log(`   Dialog ${i}: visible=${visible}, hasEditor=${!!hasEditor}`);
  if (hasEditor) {
    console.log(`      Editor text:`, hasEditor.textContent?.substring(0, 50));
  }
});

// 3. ¿Hay editores sueltos?
console.log('\n3. Editors (not in dialogs):');
const editors = document.querySelectorAll('[contenteditable="true"], .ql-editor');
console.log('   Total editors:', editors.length);
editors.forEach((e, i) => {
  const visible = e.offsetWidth > 0;
  const inDialog = e.closest('[role="dialog"]');
  console.log(`   Editor ${i}: visible=${visible}, inDialog=${!!inDialog}, class="${e.className}"`);
});

// 4. ¿Logs en consola?
console.log('\n4. Check console for:');
console.log('   - [LinkedIn Assistant] Content script loaded');
console.log('   - [DOMObserver] Scanning for post composer...');
console.log('   - [DOMObserver] Found X dialogs');

console.log('\n=== END DEBUG ===');
console.log('\nSHARE THE OUTPUT ABOVE');
