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
    violations.push('public profile route must use the consent-verified server projection');
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

// Public profile privacy is a release-critical invariant: only consent-verified
// public profiles may be rendered or indexed, and private fields stay server-side.
const publicProfilePath = path.join(root, 'src/lib/public-profile.js');
if (!fs.existsSync(publicProfilePath)) {
  violations.push('consent-verified public profile access helper missing');
} else {
  const publicProfile = fs.readFileSync(publicProfilePath, 'utf8');
  for (const required of [
    'professional_profile_acknowledgements',
    'PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION',
    "acknowledgement_type', 'profile_submission'",
    "acknowledgement_version', PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION",
    "visibility', 'public'",
    "listing_status', 'listed'",
    "is_test', false",
    ".is('revoked_at', null)",
  ]) {
    if (!publicProfile.includes(required)) violations.push('public profile helper missing consent/visibility invariant: ' + required);
  }
  const publicFields = publicProfile.match(/const PUBLIC_PROFILE_FIELDS = \[([\s\S]*?)\]\.join/);
  if (publicFields && /'phone'|'username'|'cv_url'|'cv_summary'|'salary_expectation'|'fee_range'/.test(publicFields[1])) {
    violations.push('public profile projection includes a private contact, CV or compensation field');
  }
}
if (fs.existsSync(profileRoutePath)) {
  const route = fs.readFileSync(profileRoutePath, 'utf8');
  if (!route.includes('getConsentVerifiedPublicProfile')) {
    violations.push('public profile route must use the consent-verifying server helper');
  }
}
const profileLayoutPath = path.join(root, 'src/app/profile/[id]/layout.jsx');
if (fs.existsSync(profileLayoutPath)) {
  const layout = fs.readFileSync(profileLayoutPath, 'utf8');
  if (!layout.includes('getConsentVerifiedPublicProfile')) {
    violations.push('public profile metadata must use the consent-verifying server helper');
  }
}
const sitemapPath = path.join(root, 'src/app/sitemap.js');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (!sitemap.includes('getConsentVerifiedPublicProfileSitemapRows')) {
    violations.push('sitemap must include only consent-verified public profiles');
  }
}
if (fs.existsSync(profileClientPath)) {
  const client = fs.readFileSync(profileClientPath, 'utf8');
  if (!client.includes('if (!user || user.id !== id)')) {
    violations.push('public profile client must not fall back to broad anonymous profile reads');
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
  if (!registry.includes('vi-scroll-track-static') ||
      !registry.includes('getMarketplaceRows')) {
    violations.push('LiveProfilesScroll: public profiles must render from the verified, deduplicated server roster');
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
