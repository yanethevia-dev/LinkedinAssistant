// Simple script to get Shadow DOM HTML
// Paste this in console and it will show you how to download the HTML

const shadowHost = document.querySelector('#interop-outlet');

if (shadowHost && shadowHost.shadowRoot) {
  const html = shadowHost.shadowRoot.innerHTML;

  console.log('Shadow DOM found!');
  console.log('Total HTML length:', html.length, 'characters');
  console.log('\nFirst 2000 characters:');
  console.log('='.repeat(80));
  console.log(html.substring(0, 2000));
  console.log('='.repeat(80));

  console.log('\n\nTo download the full HTML, run this command:');
  console.log('\nStep 1: Copy this function:');
  console.log(`
function downloadHTML() {
  const html = document.querySelector('#interop-outlet').shadowRoot.innerHTML;
  const blob = new Blob([html], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'linkedin-shadow-dom.html';
  a.click();
}
  `);
  console.log('\nStep 2: Paste the function above');
  console.log('Step 3: Then run: downloadHTML()');

} else {
  console.error('Shadow DOM not found!');
}
