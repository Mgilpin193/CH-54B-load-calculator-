'use strict';
window.createChecklistRunner = function () {
  const states = new Map();
  let advanceTimer;
  function cancelPending() { clearTimeout(advanceTimer); }
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
  function wording(item) {
    return el('p', item.text, [item.callout ? 'verbal' : '', item.underlined ? 'source-underline' : ''].filter(Boolean).join(' '));
  }
  function renderList(content, list, refresh, options = {}) {
    cancelPending();
    const actions = list.items.filter(item => item.type === 'action');
    if (!states.has(list.id)) states.set(list.id, { cursor: 0, done: new Set(), postponed: new Set() });
    const state = states.get(list.id);
    // Keep source warnings, conditions and explanatory notes available throughout the list.
    list.items.filter(item => item.type !== 'action').forEach(item => content.append(el('p', item.text, item.type === 'warning' ? 'warning' : 'condition')));
    const progress = el('p', state.done.size + ' of ' + actions.length + ' complete · ' + state.postponed.size + ' postponed', 'progress');
    progress.setAttribute('aria-live', 'polite');
    content.append(progress);
    const current = actions[state.cursor];
    if (current) {
      const card = el('section', '', 'runner-card');
      card.setAttribute('aria-live', 'polite');
      card.append(el('p', 'Item ' + (state.cursor + 1) + ' of ' + actions.length + (current.callout ? ' · Verbal callout' : ''), 'step-number'), wording(current));
      content.append(card);
    } else {
      content.append(el('h3', state.postponed.size ? 'Postponed items' : (actions.length ? (options.completionStatement || list.title + ' complete') : 'Procedure reference'), 'completion-statement'));
      if (state.postponed.size) {
        content.append(el('p', 'Complete each postponed item below.', 'progress'));
        for (const index of state.postponed) {
          const row = el('div', '', 'postponed-entry');
          const text = el('div');
          text.append(el('span', 'Item ' + (index + 1), 'step-number'), wording(actions[index]));
          row.append(text, button('Complete', 'runner-complete', () => {
            state.postponed.delete(index);
            state.done.add(index);
            refresh();
          }));
          content.append(row);
        }
      }
      if (actions.length && state.done.size === actions.length && !state.postponed.size && options.nextChoices?.length) {
        content.append(el('p', 'Choose the next checklist.', 'progress'));
        for (const choice of options.nextChoices) {
          content.append(button(choice.label, 'runner-next', choice.onSelect));
        }
      } else if (actions.length && state.done.size === actions.length && !state.postponed.size && options.onNext) {
        const advance = () => {
          cancelPending();
          state.advanced = true;
          options.onNext();
        };
        content.append(button(options.nextLabel || 'Next list', 'runner-next', advance));
        if (!state.advanced) {
          const announcement = el('p', 'All items complete. ' + (options.nextTitle ? 'Opening ' + options.nextTitle : 'Returning to the menu') + ' in 3 seconds.', 'progress');
          announcement.setAttribute('role', 'status');
          content.append(announcement);
          advanceTimer = setTimeout(advance, 3000);
        }
      }
    }
    const controls = el('div', '', 'runner-controls');
    const back = button('Go back', 'runner-back', () => {
      if (!state.cursor) return;
      state.cursor--;
      state.advanced = false;
      state.done.delete(state.cursor);
      state.postponed.delete(state.cursor);
      refresh();
    });
    back.disabled = state.cursor === 0;
    const postpone = button('Postpone', 'runner-postpone', () => {
      if (!current) return;
      state.done.delete(state.cursor);
      state.postponed.add(state.cursor++);
      refresh();
    });
    const complete = button('Complete', 'runner-complete', () => {
      if (!current) return;
      state.postponed.delete(state.cursor);
      state.done.add(state.cursor++);
      refresh();
    });
    postpone.disabled = complete.disabled = !current;
    controls.append(back, postpone, complete);
    content.append(controls, button('Start over', 'reset', () => {
      state.cursor = 0;
      state.advanced = false;
      state.done.clear();
      state.postponed.clear();
      refresh();
    }));
    const emergencyLink = el('a', 'CH-54A Emergency Procedures', 'emergency-shortcut');
    emergencyLink.href = 'emergency-a.html';
    content.append(emergencyLink);
  };
  renderList.cancelPending = cancelPending;
  return renderList;
};
