const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor(tag = 'div') {
    this.tag = tag;
    this.children = [];
    this.events = {};
    this.attributes = {};
    this.classes = new Set();
    this.classList = { contains: value => this.classes.has(value) };
  }
  append(node) { this.children.push(node); }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(key, fn) { (this.events[key] ||= []).push(fn); }
  fire(key) { for (const fn of this.events[key] || []) fn(); }
  querySelector(tag) { return this.children.find(node => node.tag === tag); }
  querySelectorAll(tag) { return this.children.filter(node => node.tag === tag); }
}
const ids = Object.fromEntries(['perfModel', 'tabChecklist', 'selectedEmergencyButton', 'checklistHost', 'emergencyHost', 'checklistUnavailable', 'emergencyUnavailable', 'pChecklist', 'pEmergency'].map(id => [id, new Element()]));
for (const id of ['checklistUnavailable', 'emergencyUnavailable']) {
  ids[id].append(new Element('h2'));
  ids[id].append(new Element('p'));
}
ids.perfModel.value = 'CH54B';
const documentEvents = {};
const context = {
  document: {
    getElementById: id => ids[id],
    createElement: tag => new Element(tag),
    querySelectorAll: () => [ids.tabChecklist],
    addEventListener: (event, fn) => { documentEvents[event] = fn; }
  },
  window: {
    showPage(id) {
      ids.pChecklist.classes.delete('active');
      ids.pEmergency.classes.delete('active');
      ids[id]?.classes.add('active');
    }
  }
};
vm.runInNewContext(fs.readFileSync('aircraft-checklists.js', 'utf8'), context);
const app = context.window.CH54Checklist;
app.openChecklist();
assert.equal(ids.checklistUnavailable.hidden, false);
assert.match(ids.checklistUnavailable.querySelector('p').textContent, /CH-54B/);
assert.equal(ids.checklistHost.children.length, 0);
app.openEmergency();
assert.equal(ids.emergencyHost.children[0].src, 'Checklist/emergency.html?embedded=1');
ids.perfModel.value = 'CH54A';
ids.perfModel.fire('change');
assert.equal(ids.emergencyHost.children[0].hidden, true);
assert.equal(ids.emergencyHost.children[1].src, 'Checklist/emergency-a.html?embedded=1');
app.openChecklist();
const savedFrame = ids.checklistHost.children[0];
assert.equal(savedFrame.src, 'Checklist/normal.html?embedded=1');
savedFrame.progress = 'Item 6';
app.openEmergency();
app.openChecklist();
assert.equal(ids.checklistHost.children[0], savedFrame);
assert.equal(savedFrame.progress, 'Item 6');
for (const model of ['CH54A_CMRB', 'CH54B_CMRB']) {
  ids.perfModel.value = model;
  ids.perfModel.fire('change');
  app.openChecklist();
  assert.equal(ids.checklistUnavailable.hidden, false);
  app.openEmergency();
  assert.equal(ids.emergencyUnavailable.hidden, false);
  assert.ok(ids.emergencyHost.children.every(frame => frame.hidden));
}
ids.perfModel.value = 'CH54A';
documentEvents.inputsRestored();
assert.equal(ids.selectedEmergencyButton.textContent, 'EMERGENCY');
assert.equal(ids.selectedEmergencyButton.attributes['aria-label'], 'CH-54A Emergency Procedures');
assert.equal(ids.emergencyHost.children[1].hidden, false);
console.log('PASS: aircraft-specific routing, missing-checklist handling, CMRB isolation, frame progress retention, restored aircraft selection.');

const html = fs.readFileSync('index.html', 'utf8');
assert.equal((html.match(/id="tabChecklist"/g) || []).length, 1);
assert.equal((html.match(/id="selectedEmergencyButton"/g) || []).length, 1);
assert.ok(html.indexOf('aircraft-checklists.css') > html.lastIndexOf('</style>', html.indexOf('</head>')));
let scripts = 0;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\bsrc\s*=/.test(match[1])) continue;
  new vm.Script(match[2]);
  scripts++;
}
console.log(`PASS: single integration tab and emergency button, final stylesheet precedence, ${scripts} performance scripts parse.`);
