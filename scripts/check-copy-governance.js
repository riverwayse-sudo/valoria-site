#!/usr/bin/env node
/**
 * Lightweight guard: when a PR changes likely user-facing JSX copy, require
 * an accompanying Current Website Audit copy-change register update.
 * This is a traceability gate, not semantic approval of the wording.
 */
const { execFileSync } = require('node:child_process');

const base = process.env.GITHUB_BASE_REF;
if (!base) {
  console.error('COPY GOVERNANCE: GITHUB_BASE_REF is missing; run this check in a pull_request workflow.');
  process.exit(1);
}

const run = (args) => execFileSync('git', args, { encoding: 'utf8' });
const diff = run(['diff', '--unified=0', `origin/${base}...HEAD`]);
const changed = run(['diff', '--name-only', `origin/${base}...HEAD'])
  .split('\n')
  .filter(Boolean);

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

if (changedCopy.length === 0) {
  console.log('COPY GOVERNANCE: no likely user-facing copy edits detected.');
  process.exit(0);
}

const registerChanged = changed.some((path) =>
  /^docs\/CURRENT_SITE_COPY_CHANGE_REGISTER(?:_[A-Z0-9-]+)?\.md$/i.test(path)
);

if (!registerChanged) {
  console.error('COPY GOVERNANCE FAILED: likely user-facing copy changed, but no Current Website Audit copy-change register was updated.');
  console.error('Add docs/CURRENT_SITE_COPY_CHANGE_REGISTER_<PR>.md with exact before/after wording, audit section and PDF page, product/evidence check, and verification status.');
  process.exit(1);
}

console.log(`COPY GOVERNANCE: detected ${changedCopy.length} likely copy diff line(s); register update is present.`);
console.log('Human review against the Current Website Audit and product evidence remains mandatory.');
