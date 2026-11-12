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
    "acknowledgement?.acknowledgement_version !== PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION",
    ".order('acknowledged_at', { ascending: false })",
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
  if (!registry.includes('vi-scroll-group') ||
      !registry.includes('getMarketplaceDirectoryData') ||
      !registry.includes('[false, true].map((isClone)') ||
      !registry.includes('tabIndex={isClone ? -1 : undefined}')) {
    violations.push('LiveProfilesScroll: public profiles must retain the verified roster and an accessible duplicated rail for continuous motion');
  }
  const motionPath = path.join(root, 'src/styles/motion.css');
  const motion = fs.existsSync(motionPath) ? fs.readFileSync(motionPath, 'utf8') : '';
  if (!motion.includes('.vi-scroll-track { animation: vi-scroll-x var(--motion-registry-loop) linear infinite;')) {
    violations.push('LiveProfilesScroll: continuous registry animation must use the canonical motion system');
  }
}
const navPath = path.join(root, 'src/components/Nav.jsx');
if (fs.existsSync(navPath)) {
  const nav = fs.readFileSync(navPath, 'utf8');
  if (/label:\s*['"]START VALU['"]|What is VALU\?/i.test(nav)) {
    violations.push('Nav: use the canonical VALU Index name, not standalone VALU naming');
  }
}
// Public content must explain the VALU journey without exposing internal assessment mechanics.
const valuStartPath = path.join(root, 'src/app/valu/start/page.jsx');
const signupPath = path.join(root, 'src/app/signup/page.jsx');
const aboutPath = path.join(root, 'src/app/about/page.jsx');
const programmesPath = path.join(root, 'src/app/programmes/page.jsx');
if (fs.existsSync(valuStartPath)) {
  const valuStart = fs.readFileSync(valuStartPath, 'utf8');
  if (!valuStart.includes('Create your Valoria account and confirm your email before beginning the Taster') || !valuStart.includes('Your official result in points') || !valuStart.includes('VALU Index')) {
    violations.push('VALU entry page must explain the taster value and the official VALU Index');
  }
  if (/The 9-question taster is separate from the 58-question full VALU assessment|Valoria has two separate assessment stages|Two separate assessments/i.test(valuStart)) {
    violations.push('VALU entry page must not expose internal assessment separation mechanics');
  }
  if (/Question\s+\d+\s+of\s+\d+/i.test(valuStart)) {
    violations.push('VALU entry page must not display question-count progress labels');
  }
  if (!/\b(?:START|TAKE) THE VALU INDEX TASTER\b/.test(valuStart) || !/points/i.test(valuStart)) {
    violations.push('VALU entry page must label the VALU Index Taster CTA and show VALU Index results in points');
  }
}
if (fs.existsSync(signupPath)) {
  const signup = fs.readFileSync(signupPath, 'utf8');
  if (/Question 10|remaining 49|9 of 58/i.test(signup)) {
    violations.push('Signup page contains the retired combined-assessment journey');
  }
}
if (fs.existsSync(aboutPath)) {
  const about = fs.readFileSync(aboutPath, 'utf8');
  for (const statement of ['Vision', 'Mission', 'Purpose', 'An Africa where professional merit always finds its platform.', 'To bridge the gap between latent brilliance and institutional scale.']) {
    if (!about.includes(statement)) violations.push('About page is missing approved institutional foundation: ' + statement);
  }
}
const facilitatorsPath = path.join(root, 'src/app/facilitators/page.jsx');
const waitlistPath = path.join(root, 'src/components/WaitlistForm.jsx');
const publicLayoutPath = path.join(root, 'src/app/layout.jsx');
const publicServiceCopy = [programmesPath, facilitatorsPath, waitlistPath, publicLayoutPath];
for (const file of publicServiceCopy) {
  if (!fs.existsSync(file)) continue;
  const copy = fs.readFileSync(file, 'utf8');
  if (/\bPRIME[-\s]?certified\b|\bcertified facilitator(s)?\b|\bpre-assessed candidates\b|every profile is verified by the VALU Index/i.test(copy)) {
    violations.push(path.relative(root, file) + ': unsupported blanket assessment or facilitator certification claim');
  }
  if (/\b90\s*[- ]day\s+re[- ]?measurement\b|\bafter\s+90\s+days\b|\b90\s+days\s+out\b|retake.{0,40}90\s+days/i.test(copy)) {
    violations.push(path.relative(root, file) + ': fixed follow-up assessment timing must be agreed in programme scope');
  }
}

// Retired or unsupported public claims must not reappear in primary site copy.
const publicCopyPaths = [
  'src/app/page.jsx',
  'src/app/about/page.jsx',
  'src/app/prime/page.jsx',
  'src/app/valu/page.jsx',
  'src/app/valu/start/page.jsx',
  'src/app/programmes/page.jsx',
  'src/app/facilitators/page.jsx',
  'src/components/WaitlistForm.jsx',
  'src/app/layout.jsx',
  'src/app/about-us/page.jsx',
  'src/app/marketplace/page.jsx',
  'src/app/dashboard/page.jsx',
  'src/app/professional-signup/page.jsx',
  'src/app/profile/setup/page.jsx',
  'src/app/test/assessment/page.jsx',
  'src/components/VALUJourneyProgress.jsx',
  'src/components/HeroSlider.jsx',
  'src/components/MarketplaceDirectory.jsx',
];
const retiredPublicClaims = [
  [/Africa's human capital institution|human capital institution/i, 'retired institutional positioning'],
  [/Explore the Bureau/i, 'retired Bureau navigation'],
  [/21 professionals/i, 'unverified marketplace headcount'],
  [/\bPRIME[-\s]?certified\b|\bcertified facilitator(s)?\b/i, 'unverified facilitator certification'],
  [/pre-assessed candidates|every profile is verified by the VALU Index/i, 'unverified blanket assessment claim'],
  [/independently assessed/i, 'independent assessment claim before validation is complete'],
  [/Question 10|remaining 49|Questions 10–58/i, 'retired combined-assessment journey'],
  [/Question\s+\d+\s+of\s+\d+/i, 'question-count progress label must not appear in public copy'],
  [/The 9-question taster is separate from the 58-question full VALU assessment|Valoria has two separate assessment stages|Two separate assessments/i, 'internal assessment separation mechanics must not appear in public copy'],
  // Canonical VALU merit tiers are approved public labels.
];
for (const relativePath of publicCopyPaths) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) continue;
  const text = fs.readFileSync(absolutePath, 'utf8');
  for (const [pattern, label] of retiredPublicClaims) {
    if (pattern.test(text)) violations.push(relativePath + ': ' + label + ' must not appear in public copy');
  }
}

