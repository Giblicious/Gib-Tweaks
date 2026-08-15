import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('manifest.json'));
const versions = JSON.parse(read('versions.json'));

if (manifest.id !== 'gib-tweaks') throw new Error('manifest id must be gib-tweaks');
if (manifest.name !== 'Gib Tweaks') throw new Error('manifest name must be Gib Tweaks');
if (!/^0\.\d+\.\d+$/.test(manifest.version)) throw new Error('public beta versions must remain in 0.x.x');
if (packageJson.version !== manifest.version) throw new Error('package and manifest versions must match');
if (versions[manifest.version] !== manifest.minAppVersion) throw new Error('versions.json must map the current version to minAppVersion');
if (manifest.isDesktopOnly !== true) throw new Error('Gib Tweaks uses desktop workspace APIs and must remain desktop-only');

for (const required of [
  'main.js',
  'manifest.json',
  'styles.css',
  'versions.json',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'SECURITY.md',
  'AGENTS.md',
]) {
  if (!fs.existsSync(path.join(root, required))) throw new Error(`Missing public release file: ${required}`);
}

const builtMain = read('main.js');
for (const requiredText of [
  'gib-tweaks-typography',
  'Default workspace',
  'Hide sidebar panels on startup',
  'Status bar location',
  'Right sidebar footer',
  'statusBarLocation: "right"',
  'restoreStatusBar',
  'module.exports',
]) {
  if (!builtMain.includes(requiredText)) throw new Error(`Release build is missing expected plugin behavior: ${requiredText}`);
}

const styles = read('styles.css');
for (const requiredStyle of [
  '.workspace-split.mod-right-split .workspace-tabs.gib-tweaks-status-bar-panel > .status-bar.gib-tweaks-status-bar-in-sidebar',
  'position: relative !important',
  'inset: auto !important',
  'z-index: 101',
  'justify-content: flex-end',
  'border-inline-start: var(--divider-width) solid var(--divider-color)',
  'height: var(--gib-tweaks-sidebar-footer-height, 43px) !important',
  'flex: 0 0 var(--gib-tweaks-sidebar-footer-height, 43px) !important',
]) {
  if (!styles.includes(requiredStyle)) throw new Error(`Release styles are missing right-sidebar behavior: ${requiredStyle}`);
}

for (const relativePath of ['src/main.js', 'main.js', 'styles.css', 'README.md']) {
  const source = read(relativePath);
  if (/\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"']+["']/i.test(source)) {
    throw new Error(`${relativePath} appears to contain a committed credential`);
  }
}

if (fs.existsSync(path.join(root, 'data.json'))) throw new Error('data.json is user-owned runtime state and must not be in the repository');

const syntax = spawnSync(process.execPath, ['--check', path.join(root, 'main.js')], { encoding: 'utf8' });
if (syntax.status !== 0) throw new Error(syntax.stderr || syntax.stdout || 'Built main.js failed syntax validation');

console.log(`Gib Tweaks ${manifest.version} passed build, syntax, manifest, and public-content checks.`);
