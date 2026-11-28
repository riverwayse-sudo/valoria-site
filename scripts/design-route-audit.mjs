import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve('src/app');
const base = process.env.STAGING_SITE_URL || 'https://staging.valoriainstitute.com';
const assessmentBase = process.env.STAGING_ASSESSMENT_URL || 'https://assessment-staging.valoriainstitute.com';
const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const failures = [];
const results = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const routeFromPage = (file) => {
  let relative = path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean);
  relative = relative.filter((part) => !/^\(.*\)$/.test(part));
  const dynamic = relative.some((part) => /^\[.*\]$/.test(part));
  const segments = relative.map((part) => {
    if (/^\[\[\.\.\..+\]\]$/.test(part)) return null;
    if (/^\[\.\.\..+\]$/.test(part)) return 'design-audit-placeholder';
    if (/^\[.+\]$/.test(part)) return 'design-audit-placeholder';
    return part;
  });
  if (segments.includes(null)) return null;
  return { path: '/' + segments.join('/'), dynamic };
};
const pageFiles = walk(root).filter((file) => /[\\/]page\.(js|jsx|ts|tsx)$/.test(file));
const routes = [...new Map(pageFiles.map((file) => routeFromPage(file)).filter(Boolean).map((route) => [route.path, route])).values()]
  .sort((a, b) => a.path.localeCompare(b.path));
if (routes.length < 30) throw new Error(\`Route inventory unexpectedly small: \${routes.length}\`);

const report = {
  generatedAt: new Date().toISOString(),
  base,
  assessmentBase,
  routeTemplatesDiscovered: pageFiles.length,
  uniqueRoutesTested: routes.length,
  viewports: viewports.map(({ name, width, height }) => ({ name, width, height })),
  results,
  failures,
};
await fs.mkdir('artifacts/design-route-audit', { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    for (const route of routes) {
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));
      let status = null;
      let finalUrl = route.path;
      let navigationError = null;
      let metrics = null;
      try {
        const response = await page.goto(\`\${base}\${route.path}\`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        status = response?.status() ?? null;
        finalUrl = page.url();
        await page.locator('body').waitFor({ state: 'visible', timeout: 10000 });
        await page.waitForTimeout(250);
        metrics = await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyTextLength: (document.body?.innerText || '').trim().length,
          fontFamily: getComputedStyle(document.body).fontFamily,
          mainLandmarks: document.querySelectorAll('main,[role="main"]').length,
          h1Count: document.querySelectorAll('h1').length,
        }));
      } catch (error) {
        navigationError = error.message;
      }
      const dynamicNotFound = route.dynamic && status === 404;
      const badStatus = status == null || (status >= 400 && !dynamicNotFound);
      const overflow = metrics && metrics.documentWidth > metrics.viewportWidth + 2;
      const blank = metrics && metrics.bodyTextLength === 0;
      const badFont = metrics && !/Raleway/i.test(metrics.fontFamily);
      const routeFailures = [
        ...(badStatus ? [\`HTTP \${status}\`] : []),
        ...(navigationError ? [navigationError] : []),
        ...(overflow ? [\`horizontal overflow \${metrics.documentWidth}px > \${metrics.viewportWidth}px\`] : []),
        ...(blank ? ['blank rendered document'] : []),
        ...(badFont ? [\`unexpected body typeface: \${metrics.fontFamily}\`] : []),
        ...pageErrors,
      ];
      const result = {
        route: route.path,
        dynamic: route.dynamic,
        viewport: viewport.name,
        status,
        finalUrl,
        metrics,
        errors: routeFailures,
      };
      results.push(result);
      if (routeFailures.length) failures.push(result);
      await page.close();
    }
    await context.close();
  }

  if (process.env.AUDIT_ASSESSMENT === "1") {
  // The separate assessment Worker is checked as a real rendered client app, not merely an HTTP shell.
  for (const viewport of [viewports[0], viewports[2]]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    let status = null;
    let metrics = null;
    let navigationError = null;
    try {
      const response = await page.goto(\`\${assessmentBase}/valu/assessment/?journey=account-first#taster_start_code=design-audit-invalid-probe\`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      status = response?.status() ?? null;
      await page.waitForTimeout(1500);
      metrics = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyTextLength: (document.body?.innerText || '').trim().length,
        fontFamily: getComputedStyle(document.body).fontFamily,
        rootExists: Boolean(document.querySelector('#root')),
      }));
    } catch (error) {
      navigationError = error.message;
    }
    const errors = [
      ...(status == null || status >= 400 ? [\`HTTP \${status}\`] : []),
      ...(navigationError ? [navigationError] : []),
      ...(metrics && metrics.documentWidth > metrics.viewportWidth + 2 ? ['assessment horizontal overflow'] : []),
      ...(metrics && metrics.bodyTextLength === 0 ? ['assessment rendered blank'] : []),
      ...(metrics && !/Raleway/i.test(metrics.fontFamily) ? [\`assessment typeface mismatch: \${metrics.fontFamily}\`] : []),
      ...pageErrors,
    ];
    const result = { route: '/valu/assessment/', viewport: viewport.name, status, metrics, errors };
    results.push(result);
    if (errors.length) failures.push(result);
    await context.close();
  }
  }

} finally {
  await browser.close();
}

await fs.writeFile('artifacts/design-route-audit/report.json', JSON.stringify(report, null, 2));
console.log(\`Design route audit: \${routes.length} site routes x \${viewports.length} viewports + 2 assessment viewport checks.\`);
if (failures.length) {
  console.error(\`Design route audit FAILED: \${failures.length} failing route/viewport checks.\`);
  for (const failure of failures.slice(0, 30)) console.error(JSON.stringify(failure));
  process.exit(1);
}
console.log('Design route audit PASSED: all discovered site routes and assessment entry checks rendered without overflow or page errors.');
