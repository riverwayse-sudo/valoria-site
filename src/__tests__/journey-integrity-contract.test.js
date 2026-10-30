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
    expect(continuation).toContain("searchParams.has('pending_taster_id')")
  })

  test('assessment return from login always lands on dashboard before the user chooses to continue', () => {
    const login = read('src/app/login/page.jsx')
    expect(login).toContain("target.pathname === '/journey/continue'")
    expect(login).toContain("window.location.replace('/dashboard')")
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

  test('professional signup preserves the snapshot but sends authenticated users to the dashboard before full assessment', () => {
    const source = read('src/app/professional-signup/page.jsx')
    expect(source).not.toContain('https://valoriainstitute.com/journey/continue?stage=assess&taster_id=')
    expect(source).toContain('GO TO MY DASHBOARD')
    expect(source).toContain('Sign in to connect your saved VALU snapshot.')
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
    expect(dashboard).toContain('CONTINUE TO QUESTION 10')
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
  
  test('dashboard is the only authenticated continuation entry point', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    const nav = read('src/components/Nav.jsx')
    const start = read('src/app/valu/start/page.jsx')
    const continuation = read('src/app/journey/continue/route.js')
    expect(dashboard).toContain('AssessmentStartLink')
    expect(dashboard).toContain('dashboardOnly')
    expect(nav).toContain('export function AssessmentStartLink')
    expect(nav).toContain("fetch('/api/valu-handoff'")
    expect(nav).toContain("window.location.assign('/dashboard')")
    expect(nav).not.toContain('pending_taster_id')
    expect(nav).not.toContain("continuation.searchParams.set('stage', 'assess')")
    expect(start).toContain('AssessmentStartLink')
    expect(continuation).toContain("stage === 'assess'")
    expect(continuation).toContain("return NextResponse.redirect(new URL('/dashboard', request.url))")
    expect(continuation).not.toContain('assessment.valoriainstitute.com')
  })


  test('the VALU opening, confirmation bridge, and Question 10 continuation read as one journey', () => {
    const progress = read('src/components/VALUJourneyProgress.jsx')
    const signup = read('src/app/professional-signup/page.jsx')
    const callback = read('src/app/auth/callback/page.jsx')
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(progress).toContain('Questions 1–9')
    expect(progress).toContain('Save & confirm')
    expect(progress).toContain('Questions 10–58')
    expect(signup).toContain('VALUJourneyProgress stage="bridge"')
    expect(callback).toContain('VALUJourneyProgress stage="bridge"')
    expect(dashboard).toContain('VALUJourneyProgress stage="continuation"')
    expect(signup).not.toContain('9-QUESTION VALU INDEX COMPLETE')
    expect(signup).toContain('Opening 9 of 58 · Saved')
    expect(dashboard).toContain('CONTINUE TO QUESTION 10')
  })


  test('dashboard makes the next milestone visible and previews what follows without inventing saved progress', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain('COMING UP AFTER THIS')
    expect(dashboard).toContain('You’ll unlock:')
    expect(dashboard).toContain('hasSavedOpening={!!assessmentAccess?.can_continue}')
    expect(dashboard).toContain('Your first answers are saved. Ready for the next 49?')
    expect(dashboard).toContain('Start or continue your 58-question VALU assessment.')
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

  test('public VALU explanation describes one continuous 58-question journey with an account bridge', () => {
    const start = read('src/app/valu/start/page.jsx')
    expect(start).toContain('one continuous journey of 58 questions')
    expect(start).toContain('Questions 10–58')
    expect(start).toContain('One continuous journey.')
    expect(start).not.toContain('Two sessions. One result.')
    expect(start).toContain('Your official result in points')
  })


  test('the account bridge explains email confirmation, signed-in return and Question 10 as the next action', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    const callback = read('src/app/auth/callback/page.jsx')
    expect(signup).toContain('ACCOUNT BRIDGE · STEP 2 OF 3')
    expect(signup).toContain('ACCOUNT BRIDGE · EMAIL CONFIRMATION')
    expect(signup).toContain('One quick confirmation.')
    expect(signup).toContain('Then Question 10.')
    expect(signup).toContain('Continue at Question 10')
    expect(signup).toContain('Opening nine saved')
    expect(callback).toContain('Your dashboard is ready; continue at Question 10.')
    expect(callback).toContain('Return to your dashboard')
    expect(callback).toContain('No separate login is needed.')
    expect(callback).toContain('Continue at Question 10')
  })

})
