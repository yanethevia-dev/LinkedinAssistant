// Options page script

const openLinkedInBtn = document.getElementById('openLinkedIn') as HTMLButtonElement;

openLinkedInBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.linkedin.com' });
});

console.log('[LinkedIn Assistant] Options page loaded');
