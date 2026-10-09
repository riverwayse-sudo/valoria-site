#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredDocs = [
  'DESIGN_CONSTITUTION.md',
  'MOTION_CONSTITUTION.md',
  'docs/FINAL_QA_GATE.md',
  'docs/PRODUCTION_PARITY_GATE.md',
  'docs/AUTHENTICATION_SECURITY.md',
];
const violations = [];

for (const file of requiredDocs) {
  if (!fs.existsSync(path.join(root, file))) violations.push(`missing excellence control document: ${file}`);
}

const sourceRoots = ['src/app', 'src/components', 'src/lib', 'src/styles'];
for (const dir of sourceRoots) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) continue;
  const walk = current => fs.readdirSync(current, {withFileTypes:true}).flatMap(e => {
    const full = path.join(current,e.name);
    return e.isDirectory() ? walk(full) : /\.(js|jsx|ts|tsx|css)$/.test(e.name) ? [full] : [];
  });
  for (const file of walk(absolute)) {
    const text = fs.readFileSync(file,'utf8');
    const isClientModule = /^['\"]use client['\"]/m.test(text);
    if (isClientModule && /service_role|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/i.test(text)) {
      violations.push(`${path.relative(root,file)}: privileged Supabase credential reference in a client module`);
    }
  }
}

// Runtime regression guards for the public profile route. Next's production
// build does not reliably catch unresolved identifiers in client components,
// so keep these critical route invariants explicit and run them in CI.
const profileRoutePath = path.join(root, 'src/app/profile/[id]/page.jsx');
const profileClientPath = path.join(root, 'src/app/profile/[id]/ProfileClient.jsx');
if (!fs.existsSync(profileRoutePath)) {
  violations.push('public profile route missing: src/app/profile/[id]/page.jsx');
}
if (!fs.existsSync(profileClientPath)) {
  violations.push('public profile client missing: src/app/profile/[id]/ProfileClient.jsx');
}
if (fs.existsSync(profileRoutePath)) {
  const route = fs.readFileSync(profileRoutePath, 'utf8');
  if (!/const\s*\{\s*id\s*\}\s*=\s*await\s+params\b/.test(route)) {
    violations.push('public profile route must await Next.js 15 async params before reading id');
  }
  if (!/const\s+resolvedSearchParams\s*=\s*await\s+searchParams\b/.test(route)) {
    violations.push('public profile route must await Next.js 15 async searchParams');
  }
  if (!/\.eq\(\s*['"]visibility['"]\s*,\s*['"]public['"]\s*\)/.test(route) ||
      !/\.eq\(\s*['"]listing_status['"]\s*,\s*['"]listed['"]\s*\)/.test(route)) {
    violations.push('public profile route must enforce public visibility and listed status');
  }
  if (/\.eq\(\s*['"]profile_complete['"]/.test(route)) {
    violations.push('public profile route must not confuse profile completion with public listing eligibility');
  }
  if (!/return\s*<ProfileClient\b/.test(route) || !/initialProfile=\{initialProfile\}/.test(route)) {
    violations.push('public profile route must pass its server-fetched profile into ProfileClient');
  }
}
if (fs.existsSync(profileClientPath)) {
  const client = fs.readFileSync(profileClientPath, 'utf8');
  // Helpers invoked by the profile client must remain declared in this module.
  // This catches the exact production crash: getAvatarLetters is not defined.
  for (const helper of ['getInitials', 'getAvatarLetters', 'getYouTubeId', 'rankedClusterStrengths']) {
    const invoked = new RegExp('\\b' + helper + '\\s*\\(').test(client);
    const declared = new RegExp('function\\s+' + helper + '\\s*\\(').test(client);
    if (invoked && !declared) violations.push('ProfileClient references missing helper: ' + helper);
  }
  for (const component of ['PrimeRadarChart', 'Section']) {
    if (!new RegExp('function\\s+' + component + '\\s*\\(').test(client)) {
      violations.push('ProfileClient component/helper missing: ' + component);
    }
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if (!pkg.scripts?.['design:check']) violations.push('package.json: design:check gate missing');
if (!fs.existsSync(path.join(root, 'src/lib/password-policy.js'))) violations.push('authentication control missing: src/lib/password-policy.js');
if (!pkg.scripts?.test) violations.push('package.json: test gate missing');

if (violations.length) {
  console.error('Valoria excellence check FAILED');
  for (const v of [...new Set(violations)]) console.error('• '+v);
  process.exit(1);
}
console.log('Valoria excellence static gate passed.');
