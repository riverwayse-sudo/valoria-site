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
  { name: 'auth-confirm', url: `${SITE}/auth/confirm?token_hash=staging-probe-token&type=email&next=%2Fauth%2Fcallback%3Fvalu_taster%3D1`, site: true },
  { name: 'professional-signup-account-first', url: `${SITE}/professional-signup/?taster_id=55555555-5555-4555-8555-555555555555&name=Staging%20Participant&role=Staging%20QA&account_first=1`, site: true },
  { name: 'professional-signup-post-taster', url: `${SITE}/professional-signup/?taster_id=${POST_TASTER_ID}&name=Staging%20Participant&role=Staging%20QA&experience=0-3&email=staging-participant%40example.invalid`, site: true },
  { name: 'prime', url: `${SITE}/prime`, site: true },
  { name: 'about', url: `${SITE}/about-us`, site: true },
  { name: 'dashboard-preview', url: `${SITE}/dashboard?preview=1`, site: true },
  { name: 'assessment-proxy', url: `${SITE}/valu/assessment/`, site: true },
  { name: 'assessment-host', url: `${ASSESSMENT}/`, site: false },
  { name: 'assessment-account-first-taster-gate', url: `${ASSESSMENT}/valu/assessment/?journey=account-first#taster_start_code=staging-invalid-probe`, site: false },
]
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
async function auditDropdownInteractions(page, route, viewport) {
  const failures = []
  const result = {
    nativeSelects: 0,
    desktopMenus: 0,
    mobileMenu: false,
    notificationPanel: 'not-present-in-unauthenticated-staging-context',
    disabledStyle: null,
    optionPalette: null,
  }

  if (route.name === 'homepage' && !viewport.isMobile) {
    const triggers = page.locator('button.nav-trigger[aria-haspopup="true"][aria-controls]')
    result.desktopMenus = await triggers.count()
    if (!result.desktopMenus) failures.push('desktop navigation exposes no dropdown triggers')
    for (let i = 0; i < result.desktopMenus; i++) {
      const trigger = triggers.nth(i)
      const id = await trigger.getAttribute('aria-controls')
      const menu = page.locator(`[id="${id}"]`)
      if (await trigger.getAttribute('aria-expanded') !== 'false') failures.push(`desktop menu ${id} is not initially collapsed`)
      if (await menu.getAttribute('aria-hidden') !== 'true' || await menu.getAttribute('inert') === null) {
        failures.push(`desktop menu ${id} is not hidden and inert while closed`)
      }
      await trigger.focus()
      await page.keyboard.press('Enter')
      await page.waitForFunction((menuId) => {
        const element = document.getElementById(menuId)
        return element && element.getAttribute('aria-hidden') === 'false' && !element.hasAttribute('inert')
      }, id, { timeout: 5000 })
      if (await trigger.getAttribute('aria-expanded') !== 'true') failures.push(`desktop menu ${id} did not expose aria-expanded=true after keyboard activation`)
      await page.keyboard.press('Escape')
      await page.waitForFunction((menuId) => {
        const element = document.getElementById(menuId)
        return element && element.getAttribute('aria-hidden') === 'true' && element.hasAttribute('inert')
      }, id, { timeout: 5000 })
      if (await trigger.getAttribute('aria-expanded') !== 'false') failures.push(`desktop menu ${id} did not close on Escape`)
      if (!await trigger.evaluate(element => document.activeElement === element)) {
        failures.push(`desktop menu ${id} did not retain focus on its trigger after Escape`)
      }
    }
  }

  if (route.name === 'homepage' && viewport.isMobile) {
    const burger = page.locator('button.nav-burger[aria-controls="vi-mobile-navigation"]')
    const mobileNav = page.locator('#vi-mobile-navigation')
    if (await burger.count()) {
      if (await burger.getAttribute('aria-expanded') !== 'false') failures.push('mobile navigation is not initially collapsed')
      if (await mobileNav.getAttribute('aria-hidden') !== 'true' || await mobileNav.getAttribute('inert') === null) {
        failures.push('mobile navigation is not hidden and inert while closed')
      }
      await burger.focus()
      await page.keyboard.press('Enter')
      await page.waitForFunction(() => {
        const nav = document.getElementById('vi-mobile-navigation')
        return nav && nav.getAttribute('aria-hidden') === 'false' && !nav.hasAttribute('inert')
      }, null, { timeout: 5000 })
      if (await burger.getAttribute('aria-expanded') !== 'true') failures.push('mobile navigation did not expose aria-expanded=true after keyboard activation')
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => {
        const nav = document.getElementById('vi-mobile-navigation')
        return nav && nav.getAttribute('aria-hidden') === 'true' && nav.hasAttribute('inert')
      }, null, { timeout: 5000 })
      if (await burger.getAttribute('aria-expanded') !== 'false') failures.push('mobile navigation did not close on Escape')
      if (!await burger.evaluate(element => document.activeElement === element)) {
        failures.push('mobile navigation did not retain focus on its toggle after Escape')
      }
      result.mobileMenu = true
    } else {
      failures.push('mobile navigation toggle was not found')
    }
  }

  const bell = page.locator('button[aria-controls="vi-notification-panel"]')
  if (await bell.count()) {
    await bell.focus()
    await page.keyboard.press('Enter')
    const panel = page.locator('#vi-notification-panel')
    if (!await panel.isVisible()) failures.push('notification dropdown did not open from keyboard activation')
    else result.notificationPanel = 'opened'
    await page.keyboard.press('Escape')
    if (await bell.getAttribute('aria-expanded') !== 'false') failures.push('notification dropdown did not close on Escape')
    if (!await bell.evaluate(element => document.activeElement === element)) {
      failures.push('notification dropdown did not retain focus on its trigger after Escape')
    }
  }

  const selects = page.locator('select')
  result.nativeSelects = await selects.count()
  for (let i = 0; i < result.nativeSelects; i++) {
    const select = selects.nth(i)
    const className = await select.getAttribute('class') || ''
    const classes = className.split(/\s+/).filter(Boolean)
    if (!classes.includes('vi-select') && !classes.includes('vi-select--light')) {
      failures.push(`native select ${i + 1} on ${route.name} is missing the shared select class`)
    }
    const hasLabel = await select.evaluate(element =>
      Boolean(
        (element.labels && element.labels.length) ||
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        element.closest('label')
      )
    )
    if (!hasLabel) failures.push(`native select ${i + 1} on ${route.name} has no accessible label`)

    const palette = await select.evaluate(element => {
      const style = getComputedStyle(element)
      const option = element.options[0]
      const optionStyle = option ? getComputedStyle(option) : style
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        optionColor: optionStyle.color,
        optionBackgroundColor: optionStyle.backgroundColor,
        light: element.classList.contains('vi-select--light'),
      }
    })
    const expected = palette.light
      ? { color: 'rgb(26, 26, 46)', background: 'rgb(250, 250, 247)' }
      : { color: 'rgb(247, 244, 238)', background: 'rgb(26, 26, 46)' }
    if (palette.color !== expected.color || palette.backgroundColor !== expected.background ||
        palette.optionColor !== expected.color || palette.optionBackgroundColor !== expected.background) {
      failures.push(`native select ${i + 1} on ${route.name} has an incorrect ${palette.light ? 'light' : 'dark'} control/option palette: ${JSON.stringify(palette)}`)
    }

    if (await select.isVisible() && !(await select.isDisabled())) {
      await page.evaluate(() => {
        document.activeElement?.blur()
        document.body.setAttribute('tabindex', '-1')
        document.body.focus()
        document.body.removeAttribute('tabindex')
      })
      let reachedByKeyboard = false
      for (let step = 0; step < 100; step++) {
        await page.keyboard.press('Tab')
        if (await select.evaluate(element => document.activeElement === element)) {
          reachedByKeyboard = true
          break
        }
      }
      if (!reachedByKeyboard) {
        failures.push(`native select ${i + 1} on ${route.name} is not reachable by keyboard Tab`)
      } else {
        const focusStyle = await select.evaluate(element => {
          const style = getComputedStyle(element)
          return { outlineWidth: parseFloat(style.outlineWidth) || 0, outlineStyle: style.outlineStyle }
        })
        if (focusStyle.outlineWidth < 1 || focusStyle.outlineStyle === 'none') {
          failures.push(`native select ${i + 1} on ${route.name} has no visible keyboard focus treatment`)
        }
      }
    }
  }

  if (route.name === 'homepage' && viewport.name === 'desktop') {
    result.disabledStyle = await page.evaluate(() => {
      const select = document.createElement('select')
      select.className = 'vi-select'
      select.disabled = true
      select.innerHTML = '<option>Disabled control</option>'
      document.body.appendChild(select)
      const opacity = getComputedStyle(select).opacity
      select.remove()
      return opacity
    })
    if (Math.abs(Number(result.disabledStyle) - 0.58) > 0.05) failures.push('disabled native select does not use the shared disabled state')

    result.optionPalette = await page.evaluate(() => {
      const read = className => {
        const select = document.createElement('select')
        select.className = className
        select.innerHTML = '<option>Palette probe</option>'
        document.body.appendChild(select)
        const style = getComputedStyle(select.options[0])
        const palette = { color: style.color, backgroundColor: style.backgroundColor }
        select.remove()
        return palette
      }
      return { dark: read('vi-select'), light: read('vi-select--light') }
    })
    const dark = result.optionPalette.dark
    const light = result.optionPalette.light
    if (dark.color !== 'rgb(247, 244, 238)' || dark.backgroundColor !== 'rgb(26, 26, 46)') {
      failures.push('dark dropdown option palette does not match the Valoria contrast tokens')
    }
    if (light.color !== 'rgb(26, 26, 46)' || light.backgroundColor !== 'rgb(250, 250, 247)') {
      failures.push('light dropdown option palette does not match the Valoria contrast tokens')
    }
  }

  return { result, failures }
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
        }
      })

      const dropdownAudit = await auditDropdownInteractions(page, route, viewport)
      for (const failure of dropdownAudit.failures) report.failures.push(`${route.name}/${viewport.name}: dropdown audit: ${failure}`)

      const filename = `${route.name}-${viewport.name}.png`
      await page.screenshot({ path: path.join(OUT, filename), fullPage: true })
      const result = {
        route: route.name,
        url: route.url,
        viewport: viewport.name,
        status,
        navigationError,
        ...state,
        dropdownAudit: dropdownAudit.result,
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
      if (route.name !== 'auth-confirm' && !state.banner.includes('STAGING PREVIEW')) report.failures.push(`${route.name}/${viewport.name}: staging banner is missing`)
      if (route.name === 'auth-confirm' && !state.confirmationForm) report.failures.push(`${route.name}/${viewport.name}: scanner-safe confirmation form is missing`)
      if (state.analyticsLoaded) report.failures.push(`${route.name}/${viewport.name}: production analytics loaded in staging`)
      if (forbiddenRequests.length) report.failures.push(`${route.name}/${viewport.name}: production Supabase/assessment request detected`)
      if (state.literalNewlineVisible && route.name.startsWith('assessment-')) report.failures.push(`${route.name}/${viewport.name}: literal \\n text is visible in the assessment UI`)
      if (state.visibleInternalTerms?.length) report.failures.push(`${route.name}/${viewport.name}: internal participant copy is visible: ${state.visibleInternalTerms.join(', ')}`)
      if (route.name.startsWith('assessment-') && state.assessmentSiteLinks.some(href => {
        try { return ['valoriainstitute.com', 'www.valoriainstitute.com'].includes(new URL(href).hostname) } catch { return false }
      })) report.failures.push(`${route.name}/${viewport.name}: assessment navigation points to production site`)
      if (pageErrors.length) report.failures.push(`${route.name}/${viewport.name}: browser page errors detected`)
      if (state.eventPanel?.clipsContent) report.failures.push(`${route.name}/${viewport.name}: event card clips content`)
      const canonicalTasterEntries = new Set(['/valu/register'])
      const normalisePath = value => value.replace(/\/+$/, '') || '/'
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
      mask.innerHTML = `
        <div class="vi-scroll-track">
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
          </div>
        </div>`
      const bottom = shell.querySelector('.live-profiles-bottom')
      shell.insertBefore(note, bottom)
      shell.insertBefore(mask, bottom)
      const track = mask.querySelector('.vi-scroll-track')
      if (track) {
        track.style.animation = 'none'
        track.style.transform = 'none'
      }
      return Boolean(track && mask.querySelectorAll('[data-visual-fixture="true"]').length === 3)
    })
    const filename = `homepage-profile-cards-preview-${viewport.name}.png`
    await page.screenshot({ path: path.join(OUT, filename), fullPage: true })
    report.profileCardPreviews.push({ viewport: viewport.name, status: response?.status() ?? null, screenshot: filename, syntheticFixtures: 3, clearlyLabelled: true, previewReady })
    if (!previewReady) report.failures.push(`${viewport.name}: compact profile-card visual fixture could not be rendered`)
    await context.close()
  }

} finally {
  await browser.close()
}

await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pages: report.results.length, failures: report.failures, output: OUT }, null, 2))
if (report.failures.length) process.exitCode = 1

// Re-run after the staging assessment Worker refresh so the current deployed banner and form are captured.
