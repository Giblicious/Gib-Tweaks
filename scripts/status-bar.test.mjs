import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8');
const classStart = source.indexOf('class StatusBarTweak {');
const classEnd = source.indexOf('\n/*', classStart);
if (classStart < 0 || classEnd < 0) throw new Error('Could not find StatusBarTweak in src/main.js');
const classSource = source.slice(classStart, classEnd);

class FakeStyle {
  constructor() {
    this.values = new Map();
  }

  set left(value) { this.values.set('left', value); }
  get left() { return this.values.get('left') || ''; }
  set right(value) { this.values.set('right', value); }
  get right() { return this.values.get('right') || ''; }
  set width(value) { this.values.set('width', value); }
  get width() { return this.values.get('width') || ''; }
  set paddingBottom(value) { this.values.set('padding-bottom', value); }
  get paddingBottom() { return this.values.get('padding-bottom') || ''; }
  removeProperty(name) { this.values.delete(name); }
}

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) { for (const name of names) this.values.add(name); }
  remove(...names) { for (const name of names) this.values.delete(name); }
  contains(name) { return this.values.has(name); }
}

class FakeElement {
  constructor(name, rect = { left: 0, width: 0, height: 0 }) {
    this.name = name;
    this.rect = rect;
    this.style = new FakeStyle();
    this.classList = new FakeClassList();
    this.children = [];
    this.parentNode = null;
    this.isConnected = true;
  }

  set className(value) {
    this.classList = new FakeClassList();
    this.classList.add(...value.split(/\s+/).filter(Boolean));
  }

  get className() { return [...this.classList.values].join(' '); }
  get nextSibling() {
    if (!this.parentNode) return null;
    const index = this.parentNode.children.indexOf(this);
    return this.parentNode.children[index + 1] || null;
  }

  appendChild(child) {
    if (child.parentNode) child.parentNode.children = child.parentNode.children.filter(item => item !== child);
    this.children.push(child);
    child.parentNode = this;
    child.isConnected = this.isConnected;
    return child;
  }

  insertBefore(child, reference) {
    if (child.parentNode) child.parentNode.children = child.parentNode.children.filter(item => item !== child);
    const index = reference ? this.children.indexOf(reference) : -1;
    if (index >= 0) this.children.splice(index, 0, child);
    else this.children.push(child);
    child.parentNode = this;
    child.isConnected = this.isConnected;
    return child;
  }

  remove() {
    if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(item => item !== this);
    this.parentNode = null;
    this.isConnected = false;
  }

  getBoundingClientRect() { return this.rect; }
}

test('moves the status bar to the right footer and restores native placement on unload', () => {
  const appContainer = new FakeElement('app-container');
  const workspace = new FakeElement('workspace');
  const mainRoot = new FakeElement('main-root', { left: 120, width: 800, height: 600 });
  const rightSplit = new FakeElement('right-split');
  const statusBar = new FakeElement('status-bar', { left: 0, width: 800, height: 43 });
  const trailingSibling = new FakeElement('trailing-sibling');
  appContainer.appendChild(statusBar);
  appContainer.appendChild(trailingSibling);

  const elements = new Map([
    ['.app-container', appContainer],
    ['.workspace', workspace],
    ['.workspace-split.mod-root', mainRoot],
    ['.workspace-split.mod-right-split', rightSplit],
    ['.status-bar', statusBar],
  ]);

  class FakeObserver {
    observe() {}
    disconnect() {}
  }

  const context = {
    document: {
      querySelector: selector => elements.get(selector) || null,
      createElement: name => new FakeElement(name),
    },
    MutationObserver: FakeObserver,
    ResizeObserver: FakeObserver,
    window: { addEventListener() {}, removeEventListener() {} },
    requestAnimationFrame: callback => { callback(); return 1; },
    cancelAnimationFrame() {},
  };
  vm.createContext(context);
  vm.runInContext(`${classSource}\nglobalThis.StatusBarTweak = StatusBarTweak;`, context);

  const tweak = new context.StatusBarTweak('right');
  tweak.enable();

  const host = statusBar.parentNode;
  assert.equal(host.parentNode, rightSplit);
  assert.equal(host.classList.contains('workspace-sidedock-vault-profile'), true);
  assert.equal(host.classList.contains('gib-tweaks-status-bar-host'), true);
  assert.equal(statusBar.classList.contains('gib-tweaks-status-bar-in-sidebar'), true);

  tweak.setLocation('main');
  assert.equal(statusBar.parentNode, appContainer);
  assert.equal(statusBar.nextSibling, trailingSibling);
  assert.equal(statusBar.style.left, '120px');
  assert.equal(statusBar.style.width, '800px');
  assert.equal(mainRoot.style.paddingBottom, '43px');

  tweak.setLocation('right');
  tweak.disable();
  assert.equal(statusBar.parentNode, appContainer);
  assert.equal(statusBar.nextSibling, trailingSibling);
  assert.equal(statusBar.style.left, '');
  assert.equal(statusBar.style.right, '');
  assert.equal(statusBar.style.width, '');
  assert.equal(mainRoot.style.paddingBottom, '');
  assert.equal(rightSplit.children.length, 0);
});
