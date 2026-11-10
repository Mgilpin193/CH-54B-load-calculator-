'use strict';
(() => {
  const categories = window.EMERGENCY_CHECKLIST.categories;
  const content = document.getElementById('content');
  const navigation = document.getElementById('navigation');
  const completed = new Map();
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(text, className, onClick) {
    const node = element('button', text, className);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  }
  function go(category, procedure) {
    location.hash = category ? category.id + (procedure ? '/' + procedure.id : '') : '';
  }
  function menuButton(text, className, onClick) {
    const node = button('', className, onClick);
    const arrow = element('span', '›', 'arrow');
    arrow.setAttribute('aria-hidden', 'true');
    node.append(element('span', text), arrow);
    return node;
  }
  function note(item) { return element('p', item.text, item.type === 'warning' ? 'warning' : 'condition'); }
  function render() {
    const [categoryId, procedureId] = location.hash.slice(1).split('/');
    const category = categories.find(item => item.id === categoryId);
    const procedure = category?.procedures.find(item => item.id === procedureId);
    content.replaceChildren();
    navigation.replaceChildren();
    if (category) navigation.append(button('All categories', '', () => go()));
    if (procedure) navigation.append(button('Back to procedure list', '', () => go(category)));
    const title = element('h2', procedure?.title || category?.title || 'Emergency categories');
    title.id = 'view-title';
    title.tabIndex = -1;
    if (procedure) content.append(element('p', category.title, 'current-category'));
    content.append(title);
    if (!category) {
      (window.EMERGENCY_CHECKLIST.introduction || []).forEach(text => content.append(element('p', text, 'condition')));
    }
    if (!category) {
      const menu = element('div', '', 'menu');
      categories.forEach(item => menu.append(menuButton(item.title, 'category', () => go(item))));
      content.append(menu);
    } else if (!procedure) {
      category.notes.forEach(item => content.append(note(item)));
      const menu = element('div', '', 'menu');
      category.procedures.forEach(item => menu.append(menuButton(item.title, 'procedure', () => go(category, item))));
      content.append(menu);
    } else {
      // Category warnings also remain visible with every affected procedure.
      category.notes.forEach(item => content.append(note(item)));
      const checked = completed.get(procedure.id) || new Set();
      completed.set(procedure.id, checked);
      procedure.items.forEach((item, index) => {
        if (item.type !== 'action') { content.append(note(item)); return; }
        const row = element('div', '', 'action');
        const label = element('label');
        const checkbox = element('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked.has(index);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) checked.add(index); else checked.delete(index);
        });
        label.append(checkbox, element('span', item.text, 'step-text'));
        row.append(label);
        content.append(row);
      });
      if (procedure.items.some(item => item.type === 'action')) {
        content.append(button('Reset this procedure', 'reset', () => { checked.clear(); render(); }));
      }
    }
    title.focus();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('../service-worker.js').catch(() => {});
})();
