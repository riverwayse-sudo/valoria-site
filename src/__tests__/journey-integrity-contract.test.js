const fs = require('fs')
const path = require('path')
const { deriveJourneyState } = require('../lib/journey-state')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('participant-facing assessment clarity', () => {
  test('participant-facing pages and progress indicators do not expose assessment mechanics', () => {
    const sources = [
      read('src/components/VALUJourneyProgress.jsx'),
      read('src/app/valu/start/page.jsx'),
      read('src/app/prime/page.jsx'),
      read('src/app/dashboard/page.jsx'),
      read('src/app/dashboard/ExperiencePreview.jsx'),
      read('src/app/professional-signup/page.jsx'),
      read('src/components/ValuCompletionNudge.jsx'),
      read('src/app/terms-of-use/page.jsx'),
    ]
    for (const source of sources) {
      expect(source).not.toMatch(/(?:9|58)[- ]questions?|Question\\s*(?:1|10)|remaining 49|\\b\\d+\\s+of\\s+(?:9|58)\\b/i)
    }
  })

  test('public VALU information distinguishes the taster from the full assessment', () => {
    const valu = read('src/app/valu/page.jsx')
    expect(valu).toContain('Begin with the VALU Taster')
    expect(valu).toContain('separate full assessment')
    expect(valu).toContain('official points-based VALU Index')
    expect(valu).toContain('separate full assessment')
    expect(valu).not.toContain('four Intelligence skills')
    expect(valu).toContain('separate full assessment')
    expect(valu).not.toMatch(/(?:9|58)[- ]questions?|nine questions|54 scored questions|four validity checks/i)
  })

  test('public PRIME page and marketplace use the five approved VALU designation bands', () => {
    const brand = read('src/lib/brand.js')
    const prime = read('src/app/prime/page.jsx')
    const marketplaceCss = read('src/components/MarketplaceDirectory.module.css')
    const tiers = [
      { min: 80, max: 100, name: 'Force to Align With', className: 'force-to-align' },
      { min: 65, max: 79, name: 'Emerging Force', className: 'emerging-force' },
      { min: 50, max: 64, name: 'Developing Professional', className: 'developing-professional' },
      { min: 35, max: 49, name: 'Building Foundations', className: 'building-foundations' },
      { min: 0, max: 34, name: 'At the Starting Point', className: 'starting-point' },
    ]
    for (const tier of tiers) {
      expect(brand).toContain(`min: ${tier.min}, max: ${tier.max}, name: '${tier.name}'`)
      expect(prime).toContain(tier.name)
      expect(marketplaceCss).toContain(`.${tier.className}`)
    }
    expect(prime).toContain('80–100 POINTS')
    expect(prime).toContain('65–79 POINTS')
    expect(prime).toContain('50–64 POINTS')
    expect(prime).toContain('35–49 POINTS')
    expect(prime).toContain('BELOW 35 POINTS')
    expect(brand).toContain("unit: 'points'")
  })

  test('staging preview blocks public writes but permits only confirmed identity and assessment handoff', () => {
    const middleware = read('src/middleware.js')
    const opportunities = read('src/app/api/opportunities/route.js')
    const eventRegistration = read('src/app/api/session-registration/route.js')
    const eventTrigger = read('src/components/EventRegistrationTrigger.jsx')
    const stagingWorkflow = read('.github/workflows/cloudflare-staging-deploy.yml')

    expect(middleware).toContain("process.env.VALU_STAGING_API_ENABLED === '1'")
    expect(middleware).toContain('const isPreviewApiAllowed = stagingApiEnabled && (')
    expect(middleware).toContain("if (isPreview && pathname.startsWith('/api/') && !isPreviewApiAllowed)")
    expect(middleware).toContain("(pathname === '/api/link-taster' && request.method === 'POST')")
    expect(middleware).toContain("(pathname === '/api/link-assessment' && request.method === 'POST')")
    expect(middleware).toContain("(pathname === '/api/valu-handoff' && ['GET', 'POST'].includes(request.method))")
    expect(opportunities).toContain('IS_READ_ONLY_PREVIEW')
    expect(eventRegistration).toContain('Event registration is disabled in staging preview')
    expect(eventTrigger).toContain('REGISTRATION DISABLED IN PREVIEW')
    expect(stagingWorkflow).toContain('NEXT_PUBLIC_VALU_PREVIEW=1')
    expect(stagingWorkflow).toContain("grep -qi 'Valoria Platform' <<<\"$assessment_html\"")
    expect(stagingWorkflow).not.toContain("grep -qi 'VALU ASSESSMENT'")
    expect(stagingWorkflow).toContain('NEXT_PUBLIC_VALU_STAGING_API_ENABLED=1')
    expect(stagingWorkflow).toContain('VALU_STAGING_API_ENABLED=1')
    expect(stagingWorkflow).toContain('NEXT_PUBLIC_SUPABASE_URL=https://yccxgjdqworgcbircnvn.supabase.co')
    expect(stagingWorkflow).toContain('VALU_PREVIEW_ASSESSMENT_ORIGIN=https://valoria-staging-assessment.riverwayse.workers.dev')
    const wrangler = JSON.parse(read('wrangler.jsonc'))
    expect(wrangler.previews.vars.VALU_STAGING_API_ENABLED).toBe('0')
    expect(wrangler.previews.vars.NEXT_PUBLIC_VALU_STAGING_API_ENABLED).toBe('0')
    expect(wrangler.env.staging.vars.VALU_STAGING_API_ENABLED).toBe('1')
    expect(wrangler.env.staging.vars.NEXT_PUBLIC_VALU_STAGING_API_ENABLED).toBe('1')
    const linkTaster = read('src/app/api/link-taster/route.js')
    expect(linkTaster.indexOf("const authorization = request.headers.get")).toBeLessThan(linkTaster.indexOf('request.json()'))
    expect(stagingWorkflow).not.toContain('https://placeholder.supabase.co')
  })

  test('the isolated dashboard preview launches the interactive taster', () => {
    const preview = read('src/app/dashboard/ExperiencePreview.jsx')
    expect(preview).toContain('AssessmentStartLink href="/valu/assessment/"')
    expect(preview).toContain('START THE VALU TASTER')
    expect(preview).not.toContain('58')
  })

  test('internal assessment links remain in the current browser tab', () => {
    const sources = [
      read('src/app/prime/page.jsx'),
      read('src/app/about-us/page.jsx'),
      read('src/app/events/page.jsx'),
      read('src/app/login/page.jsx'),
      read('src/app/profile/setup/page.jsx'),
    ]
    for (const source of sources) {
      expect(source).not.toContain('target="_blank"')
    }
  })
})

