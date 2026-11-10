'use strict';
(() => {
  if (window.parent === window || new URLSearchParams(location.search).get('embedded') !== '1') return;
  // Embedded pages use the performance app's navigation and selected-aircraft shortcut.
  document.querySelectorAll('header a').forEach(link => { link.hidden = true; });
  const style = document.createElement('style');
  style.textContent = '.emergency-shortcut{display:none}header>a{display:none}';
  document.head.append(style);
  document.addEventListener('click', event => {
    const link = event.target.closest('.emergency-shortcut');
    if (!link) return;
    event.preventDefault();
    window.parent.CH54Checklist.openEmergency();
  });
})();