// Site-wide left alignment is a production requirement, including desktop dropdowns and mobile navigation.
const globalStylesPath = path.join(root, 'src/styles/globals.css');
const rootLayoutPath = path.join(root, 'src/app/layout.jsx');
const navigationPath = path.join(root, 'src/components/Nav.jsx');
if (!fs.existsSync(globalStylesPath) || !fs.existsSync(rootLayoutPath) || !fs.existsSync(navigationPath)) {
  violations.push('main website global alignment contract is missing its stylesheet, root layout or navigation component');
} else {
  const globalStyles = fs.readFileSync(globalStylesPath, 'utf8');
  const rootLayout = fs.readFileSync(rootLayoutPath, 'utf8');
  const navigation = fs.readFileSync(navigationPath, 'utf8');
  if (!rootLayout.includes("import '../styles/globals.css'")) {
    violations.push('main website global alignment stylesheet must be loaded by the root layout');
  }
  if (!/html\s+body,\s*html\s+body \*\s*\{\s*text-align:\s*left\s*!important;/i.test(globalStyles)) {
    violations.push('all main website page content must inherit the left-alignment contract');
  }
  for (const selector of ['.nav-dropdown', '.nav-dropdown-grid', '.nav-dropdown-link', '.nav-dropdown-description', '.nav-mobile', '.nav-mobile-link']) {
    if (!globalStyles.includes(selector) || !navigation.includes(selector.slice(1))) {
      violations.push('desktop/mobile navigation alignment contract missing: ' + selector);
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
