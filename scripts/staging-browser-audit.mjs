import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const SITE = process.env.STAGING_SITE_URL || 'https://staging.valoriainstitute.com'
const ASSESSMENT = process.env.STAGING_ASSESSMENT_URL || 'https://assessment-staging.valoriainstitute.com'
const OUT = path.resolve('artifacts/staging-browser-audit')
const viewports = [
  { name: 'desktop', width: 1440, height: 960, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
]
const routes = [
  { name: 'homepage', url: `${SITE}/`, site: true },
  { name: 'marketplace', url: `${SITE}/marketplace`, site: true },
  { name: 'events', url: `${SITE}/events`, site: true },
  { name: 'valu', url: `${SITE}/valu`, site: true },
  { name: 'valu-start', url: `${SITE}/valu/start`, site: true },
  { name: 'prime', url: `${SITE}/prime`, site: true },
  { name: 'about', url: `${SITE}/about-us`, site: true },
  { name: 'dashboard-preview', url: `${SITE}/dashboard?preview=1`, site: true },
  { name: 'assessment-proxy', url: `${SITE}/valu/assessment/`, site: true },
  { name: 'assessment-host', url: `${ASSESSMENT}/`, site: false },
]
const report = {
  generatedAt: new Date().toISOString(),
  environment: 'Cloudflare staging only',
  site: SITE,
  assessment: ASSESSMENT,
  viewports: viewports.map(({name,width,height}) => ({name,width,height})),
  results: [],
  failures: [],
}
await fs.mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true })

