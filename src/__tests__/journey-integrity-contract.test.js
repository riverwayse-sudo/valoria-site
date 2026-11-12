const fs = require('fs')
const path = require('path')
const { deriveJourneyState } = require('../lib/journey-state')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

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
    expect(state.eligibility.missing).toContain('A current full VALU Index')
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
    expect(source).toContain('Sign in to your account')
    expect(source).not.toContain("from('valoria_reentry_links').insert")
    expect(source).not.toContain('CONTINUE TO QUESTION 10')
    expect(source).not.toContain('pending_taster_id')
    expect(source).not.toContain('taster_id=')
    expect(source).toContain('email_confirmed_at')
  })

  test('professional account creation links the saved taster and returns signed-in users to the dashboard', () => {
    const source = read('src/app/professional-signup/page.jsx')
    expect(source).toContain('continueSignedInUser')
    expect(source).toContain("window.location.replace('/dashboard?welcome=profile')")
    expect(source).toContain("localStorage.removeItem('pending_taster_id')")
    expect(source).toContain('TASTER SAVED')
    expect(source).toContain('CREATE ACCOUNT')
    expect(source).not.toContain('Question 10')
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

  test('email confirmation links the saved taster and returns the participant to the dashboard', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    const handoff = read('src/app/api/valu-handoff/route.js')
    expect(callback).toContain('/api/link-taster')
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')")
    expect(dashboard).toContain('DashboardAssessmentHandover')
    expect(dashboard).toContain('assessmentAccess?.can_continue')
    expect(dashboard).toContain('AssessmentStartLink')
    expect(dashboard).not.toMatch(/Question\s+\d+|58-question/i)
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
    expect(reportTrigger).toContain("from '@/lib/valu-origin'")
    expect(reportTrigger).toContain('getValuAssessmentOrigin(process.env)')
    expect(origin).toContain("env.CF_WORKERS === '1'")
    expect(origin).toContain("env.CF_WORKERS_PREVIEW === '1'")
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

  test('opportunity submission removes the created opportunity if submission persistence fails', () => {
    const source = read('src/app/api/opportunities/route.js')
    expect(source).toContain("from('opportunities').delete()")
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

  test('marketplace pages use the canonical capability vocabulary through the verified directory loader', () => {
    const pages = [
      read('src/app/marketplace/talent/page.jsx'),
      read('src/app/marketplace/speakers/page.jsx'),
      read('src/app/marketplace/facilitators/page.jsx'),
    ].join('\n')
    expect(pages).toContain("getMarketplaceDirectoryData('candidate')")
    expect(pages).toContain("getMarketplaceDirectoryData('speaker')")
    expect(pages).toContain("getMarketplaceDirectoryData('facilitator')")
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
  
  test('every incomplete VALU dashboard milestone opens the secure direct assessment handoff', () => {
    const cards = read('src/components/ValoriaJourneyCards.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    const nudge = read('src/components/ValuCompletionNudge.jsx')
    expect(cards).toContain("href:'/dashboard'")
    expect(cards).toContain('Authorization: `Bearer ${session.access_token}`')
    expect(dashboard).toContain('CONTINUE YOUR ASSESSMENT')
    expect(dashboard).toContain('dashboardOnly')
    expect(nudge).toContain('CONTINUE MY ASSESSMENT')
    expect(nudge).toContain('AssessmentStartLink')
    expect(nudge).toContain('dashboardOnly')
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
    expect(nav).toContain("const linkHref = dashboardOnly ? 'https://assessment.valoriainstitute.com/remaining' : href")
    expect(nav).toContain('<a href={linkHref}')
    expect(nav).not.toContain("window.location.assign('/assessment/bridge')")
    expect(nav).not.toContain('pending_taster_id')
    expect(nav).not.toContain("continuation.searchParams.set('stage', 'assess')")
    expect(start).toContain('AssessmentStartLink')
    expect(journey).toContain("assess: '/dashboard'")
    expect(journeyCards).toContain("href:'/dashboard'")
    expect(journeyCards).toContain('AssessmentStartLink')
    expect(nudge).toContain('AssessmentStartLink')
    expect(nudge).toContain('dashboardOnly')
    expect(nudge).toContain('href={assessed?"/profile/setup":"/valu/start"}')
    expect(continuation).toContain("stage === 'assess'")
    expect(continuation).toContain("return NextResponse.redirect(new URL('/dashboard', request.url))")
    expect(continuation).not.toContain('assessment.valoriainstitute.com')
  })


  test('the VALU journey presents registration, taster, account creation and Full assessment without question counts', () => {
    const progress = read('src/components/VALUJourneyProgress.jsx')
    const signup = read('src/app/professional-signup/page.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    for (const step of ["title: 'Register'", "title: 'Taster'", "title: 'Account'", "title: 'Assessment'"]) {
      expect(progress).toContain(step)
    }
    expect(progress).not.toMatch(/Questions?\s+\d|\d+\s+of\s+\d+/i)
    expect(signup).toContain('VALUJourneyProgress stage="account"')
    expect(dashboard).toContain('AssessmentStartLink')
  })
  test('signed-in assessment CTA returns participants without a linked taster to the public taster', () => {
    const nav = read('src/components/Nav.jsx')
    expect(nav).toContain("method: 'GET'")
    expect(nav).toContain('if (!access.can_continue)')
    expect(nav).toContain('window.location.assign(href)')
    expect(nav.indexOf("method: 'GET'")).toBeLessThan(nav.indexOf("method: 'POST'"))
  })

  test('dashboard shows the Full assessment continuation only when access is verified', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain('DashboardAssessmentHandover')
    expect(dashboard).toContain('assessmentAccess?.can_continue')
    expect(dashboard).toContain('AssessmentStartLink')
    expect(dashboard).not.toMatch(/Question\s+\d+|58-question|Questions 10/i)
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

  test('public VALU explanation follows account confirmation, separate Taster and Full assessment', () => {
    const start = read('src/app/valu/start/page.jsx')
    const signup = read('src/app/professional-signup/page.jsx')
    expect(start).toContain('Create your Valoria account and confirm your email before beginning the Taster')
    expect(start).toContain('Your official result in points')
    expect(start).not.toMatch(/Question\s+\d+\s+of\s+\d+/i)
    expect(start).not.toMatch(/9-question|58-question/i)
    expect(signup).toContain('VALU Index Taster')
    expect(signup).toContain('full VALU Index')
  })
  test('legacy post-taster account linking remains available without changing the account-first entry flow', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    const callback = read('src/app/auth/callback/page.jsx')
    expect(signup).toContain('ACCOUNT BRIDGE')
    expect(signup).toContain('Confirm your email')
    expect(signup).toContain('full VALU Index')
    expect(signup).not.toContain('Question 10')
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')")
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

  test('saved VALU handover is available to eligible dashboard accounts without exposing internal progress counts', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain('if (!profile && assessmentAccess?.can_continue) return <DashboardAssessmentHandover standalone />')
    expect(dashboard).toContain('assessmentAccess?.can_continue')
    expect(dashboard).toContain('AssessmentStartLink')
    expect(dashboard).not.toMatch(/Question\s+\d+|58-question|Questions 10/i)
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


  test('professional account signup and email confirmation happen before the Taster', () => {
    const register = read('src/app/valu/register/page.jsx')
    const bootstrap = read('src/app/api/valu-taster/bootstrap/route.js')
    const tasterStart = read('src/app/api/valu-taster/start/route.js')
    const callback = read('src/app/auth/callback/page.jsx')
    const publicSignup = read('src/app/signup/page.jsx')
    expect(register).toContain('valu_taster_signup: true')
    expect(register).toContain('emailRedirectTo: emailRedirect()')
    expect(register).toContain('CREATE ACCOUNT & CONTINUE')
    expect(register).toContain('supabase.auth.getSession()')
    expect(register).toContain("fetch('/api/valu-taster/start'")
    expect(tasterStart).toContain('user.email_confirmed_at')
    expect(tasterStart).toContain("metadata.valu_taster_signup !== true")
    expect(tasterStart).toContain("entry_point: 'taster_start'")
    expect(tasterStart).toContain("target_stage: 'taster'")
    expect(tasterStart).toContain("randomBytes(32).toString('base64url')")
    expect(tasterStart).toContain('completedTaster')
    expect(tasterStart).toContain("new URL('/dashboard?welcome=profile', request.url)")
    expect(tasterStart).toContain("headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }")
    expect(bootstrap).toContain('user.email_confirmed_at')
    expect(bootstrap).toContain("metadata.valu_taster_signup !== true")
    expect(bootstrap).toContain("begin_valu_taster_signup")
    expect(bootstrap).toContain("p_signup_key: user.id")
    expect(bootstrap).toContain('stableResumeToken')
    expect(bootstrap).toContain('client cannot create unlimited parallel Taster records')
    expect(bootstrap).toContain("from('lead_captures')")
    expect(bootstrap).toContain('Your saved Taster session has expired')
    expect(callback).toContain("params.get('valu_taster') === '1' && !identityHash && !pendingTasterId")
    expect(callback).toContain("fetch('/api/valu-taster/start'")
    expect(callback).toContain('window.location.replace(destination.toString())')
    expect(publicSignup).toContain('href="/valu/register/"')
    expect(publicSignup).toContain('create and confirm your Valoria account before taking the VALU Index Taster')
  })

  test('the assessment app cannot create a new Taster without the confirmed-account bootstrap', () => {
    const source = read('src/app/api/valu-taster/bootstrap/route.js')
    const gate = read('src/app/valu/register/page.jsx')
    expect(source).toContain('createServerClient')
    expect(source).toContain('user.email_confirmed_at')
    expect(source).toContain('createHmac')
    expect(source).toContain('begin_valu_taster_signup')
    expect(gate).toContain('supabase.auth.signUp')
    expect(gate).toContain('supabase.auth.signInWithPassword')
  })


  test('staging robots and sitemap never advertise production as the canonical host', () => {
    const robots = read('src/app/robots.js')
    const sitemap = read('src/app/sitemap.js')
    const workflow = read('.github/workflows/cloudflare-current-site-staging.yml')
    const layout = read('src/app/layout.jsx')
    expect(robots).toContain('process.env.NEXT_PUBLIC_SITE_URL')
    expect(robots).toContain("(process.env.NEXT_PUBLIC_SITE_URL || '').includes('staging.')")
    expect(robots).toContain("disallow: ['/']")
    expect(sitemap).toContain("const SITE_URL = IS_STAGING ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.valoriainstitute.com') : 'https://valoriainstitute.com'")
    expect(workflow).toContain('<loc>https://staging.valoriainstitute.com/')
    expect(workflow).toContain('Staging sitemap must not publish production canonical URLs')
    expect(layout).toContain('staging-site-banner')
    expect(layout).toContain('robots:IS_STAGING?{index:false,follow:false')
    expect(layout).toContain('const GA_MEASUREMENT_ID = IS_STAGING ? null')
  })


  test('VALU explainer uses participant-facing language without discoverability jargon', () => {
    const valu = read('src/app/valu/page.jsx')
    expect(valu).toContain('make them easier to match to relevant opportunities')
    expect(valu).not.toMatch(/become discoverable|discoverability/i)
  })

  test('account-first Taster completion never creates a second account after the Taster', () => {
    const professionalSignup = read('src/app/professional-signup/page.jsx')
    expect(professionalSignup).toContain("params.get('account_first')==='1'")
    expect(professionalSignup).toContain('Sign in to the same confirmed Valoria account')
    expect(professionalSignup).toContain('No second account is needed.')
    expect(professionalSignup).toContain('/login?pending_taster_id=')
    expect(professionalSignup).toContain("if(accountFirst && !redirecting)return")
    expect(professionalSignup).toContain("window.location.replace('/dashboard?welcome=profile')")
  })

  test('public marketplace copy avoids internal listing and sourcing terminology', () => {
    const registry = read('src/components/LiveProfilesScroll.jsx')
    const directory = read('src/components/MarketplaceDirectory.jsx')
    for (const source of [registry, directory]) {
      expect(source).not.toMatch(/BASIC LISTING|FULL LISTING|sourcing access|buyer access|BASIC PROFESSIONAL LISTING/i)
    }
    expect(registry).toContain('Discuss your talent needs')
    expect(directory).toContain('DISCUSS YOUR TALENT NEEDS')
  })

  test('homepage registry uses compact cards without exposing internal listing tiers', () => {
    const registry = read('src/components/LiveProfilesScroll.jsx')
    const homeCss = read('src/app/home.css')
    expect(registry).toContain("isBasic ? 'PUBLIC PROFILE'")
    expect(registry).toContain("isBasic ? 'PROFILE' : 'VALU INDEX'")
    expect(registry).not.toContain('BASIC LISTING')
    expect(registry).not.toContain('FULL LISTING')
    expect(registry).not.toContain('WANT TO BE DISCOVERED')
    expect(registry).toContain('YOUR PROFESSIONAL PRESENCE')
    expect(homeCss).toContain('width: min(350px, 82vw)')
    expect(homeCss).toContain('min-height: 142px')
    expect(homeCss).toContain('grid-template-columns: 40px minmax(0,1fr) 54px 12px')
  })

  test('public VALU entry points route through account-first registration while preserving signed-in handoff', () => {
    const navigation = read('src/config/navigation.js')
    const nav = read('src/components/Nav.jsx')
    const home = read('src/app/page.jsx')
    const valu = read('src/app/valu/page.jsx')
    const register = read('src/app/valu/register/page.jsx')
    const hero = read('src/components/HeroSlider.jsx')
    const footer = read('src/components/Footer.jsx')
    const liveProfiles = read('src/components/LiveProfilesScroll.jsx')
    expect(navigation).toContain("assessmentUrl: '/valu/register/'")
    expect(nav).toContain("href = '/valu/register/'")
    expect(home).toContain('href="/valu/register/"')
    expect(home).toContain("import LiveProfilesScroll from '@/components/LiveProfilesScroll'")
    expect(home).toContain('<LiveProfilesScroll />')
    expect(home).not.toContain('CapabilityProfilePreview')
    expect(valu).toContain('Create and confirm your Valoria account first')
    expect(register).toContain("{mode !== 'complete' && <label style={S.label}>PASSWORD")
    expect(register).toContain("disabled={mode==='complete'}")
    expect(hero).toContain('href="/valu/register/"')
    expect(footer).toContain('<AssessmentStartLink href="/valu/register/">')
    expect(liveProfiles).toContain("candidate: { label: 'Talent'")
    expect(liveProfiles).toContain("speaker: { label: 'Speaker'")
    expect(liveProfiles).toContain("facilitator: { label: 'Facilitator'")
    expect(liveProfiles).toContain('getMarketplaceDirectoryData')
    expect(liveProfiles).toContain('assessment_access === \'basic\'')
    expect(nav).toContain("fetch('/api/valu-handoff'")
    expect(nav).toContain('window.location.assign(data.url)')
  })


})
