#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredDocs = [
  'DESIGN_CONSTITUTION.md',
  'MOTION_CONSTITUTION.md',
  'docs/FINAL_QA_GATE.md',
  'docs/PRODUCTION_PARITY_GATE.md',
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

const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if (!pkg.scripts?.['design:check']) violations.push('package.json: design:check gate missing');
if (!pkg.scripts?.test) violations.push('package.json: test gate missing');

if (violations.length) {
  console.error('Valoria excellence check FAILED');
  for (const v of [...new Set(violations)]) console.error('• '+v);
  process.exit(1);
}
console.log('Valoria excellence static gate passed.');
