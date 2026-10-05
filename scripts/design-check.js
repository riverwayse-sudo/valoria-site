#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const sourceRoots = ['src/app', 'src/components', 'src/lib', 'src/styles'];
const homepageFiles = [
  'src/app/page.jsx',
  'src/app/home.css',
  'src/components/Nav.jsx',
  'src/components/HeroSlider.jsx',
  'src/components/LiveProfilesScroll.jsx',
  'src/components/Footer.jsx',
  'src/styles/motion.css',
];
const existing = sourceRoots.flatMap((dir) => {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return [];
  const walk = (current) => fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(css|jsx|js|ts|tsx)$/.test(entry.name) ? [full] : [];
  });
  return walk(absolute);
}).map((file) => ({
  file: path.relative(root, file).replaceAll(path.sep, '/'),
  text: fs.readFileSync(file, 'utf8'),
}));

const violations = [];
const add = (message) => violations.push(message);

const legacyColors = ['#008', '#00f', '#6c63ff', '#7c3aed', '#f59e0b', '#ff6b6b', '#14b8a6'];
for (const { file, text } of existing.filter(({ file }) => homepageFiles.includes(file))) {
  for (const color of legacyColors) {
    if (text.toLowerCase().includes(color)) add(`${file}: legacy/unapproved colour token ${color}`);
  }
  if (/transition\s*:\s*all\b/i.test(text)) add(`${file}: transition: all is prohibited`);
  if (/animation\s*:\s*all\b/i.test(text)) add(`${file}: animation: all is prohibited`);
  if (/easeOutElastic|easeInOutBack|elastic/i.test(text)) add(`${file}: spring/bouncy easing is prohibited`);
}

for (const { file, text } of existing) {
  if (file === 'src/styles/motion.css') continue;
  if (/from ['"](?:gsap|lenis|animejs|motion(?:\/react)?)['"]/.test(text) || /from ['"]animejs\//.test(text)) {
    add(`${file}: non-canonical motion runtime detected; use src/styles/motion.css + Reveal.jsx`);
  }
}

const packagePath = path.join(root, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  for (const dependency of ['gsap', 'lenis', 'animejs', 'motion']) {
    if (pkg.dependencies?.[dependency] || pkg.devDependencies?.[dependency]) {
      add(`package.json: unsupported motion dependency ${dependency}; canonical motion system is CSS + IntersectionObserver`);
    }
  }
}

const page = existing.find((x) => x.file === 'src/app/page.jsx')?.text || '';
for (const section of ['home-pathways', 'valu-conversion', 'LiveProfilesScroll']) {
  if (!page.includes(section)) add(`src/app/page.jsx: required homepage composition missing ${section}`);
}
if (!page.includes("import './home.css'")) add('src/app/page.jsx: canonical homepage stylesheet is not loaded');

const motion = existing.find((x) => x.file === 'src/styles/motion.css')?.text || '';
for (const token of ['--motion-micro','--motion-standard','--motion-emphasis','--motion-reveal','--motion-section','--motion-ease']) {
  if (!motion.includes(token)) add(`src/styles/motion.css: missing canonical token ${token}`);
}
if (!motion.includes('prefers-reduced-motion')) add('src/styles/motion.css: reduced-motion contract missing');
if (motion.includes('transition: all') || motion.includes('animation: all')) add('src/styles/motion.css: broad all-property animation/transition is prohibited');

const homepage = existing.filter(({ file }) => homepageFiles.includes(file));
for (const { file, text } of homepage) {
  if (file !== 'src/styles/motion.css' && /<style(?:\s|>)/i.test(text)) {
    add(`${file}: homepage component contains an inline <style> block; move presentation/motion to canonical stylesheets`);
  }
}
const globals = existing.find((x) => x.file === 'src/styles/globals.css')?.text || '';
if (/\.reveal\s*\{|@keyframes\s+fade-up|\.au\s*\{[^}]*animation/i.test(globals)) {
  add('src/styles/globals.css: legacy reveal/entrance motion competes with canonical motion.css');
}
const homeCss = existing.find((x) => x.file === 'src/app/home.css')?.text || '';
if (/\b(?:transition|animation)\s*:/i.test(homeCss)) add('src/app/home.css: motion declarations must live in src/styles/motion.css');
if (/@keyframes\s+(scrollBounce|heroSlideFade)/.test(homeCss)) {
  add('src/app/home.css: legacy hero keyframes compete with canonical motion.css');
}

const negativeMargin = existing.filter(({ file, text }) => homepageFiles.includes(file) && /margin(?:-(?:top|right|bottom|left))?\s*:\s*-\\d/.test(text));
for (const { file } of negativeMargin) add(`${file}: negative margin detected; justify or remove before production`);

if (violations.length) {
  console.error('\nValoria design check FAILED\n');
  for (const violation of [...new Set(violations)]) console.error('• ' + violation);
  process.exit(1);
}
console.log('Valoria design check passed.');