try {
  for (const route of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        isMobile: viewport.isMobile,
        hasTouch: viewport.isMobile,
      })
      const page = await context.newPage()
      const pageErrors = []
      const consoleErrors = []
      const forbiddenRequests = []
      page.on('pageerror', error => pageErrors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })
      page.on('request', request => {
        const url = request.url()
        if (
          url.includes('sbkgpisgkuhbalsxqkdr.supabase.co') ||
          url.includes('assessment.valoriainstitute.com') ||
          url.includes('valoria-assessment.riverwayse.workers.dev') ||
          url.includes('valoria-platform.riverwayse.workers.dev')
        ) forbiddenRequests.push(url)
      })

      let status = null
      let navigationError = null
      try {
        const response = await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        status = response?.status() ?? null
        await page.waitForTimeout(1800)
      } catch (error) {
        navigationError = error.message
      }

      const state = await page.evaluate(() => {
        const robots = document.querySelector('meta[name="robots"]')?.content || ''
        const banner = document.querySelector('.staging-site-banner')?.innerText ||
          (document.body.innerText.includes('STAGING PREVIEW') ? 'STAGING PREVIEW' : '')
        const navBrand = document.querySelector('a[aria-label="Valoria Institute home"]')?.href || ''
        const navDashboard = [...document.querySelectorAll('a')].find(a => /return to dashboard/i.test(a.innerText))?.href || ''
        const literalNewlineVisible = document.body.innerText.includes(String.fromCharCode(92, 110))
        const track = document.querySelector('.vi-scroll-track')
        const panel = document.querySelector('.hero-event-panel')
        const overflowingCards = [...document.querySelectorAll('[class*="card"]')]
          .filter(el => {
            const style = getComputedStyle(el)
            return (style.overflow === 'hidden' || style.overflowY === 'hidden' || style.overflow === 'clip') &&
              (el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4)
          }).length
        return {
          title: document.title,
          robots,
          banner,
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
          scrollAnimation: track ? {
            name: getComputedStyle(track).animationName,
            playState: getComputedStyle(track).animationPlayState,
          } : null,
          eventPanel: panel ? {
            width: Math.round(panel.getBoundingClientRect().width),
            clientWidth: panel.clientWidth,
            scrollWidth: panel.scrollWidth,
            clipsContent: panel.scrollWidth > panel.clientWidth + 2,
          } : null,
          overflowingCards,
          analyticsLoaded: Boolean(window.gtag || window.fbq),
          literalNewlineVisible,
          assessmentSiteLinks: [navBrand, navDashboard].filter(Boolean),
        }
      })

      const filename = `${route.name}-${viewport.name}.png`
      await page.screenshot({ path: path.join(OUT, filename), fullPage: true })
      const result = {
        route: route.name,
        url: route.url,
        viewport: viewport.name,
        status,
        navigationError,
        ...state,
        pageErrors,
        consoleErrors,
        forbiddenRequests,
        screenshot: filename,
      }
      report.results.push(result)

      if (navigationError) report.failures.push(`${route.name}/${viewport.name}: navigation failed: ${navigationError}`)
      if (status === null || status >= 400) report.failures.push(`${route.name}/${viewport.name}: HTTP ${status}`)
      if (state.horizontalOverflow) report.failures.push(`${route.name}/${viewport.name}: horizontal overflow`)
      if (!state.robots.toLowerCase().includes('noindex')) report.failures.push(`${route.name}/${viewport.name}: staging page is missing noindex robots metadata`)
      if (!state.banner.includes('STAGING PREVIEW')) report.failures.push(`${route.name}/${viewport.name}: staging banner is missing`)
      if (state.analyticsLoaded) report.failures.push(`${route.name}/${viewport.name}: production analytics loaded in staging`)
      if (forbiddenRequests.length) report.failures.push(`${route.name}/${viewport.name}: production Supabase/assessment request detected`)
      if (state.literalNewlineVisible && route.name.startsWith('assessment-')) report.failures.push(`${route.name}/${viewport.name}: literal \\n text is visible in the assessment UI`)
      if (route.name.startsWith('assessment-') && state.assessmentSiteLinks.some(href => {
        try { return ['valoriainstitute.com', 'www.valoriainstitute.com'].includes(new URL(href).hostname) } catch { return false }
      })) report.failures.push(`${route.name}/${viewport.name}: assessment navigation points to production site`)
      if (pageErrors.length) report.failures.push(`${route.name}/${viewport.name}: browser page errors detected`)
      if (state.eventPanel?.clipsContent) report.failures.push(`${route.name}/${viewport.name}: event card clips content`)

      await context.close()
    }
  }

  // Fresh-session participant acceptance: no resume token or pending taster
  // must lead directly to registration without contacting progress APIs.
  const freshContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  })
  const freshPage = await freshContext.newPage()
  const freshPageErrors = []
  const freshConsoleErrors = []
  const progressRequests = []
  const forbiddenFreshRequests = []
  freshPage.on('pageerror', error => freshPageErrors.push(error.message))
  freshPage.on('console', message => {
    if (message.type() === 'error') freshConsoleErrors.push(message.text())
  })
  freshPage.on('request', request => {
    const url = request.url()
    if (url.includes('/api/taster-progress')) progressRequests.push(url)
    if (
      url.includes('sbkgpisgkuhbalsxqkdr.supabase.co') ||
      url.includes('assessment.valoriainstitute.com') ||
      url.includes('valoria-assessment.riverwayse.workers.dev') ||
      url.includes('valoria-platform.riverwayse.workers.dev')
    ) forbiddenFreshRequests.push(url)
  })
  await freshPage.addInitScript(() => {
    try {
      localStorage.removeItem('pending_taster_id')
      localStorage.removeItem('valu_taster_resume_token')
      localStorage.removeItem('valu_taster_signup_key')
      sessionStorage.clear()
    } catch {}
  })

  let freshStatus = null
  let freshNavigationError = null
  let registrationVisible = false
  let marketingConsentChecked = null
  let privacyCheckboxRequired = null
  try {
    const response = await freshPage.goto(ASSESSMENT, { waitUntil: 'domcontentloaded', timeout: 60000 })
    freshStatus = response?.status() ?? null
    await freshPage.getByRole('button', { name: /CONTINUE TO MY VALU TASTER/ }).waitFor({ state: 'visible', timeout: 20000 })
    registrationVisible = await freshPage.getByPlaceholder('Your full professional name').isVisible()
    marketingConsentChecked = await freshPage.getByRole('checkbox').nth(1).isChecked()
    privacyCheckboxRequired = await freshPage.getByRole('checkbox').nth(0).evaluate(element => element.required)
  } catch (error) {
    freshNavigationError = error.message
  }

  const freshScreenshot = 'fresh-taster-registration-desktop.png'
  await freshPage.screenshot({ path: path.join(OUT, freshScreenshot), fullPage: true })
  report.results.push({
    route: 'fresh-taster-registration',
    url: ASSESSMENT,
    viewport: 'desktop',
    status: freshStatus,
    navigationError: freshNavigationError,
    registrationVisible,
    marketingConsentChecked,
    privacyCheckboxRequired,
    progressRequests,
    forbiddenRequests: forbiddenFreshRequests,
    pageErrors: freshPageErrors,
    consoleErrors: freshConsoleErrors,
    screenshot: freshScreenshot,
  })
  if (freshNavigationError) report.failures.push(`fresh-taster-registration: ${freshNavigationError}`)
  if (freshStatus === null || freshStatus >= 400) report.failures.push(`fresh-taster-registration: HTTP ${freshStatus}`)
  if (!registrationVisible) report.failures.push('fresh-taster-registration: a fresh session did not reach registration')
  if (marketingConsentChecked !== false) report.failures.push('fresh-taster-registration: optional marketing consent is not unchecked by default')
  if (privacyCheckboxRequired !== true) report.failures.push('fresh-taster-registration: privacy acknowledgement is not required')
  if (progressRequests.length) report.failures.push('fresh-taster-registration: fresh session unexpectedly called the progress API')
  if (forbiddenFreshRequests.length) report.failures.push('fresh-taster-registration: production Supabase/assessment request detected')
  if (freshPageErrors.length) report.failures.push('fresh-taster-registration: browser page errors detected')
  await freshContext.close()
} finally {
  await browser.close()
}

await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pages: report.results.length, failures: report.failures, output: OUT }, null, 2))
if (report.failures.length) process.exitCode = 1

// Re-run after the staging assessment Worker refresh so the current deployed banner and form are captured.
