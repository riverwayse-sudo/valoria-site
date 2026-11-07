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
  'src/components/HomepageEvents.jsx',
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
  if (file !== 'src/styles/motion.css' && /<style(?:\\s|>)/i.test(text)) {
    add(`${file}: homepage component contains an inline <style> block; move presentation/motion to canonical stylesheets`);
  }
  if (/style=\\{\\{[^}]*\\b(?:background|color|border|borderRadius|boxShadow)\\b/i.test(text)) {
    add(`${file}: homepage component contains inline visual styling; move colors, borders, radii and shadows to canonical stylesheets`);
  }
}
const globals = existing.find((x) => x.file === 'src/styles/globals.css')?.text || '';
if (/\.reveal\s*\{|@keyframes\s+fade-up|\.au\s*\{[^}]*animation/i.test(globals)) {
  add('src/styles/globals.css: legacy reveal/entrance motion competes with canonical motion.css');
}
const homeCss = existing.find((x) => x.file === 'src/app/home.css')?.text || '';
if (/text-align\s*:\s*center\b/i.test(homeCss) || /justify-items\s*:\s*center\b/i.test(homeCss)) {
  add('src/app/home.css: homepage content must remain left-aligned; centered text or grid alignment is prohibited');
}
if (/\b(?:transition|animation)\s*:/i.test(homeCss)) add('src/app/home.css: transition/animation declarations must live in src/styles/motion.css');
if (/@keyframes\s+/.test(homeCss)) add('src/app/home.css: keyframes are prohibited; motion.css is the sole animation authority');
const hero = existing.find((x) => x.file === 'src/components/HeroSlider.jsx')?.text || '';
if (/setInterval|hero-event-slide|hero-slider-controls/.test(hero)) {
  add('HeroSlider: institutional positioning must remain static; event promotion cannot rotate into the hero');
}
const homepageEvents = existing.find((x) => x.file === 'src/components/HomepageEvents.jsx')?.text || '';
if (/<iframe\b/i.test(homepageEvents)) add('HomepageEvents: do not embed an unverified video; use the branded replay link');
if (!page.includes('FOR FACILITATORS') || !page.includes('FOR EVENT ORGANISERS')) {
  add('src/app/page.jsx: facilitator and event organiser pathways must both be visible');
}
const navConfigPath = path.join(root, 'src/config/navigation.js');
if (fs.existsSync(navConfigPath)) {
  const navConfig = fs.readFileSync(navConfigPath, 'utf8');
  if (/58\s+questions|separate\s+9-question/i.test(navConfig)) {
    add('src/config/navigation.js: do not expose internal assessment mechanics in public navigation');
  }
  if (/Start the VALU Taster/i.test(navConfig)) {
    add('src/config/navigation.js: avoid duplicating the VALU entry CTA inside the navigation menu');
  }
}

const spacingTokens = ['--space-section','--space-section-tight','--space-content'];
for (const token of spacingTokens) if (!homeCss.includes(token)) add(`src/app/home.css: missing canonical homepage spacing token ${token}`);
if (!/\.home-redesign-root\s*>\s*section:not\(\.hero\)/.test(homeCss)) add('src/app/home.css: major homepage sections must inherit the canonical section-spacing rule');
if (!/\.home-redesign-root\s+\.container\s*\{/.test(homeCss)) add('src/app/home.css: homepage container contract is missing');

const negativeMargin = existing.filter(({ file, text }) => homepageFiles.includes(file) && /margin(?:-(?:top|right|bottom|left))?\s*:\s*-\\d/.test(text));
for (const { file } of negativeMargin) add(`${file}: negative margin detected; justify or remove before production`);

// Parallax is a bounded visual layer, not a second animation system.
const parallaxController = existing.find((x) => x.file === 'src/components/ParallaxController.jsx')?.text || '';
const layout = existing.find((x) => x.file === 'src/app/layout.jsx')?.text || '';
if (!layout.includes('ParallaxController') || !layout.includes('rootSelector="body"')) {
  add('src/app/layout.jsx: the shared parallax controller must be mounted once at the public-site root');
}
if (!parallaxController.includes("usePathname") || !parallaxController.includes("[rootSelector, pathname]")) {
  add('ParallaxController must rescan page atmospheres after App Router navigation');
}
if (!parallaxController.includes("addEventListener?.('change'") || !parallaxController.includes("removeEventListener?.('change'")) {
  add('ParallaxController must respond to runtime reduced-motion and pointer-preference changes');
}
if (!parallaxController.includes("prefers-reduced-motion: reduce") ||
    !parallaxController.includes('requestAnimationFrame') ||
    !parallaxController.includes('IntersectionObserver') ||
    !parallaxController.includes('MAX_PARALLAX_OFFSET') ||
    !parallaxController.includes('previousOffset') ||
    !parallaxController.includes('PAGE_ATMOSPHERE_SELECTOR')) {
  add('ParallaxController must respect reduced motion, schedule scroll work, observe visible layers, support public-page atmospheres and cap displacement');
}
if (!motion.includes('[data-parallax-speed]') || !motion.includes('prefers-reduced-motion: reduce') ||
    !motion.includes('.page-hero::before') || !motion.includes('.valu-hero::before')) {
  add('src/styles/motion.css: canonical parallax layers, public-page atmosphere and reduced-motion fallback are required');
}
const parallaxSources = existing.filter(({ file }) => ['src/app/page.jsx','src/components/HeroSlider.jsx'].includes(file));
for (const { file, text } of parallaxSources) {
  for (const match of text.matchAll(/data-parallax-speed=["']([^"']+)["']/g)) {
    const speed = Number(match[1]);
    if (!Number.isFinite(speed) || Math.abs(speed) > 0.16) {
      add(file + ': parallax speed must be numeric and no greater than 0.16 in magnitude');
    }
  }
}

if (violations.length) {
  console.error('\nValoria design check FAILED — production promotion blocked\n');
  for (const violation of [...new Set(violations)]) console.error('• ' + violation);
  process.exit(1);
}
console.log('Valoria design check passed — enforced systems are clean.');
