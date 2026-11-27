const fs = require('fs');
const path = require('path');

const auditScript = fs.readFileSync(
  path.join(__dirname, '../../scripts/staging-browser-audit.mjs'),
  'utf8'
);
const stagingWorkflow = fs.readFileSync(
  path.join(__dirname, '../../.github/workflows/cloudflare-current-site-staging.yml'),
  'utf8'
);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);

describe('staging WCAG audit contract', () => {
  test('axe-core is installed only in the staging audit job, not application dependencies', () => {
    expect(stagingWorkflow).toContain('axe-core@4.10.3');
    expect(auditScript).toContain('wcag22aa');
    expect(auditScript).toContain('accessibilityRoutes');
    expect(packageJson.dependencies).not.toHaveProperty('axe-core');
    expect(packageJson.devDependencies).not.toHaveProperty('axe-core');
  });

  test('serious and critical WCAG violations fail the staging audit', () => {
    expect(auditScript).toContain("['serious', 'critical']");
    expect(auditScript).toContain('report.failures.push');
  });
});
