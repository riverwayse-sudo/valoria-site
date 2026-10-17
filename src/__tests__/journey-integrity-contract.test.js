const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('journey integrity contract', () => { // UX simplification coverage + dashboard web
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

  test('full VALU launch links are signed, time-limited, and bound to the authenticated snapshot owner', () => {
    const signer = read('src/lib/valu-handoff-token.js')
    const handoff = read('src/app/api/valu-handoff/route.js')
    const continuation = read('src/app/journey/continue/route.js')
    expect(signer).toContain('createHmac')
    expect(signer).toContain('valu-full-assessment')
    expect(signer).toContain('TOKEN_TTL_SECONDS')
    expect(handoff).toContain('user.email_confirmed_at')
    expect(handoff).toContain('createValuHandoffToken(user.id, taster.id)')
    expect(handoff).toContain('destination.hash')
    expect(continuation).toContain('createValuHandoffToken(user.id,taster.id)')
    expect(continuation).toContain("login.searchParams.set('returnTo','/journey/continue?'+continuationParams.toString())")
    expect(continuation).toContain("destinationParams.set('resume',resumeToken)")
    expect(continuation).not.toContain("return NextResponse.redirect(new URL(ASSESSMENT_ORIGIN+'/',request.url))")
  })

  test('assessment reminder links require account continuation instead of anonymous assessment submission', () => {
    const source = read('src/app/api/cron/valu-reminders/route.js')
    expect(source).toContain('/journey/continue?stage=assess&taster_id=')
    expect(source).not.toContain('/valu/assessment/?full=1&taster_id=')
    expect(source).toContain('email_confirmed_at')
  })

  test('professional signup sends the user through authenticated continuation for the full assessment', () => {
    const source = read('src/app/professional-signup/page.jsx')
    expect(source).toContain('https://valoriainstitute.com/journey/continue?stage=assess&taster_id=')
    expect(source).not.toContain('/valu/assessment/?full=1&taster_id=')
  })

  test('pending snapshot claim survives a failed link attempt so the user can retry', () => {
    const source = read('src/app/login/page.jsx')
    const failedLink = source.indexOf('if (!linkRes.ok)')
    const clearPending = source.indexOf("localStorage.removeItem('pending_taster_id')")
    expect(failedLink).toBeGreaterThan(-1)
    expect(clearPending).toBeGreaterThan(failedLink)
    expect(source).toContain('Keep the pending ID so the user can retry')
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
    expect(continuation).toContain('candidate?.linked_user_id&&candidate.linked_user_id!==user.id')
    expect(continuation).toContain('candidate?.candidate_email')
    expect(continuation).toContain('candidate?.candidate_role')
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
    expect(report).toContain('SEE MY NEXT STEP')
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
})
