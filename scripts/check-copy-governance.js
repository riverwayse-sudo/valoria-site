#!/usr/bin/env node
/**
 * Lightweight PR traceability guard for likely user-facing JSX copy edits.
 * It requires a Current Website Audit copy-change register update.
 * This is not semantic approval: a human must still review claims and evidence.
 */
const { execFileSync } = require('node:child_process');

const base = process.env.GITHUB_BASE_REF;
if (!base) {
  console.error('COPY GOVERNANCE: GITHUB_BASE_REF is missing; this check must run on pull_request.');
  process.exit(1);
}

const run = (args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try {
  run(['fetch', 'origin', base, '--no-tags']);
} catch (error) {
  console.error('COPY GOVERNANCE: unable to fetch the PR base branch:', error.stderr?.toString() || error.message);
  process.exit(1);
}

const range = `origin/${base}...HEAD`;
const diff = run(['diff', '--unified=0', range]);
const changedPaths = run(['diff', '--name-only', range]).split('\n').filter(Boolean);

const copyBearingLine = (line) => {
  const value = line.replace(/^\+/, '').replace(/^-/, '').trim();
  if (!value || value.startsWith('//') || value.startsWith('/*') || value.startsWith('*')) return false;
  return (
    /<[^>]+>[^<{]*[A-Za-z][^<{]*<\//.test(value) ||
    /\b(title|description|label|placeholder|aria-label|alt|content|headline|eyebrow|subtitle|buttonText|ctaText)\s*=\s*["'`][^"'`]{3,}["'`]/i.test(value) ||
    /\b(children|text)\s*:\s*["'`][^"'`]{3,}["'`]/i.test(value)
  );
};

const changedCopy = diff.split('\n').filter((line) =>
  (line.startsWith('+') || line.startsWith('-')) &&
  !line.startsWith('+++') && !line.startsWith('---') &&
  copyBearingLine(line)
);

console.log(`COPY GOVERNANCE: inspected ${changedPaths.length} changed file(s); detected ${changedCopy.length} likely copy diff line(s).`);

if (changedCopy.length === 0) {
  console.log('COPY GOVERNANCE: no likely user-facing copy edits detected.');
  process.exit(0);
}

const registerChanged = changedPaths.some((path) =>
  path.startsWith('docs/CURRENT_SITE_COPY_CHANGE_REGISTER') && path.endsWith('.md')
);

if (!registerChanged) {
  console.error('COPY GOVERNANCE FAILED: likely user-facing copy changed, but no Current Website Audit copy-change register was updated.');
  console.error('Changed paths:', changedPaths.join(', '));
  console.error('Add docs/CURRENT_SITE_COPY_CHANGE_REGISTER_<PR>.md with exact before/after wording, audit section and PDF page, product/evidence check, and verification status.');
  process.exit(1);
}

console.log('COPY GOVERNANCE: register update is present.');
console.log('Human review against the Current Website Audit and product evidence remains mandatory.');