describe('journey integrity contract', () => {
  test('profile completeness remains true when the full VALU assessment is expired', () => {
    const state = deriveJourneyState({
      journey: { journey_stage: 'profile_complete', progress_percent: 78 },
      assessment: {
        completed_at: '2026-01-01T00:00:00.000Z',
        expires_at: '2026-02-01T00:00:00.000Z',
        total_score: 62,
        report_status: 'READY',
        ai_report: { summary: 'Assessment summary' },
      },
      activation: { status: 'activated' },
      profile: {
        profile_complete: true,
        display_name: 'Test Professional',
        current_job_title: 'Consultant',
        headline: 'Consultant',
        bio: 'Professional profile summary',
        industry: 'Consulting',
        username: 'test-professional',
        phone: '+2348000000000',
        location: 'Lagos',
        languages: ['English'],
        active_tracks: ['candidate'],
        cv_url: null,
      },
      capabilities: [{
        is_active: true,
        eligible_for_listing: true,
        eligibility_status: 'listed',
        missing_requirements: [],
      }],
    })

    expect(state.profile.complete).toBe(true)
    expect(state.assessment.current).toBe(false)
    expect(state.eligibility.complete).toBe(false)
    expect(state.eligibility.missing).toContain('Your CV')
    expect(state.eligibility.missing).toContain('A current full VALU Index assessment')
    expect(state.marketplace.capabilities).toEqual([])
  })

  test('profile completeness does not require an uploaded photo or CV', () => {
    const state = deriveJourneyState({
      assessment: { completed_at: new Date().toISOString(), expires_at: null, report_status: 'READY' },
      activation: { status: 'activated' },
      profile: {
        profile_complete: true,
        display_name: 'Test Professional',
        current_job_title: 'Consultant',
        headline: 'Consultant',
        bio: 'Professional profile summary',
        industry: 'Consulting',
        username: 'test-professional',
        phone: '+2348000000000',
        location: 'Lagos',
        languages: ['English'],
        active_tracks: ['candidate'],
        photo_url: null,
        cv_url: null,
      },
    })

    expect(state.profile.complete).toBe(true)
    expect(state.profile.missing).toEqual([])
    expect(state.eligibility.missing).toContain('Your CV')
  })
 // UX simplification coverage + dashboard web
  test('journey state fails loudly when required database reads fail', () => {
    const source = read('src/app/api/journey/state/route.js')
    expect(source).toContain('query_errors')
    expect(source).toContain('status: 502')
    expect(source).toContain("require('@/lib/journey-state')")
  })

  test('journey diagnostics exists and requires authentication', () => {
    const source = read('src/app/api/journey/diagnostics/route.js')
    expect(source).toContain("Authentication required.")
    expect(source).toContain('invariant_failures')
    expect(source).toContain('all_required_reads_verified')
  })

  test('historical assessment claim verifies every critical persistence step', () => {
    const source = read('src/app/api/assessment/claim/route.js')
    expect(source).toContain('verifyError')
    expect(source).toContain('verifyTaster')
    expect(source).toContain('identityError')
    expect(source).toContain('journeyError')
    expect(source).toContain('auditError')
  })

  test('legacy taster claim retries partial writes and appends audit decisions without overwriting history', () => {
    const source = read('src/app/api/claim-taster/route.js')
    expect(source).toContain("'account_linked'")
    expect(source).toContain("candidate.linked_user_id !== user.id")
    expect(source).toContain("order('created_at', { ascending: false })")
    expect(source).toContain("from('identity_reconciliation_reviews').insert({")
    expect(source).not.toContain('.update(reviewData)')
    expect(source).toContain('processed.length')
    expect(source).toContain('refresh_professional_journey')
    expect(source).toContain('sync_professional_listing_status')
  })

  test('full VALU launch is a one-time dashboard-only handoff', () => {
    const handoff = read('src/app/api/valu-handoff/route.js')
    const continuation = read('src/app/journey/continue/route.js')
    expect(handoff).toContain('HANDOFF_TTL_SECONDS = 60')
    expect(handoff).toContain("createHash('sha256')")
    expect(handoff).toContain("entry_point: 'dashboard_assessment'")
    expect(handoff).toContain("source: 'authenticated_dashboard'")
    expect(handoff).toContain('destination.hash')
    expect(handoff).toContain('export async function POST')
    expect(handoff).toContain(".eq('user_id', user.id)")
    expect(continuation).toContain("stage === 'assess'")
    expect(continuation).toContain("return NextResponse.redirect(new URL('/dashboard', request.url))")
    expect(continuation).not.toContain('createValuHandoffToken')
    expect(continuation).toContain('hasLegacyAssessmentParams')
  })

  test('login returns authenticated participants to the dashboard without a bridge interstitial', () => {
    const login = read('src/app/login/page.jsx')
    expect(login).toContain('window.location.href = target')
    expect(login).not.toContain('/assessment/bridge')
    expect(login).toContain("pending_taster_id")
    expect(login).not.toContain('launchAssessmentIfRequested')
    expect(login).not.toContain("fetch('/api/valu-handoff'")
  })

  test('assessment reminder emails return participants to login and dashboard only', () => {
    const source = read('src/app/api/cron/valu-reminders/route.js')
    expect(source).toContain("https://valoriainstitute.com/login?returnTo=%2Fdashboard")
    expect(source).toContain('RETURN TO YOUR DASHBOARD')
    expect(source).toContain('Sign in to your dashboard')
    expect(source).not.toContain("from('valoria_reentry_links').insert")
    expect(source).not.toContain('CONTINUE TO QUESTION 10')
    expect(source).not.toContain('pending_taster_id')
    expect(source).not.toContain('taster_id=')
    expect(source).toContain('email_confirmed_at')
  })

  test('professional signup preserves the snapshot but sends authenticated users to the dashboard before full assessment', () => {
    const source = read('src/app/professional-signup/page.jsx')
    expect(source).not.toContain('https://valoriainstitute.com/journey/continue?stage=assess&taster_id=')
    expect(source).toContain('GO TO MY DASHBOARD')
    expect(source).toContain('Sign in to connect your saved taster and continue your full assessment.')
    expect(source).toContain('continueSignedInUser')
    expect(source).toContain("window.location.replace('/dashboard?welcome=profile')")
    expect(source).toContain("localStorage.removeItem('pending_taster_id')")
    expect(source).not.toContain("fetch(`/api/valu-handoff?taster_id=")
    expect(source).not.toContain('COMPLETE MY PROFESSIONAL PROFILE')
    expect(source).not.toContain('/valu/assessment/?full=1&taster_id=')
  })

  test('signup and resend confirmation use the current site origin so staging links do not jump to production', () => {
    const source = read('src/app/professional-signup/page.jsx')
    expect(source).toContain('emailRedirectTo:')
    expect(source).toContain('window.location.origin')
    expect(source).toContain('/auth/callback?pending_taster_id=')
    expect(source).not.toContain('https://valoriainstitute.com/auth/callback?pending_taster_id=')
    expect(source).toContain("localStorage.setItem('pending_taster_id',tasterId)")
  })

  test('email confirmation returns participants to dashboard before assessment continuation', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    const continuation = read('src/app/journey/continue/route.js')
    const handoff = read('src/app/api/valu-handoff/route.js')
    expect(callback).toContain('/dashboard')
    expect(callback).not.toContain('pending_taster_id=')
    expect(dashboard).toContain('START / CONTINUE YOUR FULL ASSESSMENT')
    expect(dashboard).toContain('Required Profile Details')
    expect(dashboard).toContain('This is separate from your VALU assessment and marketplace eligibility.')
    expect(dashboard).toContain('five milestones; not a profile or VALU percentage')
    expect(dashboard).toContain('dashboardOnly')
    expect(dashboard).not.toContain('pending_taster_id')
    expect(dashboard).not.toContain('/journey/continue?stage=assess')
    expect(continuation).toContain("stage === 'assess'")
    expect(handoff).toContain("entry_point: 'dashboard_assessment'")
    expect(handoff).toContain(".eq('user_id', user.id)")
  })

  test('assessment origin is environment-specific and preview never silently falls back to production', () => {
    const handoff = read('src/app/api/valu-handoff/route.js')
    const config = read('next.config.js')
    const reportTrigger = read('src/app/api/trigger-report/route.js')
    const origin = read('src/lib/valu-origin.js')
    const signup = read('src/app/professional-signup/page.jsx')
    expect(handoff).toContain("from '@/lib/valu-origin'")
    expect(handoff).toContain('getValuAssessmentOrigin(process.env)')
    expect(handoff).toContain('if (!assessmentOrigin)')
    expect(handoff.indexOf('if (!assessmentOrigin)')).toBeLessThan(handoff.indexOf("admin.from('valoria_reentry_links').insert"));
    expect(config).toContain("process.env.VERCEL_ENV === 'preview'")
    expect(config).toContain('if (!valuOrigin) return []')
    const assessmentProxy = read('src/app/valu/assessment/[[...path]]/route.js')
    expect(assessmentProxy).toContain('valoria-staging-assessment.riverwayse.workers.dev')
    expect(assessmentProxy).toContain("redirect: 'manual'")
    expect(assessmentProxy).toContain("const suffix = pathname.replace(/^\\/valu\\/assessment\\/?/, '')")
    expect(assessmentProxy).toContain("if (!suffix) return '/'")
    expect(assessmentProxy).toContain("if (suffix === 'api' || suffix.startsWith('api/')) return `/${suffix}`")
    expect(assessmentProxy).toContain("return `/valu/assessment/${suffix}`")
    expect(assessmentProxy).toContain('service.fetch(upstreamRequest)')
    expect(assessmentProxy).toContain('getCloudflareContext')
    expect(assessmentProxy).toContain('env.VALU_ASSESSMENT')
    expect(assessmentProxy).toContain('export async function GET')
    expect(assessmentProxy).toContain('export async function HEAD')
    expect(assessmentProxy).not.toContain("runtime = 'edge'")
    expect(config).not.toContain("source: '/valu/assessment'")
    expect(reportTrigger).toContain("from '@/lib/valu-origin'")
    expect(reportTrigger).toContain('getValuAssessmentOrigin(process.env)')
    expect(origin).toContain("env.CF_WORKERS === '1'")
    expect(origin).toContain("env.CF_WORKERS_PREVIEW === '1'")
    expect(origin).toContain("env.VALU_PREVIEW === '1'")
    expect(origin).toContain("env.NEXT_PUBLIC_VALU_PREVIEW === '1'")
    expect(origin).toContain('VALU_PREVIEW_ASSESSMENT_ORIGIN')
    expect(origin).toContain("url.hostname === 'assessment.valoriainstitute.com'")
    expect(signup).toContain('href="/valu/assessment/"')
    expect(signup).not.toContain('href="https://assessment.valoriainstitute.com/"')
  })


  test('assessment continuation never accepts email resume tokens or public identity query parameters', () => {
    const continuation = read('src/app/journey/continue/route.js')
    const handoff = read('src/app/api/valu-handoff/route.js')
    expect(continuation).not.toContain("searchParams.get('token')")
    expect(continuation).not.toContain("searchParams.get('taster_id')")
    expect(handoff).not.toContain("searchParams.get('taster_id')")
    expect(handoff).not.toContain("searchParams.get('resume')")
    expect(handoff).toContain("expires_at: expiresAt")
  })

  test('unowned snapshots require exact email evidence and legacy assessments are never auto-linked by name/role', () => {
    const source = read('src/app/api/link-taster/route.js')
    expect(source).toContain('identityCandidate?.candidate_role')
    expect(source).toContain('if (!taster.user_id && (!identityCandidate?.candidate_email')
    expect(source).toContain("assessmentLinkStatus = 'legacy_assessment_requires_review'")
    expect(source).not.toContain("assessmentCandidate = (ownedLegacy || []).find")
    expect(source).toContain(".eq('taster_id', tasterId)")
  })

  test('assessment handoff issuance refuses contact-owner and role conflicts', () => {
    const handoff = read('src/app/api/valu-handoff/route.js')
    const continuation = read('src/app/journey/continue/route.js')
    expect(handoff).toContain('candidate?.linked_user_id && candidate.linked_user_id !== user.id')
    expect(handoff).toContain('candidate?.candidate_email')
    expect(handoff).toContain('candidate?.candidate_role')
    expect(continuation).not.toContain('candidate?.linked_user_id')
    expect(continuation).not.toContain('createValuHandoffToken')
  })

  test('value activation is idempotent and does not silently lose its audit event', () => {
    const source = read('src/app/api/journey/value-activation/route.js')
    expect(source).toContain('alreadyActivated')
    expect(source).toContain('eventError')
    expect(source).toContain('Value activation plan does not exist yet')
  })

  test('opportunity matching does not silently treat database errors as zero matches', () => {
    const source = read('src/app/api/opportunities/matches/route.js')
    expect(source).toContain('query_errors')
    expect(source).toContain('status:502')
  })

  test('employer opportunity submissions use an atomic idempotent publishing RPC', () => {
    const source = read('src/app/api/opportunities/route.js')
    expect(source).toContain('create_employer_opportunity_submission')
    expect(source).toContain('p_submission_key')
    expect(source).not.toContain(".from('opportunities').insert")
  })

  test('opportunity application flow has both professional and employer endpoints', () => {
    const apply = read('src/app/api/opportunities/applications/route.js')
    const employer = read('src/app/api/employer/applications/route.js')
    const dashboard = read('src/app/employer/dashboard/page.jsx')
    expect(apply).toContain("from('opportunity_applications')")
    expect(apply).toContain("event_type: 'application'")
    expect(employer).toContain("application_status_changed")
    expect(dashboard).toContain('/api/employer/applications')
  })

  test('production smoke gate covers the canonical public and unauthenticated API surfaces', () => {
    const source = read('scripts/production-smoke.mjs')
    for (const marker of [
      '/test/assessment',
      '/opportunities',
      '/marketplace',
      '/api/journey/state',
      '/api/journey/diagnostics',
      '/api/opportunities/matches',
      '/api/outcomes',
    ]) expect(source).toContain(marker)
  })
  
  test('marketplace uses the canonical public roster and counts multi-capability professionals uniquely', () => {
    const source = read('src/lib/marketplace-data.js')
    expect(source).toContain("const SOURCE = 'marketplace_public_roster'")
    expect(source).toContain('new Set()')
    expect(source).toContain('row.capabilities')
  })

  test('legacy PRIME color tokens are removed from the active design system', () => {
    const globals = read('src/styles/globals.css')
    const facilitator = read('src/app/facilitators/page.jsx')
    for (const token of ['--teal', '--blue', '--purple', '--amber', '--coral']) {
      expect(globals).not.toContain(token)
    }
    expect(facilitator).not.toContain('COLORS.teal')
    expect(facilitator).not.toContain('#1D9E75')
  })

  test('opportunity detail declares every state value used by the application loop', () => {
    const source = read('src/app/opportunities/[slug]/page.jsx')
    for (const marker of ['[error,setError]', '[session,setSession]', '[coverNote,setCoverNote]', '[applied,setApplied]', '[applying,setApplying]', '[applyError,setApplyError]']) {
      expect(source).toContain(marker)
    }
    expect(source).toContain("supabase.auth.getSession()")
  })

  test('marketplace pages use the canonical capability vocabulary', () => {
    const pages = [
      read('src/app/marketplace/talent/page.jsx'),
      read('src/app/marketplace/speakers/page.jsx'),
      read('src/app/marketplace/facilitators/page.jsx'),
    ].join('\n')
    expect(pages).toContain("getMarketplaceRows('candidate')")
    expect(pages).toContain("getMarketplaceRows('speaker')")
    expect(pages).toContain("getMarketplaceRows('facilitator')")
  })
  test('password recovery waits for the asynchronous Supabase recovery session and surfaces link errors', () => {
    const source = read('src/app/reset-password/page.jsx')
    expect(source).toContain("event === 'PASSWORD_RECOVERY'")
    expect(source).toContain('let resolved = false')
    expect(source).toContain('setTimeout(() => {')
    expect(source).toContain('}, 10000)')
    expect(source).toContain("error_description")
    expect(source).not.toContain('if (!sessionReady) setNoSession(true)')
  })

  test('login password reset uses the canonical production recovery route', () => {
    const source = read('src/app/login/page.jsx')
    expect(source).toContain('resetPasswordForEmail')
    expect(source).toContain('/reset-password')
    expect(source).toContain('setResetSent(true)')
  })

  test('the experience keeps the webbed result and exposes only one next journey action', () => {
    const journey = read('src/components/ValoriaJourneyCards.jsx')
    const report = read('src/app/report/page.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(journey).toContain('role="list"')
    expect(journey).toContain('webNode')
    expect(journey).toContain('YOUR NEXT STEP')
    expect(report).toContain('Your five PRIME dimension results')
    expect(report).toContain('radarShape')
    expect(report).toContain('BUILD MY PROFESSIONAL PROFILE')
    expect(dashboard).toContain('YOUR NEXT STEP')
    expect(dashboard).not.toContain('OBJECTIVES CLEARED')
  })


  test('identity reconciliation cannot change owners or attach a taster without a verified, traceable review', () => {
    const claim = read('src/app/api/admin/reconciliation/claim/route.js')
    const apply = read('src/app/api/admin/reconciliation/apply-taster-link/route.js')
    const ownerApply = read('src/app/api/admin/reconciliation/apply-taster-owner/route.js')
    const reviews = read('src/app/api/admin/reconciliation/reviews/route.js')
    const page = read('src/app/admin/reconciliation/page.jsx')
    expect(claim).toContain("review.decision!=='verified_match'")
    expect(claim).toContain("review.candidate_record_type!=='account'")
    expect(claim).toContain('target.user.email_confirmed_at')
    expect(apply).toContain("review.candidate_record_type!=='taster'")
    expect(apply).toContain("a.user_id!==t.user_id")
    expect(apply).toContain(".is('taster_id',null)")
    expect(apply).toContain("admin_applied_verified_taster_link")
    expect(ownerApply).toContain("review.candidate_record_type!=='account'")
    expect(ownerApply).toContain("taster.user_id&&taster.user_id!==userId")
    expect(ownerApply).toContain("admin_linked_taster_owner")
    expect(ownerApply).toContain("String(review.notes||'').trim().length>=20")
    expect(apply).toContain("String(review.notes||'').trim().length>=20")
    expect(claim).toContain('assessmentEmailMatches')
    expect(claim).toContain("String(review.notes||'').trim().length>=20")
    expect(reviews).toContain("review.application_state=applied?'applied'")
    expect(page).toContain('applyTasterLink')
    expect(page).toContain('applyTasterOwner')
    expect(page).toContain('APPLY VERIFIED ACCOUNT LINK')
    expect(page).toContain('REVIEW ACCOUNT')
    expect(page).toContain('LINK LOCKED')
  })

  test('daily reconciliation monitor is scheduled, authenticated, and read-only with respect to identity links', () => {
    const monitor = read('src/app/api/cron/reconciliation-health/route.js')
    const config = read('vercel.json')
    expect(monitor).toContain('CRON_SECRET')
    expect(monitor).toContain('rpc/run_valu_reconciliation_health')
    expect(monitor).toContain('rpc/record_valu_reconciliation_health_snapshot')
    expect(monitor).toContain('missing_taster_link_assessments_without_verified_taster_review')
    expect(monitor).toContain('platform_notifications')
    expect(monitor).not.toContain("from('valu_assessments').update")
    expect(config).toContain('/api/cron/reconciliation-health')
  })
  
  test('incomplete VALU milestones enter the canonical taster or formal assessment path', () => {
    const cards = read('src/components/ValoriaJourneyCards.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    const nudge = read('src/components/ValuCompletionNudge.jsx')
    expect(cards).toContain('AssessmentStartLink href="/valu/assessment/"')
    expect(cards).toContain('Authorization: `Bearer ${session.access_token}`')
    expect(dashboard).toContain('START / CONTINUE YOUR FULL ASSESSMENT')
    expect(dashboard).toContain('dashboardOnly')
    expect(nudge).toContain('START THE VALU TASTER')
    expect(nudge).toContain('AssessmentStartLink')
    expect(nudge).not.toContain('dashboardOnly')
  })

  test('journey-state API accepts a verified bearer session as well as the SSR cookie session', () => {
    const route = read('src/app/api/journey/state/route.js')
    expect(route).toContain("request.headers.get('authorization')")
    expect(route).toContain('verifier.auth.getUser(bearer)')
    expect(route).toContain('createServerClient')
  })

  test('dashboard is the only authenticated continuation entry point', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    const nav = read('src/components/Nav.jsx')
    const start = read('src/app/valu/start/page.jsx')
    const journey = read('src/app/journey/page.jsx')
    const journeyCards = read('src/components/ValoriaJourneyCards.jsx')
    const nudge = read('src/components/ValuCompletionNudge.jsx')
    const continuation = read('src/app/journey/continue/route.js')
    const legacyBridge = read('src/app/assessment/bridge/page.jsx')
    expect(legacyBridge).toContain("redirect('/dashboard')")
    expect(dashboard).toContain('AssessmentStartLink')
    expect(dashboard).toContain('dashboardOnly')
    expect(nav).toContain('export function AssessmentStartLink')
    expect(nav).toContain("fetch('/api/valu-handoff'")
    expect(nav).toContain('window.location.assign(data.url)')
    expect(nav).toContain("method: 'GET'")
    expect(nav).toContain('if (access.assessment_completed)')
    expect(nav).toContain('if (!access.can_continue)')
    expect(nav).toContain("const linkHref = dashboardOnly ? '/dashboard' : href")
    expect(nav).not.toContain('NEXT_PUBLIC_VALU_ASSESSMENT_ORIGIN')
    expect(nav).not.toContain('assessment.valoriainstitute.com/remaining')
    expect(nav).toContain('<a href={linkHref}')
    expect(nav).not.toContain("window.location.assign('/assessment/bridge')")
    expect(nav).not.toContain('pending_taster_id')
    expect(nav).not.toContain("continuation.searchParams.set('stage', 'assess')")
    expect(start).toContain('AssessmentStartLink')
    expect(journey).toContain("assess: '/dashboard'")
    expect(journeyCards).toContain("href:'/dashboard'")
    expect(journeyCards).toContain('AssessmentStartLink')
    expect(nudge).toContain('AssessmentStartLink')
    expect(nudge).not.toContain('dashboardOnly')
    expect(nudge).toContain('AssessmentStartLink href="/valu/assessment/"')
    expect(nudge).toContain('href="/profile/setup"')
    expect(nudge).not.toContain('/valu/start')
    expect(continuation).toContain("stage === 'assess'")
    expect(continuation).toContain("return NextResponse.redirect(new URL('/dashboard', request.url))")
    expect(continuation).not.toContain('assessment.valoriainstitute.com')
  })


  test('the taster, account confirmation, and formal assessment are distinct journey stages', () => {
    const progress = read('src/components/VALUJourneyProgress.jsx')
    const signup = read('src/app/professional-signup/page.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(progress).toContain('Your starting insight')
    expect(progress).toContain('Secure your profile')
    expect(progress).toContain('Your full capability picture')
    expect(progress).not.toContain('9 questions')
    expect(progress).not.toContain('58 questions')
    expect(signup).toContain('VALUJourneyProgress stage="account"')
    expect(dashboard).toContain('VALUJourneyProgress stage="full"')
    expect(signup).not.toContain('9-QUESTION VALU INDEX COMPLETE')
    expect(signup).toContain('VALU taster saved')
    expect(dashboard).toContain('START / CONTINUE YOUR FULL ASSESSMENT')
    expect(dashboard).not.toContain('Question 10')
  })


  test('dashboard makes the next milestone visible and previews what follows without inventing saved progress', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain('COMING UP AFTER THIS')
    expect(dashboard).toContain('You’ll unlock:')
    expect(dashboard).not.toContain('hasSavedOpening')
    expect(dashboard).toContain('Your taster is complete. Continue into your full assessment.')
    expect(dashboard).toContain('Begin with the VALU taster for a directional starting point.')
    expect(dashboard).not.toContain('Your opening nine answers are saved. Your account is confirmed.')
  })


  test('the completed VALU report creates anticipation for profile building and the next marketplace stages', () => {
    const report = read('src/app/report/page.jsx')
    expect(report).toContain('VALU COMPLETE · YOUR NEXT CHAPTER')
    expect(report).toContain('Turn your insight into a professional presence.')
    expect(report).toContain('/profile/setup')
    expect(report).toContain('Choose capabilities')
    expect(report).toContain('Prepare for the Registry')
    expect(report).toContain(' points</span>')
  })

  test('public VALU explanation distinguishes the taster from the formal assessment', () => {
    const start = read('src/app/valu/start/page.jsx')
    expect(start).toContain('Begin with the VALU taster')
    expect(start).toContain('complete your full assessment')
    expect(start).not.toContain('Questions 10–58')
    expect(start).toContain('A clear first signal.')
    expect(start).not.toContain('Two sessions. One result.')
    expect(start).toContain('Your official result in points')
  })


  test('the account bridge explains email confirmation and dashboard return before the formal assessment', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    const callback = read('src/app/auth/callback/page.jsx')
    expect(signup).toContain('ACCOUNT BRIDGE · EMAIL CONFIRMATION')
    expect(signup).toContain('One quick confirmation.')
    expect(signup).toContain('Then your formal assessment.')
    expect(signup).not.toContain('Question 1')
    expect(signup).toContain('VALU taster saved')
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')")
    expect(callback).not.toContain('VALUJourneyProgress')
    expect(callback).not.toContain('Your next steps')
    expect(callback).not.toContain('Continue at Question 10')
  })

  test('dashboard launches the secure assessment handoff directly without an interstitial', () => {
    const nav = read('src/components/Nav.jsx')
    const events = read('src/lib/professionalStandardSeries.js')
    expect(nav).toContain("fetch('/api/valu-handoff'")
    expect(nav).toContain('window.location.assign(data.url)')
    expect(events).toContain('dateApproved: false')
    expect(read('src/app/auth/callback/page.jsx')).not.toContain('ValoriaHandoverCards')
  })

  test('saved VALU handover is visible for dashboard accounts with or without a professional profile', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain('if (!profile && assessmentAccess?.can_continue) return <DashboardAssessmentHandover standalone />')
    expect(dashboard).toContain('{assessmentAccess?.can_continue && (')
    expect(dashboard).toContain('Your taster is linked to this account.')
    expect(dashboard).not.toContain('<ValoriaHandoverCards />')
    expect(dashboard).toContain('AssessmentStartLink')
    expect(dashboard).toContain('dashboardOnly')
    expect(dashboard).toContain('isSupply && !assessmentAccess?.can_continue')
  })

  test('dashboard presents one primary assessment action and keeps the VALU Index card informational', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    const sidebar = dashboard.split('{/* VALU Index */}')[1].split('{/* Profile completeness */}')[0]
    expect(dashboard).toContain('<AccessProgressCard')
    expect(sidebar).toContain('ASSESSMENT IN PROGRESS')
    expect(sidebar).not.toContain('AssessmentStartLink')
    expect(sidebar).not.toContain('CONTINUE YOUR VALU ASSESSMENT')
    expect(sidebar).toContain('Your official VALU Index and PRIME insights will appear here')
  })





  test('signed-in assessment navigation checks canonical access before creating a handoff', () => {
    const nav = read('src/components/Nav.jsx')
    expect(nav).toContain("method: 'GET'")
    expect(nav).toContain('if (!access.can_continue)')
    expect(nav).toContain('window.location.assign(href)')
    expect(nav.indexOf("method: 'GET'")).toBeLessThan(nav.indexOf("method: 'POST'"))
    expect(nav).toContain("const linkHref = dashboardOnly ? '/dashboard' : href")
    expect(nav).not.toContain('assessment.valoriainstitute.com/remaining')
  })

  test('completed full assessments return to the dashboard before a new handoff is created', () => {
    const nav = read('src/components/Nav.jsx')
    expect(nav).toContain('if (access.assessment_completed)')
    expect(nav).toContain("window.location.assign('/dashboard')")
    expect(nav.indexOf('if (access.assessment_completed)')).toBeLessThan(nav.indexOf("method: 'POST'"))
    expect(nav).toContain('if (!access.can_continue)')
  })

})
