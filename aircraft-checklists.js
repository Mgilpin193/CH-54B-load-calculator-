'use strict';
(() => {
  const routes = {
    CH54A: { label: 'CH-54A', checklist: 'Checklist/normal.html', emergency: 'Checklist/emergency-a.html' },
    CH54B: { label: 'CH-54B', checklist: null, emergency: 'Checklist/emergency.html' },
    CH54A_CMRB: { label: 'CH-54A CMRB', checklist: null, emergency: null },
    CH54B_CMRB: { label: 'CH-54B CMRB', checklist: null, emergency: null }
  };
  const frames = new Map();
  const picker = document.getElementById('perfModel');
  const checklistTab = document.getElementById('tabChecklist');
  const emergencyButton = document.getElementById('selectedEmergencyButton');
  function selected() {
    return routes[picker.value] || { label: 'Selected aircraft', checklist: null, emergency: null };
  }
  function prepare(kind) {
    const route = selected();
    const host = document.getElementById(kind === 'checklist' ? 'checklistHost' : 'emergencyHost');
    const empty = document.getElementById(kind === 'checklist' ? 'checklistUnavailable' : 'emergencyUnavailable');
    const source = route[kind];
    host.querySelectorAll('iframe').forEach(frame => { frame.hidden = true; });
    empty.hidden = !!source;
    if (!source) {
      empty.querySelector('h2').textContent = route.label + (kind === 'checklist' ? ' Checklist' : ' Emergency Procedures');
      empty.querySelector('p').textContent = kind === 'checklist'
        ? 'Checklist not yet available for ' + route.label + '.'
        : 'Emergency procedures not yet available for ' + route.label + '.';
      return;
    }
    const key = picker.value + ':' + kind;
    let frame = frames.get(key);
    if (!frame) {
      frame = document.createElement('iframe');
      frame.className = 'aircraft-checklist-frame';
      frame.title = route.label + (kind === 'checklist' ? ' Checklist' : ' Emergency Procedures');
      frame.src = source + '?embedded=1';
      host.append(frame);
      frames.set(key, frame);
    }
    frame.hidden = false;
  }
  function sync() {
    const route = selected();
    checklistTab.setAttribute('aria-label', route.label + ' Checklist');
    emergencyButton.textContent = 'EMERGENCY';
    emergencyButton.setAttribute('aria-label', route.label + ' Emergency Procedures');
    emergencyButton.setAttribute('title', route.label + ' Emergency Procedures');
    if (document.getElementById('pChecklist').classList.contains('active')) prepare('checklist');
    if (document.getElementById('pEmergency').classList.contains('active')) prepare('emergency');
  }
  function openChecklist() {
    prepare('checklist');
    window.showPage('pChecklist', checklistTab);
    emergencyButton.setAttribute('aria-pressed', 'false');
  }
  function openEmergency() {
    prepare('emergency');
    window.showPage('pEmergency', emergencyButton);
    emergencyButton.setAttribute('aria-pressed', 'true');
  }
  window.CH54Checklist = { openChecklist, openEmergency };
  checklistTab.addEventListener('click', openChecklist);
  emergencyButton.addEventListener('click', openEmergency);
  document.querySelectorAll('.tabbtn').forEach(button => button.addEventListener('click', () => {
    if (button !== emergencyButton) emergencyButton.setAttribute('aria-pressed', 'false');
  }));
  picker.addEventListener('change', sync);
  document.addEventListener('inputsRestored', sync);
  document.addEventListener('DOMContentLoaded', sync);
  sync();
})();
