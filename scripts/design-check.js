#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const files = [
  'src/app/page.jsx',
  'src/app/home.css',
  'src/styles/motion.css',
  'src/styles/brand-standard.css',
  'src/app/globals.css',
];

const existing = files
  .map((file) => ({ file, text: fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : '' }))
  .filter(({ text }) => text);

const violations = [];

const legacyColors = ['#008', '#00f', '#6c63ff', '#7c3aed', '#f59e0b', '#ff6b6b', '#14b8a6'];
for (const { file, text } of existing) {
  for (const color of legacyColors) {
    if (text.toLowerCase().includes(color)) {
      violations.push(`${file}: legacy/unapproved colour token ${color}`);
    }
  }
}

for (const { file, text } of existing) {
  const negativeMargin = /margin(?:-(?:top|right|bottom|left))?\s*:\s*-\d/.test(text);
  if (negativeMargin) violations.push(`${file}: negative margin detected; justify or remove before production`);
}

const page = existing.find((x) => x.file === 'src/app/page.jsx')?.text || '';
const requiredSections = ['home-pathways', 'valu-conversion', 'LiveProfilesScroll'];
for (const section of requiredSections) {
  if (!page.includes(section)) violations.push(`src/app/page.jsx: required homepage composition missing ${section}`);
}

if (!page.includes("import './home.css'")) {
  violations.push('src/app/page.jsx: canonical homepage stylesheet is not loaded');
}

const motion = existing.find((x) => x.file === 'src/styles/motion.css')?.text || '';
if (!motion.includes('--motion-reveal') || !motion.includes('prefers-reduced-motion')) {
  violations.push('src/styles/motion.css: canonical motion tokens or reduced-motion contract missing');
}
if (motion.includes('transition: all') || motion.includes('animation: all')) {
  violations.push('src/styles/motion.css: broad all-property animation/transition is prohibited');
}

if (violations.length) {
  console.error('\nValoria design check FAILED\n');
  for (const violation of violations) console.error('• ' + violation);
  process.exit(1);
}

console.log('Valoria design check passed.');
