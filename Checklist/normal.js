'use strict';
(() => {
  const { sections, model = 'CH-54A' } = window.NORMAL_CHECKLIST;
  const content = document.getElementById('content');
  const navigation = document.getElementById('navigation');
  const renderList = window.createChecklistRunner(model);
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(text, className, callback) {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', callback);
    return node;
  }
  function render() {
    renderList.cancelPending();
    const section = sections.find(item => item.id === location.hash.slice(1));
    content.replaceChildren();
    navigation.replaceChildren();
    if (section) navigation.append(button('All checklist sections', '', () => { location.hash = ''; }));
    const title = el('h2', section ? section.title : 'Checklist sections');
    title.id = 'view-title';
    title.tabIndex = -1;
    content.append(title);
    if (!section) {
      const menu = el('div', '', 'menu');
      sections.forEach(item => {
        const node = button('', 'category', () => { location.hash = item.id; });
        const arrow = el('span', '›', 'arrow');
        arrow.setAttribute('aria-hidden', 'true');
        node.append(el('span', item.title), arrow);
        menu.append(node);
      });
      content.append(menu);
    } else {
      const next = sections[sections.indexOf(section) + 1];
      const last = section.items[section.items.length - 1];
      const hasCompletionStatement = last?.type === 'completion' ||
        (model === 'CH-54A' && last?.type === 'action' && /complete\s*$/i.test(last.text));
      const nextChoices = /^(#2 Engine Start|Second Engine Start)$/i.test(section.title)
        ? sections.filter(item => /^Ground Taxi(?: \(if required\))?$/.test(item.title) || item.title === 'Before Takeoff Check')
          .map(item => ({ label: item.title, onSelect: () => { location.hash = item.id; } }))
        : undefined;
      renderList(content, { ...section, items: hasCompletionStatement ? section.items.slice(0, -1) : section.items }, render, {
        completionStatement: hasCompletionStatement ? last.text : section.title + ' complete',
        nextChoices,
        nextTitle: next?.title,
        nextLabel: next ? 'Next list: ' + next.title : 'Return to checklist menu',
        onNext: () => { location.hash = next ? next.id : ''; }
      });
    }
    title.focus();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('../service-worker.js').catch(() => {});
})();
