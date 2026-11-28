#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const failures = [];
const requireText = (file, patterns, label) => {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    failures.push(\`Missing required \${label || 'file'}: \${file}\`);
    return '';
  }
  const text = fs.readFileSync(full, 'utf8');
  for (const pattern of patterns) {
    if (!pattern.test(text)) failures.push(\`\${file}: missing required contract \${pattern}\`);
  }
  return text;
};
const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
};

const layout = requireText('src/app/layout.jsx', [
  /styles\/globals\.css/,
  /styles\/motion\.css/,
  /styles\/design-constitution\.css/,
], 'global application layout');
const globals = requireText('src/styles/globals.css', [
  /Raleway/,
  /--vi-font-family:\s*'Raleway'/,
], 'global typography contract');
requireText('src/styles/design-constitution.css', [
  /--vi-color-midnight:\s*#1A1A2E/i,
  /--vi-color-gold:\s*#C9A84C/i,
  /--vi-color-slate:\s*#2E2E4A/i,
  /--vi-color-parchment:\s*#F7F4EE/i,
  /--vi-color-linen:\s*#EDE8DC/i,
  /--vi-color-brass:\s*#D4C9A8/i,
  /--vi-color-ivory:\s*#FAFAF7/i,
  /--vi-target-min:\s*48px/,
], 'canonical design tokens');
const motion = requireText('src/styles/motion.css', [
  /--motion-micro/,
  /--motion-standard/,
  /--motion-emphasis/,
  /--motion-reveal/,
  /--motion-section/,
  /--motion-ease/,
  /prefers-reduced-motion:\s*reduce/,
  /hover\s*:\s*hover/,
  /pointer\s*:\s*fine/,
], 'canonical motion system');
requireText('MOTION_CONSTITUTION.md', [
  /Reduced motion is a release requirement/i,
  /One interaction has one dominant movement/i,
  /No page-specific motion hacks/i,
], 'motion governance');

const appRoot = path.join(root, 'src/app');
const routeFiles = walk(appRoot).filter((file) => /[\\/](page|route)\.(js|jsx|ts|tsx)$/.test(file));
const relativeRoutes = routeFiles.map((file) => path.relative(root, file).replaceAll(path.sep, '/'));
if (routeFiles.length < 35) {
  failures.push(\`Route coverage unexpectedly low: found \${routeFiles.length} page/route entrypoints; expected at least 35.\`);
}

const requiredRoutes = [
  'src/app/page.jsx',
  'src/app/about-us/page.jsx',
  'src/app/valu/page.jsx',
  'src/app/valu/register/page.jsx',
  'src/app/valu/start/page.jsx',
  'src/app/valu/confirm-taster/page.jsx',
  'src/app/valu/assessment/[[...path]]/route.js',
  'src/app/auth/callback/page.jsx',
  'src/app/login/page.jsx',
  'src/app/signup/page.jsx',
  'src/app/dashboard/page.jsx',
  'src/app/marketplace/page.jsx',
  'src/app/profile/[id]/page.jsx',
];
for (const route of requiredRoutes) {
  if (!relativeRoutes.includes(route)) failures.push(\`Required user-journey route is missing from the application: \${route}\`);
}

if (!layout.includes('styles/motion.css') || !layout.includes('styles/design-constitution.css')) {
  failures.push('The root layout must load the canonical design and motion systems for every route.');
}
if (!globals.includes('Raleway')) failures.push('The global type system must retain the approved Raleway typeface.');
if (/DM Mono|Space Grotesk|Inter|Montserrat/i.test(globals)) {
  failures.push('A non-approved display/body typeface was introduced into the global site typography layer.');
}
if (/transition\s*:\s*all\b/i.test(motion) || /animation\s*:\s*all\b/i.test(motion)) {
  failures.push('The canonical motion layer must not animate all properties.');
}

const allSource = walk(path.join(root, 'src')).filter((file) => /\.(css|jsx|js|ts|tsx)$/.test(file));
const sourceText = allSource.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const runtime of [/from ['"]gsap['"]/, /from ['"]lenis['"]/, /from ['"]animejs['"]/, /from ['"]motion(?:\/react)?['"]/]) {
  if (runtime.test(sourceText)) failures.push(\`Non-canonical motion runtime detected: \${runtime}\`);
}

if (failures.length) {
  console.error('Valoria full-surface design enforcement FAILED.');
  failures.forEach((failure) => console.error(' - ' + failure));
  process.exit(1);
}

console.log(\`Valoria full-surface design enforcement PASSED: \${routeFiles.length} page/route entrypoints inherit the canonical site design and motion layers.\`);
console.log('Protected journey coverage: registration, taster, confirmation, assessment, dashboard, marketplace and professional profiles.');
