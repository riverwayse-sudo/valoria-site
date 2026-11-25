import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function collectSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(absolute);
    return /\.(jsx|tsx)$/.test(entry.name) ? [absolute] : [];
  });
}
const auditedFiles = collectSourceFiles(path.join(root, 'src'));
const css = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf8');
for (const token of [
  '--vi-select-bg: #1A1A2E',
  '--vi-select-fg: #F7F4EE',
  '--vi-select-option-bg: #1A1A2E',
  '--vi-select-option-fg: #F7F4EE',
  'select:not(.vi-select--light) option',
  'select.vi-select--light option',
  'focus-visible',
]) {
  if (!css.includes(token)) throw new Error(`Dropdown design system missing contract: ${token}`);
}
let count = 0;
for (const file of auditedFiles) {
  const source = fs.readFileSync(file, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  const tags = [...source.matchAll(/<select\b[^>]*>/gs)].map(match => match[0]);
  for (const tag of tags) {
    count += 1;
    if (!/className=["'][^"']*vi-select(?:--light)?[^"']*["']/.test(tag)) {
      throw new Error(`Unstandardised native select in ${file}: ${tag.slice(0, 160)}`);
    }
    if ((tag.match(/\bclassName=/g) || []).length > 1) {
      throw new Error(`Duplicate className attributes on native select in ${file}: ${tag.slice(0, 160)}`);
    }
  }
}
if (count < 15) throw new Error(`Dropdown audit unexpectedly found only ${count} selects`);

const navigation = fs.readFileSync(path.join(root, 'src/components/Nav.jsx'), 'utf8');
if (!navigation.includes('aria-hidden={openMenu !== item.label}') || !navigation.includes('inert={openMenu !== item.label}') || !navigation.includes('inert={!menuOpen}')) {
  throw new Error('Navigation dropdowns must hide and remove closed menus from keyboard focus.');
}
const notifications = fs.readFileSync(path.join(root, 'src/components/NotificationBell.jsx'), 'utf8');
if (!notifications.includes("event.key === 'Escape'") || !notifications.includes('aria-controls="vi-notification-panel"')) {
  throw new Error('Notification dropdown must expose its controlled region and support Escape dismissal.');
}

console.log(`Dropdown design-system contract passed: ${count} native selects across ${auditedFiles.length} audited files.`);