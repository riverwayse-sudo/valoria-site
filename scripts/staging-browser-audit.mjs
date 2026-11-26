// CI uses the Playwright headless shell and the runner's preinstalled browser libraries.
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const SITE = process.env.STAGING_SITE_URL || 'https://staging.valoriainstitute.com'
const ASSESSMENT = process.env.STAGING_ASSESSMENT_URL || 'https://assessment-staging.valoriainstitute.com'
const POST_TASTER_ID = '66666666-6666-4666-8666-666666666666'
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
  { name: 'valu-register', url: `${SITE}/valu/register`, site: true },
  { name: 'valu-register-legacy', url: `${SITE}/valu/register?journey=valu_taster`, site: true },
  { name: 'auth-confirm-legacy', url: `${SITE}/auth/confirm?token_hash=staging-probe-token&type=email&next=%2Fauth%2Fcallback%3Fvalu_taster%3D1`, site: true },
  { name: 'auth-confirm-post-taster', url: `${SITE}/auth/confirm?token_hash=staging-probe-token&type=email&next=%2Fauth%2Fcallback%3Fpending_taster_id%3D${POST_TASTER_ID}`, site: true },
  { name: 'professional-signup-account-first', url: `${SITE}/professional-signup/?taster_id=55555555-5555-4555-8555-555555555555&name=Staging%20Participant&role=Staging%20QA&account_first=1`, site: true },
  { name: 'professional-signup-post-taster', url: `${SITE}/professional-signup/?taster_id=${POST_TASTER_ID}&name=Staging%20Participant&role=Staging%20QA&experience=0-3&email=staging-participant%40example.invalid`, site: true },
  { name: 'prime', url: `${SITE}/prime`, site: true },
  { name: 'about', url: `${SITE}/about-us`, site: true },
  { name: 'assessment-legacy', url: `${SITE}/assessment`, site: true },
  { name: 'privacy-legacy', url: `${SITE}/privacy`, site: true },
  { name: 'terms-legacy', url: `${SITE}/terms`, site: true },
  { name: 'privacy-policy', url: `${SITE}/privacypolicy`, site: true },
  { name: 'terms-of-use', url: `${SITE}/terms-of-use`, site: true },
  { name: 'programmes', url: `${SITE}/programmes`, site: true },
  { name: 'develop-legacy', url: `${SITE}/develop`, site: true },
  { name: 'facilitators-legacy', url: `${SITE}/facilitators`, site: true },
  { name: 'valoria-develop-legacy', url: `${SITE}/valoria-develop`, site: true },
  { name: 'atb-connect-legacy', url: `${SITE}/atb-connect`, site: true },
  { name: 'atb-spotlight-legacy', url: `${SITE}/atb-spotlight`, site: true },
  { name: 'spotlight-legacy', url: `${SITE}/spotlight`, site: true },
  { name: 'marketplace-talent', url: `${SITE}/marketplace/talent`, site: true },
  { name: 'marketplace-speakers', url: `${SITE}/marketplace/speakers`, site: true },
  { name: 'marketplace-facilitators', url: `${SITE}/marketplace/facilitators`, site: true },
  { name: 'opportunities', url: `${SITE}/opportunities`, site: true },
  { name: 'opportunity-submit', url: `${SITE}/opportunities/submit`, site: true },
  { name: 'contact-us', url: `${SITE}/contact-us`, site: true },
  { name: 'careers', url: `${SITE}/careers`, site: true },
  { name: 'insights', url: `${SITE}/insights`, site: true },
  { name: 'login', url: `${SITE}/login`, site: true },
  { name: 'signup', url: `${SITE}/signup`, site: true },
  { name: 'register', url: `${SITE}/register`, site: true },
  { name: 'admin-reconciliation-unauthenticated', url: `${SITE}/admin/reconciliation`, site: true },
  { name: 'dashboard-preview', url: `${SITE}/dashboard?preview=1`, site: true },
  { name: 'assessment-proxy', url: `${SITE}/valu/assessment/`, site: true },
  { name: 'assessment-host', url: `${ASSESSMENT}/`, site: false },
  { name: 'assessment-account-first-taster-gate', url: `${ASSESSMENT}/valu/assessment/?journey=account-first#taster_start_code=staging-invalid-probe`, site: false },
]
const expectedRedirectPaths = {
  'assessment-legacy': '/valu',
  'privacy-legacy': '/privacypolicy',
  'terms-legacy': '/terms-of-use',
  'develop-legacy': '/programmes',
  'facilitators-legacy': '/programmes',
  'valoria-develop-legacy': '/programmes',
  'atb-connect-legacy': '/marketplace/talent',
  'atb-spotlight-legacy': '/marketplace/speakers',
  'spotlight-legacy': '/marketplace/speakers',
  'admin-reconciliation-unauthenticated': '/admin/login',
}
const report = {
  generatedAt: new Date().toISOString(),
  environment: 'Cloudflare staging only',
  site: SITE,
  assessment: ASSESSMENT,
  viewports: viewports.map(({name,width,height}) => ({name,width,height})),
  results: [],
  profileCardPreviews: [],
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
      let tasterHandoffExchangeAttempted = false
      page.on('pageerror', error => pageErrors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })
      page.on('request', request => {
        const url = request.url()
        const requestBody = request.postData() || ''
        if (request.method() === 'POST' && url.includes('/api/submit-assessment') &&
            requestBody.includes('exchange-taster-start-handoff')) {
          tasterHandoffExchangeAttempted = true
        }
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

      // Reveal scroll-triggered content before taking a full-page screenshot.
      // Full-page capture does not itself scroll through the page, so without
      // this pass legitimate sections remain opacity-hidden in visual evidence.
      await page.evaluate(async () => {
        const reveals = [...document.querySelectorAll('.reveal')]
        for (const element of reveals) {
          element.scrollIntoView({ block: 'center', behavior: 'auto' })
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        window.scrollTo({ top: 0, behavior: 'auto' })
      })
      await page.waitForTimeout(350)

      const state = await page.evaluate(() => {
        const robots = document.querySelector('meta[name="robots"]')?.content || ''
        const banner = document.querySelector('.staging-site-banner')?.innerText ||
          (document.body.innerText.includes('STAGING PREVIEW') ? 'STAGING PREVIEW' : '')
        const navBrand = document.querySelector('a[aria-label="Valoria Institute home"]')?.href || ''
        const navDashboard = [...document.querySelectorAll('a')].find(a => /return to dashboard/i.test(a.innerText))?.href || ''
        const tasterEntryLinks = [...document.querySelectorAll('a')]
          .filter(a => /START THE VALU INDEX TASTER/i.test(a.innerText))
          .map(a => {
            const href = a.getAttribute('href') || ''
            try { return new URL(href, window.location.href).pathname } catch { return href }
          })
        const registrationForm = {
          email: Boolean(document.querySelector('input[type="email"]')),
          emailReadOnly: Boolean(document.querySelector('input[type="email"]')?.readOnly),
          emailValue: document.querySelector('input[type="email"]')?.value || '',
          password: Boolean(document.querySelector('input[type="password"]')),
          privacyAcknowledgement: [...document.querySelectorAll('label')].some(label => /Privacy Notice/i.test(label.innerText)),
          heading: document.querySelector('h1')?.innerText || '',
        }
        const urlTasterId = new URL(window.location.href).searchParams.get('taster_id') || ''
        const currentPath = window.location.pathname
        const journeyParam = new URL(window.location.href).searchParams.get('journey') || ''
        const savedTasterCopy = /Your taster is saved/i.test(document.body.innerText)
        const signInLink = [...document.querySelectorAll('a')].find(a => /SIGN IN TO CONNECT YOUR TASTER/i.test(a.innerText))?.href || ''
        const accountCreationAction = /CREATE ACCOUNT|ACCOUNT CREATION/i.test(document.body.innerText)
        const confirmationForm = Boolean(
          document.querySelector('form[method="post"][action="/auth/confirm"]') &&
          document.querySelector('input[name="token_hash"]') &&
          document.querySelector('button[type="submit"]')
        )
        const confirmationNext = document.querySelector('input[name="next"]')?.value || ''
        const literalNewlineVisible = document.body.innerText.includes(String.fromCharCode(92, 110))
        const visibleInternalPattern = /(WANT TO BE DISCOVERED|Become discoverable|buyer access|sourcing access|BASIC LISTING|FULL LISTING|\b1 of 58\b|\b1 of 9\b|54 scored questions|four validity checks|nine[- ]questions?|9[- ]questions?|58[- ]questions?|55[- ]questions?|84 \/ 100|\b[0-9]+\s*\/\s*100\b)/gi
        const visibleInternalTerms = [...document.body.innerText.matchAll(visibleInternalPattern)].map(match => match[0])
        const revealElements = [...document.querySelectorAll('.reveal')]
        const revealState = { total: revealElements.length, visible: revealElements.filter(element => element.classList.contains('visible')).length }
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
          revealState,
          analyticsLoaded: Boolean(window.gtag || window.fbq),
          literalNewlineVisible,
          visibleInternalTerms,
          assessmentSiteLinks: [navBrand, navDashboard].filter(Boolean),
          tasterEntryLinks,
          registrationForm,
          urlTasterId,
          currentPath,
          journeyParam,
          savedTasterCopy,
          signInLink,
          accountCreationAction,
          confirmationForm,
          confirmationNext,
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
        tasterHandoffExchangeAttempted,
        pageErrors,
        consoleErrors,
        forbiddenRequests,
        screenshot: filename,
      }
      report.results.push(result)

      if (navigationError) report.failures.push(`${route.name}/${viewport.name}: navigation failed: ${navigationError}`)
      if (status === null || status >= 400) report.failures.push(`${route.name}/${viewport.name}: HTTP ${status}`)
      if (state.horizontalOverflow) report.failures.push(`${route.name}/${viewport.name}: horizontal overflow`)
      if (state.revealState?.total !== state.revealState?.visible) report.failures.push(`${route.name}/${viewport.name}: scroll-reveal content remained hidden (${state.revealState?.visible}/${state.revealState?.total})`)
      if (!state.robots.toLowerCase().includes('noindex')) report.failures.push(`${route.name}/${viewport.name}: staging page is missing noindex robots metadata`)
      if (!route.name.startsWith('auth-confirm') && !state.banner.includes('STAGING PREVIEW')) report.failures.push(`${route.name}/${viewport.name}: staging banner is missing`)
      if (route.name.startsWith('auth-confirm') && !state.confirmationForm) report.failures.push(`${route.name}/${viewport.name}: scanner-safe confirmation form is missing`)
      if (route.name === 'auth-confirm-legacy' && state.confirmationNext !== '/auth/callback?valu_taster=1') report.failures.push(`${route.name}/${viewport.name}: legacy confirmation callback flag was not preserved`)
      if (route.name === 'auth-confirm-post-taster' && state.confirmationNext !== `/auth/callback?pending_taster_id=${POST_TASTER_ID}`) report.failures.push(`${route.name}/${viewport.name}: completed Taster reference was not preserved through confirmation`)
      if (state.analyticsLoaded) report.failures.push(`${route.name}/${viewport.name}: production analytics loaded in staging`)
      if (forbiddenRequests.length) report.failures.push(`${route.name}/${viewport.name}: production Supabase/assessment request detected`)
      if (state.literalNewlineVisible && route.name.startsWith('assessment-')) report.failures.push(`${route.name}/${viewport.name}: literal \\n text is visible in the assessment UI`)
      if (!['terms-of-use', 'terms-legacy', 'privacy-policy', 'privacy-legacy'].includes(route.name) && state.visibleInternalTerms?.length) report.failures.push(`${route.name}/${viewport.name}: internal participant copy is visible: ${state.visibleInternalTerms.join(', ')}`)
      if (route.name.startsWith('assessment-') && state.assessmentSiteLinks.some(href => {
        try { return ['valoriainstitute.com', 'www.valoriainstitute.com'].includes(new URL(href).hostname) } catch { return false }
      })) report.failures.push(`${route.name}/${viewport.name}: assessment navigation points to production site`)
      if (pageErrors.length) report.failures.push(`${route.name}/${viewport.name}: browser page errors detected`)
      if (state.eventPanel?.clipsContent) report.failures.push(`${route.name}/${viewport.name}: event card clips content`)
      const normalisePath = value => value.replace(/\/+$/, '') || '/'
      const expectedRedirect = expectedRedirectPaths[route.name]
      if (expectedRedirect && normalisePath(state.currentPath) !== expectedRedirect) {
        report.failures.push(`${route.name}/${viewport.name}: expected canonical redirect to ${expectedRedirect}, reached ${state.currentPath}`)
      }
      const canonicalTasterEntries = new Set(['/valu/register'])
      if (['homepage', 'valu', 'valu-start'].includes(route.name) &&
          (!state.tasterEntryLinks.length || state.tasterEntryLinks.some(href => !canonicalTasterEntries.has(normalisePath(href))))) {
        report.failures.push(route.name + '/' + viewport.name + ': public Taster entry must require the canonical account-first registration route; found ' + JSON.stringify(state.tasterEntryLinks))
      }
      if (route.name === 'valu-register' &&
          (state.currentPath !== '/valu/register' || !state.registrationForm.email || !state.registrationForm.password ||
           !state.registrationForm.privacyAcknowledgement || !/account comes first/i.test(state.registrationForm.heading))) {
        report.failures.push(route.name + '/' + viewport.name + ': public registration must collect account details and privacy acknowledgement before Taster access')
      }
      if (route.name === 'valu-register-legacy' &&
          (state.currentPath !== '/valu/register' || state.journeyParam !== 'valu_taster' ||
           !state.registrationForm.email || !state.registrationForm.password || !state.registrationForm.privacyAcknowledgement)) {
        report.failures.push(route.name + '/' + viewport.name + ': legacy registration URL must preserve the account-first Taster journey')
      }
      if (route.name === 'professional-signup-account-first' &&
          (!state.signInLink.includes('/login?pending_taster_id=') || state.accountCreationAction)) {
        report.failures.push(route.name + '/' + viewport.name + ': completed account-first Taster must offer sign-in, never duplicate account creation')
      }
      if (route.name === 'professional-signup-post-taster' &&
          (!state.registrationForm.email || !state.registrationForm.emailReadOnly ||
           state.registrationForm.emailValue !== 'staging-participant@example.invalid' ||
           !state.registrationForm.password || !state.accountCreationAction ||
           !state.savedTasterCopy || state.urlTasterId !== POST_TASTER_ID)) {
        report.failures.push(route.name + '/' + viewport.name + ': saved Taster handoff must open post-Taster account creation with the original identity and Taster ID')
      }
      if (route.name === 'assessment-account-first-taster-gate' && !tasterHandoffExchangeAttempted) {
        report.failures.push(route.name + '/' + viewport.name + ': account-first gate did not exchange the one-time Taster start code')
      }

      await context.close()
    }
  }
  // Capture the compact homepage profile-card treatment with clearly labelled
  // synthetic visual fixtures. This is screenshot-only QA data: it never
  // enters Supabase, the application response, or the public roster.
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
    })
    const page = await context.newPage()
    const response = await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(1800)
    await page.evaluate(async () => {
      const reveals = [...document.querySelectorAll('.reveal')]
      for (const element of reveals) {
        element.scrollIntoView({ block: 'center', behavior: 'auto' })
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
    await page.waitForTimeout(350)
    const previewReady = await page.evaluate(() => {
      const shell = document.querySelector('.live-profiles-shell')
      if (!shell) return false
      shell.querySelector('.live-profiles-public-state')?.remove()
      const note = document.createElement('div')
      note.className = 'live-profiles-public-state'
      note.innerHTML = '<span class="live-profiles-empty-title">VISUAL PREVIEW ONLY</span><p>Illustrative cards for layout QA. These are not public listings or participant records.</p>'
      const mask = document.createElement('div')
      mask.className = 'vi-scroll-mask'
      const fixtureCards = `
        <div class="vi-scroll-card" data-visual-fixture="true">
          <div class="vi-scroll-avatar"><span>01</span></div>
          <div class="vi-scroll-copy">
            <div class="vi-scroll-topline">ATB-PREVIEW-001 <i>VISUAL FIXTURE</i></div>
            <span class="vi-scroll-name">Illustrative Professional 01</span>
            <div class="vi-scroll-headline">Strategy &amp; Operations</div>
            <div class="vi-scroll-track-label"><span class="is-active">Talent</span><span class="is-active">Speaker</span><span class="is-inactive">Facilitator</span></div>
            <div class="vi-scroll-designation">Illustrative designation</div>
            <div class="vi-scroll-summary">Synthetic content for layout review only</div>
            <div class="vi-scroll-development">Not a participant profile</div>
          </div>
          <div class="vi-scroll-score"><span class="vi-scroll-score-label">VALU INDEX</span><strong>78</strong><span class="vi-scroll-score-max">PTS</span></div>
          <span class="vi-scroll-card-arrow" aria-hidden="true">↗</span>
        </div>
        <div class="vi-scroll-card" data-visual-fixture="true">
          <div class="vi-scroll-avatar"><span>02</span></div>
          <div class="vi-scroll-copy">
            <div class="vi-scroll-topline">ATB-PREVIEW-002 <i>VISUAL FIXTURE</i></div>
            <span class="vi-scroll-name">Illustrative Professional 02</span>
            <div class="vi-scroll-headline">Finance &amp; Governance</div>
            <div class="vi-scroll-track-label"><span class="is-active">Talent</span><span class="is-inactive">Speaker</span><span class="is-active">Facilitator</span></div>
            <div class="vi-scroll-designation">Illustrative designation</div>
            <div class="vi-scroll-summary">Synthetic content for layout review only</div>
            <div class="vi-scroll-development">Not a participant profile</div>
          </div>
          <div class="vi-scroll-score"><span class="vi-scroll-score-label">VALU INDEX</span><strong>84</strong><span class="vi-scroll-score-max">PTS</span></div>
          <span class="vi-scroll-card-arrow" aria-hidden="true">↗</span>
        </div>
        <div class="vi-scroll-card" data-visual-fixture="true">
          <div class="vi-scroll-avatar"><span>03</span></div>
          <div class="vi-scroll-copy">
            <div class="vi-scroll-topline">ATB-PREVIEW-003 <i>VISUAL FIXTURE</i></div>
            <span class="vi-scroll-name">Illustrative Professional 03</span>
            <div class="vi-scroll-headline">Digital Transformation</div>
            <div class="vi-scroll-track-label"><span class="is-inactive">Talent</span><span class="is-active">Speaker</span><span class="is-active">Facilitator</span></div>
            <div class="vi-scroll-designation">Illustrative designation</div>
            <div class="vi-scroll-summary">Synthetic content for layout review only</div>
            <div class="vi-scroll-development">Not a participant profile</div>
          </div>
          <div class="vi-scroll-score"><span class="vi-scroll-score-label">VALU INDEX</span><strong>72</strong><span class="vi-scroll-score-max">PTS</span></div>
          <span class="vi-scroll-card-arrow" aria-hidden="true">↗</span>
        </div>`
      mask.innerHTML = `
        <div class="vi-scroll-track">
          <div class="vi-scroll-group">${fixtureCards}</div>
          <div class="vi-scroll-group" aria-hidden="true">${fixtureCards}</div>
        </div>`
      const bottom = shell.querySelector('.live-profiles-bottom')
      shell.insertBefore(note, bottom)
      shell.insertBefore(mask, bottom)
      const track = mask.querySelector('.vi-scroll-track')
      const firstGroup = track?.querySelector('.vi-scroll-group:not([aria-hidden="true"])')
      const cloneGroup = track?.querySelector('.vi-scroll-group[aria-hidden="true"]')
      const trackStyle = track ? getComputedStyle(track) : null
      const maskStyle = getComputedStyle(mask)
      return {
        ready: Boolean(firstGroup && cloneGroup &&
          firstGroup.querySelectorAll('[data-visual-fixture="true"]').length === 3 &&
          cloneGroup.querySelectorAll('[data-visual-fixture="true"]').length === 3),
        animationName: trackStyle?.animationName || 'none',
        animationPlayState: trackStyle?.animationPlayState || 'none',
        overflowX: maskStyle.overflowX,
        trackWidth: track?.scrollWidth || 0,
        maskWidth: mask.clientWidth,
        scrollable: Boolean(track && track.scrollWidth > mask.clientWidth + 4),
      }
    })
    const filename = `homepage-profile-cards-preview-${viewport.name}.png`
    await page.screenshot({ path: path.join(OUT, filename), fullPage: true })
    report.profileCardPreviews.push({ viewport: viewport.name, status: response?.status() ?? null, screenshot: filename, syntheticFixtures: 3, clearlyLabelled: true, ...previewReady })
    if (!previewReady.ready) report.failures.push(`${viewport.name}: compact profile-card visual fixture could not be rendered`)
    if (viewport.name === 'desktop' && previewReady.animationName !== 'valoria-profile-rail') {
      report.failures.push('desktop: homepage profile rail must run the seamless auto-scroll animation')
    }
    if (viewport.name === 'mobile' && (previewReady.animationName !== 'none' || previewReady.overflowX !== 'auto' || !previewReady.scrollable)) {
      report.failures.push('mobile: homepage profile rail must remain manually scrollable without auto-motion')
    }
    await context.close()
  }

} finally {
  await browser.close()
}

await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pages: report.results.length, failures: report.failures, output: OUT }, null, 2))
if (report.failures.length) process.exitCode = 1

// Re-run after the staging assessment Worker refresh so the current deployed banner and form are captured.
