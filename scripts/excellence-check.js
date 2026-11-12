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
  if (!route.includes('getConsentVerifiedPublicProfile')) {
    violations.push('public profile route must delegate to the consent-verified server projection');
  }
  if (route.includes(".from('marketplace_public_roster')")) {
    violations.push('public profile route must not query the public roster directly');
  }
  if (route.includes(".from('professional_profiles')")) {
    violations.push('public profile route must not query the private professional_profiles table');
  }
  if (!route.includes('initialProfile')) {
    violations.push('public profile route must provide its consent-verified profile to ProfileClient');
  }
  if (/\.eq\(\s*['"]profile_complete['"]/.test(route)) {
    violations.push('public profile route must not confuse profile completion with public listing eligibility');
  }
  const passesServerFetchedProfile = route.includes('initialProfile={initialProfile}');
  if (!/<ProfileClient\b/.test(route) || !passesServerFetchedProfile) {
    violations.push('public profile route must pass its server-fetched profile into ProfileClient');
  }
}
const profileProjectionPath = path.join(root, 'src/lib/public-profile.js');
if (fs.existsSync(profileProjectionPath)) {
  const projection = fs.readFileSync(profileProjectionPath, 'utf8');
  if (!projection.startsWith("import 'server-only'")) violations.push('public profile projection must be server-only');
  for (const invariant of ["professional_profile_acknowledgements", "PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION", "listing_status", "revoked_at"]) {
    if (!projection.includes(invariant)) violations.push('public profile projection is missing consent/listing invariant: ' + invariant);
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

// Product-level regression guards for the VALU Index journey and looping registry.
const nudgePath = path.join(root, 'src/components/ValuCompletionNudge.jsx');
if (fs.existsSync(nudgePath)) {
  const nudge = fs.readFileSync(nudgePath, 'utf8');
  if (!/const fullAssessmentComplete\s*=\s*!!assessment\?\.completed_at/.test(nudge)) {
    violations.push('ValuCompletionNudge: full-assessment completion must not be gated by the 35-point listing threshold');
  }
  if (/fullAssessmentComplete\s*=\s*!!assessment\?\.completed_at\s*&&/.test(nudge)) {
    violations.push('ValuCompletionNudge: assessment completion and marketplace eligibility must remain separate states');
  }
  if (!nudge.includes('aria-labelledby="valu-nudge-title"') || !nudge.includes('closeButtonRef.current?.focus()')) {
    violations.push('ValuCompletionNudge: dialog must have an accessible title and move focus into the dialog');
  }
}
const registryPath = path.join(root, 'src/components/LiveProfilesScroll.jsx');
if (fs.existsSync(registryPath)) {
  const registry = fs.readFileSync(registryPath, 'utf8');
  const hasAccessibleMarqueeClones = (
    registry.includes('aria-hidden={index >= unique.length ? true : undefined}') &&
    registry.includes('tabIndex={index >= unique.length ? -1 : undefined}')
  ) || (
    registry.includes('aria-hidden={isClone}') &&
    registry.includes('tabIndex={isClone ? -1 : undefined}')
  );
  if (!hasAccessibleMarqueeClones) {
    violations.push('LiveProfilesScroll: decorative marquee duplicates must be hidden from assistive navigation');
  }
}
const navPath = path.join(root, 'src/components/Nav.jsx');
if (fs.existsSync(navPath)) {
  const nav = fs.readFileSync(navPath, 'utf8');
  if (/label:\s*['"]START VALU['"]|What is VALU\?/i.test(nav)) {
    violations.push('Nav: use the canonical VALU Index name, not standalone VALU naming');
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
