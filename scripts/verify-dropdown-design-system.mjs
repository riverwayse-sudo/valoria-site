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
  const source = fs.readFileSync(file, 'utf8').replace(/<!--[\\s\\S]*?-->/g, '');
  const tags = [...source.matchAll(/<select\b[^>]*>/gs)].map(match => match[0]);
  for (const tag of tags) {
    count += 1;
    if (!/className=["'][^"']*vi-select(?:--light)?[^"']*["']/.test(tag)) {
      throw new Error(`Unstandardised native select in ${file}: ${tag.slice(0, 160)}`);
    }
  }
}
if (count < 15) throw new Error(`Dropdown audit unexpectedly found only ${count} selects`);
console.log(`Dropdown design-system contract passed: ${count} native selects across ${auditedFiles.length} audited files.`);
