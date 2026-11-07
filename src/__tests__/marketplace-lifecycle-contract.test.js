const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('VALUI marketplace lifecycle contract', () => {
  test('marketplace has one canonical directory route and three clean capability routes', () => {
    const rootSource = read('src/app/marketplace/page.jsx')
    const talent = read('src/app/marketplace/talent/page.jsx')
    const speakers = read('src/app/marketplace/speakers/page.jsx')
    const facilitators = read('src/app/marketplace/facilitators/page.jsx')

    expect(rootSource).toContain("import MarketplaceDirectory from '@/components/MarketplaceDirectory'")
    expect(rootSource).toContain("getMarketplaceDirectoryData('all')")
    expect(rootSource).toContain('activeTrack="all"')

    for (const source of [talent, speakers, facilitators]) {
      expect(source).toContain("import MarketplaceDirectory from '@/components/MarketplaceDirectory'")
      expect(source).toContain('getMarketplaceDirectoryData')
      expect(source).toContain('activeTrack=')
    }
    expect(talent).toContain("getMarketplaceDirectoryData('candidate')")
    expect(speakers).toContain("getMarketplaceDirectoryData('speaker')")
    expect(facilitators).toContain("getMarketplaceDirectoryData('facilitator')")
  })

  test('public marketplace supports consented Basic taster listings and Full VALU listings', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const data = read('src/lib/marketplace-data.js')
    expect(data).toContain('assessment_access')
    expect(data).toContain("row.assessment_access === 'basic'")
    expect(data).toContain("row.assessment_access === 'full'")
    expect(data).toContain("from('taster_sessions')")
    expect(data).toContain("public-profile-visibility-v3-2026-11-07")
    expect(data).toContain('assessment_summary: null')
    expect(directory).toContain('FULL VALU ASSESSED')
    expect(directory).toContain('BASIC LISTING')
  })

  test('About preserves the approved Vision and Purpose while retiring outdated institutional language', () => {
    const source = read('src/app/about/page.jsx')
    for (const statement of ['Vision', 'Mission', 'Purpose', 'An Africa where professional merit always finds its platform.', 'To develop professionals with rigour, surface talent with merit, and connect capability to meaningful opportunity.', 'To bridge the gap between latent brilliance and institutional scale.']) {
      expect(source).toContain(statement)
    }
    expect(source).toContain('not a certification body')
    expect(source).not.toContain('Africa\'s human capital institution</')
  })

  test('Valoria Develop uses the approved formats and withholds unconfirmed certification and commercial claims', () => {
    const source = read('src/app/programmes/page.jsx')
    for (const approved of ['PRIME Sprint', 'PRIME Cluster Programme', 'PRIME Certified Professional', 'Executive Immersion', 'One day', 'Six weeks', 'Six months', 'Three days', '70% Experiential', '20% Social', '10% Formal']) {
      expect(source).toContain(approved)
    }
    expect(source).toContain('IN DEVELOPMENT')
    expect(source).toContain('certification process is in development; participation in this pathway does not currently confer a Valoria certification')
    expect(source).not.toContain('certified facilitators')
    expect(source).not.toContain('90-day re-measurement')
    expect(source).not.toContain('90-day remeasurement')
    expect(source).not.toContain('PRICE')
  })

  test('public marketplace cards do not expose compensation fields', () => {
    const data = read('src/lib/marketplace-data.js')
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(data).not.toContain('salary_expectation')
    expect(data).not.toContain('fee_range')
    expect(directory).not.toContain('SALARY EXPECTATION')
    expect(directory).not.toContain('FEE RANGE')
  })

  test('marketplace counts and category filters reuse one consent-verified roster read', () => {
    const source = read('src/lib/marketplace-data.js')
    expect(source).toContain('export async function getMarketplaceDirectoryData(track = \'all\')')
    expect(source).toContain("const allRows = await getMarketplaceRows('all')")
    expect(source).toContain('counts: countMarketplaceRows(allRows)')
    expect(source).toContain('allRows.filter(row => row.capabilities.includes(normalizedTrack))')
  })

  test('marketplace data is professional-first and deduplicates capabilities', () => {
    const source = read('src/lib/marketplace-data.js')
    expect(source).toContain('professional_id')
    expect(source).toContain('new Set')
    expect(source).toContain('all: (rows || []).length')
    expect(source).toContain('candidate: byTrack.candidate.size')
    expect(source).toContain('speaker: byTrack.speaker.size')
    expect(source).toContain('facilitator: byTrack.facilitator.size')
  })

  test('marketplace cards display selected capabilities without changing category eligibility filters', () => {
    const data = read('src/lib/marketplace-data.js')
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(data).toContain('selected_capabilities')
    expect(data).toContain('selectedCapabilities: []')
    expect(data).toContain('target.selectedCapabilities')
    expect(directory).toContain('Array.isArray(p.selectedCapabilities)')
    expect(directory).toContain('Array.isArray(p.selected_capabilities)')
    expect(directory).toContain('selectedCaps.has')
    expect(directory).toContain('aria-label={`Declared roles:')
    expect(directory).toContain('DECLARED ROLES')
    expect(directory).toContain("key:'candidate'")
    expect(directory).toContain("key:'speaker'")
    expect(directory).toContain("key:'facilitator'")
    expect(directory).toContain('NOT SELECTED')
    const categoryFilter = directory.slice(directory.indexOf('const results = useMemo'), directory.indexOf('return <div className={styles.page}'))
    expect(categoryFilter).toContain('p.capabilities || p.tracks || [p.track]')
    expect(categoryFilter).not.toContain('selectedCapabilities')
  })

  test('open marketplace directories refresh server-rendered counts automatically', () => {
    const source = read('src/components/MarketplaceDirectory.jsx')
    expect(source).toContain('useRouter')
    expect(source).toContain('router.refresh()')
    expect(source).toContain('window.setInterval(refreshWhenVisible, 30_000)')
    expect(source).toContain("document.addEventListener('visibilitychange', refreshWhenVisible)")
    expect(source).toContain('window.clearInterval(interval)')
  })

  test('CV uploads create private evidence records from both onboarding and profile edit', () => {
    const helper = read('src/lib/upload-professional-cv.js')
    const setup = read('src/app/profile/setup/page.jsx')
    const edit = read('src/app/profile/edit/page.jsx')
    expect(helper).toContain("from('cvs')")
    expect(helper).toContain("from('professional_documents')")
    expect(helper).toContain("document_type: 'cv'")
    expect(helper).toContain("visibility: 'private'")
    expect(helper).toContain("verification_status: 'pending'")
    expect(helper).toContain('size_bytes: file.size')
    expect(helper).toContain('10 * 1024 * 1024')
    expect(helper).toContain('remove([storagePath])')
    expect(setup).toContain('uploadProfessionalCv(supabase, user.id, file)')
    expect(edit).toContain('uploadProfessionalCv(supabase, user.id, file)')
  })

  test('existing CV evidence backfill uses exact profile-to-storage object matches', () => {
    const migration = read('supabase/migrations/20261030122022_backfill_existing_cv_document_records_20261030140000.sql')
  })

  test('profile onboarding serializes saves, syncs capabilities, and reads database-derived completion', () => {
    const source = read('src/app/profile/setup/page.jsx')
    expect(source).toContain('saveQueueRef.current.catch(() => {}).then(write)')
    expect(source).toContain('const saved = await saveProgress()')
    expect(source).not.toContain(".from('professional_capabilities')")
    expect(source).toContain('if (saved) router.push(\'/dashboard\')')
    const capabilitySync = source.indexOf("fetch('/api/profile/capabilities'")
    const completionRead = source.indexOf(".select('atb_id, listing_status, profile_complete')")
    expect(capabilitySync).toBeGreaterThan(-1)
    expect(completionRead).toBeGreaterThan(capabilitySync)
    expect(source).not.toContain("update({ profile_complete: true")
  })

  test('profile setup matches database readiness requirements and verifies completion read-back', () => {
    const source = read('src/app/profile/setup/page.jsx')
    expect(source).toContain("key:'photo_url', kind:'photo'")
    expect(source).toContain('sub:\'Optional. Valoria uses a professional default avatar')
    expect(source).toContain('required:false })')
    expect(source).toContain(".select('atb_id, listing_status, profile_complete')")
    expect(source).not.toContain('if (!row?.profile_complete)')
    const consentRoute = read('src/app/api/profile/acknowledgements/route.js')
    expect(consentRoute).toContain('basicEligible')
    expect(consentRoute).toContain('fullEligible')
  })

  test('database keeps profile completeness separate from full-assessment and listing eligibility', () => {
    const migration = read('supabase/migrations/20261008140000_default_avatar_photo_optional.sql')
    const profileTriggerStart = migration.indexOf('create or replace function public.enforce_valu_profile_lifecycle()')
    const capabilityGateStart = migration.indexOf('create or replace function private.evaluate_professional_capability')
    const readinessGateStart = migration.indexOf('create or replace function private.evaluate_professional_readiness')
    const profileTrigger = migration.slice(profileTriggerStart, capabilityGateStart)
    const capabilityGate = migration.slice(capabilityGateStart, readinessGateStart)
    const readinessGate = migration.slice(readinessGateStart)
    expect(profileTrigger).toContain('new.profile_complete :=')
    expect(profileTrigger).not.toContain('valu_assessment_is_current')
    expect(profileTrigger).not.toContain('new.photo_url')
    expect(profileTrigger).not.toContain('new.cv_url')
    expect(capabilityGate).toContain('valu_assessment_is_current')
    expect(readinessGate).toContain('valu_assessment_is_current')
    expect(readinessGate).toContain('p.cv_url')
  })

  test('profile onboarding does not submit platform-owned governance fields', () => {
    const source = read('src/app/profile/setup/page.jsx')
    const start = source.indexOf('async function saveProgress')
    const end = source.indexOf("  // Mirrors the assessment's pattern", start)
    const saveBlock = source.slice(start, end)
    expect(saveBlock).toBeTruthy()
    expect(saveBlock).not.toContain('existingListingStatusRef')
    expect(saveBlock).not.toMatch(/listing_status\s*:/)
    expect(saveBlock).not.toMatch(/eligible_for_listing\s*:/)
    expect(saveBlock).not.toMatch(/profile_complete\s*:/)
    expect(saveBlock).not.toMatch(/visibility\s*:/)
    expect(saveBlock).not.toMatch(/valu_index\s*:/)
    expect(saveBlock).not.toMatch(/assessment_completed_at\s*:/)
  })

  test('taster handoff derives ownership from the authenticated session', () => {
    const source = read('src/app/api/link-taster/route.js')
    expect(source).toContain("request.headers.get('authorization')")
    expect(source).toContain('userClient.auth.getUser()')
    expect(source).not.toContain('const { taster_id: tasterId, user_id: userId')
    expect(source).not.toContain('getUserById(userId)')
  })

  test('taster identity proof comes from authenticated account fields, not request body', () => {
    const source = read('src/app/api/link-taster/route.js')
    expect(source).toContain('user.user_metadata?.display_name')
    expect(source).toContain("from('professional_profiles')")
    expect(source).toContain('Never trust a name supplied in this request')
    expect(source).toContain("if (!priorEvent)")
    expect(source).not.toContain('|| name\n')
  })

  test('admin reconciliation exposes missing taster links and identity conflicts without name-only auto-linking', () => {
    const source = read('src/app/api/admin/reconciliation/route.js')
    expect(source).toContain("select('id,user_id,taster_id,email,name,role,total_score,completed_at,assessment_version,scoring_version')")
    expect(source).toContain('identityReconciliation')
    expect(source).toContain('assessmentsMissingTasterIdDetails')
    expect(source).toContain('identityLinkConflictDetails')
    expect(source).toContain('exact_owner_identity_candidate')
    expect(source).toContain('no_stable_taster_match')
    expect(source).toContain('taster_version_source')
    expect(source).toContain('taster_version')
    expect(source).toContain("select('professional_id,verification_status,document_type,storage_path,original_filename,created_at')")
    expect(source).not.toContain("select('professional_id,status,document_type,created_at')")
  })

  test('assessment session schema and reconciliation protocol are governed explicitly', () => {
    const migration = read('supabase/migrations/20261014153000_assessment_sessions_owner_read_contract.sql')
    const protocol = read('docs/participant-journey-reconciliation-protocol.md')
    expect(protocol).toContain('Names, role, date proximity, score similarity')
    expect(protocol).toContain('Do not promote to production')
  })

  test('unlinked taster claims require corroborated contact evidence and exact authenticated identity', () => {
    const source = read('src/app/api/claim-taster/route.js')
    expect(source).toContain(".in('identity_status', ['contact_candidate', 'account_linked'])")
    expect(source).toContain('evidence_source_count')
    expect(source).toContain('Number(candidate.evidence_source_count) < 2')
    expect(source).toContain('norm(accountName) !== norm(taster.name)')
    expect(source).not.toContain("'unresolved', 'account_linked'")
  })

  test('taster account linking stitches a completed assessment and exposes its outcome', () => {
    const source = read('src/app/api/link-taster/route.js')
    expect(source).toContain("eq('taster_id', tasterId)")
    expect(source).toContain("eq('user_id', user.id)")
    expect(source).toContain("assessmentLinkStatus = 'linked'")
    expect(source).toContain("assessment_identity_links")
    expect(source).toContain("assessmentLinkStatus,")
  })

  test('legacy full assessment recovery uses the authenticated user and matching snapshot identity', () => {
    const source = read('src/app/api/assessment/claim/route.js')
    expect(source).toContain("eq('user_id',user.id).is('taster_id',null)")
    expect(source).toContain('norm(a.name)===norm(t.name)')
    expect(source).toContain("patch.taster_id=requestedTaster")
    expect(source).toContain('manual reconciliation')
  })

  test('assessment identity handoff is server-side and email-bound', () => {
    const source = read('src/app/api/link-assessment/route.js')
    expect(source).toContain('userClient.auth.getUser()')
    expect(source).toContain('assessment.email')
    expect(source).toMatch(/admin\s*\.from\(['"]valu_assessments['"]\)/)
    expect(source).toContain('.update({ user_id: user.id })')
  })

  test('email confirmation preserves the pending taster handoff', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    const login = read('src/app/login/page.jsx')
    expect(signup).toContain('pending_taster_id')
    expect(signup).toContain('emailRedirectTo')
    expect(login).toContain('pending_taster_id')
    expect(login).toContain('/api/link-taster')
  })

  test('public VALU pages render the canonical PRIME cluster definitions', () => {
    const valu = read('src/app/valu/page.jsx')
    const prime = read('src/app/prime/page.jsx')
    const brand = read('src/lib/brand.js')
    expect(valu).toContain('const dimensions = PRIME_CLUSTERS')
    expect(valu).toContain('dimensions.map')
    expect(prime).toContain('PRIME_CLUSTERS.map')
    for (const name of ['Presence', 'Relationships', 'Intelligence', 'Mastery', 'Enterprise']) {
      expect(brand).toContain(name)
    }
    expect(prime).not.toContain("'Professionalism'")
    expect(prime).not.toContain("'Motivation & Stamina'")
  })

  test('public copy explains the VALU journey without exposing assessment mechanics', () => {
    const prime = read('src/app/prime/page.jsx')
    const start = read('src/app/valu/start/page.jsx')
    const reminders = read('src/app/api/cron/valu-reminders/route.js')
    for (const source of [prime, start, reminders]) {
      expect(source).not.toContain('15-question')
      expect(source).not.toContain('15 question')
      expect(source).not.toContain('Question 10')
      expect(source).not.toContain('remaining 49')
    }
    expect(start).toContain('directional taster')
    expect(start).toContain('START THE VALU TASTER')
    expect(start).toContain('TAKE THE VALU TASTER')
    expect(prime).toContain('points-based capability profile')
    expect(start).not.toMatch(/\b(?:9|58)\s+(?:question|questions)/i)
    expect(prime).not.toMatch(/\b(?:9|58)\s+(?:question|questions)/i)
    expect(reminders).toContain('start or resume your VALU Index')
    expect(reminders).toContain('RETURN TO YOUR DASHBOARD')
  })

  test('profile capability selection is reconciled through an authenticated server endpoint', () => {
    const setup = read('src/app/profile/setup/page.jsx')
    const route = read('src/app/api/profile/capabilities/route.js')
    expect(setup).toContain("fetch('/api/profile/capabilities'")
    expect(setup).toContain('Authorization: `Bearer ${session.access_token}`')
    expect(setup).not.toContain(".from('professional_capabilities')")
    expect(route).toContain("auth.getUser(token)")
    expect(route).toContain("from('professional_capabilities')")
    expect(route).toContain("is_active: true")
    expect(route).toContain("is_active: false")
    expect(route).toContain("candidate: 'talent'")
    expect(route).toContain("'speaker'")
    expect(route).toContain("'facilitator'")
    expect(route).not.toContain('.delete(')
    const edit = read('src/app/profile/edit/page.jsx')
    expect(edit).toContain("section === 'tracks'")
    expect(edit).toContain("fetch('/api/profile/capabilities'")
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain('missing_requirements')
    expect(dashboard).toContain('CAPABILITY REQUIREMENTS')
    expect(dashboard).toContain('activeCapabilities.every(isCapabilityEligible)')
    expect(dashboard).toContain('talent_cv_approval')
    expect(dashboard).toContain('speaker_evidence_approval')
    expect(dashboard).toContain('facilitator_evidence_approval')
  })

  test('capability evidence is linked to one active owned capability and has an append-only review history', () => {
    const migration = read('supabase/migrations/20261030122024_capability_evidence_review_ledger_20261030160000.sql')
    const upload = read('src/app/api/profile/evidence/route.js')
    const admin = read('src/app/api/admin/capability-evidence/route.js')
    const participantPage = read('src/app/profile/evidence/page.jsx')
    const adminPage = read('src/app/admin/capability-evidence/page.jsx')
    expect(upload).toContain("auth.getUser(token)")
    expect(upload).toContain(".eq('professional_id',user.id)")
    expect(upload).toContain('!capability.is_active')
    expect(upload).toContain("verification_status:'pending'")
    expect(upload).toContain("from('professional_documents')")
    expect(upload).not.toContain("upsert:true")
    expect(admin).toContain("from('admin_users')")
    expect(admin).toContain("professional_document_reviews")
    expect(admin).toContain("'approved','changes_requested','rejected'")
    expect(admin).toContain('createSignedUrl')
    expect(participantPage).toContain('/api/profile/evidence')
    expect(participantPage).toContain('Under review')
    expect(adminPage).toContain('/api/admin/capability-evidence')
    expect(adminPage).toContain('Request changes')
  })

  test('participants cannot alter evidence review status, delete submitted records, or overwrite stored evidence', () => {
    const governance = read('supabase/migrations/20261030122026_lock_professional_document_review_governance_20261030170000.sql')
    expect(governance).toContain('using (is_valoria_admin())')
    expect(governance).toContain('with check (is_valoria_admin())')
    expect(governance).toContain('drop policy if exists professional_documents_owner_delete')
    expect(governance).toContain('pc.professional_id = professional_documents.professional_id')
    expect(governance).toContain('pc.is_active = true')
    expect(governance).toContain('drop policy if exists "CV owner can update own objects"')
  })

  test('only approved evidence unlocks the matching capability and every evidence decision recalculates eligibility', () => {
    const evaluator = read('supabase/migrations/20261030122028_require_approved_capability_evidence_20261030180000.sql')
    const trigger = read('supabase/migrations/20261030122031_recalculate_capability_eligibility_on_evidence_review_20261030190000.sql')
    expect(evaluator).toContain("d.verification_status='verified'")
    expect(evaluator).toContain("d.storage_path=p.cv_url")
    expect(evaluator).toContain("d.capability_id=capability_row_id")
    expect(evaluator).toContain("'speaker_evidence_approval'")
    expect(evaluator).toContain("'facilitator_evidence_approval'")
    expect(trigger).toContain('after insert or update or delete on public.professional_documents')
    expect(trigger).toContain('private.evaluate_professional_capability')
    expect(trigger).toContain('where id=capability_row.id')
    expect(trigger).not.toContain('set is_active=true')
  })

  test('CV evidence backfill is valid, exact-match, bounded and idempotent', () => {
    const backfill = read('supabase/migrations/20261030122022_backfill_existing_cv_document_records_20261030140000.sql')
    expect(backfill).toContain("o.name = p.cv_url")
    expect(backfill).toContain("o.bucket_id = 'cvs'")
    expect(backfill).toContain("between 1 and 10485760")
    expect(backfill).toContain("on conflict (storage_bucket, storage_path) do nothing")
    expect(backfill).not.toContain("^[0-9]+  'private'")
    expect(backfill.match(/^commit;$/gim)).toHaveLength(1)
  })

  test('evidence and capability governance migrations match installed policy names', () => {
    const governance = read('supabase/migrations/20261030122026_lock_professional_document_review_governance_20261030170000.sql')
    expect(governance).toContain('drop policy if exists "professionals can insert own capabilities"')
    expect(governance).toContain('drop policy if exists "professionals can update own capabilities"')
    expect(governance).toContain('drop policy if exists "professionals can delete own capabilities"')
    expect(governance).toContain('drop policy if exists professional_documents_owner_delete')
    expect(governance).toContain('drop policy if exists "CV owner can update own objects"')
  })

  test('administrator review history and document status update atomically', () => {
    const migration = read('supabase/migrations/20261030122033_atomic_professional_document_review_20261030200000.sql')
    const api = read('src/app/api/admin/capability-evidence/route.js')
    expect(api).toContain("db.rpc('record_professional_document_review'")
    expect(api).not.toContain("from('professional_document_reviews').insert")
  })


  test('public marketplace data is read through server-only consent-verified projections', () => {
    const helper = read('src/lib/public-profile.js')
    const directory = read('src/lib/marketplace-data.js')
    expect(helper).toContain("import 'server-only'")
    expect(directory).toContain("import 'server-only'")
    expect(helper).toContain("from('professional_profile_acknowledgements')")
    expect(directory).toContain("from('professional_profile_acknowledgements')")
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('getMarketplaceDirectoryData')
  })

  test('unlinked taster participants can self-serve account recovery using confirmed email and taster name', () => {
    const recovery = read('src/app/professional-signup/recover/page.jsx')
    const callback = read('src/app/auth/callback/page.jsx')
    const login = read('src/app/login/page.jsx')
    expect(recovery).toContain("user_type: 'professional'")
    expect(recovery).toContain('/auth/callback?claim_taster=true')
    expect(recovery).toContain('claim_name=')
    expect(callback).toContain("params.get('claim_taster') === 'true'")
    expect(callback).toContain("fetch('/api/claim-taster'")
    expect(login).toContain('/professional-signup/recover')
    expect(read('src/app/valu/start/page.jsx')).toContain('/professional-signup/recover')
    const admin = read('src/app/admin/reconciliation/page.jsx')
    expect(admin).toContain('contactCandidateCount')
    expect(admin).toContain('unresolvedTasterCount')
    expect(admin).toContain('/professional-signup/recover')
    expect(login).toContain('claimed_name: claimName')
    expect(read('src/app/api/claim-taster/route.js')).toContain('const claimedName = String(requestBody?.claimed_name || \'\').trim()')
  })

  test('Full listings enforce the 35-point threshold while Basic taster listings do not', () => {
    const helper = read('src/lib/public-profile.js')
    const data = read('src/lib/marketplace-data.js')
    expect(helper).toContain('Number(profile.valu_index) < 35')
    expect(helper).toContain('capabilitiesReady')
    expect(helper).toContain('assessment_expires_at')
    expect(helper).toContain('latestAssessment.total_score')
    expect(helper).toContain(".from('professional_capabilities')")
    expect(data).toContain('Number(row.valu_index) >= 35')
    expect(data).toContain('fullReadyIds.has(profile.id)')
    expect(data).toContain('latestAssessmentById')
    expect(data).toContain('assessment_expires_at')
    expect(data).toContain('Number(row.valu_index) === Number(profile.valu_index)')
    expect(data).toContain(".from('professional_capabilities')")
    expect(data).toContain("if (row.assessment_access === 'basic') return true")
  })

  test('public Basic listings require a linked completed taster and explicit consent', () => {
    const data = read('src/lib/marketplace-data.js')
    expect(data).toContain("row.assessment_access === 'basic'")
    expect(data).toContain("row.assessment_access === 'full'")
    expect(data).toContain(".not('completed_at', 'is', null)")
    expect(data).toContain("profile.visibility !== 'public'")
    expect(data).toContain("profile.listing_status !== 'listed'")
    expect(data).toContain('consentedIds.has(profile.id)')
  })

  test('existing capability eligibility is reconciled after historical evidence is marked pending', () => {
    const migration = read('supabase/migrations/20261030122057_reconcile_existing_capability_evidence_eligibility_20261030210000.sql')
  })

  test('capability projection preserves canonical VALU Index fields and derives descriptors from PRIME scores', () => {
    const migration = read('supabase/migrations/20261030122017_marketplace_roster_capability_eligibility_20261030100000.sql')
    expect(migration).not.toContain('report_text')
    expect(migration).not.toContain("caps := array['talent']::text[]")
  })

  test('marketplace readiness blockers provide direct next actions for each missing requirement', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain("profile: ['/profile/edit', 'Complete profile']")
    expect(dashboard).toContain("talent_cv: ['/profile/edit', 'Upload CV']")
    expect(dashboard).toContain("speaker_evidence_approval: ['/profile/evidence', 'Submit speaker evidence']")
    expect(dashboard).toContain("facilitator_evidence_approval: ['/profile/evidence', 'Submit facilitator evidence']")
    expect(dashboard).toContain("valu_assessment_score_35_current: ['/dashboard', 'Complete VALU assessment']")
    expect(dashboard).toContain('AssessmentStartLink href="/dashboard" dashboardOnly')
    expect(dashboard).toContain('href ? <Link href={href}')
  })

  test('evidence submission only offers evidence types that can satisfy the selected capability', () => {
    const page = read('src/app/profile/evidence/page.jsx')
    expect(page).toContain("['portfolio','certification','speaking_sample']")
    expect(page).toContain("['portfolio','certification','facilitation_record']")
    expect(page).toContain('allowedTypes.some(([value])=>value===type)')
    expect(page).toContain('Talent capability is verified through your profile-wide CV')
    expect(page).toContain('Upload or update your CV in profile settings')
  })


  test('public certificate reads enforce the same consent gate without exposing private profile columns', () => {
    const profile = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(profile).toContain(".from('professional_certificates')")
    expect(profile).toContain('certificate_number,title,event_title,event_date,issuer,issued_at,verification_token')
    expect(profile).not.toContain('revocation_reason')
  })


  test('public profile reads require the current acknowledgement and an eligible tier', () => {
    const helper = read('src/lib/public-profile.js')
    const directory = read('src/lib/marketplace-data.js')
    expect(helper).toContain('PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION')
    expect(helper).toContain('acknowledgement.acknowledgement_version')
    expect(helper).toContain('hasCompletedTaster')
    expect(directory).toContain('PUBLIC_PROFILE_ACK_VERSION')
    expect(directory).toContain('consentedIds.has(profile.id)')
    expect(directory).toContain("profile.visibility !== 'public'")
  })


  test('existing professionals can actively choose visibility and record consent from profile editing', () => {
    const edit = read('src/app/profile/edit/page.jsx')
    const endpoint = read('src/app/api/profile/acknowledgements/route.js')
    expect(edit).toContain('Public visibility & consent')
    expect(edit).toContain('visibilityChoice')
    expect(edit).toContain('consentConfirmed')
    expect(edit).toContain("'/api/profile/acknowledgements'")
    expect(edit).toContain("source: 'profile_edit'")
    expect(endpoint).toContain("body.source === 'profile_edit' ? 'profile_edit' : 'profile_setup'")
    expect(endpoint).toContain('PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION')
    expect(endpoint).toContain('Confirm your email before submitting your profile.')
  })


  test('marketplace cards place VALU points beside the profile identity and use report-derived insight', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const styles = read('src/components/MarketplaceDirectory.module.css')
    const identity = directory.slice(directory.indexOf('<div className={styles.identity}>'), directory.indexOf('<p className={styles.career}>'))
    expect(identity).toContain('profileId')
    expect(identity).toContain('className={styles.valu}')
    expect(identity).toContain('p.valu_index')
    expect(directory).toContain('TOP DEVELOPMENT AREA')
    expect(directory).toContain('displayText(p.assessment_summary)')
    expect(directory).not.toContain('displayText(p.bio)')
    expect(styles).toContain('.identity{position:relative;padding-right:62px!important}')
    expect(styles).toContain('.valu{position:absolute')
  })


  test('public profile consent is versioned and names the fields that may be displayed', () => {
    const copy = read('src/lib/profile-consent-copy.js')
    const helper = read('src/lib/public-profile.js')
    const endpoint = read('src/app/api/profile/acknowledgements/route.js')
    expect(copy).toContain('public-profile-visibility-v3-2026-11-07')
    expect(copy).toContain('past speaking engagements')
    expect(copy).toContain('past clients or programmes')
    expect(copy).toContain('professional media links')
    expect(helper).toContain('PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION')
    expect(helper).toContain(".select('id,acknowledgement_version')")
    expect(helper).toContain(".select('professional_id,acknowledgement_version')")
    expect(endpoint).toContain('PUBLIC_PROFILE_CONSENT_TEXT')
    expect(endpoint).toContain('basicEligible')
    expect(endpoint).toContain('fullEligible')
    expect(endpoint).toContain(".not('completed_at', 'is', null)")
  })

  test('public profile identity normalizes compatibility glyphs without rewriting stored records', () => {
    const marketplace = read('src/lib/marketplace-data.js')
    const publicProfile = read('src/lib/public-profile.js')
    expect(marketplace).toContain("value.normalize('NFKC')")
    expect(publicProfile).toContain("value.normalize('NFKC')")
    expect(marketplace).toContain('full_name: normalizePublicDisplayText(row.full_name)')
    expect(publicProfile).toContain('display_name: normalizePublicDisplayText(profile.display_name)')
  })

  test('public PRIME and VALU pages use the approved seventeen-skill framework', () => {
    const brand = read('src/lib/brand.js')
    const prime = read('src/app/prime/page.jsx')
    const valu = read('src/app/valu/page.jsx')
    const canonicalSkills = [
      'Communication', 'Negotiation', 'Personal Brand & Executive Presence',
      'Emotional Intelligence', 'Conflict Resolution', 'People Development', 'Stakeholder Management',
      'Critical Thinking', 'Strategic Thinking', 'Business Acumen', 'AI Fluency',
      'Execution & Accountability', 'Resilience & Self-Leadership', 'Adaptability',
      'Commercial Creativity', 'Influence Without Authority', 'Human-AI Collaboration',
    ]
    const skillLists = [...brand.matchAll(/skills: \[([^\]]+)\]/g)]
    const configuredSkills = skillLists.flatMap(([, list]) => [...list.matchAll(/'([^']+)'/g)].map(([, skill]) => skill))
    expect(configuredSkills).toHaveLength(17)
    expect(configuredSkills).toEqual(canonicalSkills)
    expect(prime).toContain('cluster.skills.map')
    expect(prime).toContain('Future-Ready skill')
    expect(brand).toContain("subtitle: 'How you create'")
    expect(prime).toContain('Future-Ready skill')
    expect(valu).toContain('dimensions.map')
    expect(valu).toContain('cluster.skills.join')
    expect(brand).toContain('Human-AI Collaboration')
    expect(brand).not.toContain('Composure Under Scrutiny')
    expect(brand).not.toContain('Managing Ambiguity')
  })

  test('legal pages describe Basic taster tier, consent gates and current data practices', () => {
    const terms = read('src/app/terms-of-use/page.jsx')
    const privacy = read('src/app/privacypolicy/page.jsx')
    expect(terms).toContain('a professional who has completed and linked a VALU taster may be represented in the Basic tier')
    expect(terms).toContain('A tier assignment is not, by itself, public visibility')
    expect(terms).toContain('Full VALU Index assessment')
    expect(terms).not.toContain('professionals who score 35 or above')
    expect(privacy).toContain('Google Analytics')
    expect(privacy).toContain('Meta Pixel')
    expect(privacy).toContain('Brevo')
    expect(privacy).toContain('Cloudflare — website hosting, content delivery, network security and request handling')
    expect(privacy).toContain('YouTube — embedded event/replay video playback')
    expect(privacy).toContain('professional name, role, aggregate VALU score, cluster scores and skill scores')
    expect(terms).toContain('the platform sends your professional name, role and assessment results')
    expect(terms).not.toContain('anonymised score profile')
    expect(privacy).not.toContain('We do not use advertising cookies, third-party tracking, or analytics cookies')
    expect(privacy).not.toContain('each user can only access their own records')
    expect(privacy).not.toContain('retained for 36 months after the enquiry is closed')
  })

  test('guest programme and buyer enquiries enter the admin enquiry workflow', () => {
    const contact = read('src/app/contact-us/ContactForm.jsx')
    const api = read('src/app/api/enquiries/route.js')
    const admin = read('src/app/admin/page.jsx')
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const instrumentation = read('src/components/MarketingInstrumentation.jsx')
    expect(contact).toContain("fetch('/api/enquiries'")
    expect(contact).toContain('Team / audience:')
    expect(contact).toContain('PRIME cluster(s):')
    expect(contact).toContain('Timeline:')
    expect(contact).toContain('new URLSearchParams(window.location.search)')
    expect(directory).toContain('/contact-us?type=candidate')
    expect(directory).toContain('/contact-us?type=speaker_booking')
    expect(instrumentation).toContain('buyer_contact_entry')
    expect(contact).not.toContain("from('messages')")
    expect(api).toContain("'training', 'general'")
    expect(api).toContain('getConsentVerifiedPublicProfile')
    expect(api).toContain('buyerUserId = authData.user.id')
    expect(admin).toContain("m.enquiry_type === 'training' ? 'Valoria Develop'")
    expect(admin).toContain('m.professional_profile_id && m.status')
  })

  test('taster-linked Full assessments retain Full tier while taster-only accounts remain Basic', () => {
    const tierMigration = read('supabase/migrations/20261107082952_separate_full_assessment_tier_from_listing_readiness.sql')
    const recoveryMigration = read('supabase/migrations/20261107082645_preserve_existing_profile_completeness_on_taster_link.sql')
    expect(tierMigration).toContain('assessment_ok := private.valu_assessment_is_current(p_professional_id)')
    expect(tierMigration).not.toContain('assessment_ok := private.is_full_marketplace_listing_ready')
    expect(tierMigration).toContain("now(), 'full', assessment_summary")
    expect(tierMigration).toContain("now(), 'basic', null")
    expect(recoveryMigration).not.toContain('profile_complete = false')
  })

  test('conversion analytics cover discovery, profile visibility and opportunity engagement', () => {
    const instrumentation = read('src/components/MarketingInstrumentation.jsx')
    const opportunity = read('src/app/opportunities/[slug]/page.jsx')
    const submission = read('src/app/opportunities/submit/page.jsx')
    const setup = read('src/app/profile/setup/page.jsx')
    const edit = read('src/app/profile/edit/page.jsx')
    expect(instrumentation).toContain('opportunity_discovery_click')
    expect(instrumentation).toContain('atb_connect_entry')
    expect(instrumentation).toContain('profile_completion_start')
    expect(instrumentation).toContain('valoria:analytics')
    expect(opportunity).toContain('opportunity_view')
    expect(opportunity).toContain('opportunity_application_submitted')
    expect(submission).toContain('buyer_opportunity_submission')
    expect(setup).toContain('profile_setup_completed')
    expect(edit).toContain('public_visibility_consent_granted')
  })

  test('marketplace filters use canonical VALU point bands and never infer seniority', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(directory).toContain('TIER_DESIGNATIONS.filter(tier => tier.min >= 35)')
    expect(directory).toContain('Filter by VALU points band')
    expect(directory).toContain("p.assessment_access !== 'full'")
    expect(directory).toContain('no approved public seniority field exists')
    expect(directory).not.toMatch(/seniority.*current_job_title|current_job_title.*seniority/i)
  })

  test('public profile pages use VALU report summaries and show speaker/facilitator evidence', () => {
    const helper = read('src/lib/public-profile.js')
    const profile = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(helper).toContain(".select('professional_id,atb_id,assessment_access,assessment_summary,capabilities,selected_capabilities,full_name,headline,current_job_title,valu_index')")
    expect(helper).toContain("'past_events'")
    expect(helper).toContain("'past_clients'")
    expect(helper).not.toContain("'bio'")
    expect(profile).toContain('p.assessment_summary')
    expect(profile).not.toContain('p.bio')
    expect(profile).toContain('Speaking Engagements')
    expect(profile).toContain('Clients & Programmes')
    expect(profile).toContain('p.youtube_links')
  })

  test('public profile metadata resolves UUID and canonical ATB IDs through consent-gated lookup', () => {
    const layout = read('src/app/profile/[id]/layout.jsx')
    expect(layout).toContain('const isUuid =')
    expect(layout).toContain('const isAtbId =')
    expect(layout).toContain("getConsentVerifiedPublicProfile(id, isUuid ? 'id' : 'atb_id')")
  })

  test('profile work history requires complete roles and exposes actionable save diagnostics', () => {
    const source = read('src/app/profile/setup/page.jsx')
    expect(source).toContain("screen?.key === 'work_history'")
    expect(source).toContain("row.title?.trim() && row.org?.trim() && row.duration?.trim()")
    expect(source).toContain('Add at least one complete role: job title, organisation and duration.')
    expect(source).toContain("String(error.message || '').replace(/[\\r\\n]+/g, ' ').slice(0, 180)")
    expect(source).toContain("style={{ background:'#1A1A2E', color:'#F7F4EE' }}")
  })


  test('public marketplace cards open an accessible profile preview modal', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const styles = read('src/components/MarketplaceDirectory.module.css')
    expect(directory).toContain('const [selectedProfile, setSelectedProfile] = useState(null)')
    expect(directory).toContain('aria-haspopup="dialog"')
    expect(directory).toContain('function ProfilePreviewModal({ profile, onClose })')
    expect(directory).toContain('role="dialog"')
    expect(directory).toContain('aria-modal="true"')
    expect(directory).toContain("event.key === 'Escape'")
    expect(directory).toContain("event.key !== 'Tab'")
    expect(directory).toContain('OPEN FULL PROFILE')
    expect(styles).toContain('.modalBackdrop')
    expect(styles).toContain('.modalDialog')
    expect(styles).toContain('@media(max-width:760px)')
    expect(styles).toContain('prefers-reduced-motion:reduce')
  })

  test('public profile preview keeps Basic and Full VALU treatment separate and hides private fields', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const modal = directory.slice(directory.indexOf('function ProfilePreviewModal'), directory.length)
    expect(modal).toContain("profile.assessment_access === 'full'")
    expect(modal).toContain('profile.assessment_summary')
    expect(modal).toContain("key: 'candidate'")
    expect(modal).toContain("key: 'speaker'")
    expect(modal).toContain("key: 'facilitator'")
    expect(modal).not.toContain('profile.email')
    expect(modal).not.toContain('profile.phone')
    expect(modal).not.toContain('profile.bio')
  })


  test('admin marketplace roster is authenticated, consent-aware and flags same-name records', () => {
    const route = read('src/app/api/admin/marketplace-roster/route.js')
    const page = read('src/app/admin/marketplace-roster/page.jsx')
    const admin = read('src/app/admin/page.jsx')
    expect(route).toContain(".from('admin_users')")
    expect(route).toContain("acknowledgement_version === 'public-profile-visibility-v3-2026-11-07'")
    expect(route).toContain('profile.is_test || profile.revoked_at')
    expect(route).toContain('identity_review_required')
    expect(route).toContain('public_ready: candidate.public_ready && !identityReviewRequired')
    expect(page).toContain('IDENTITY REVIEW REQUIRED')
    expect(page).toContain('PUBLICLY READY')
    expect(page).toContain('CONSENT NOT RECORDED')
    expect(admin).toContain('/admin/marketplace-roster')
  })


  test('admin roster blocks public readiness for non-canonical ATB identifiers', () => {
    const route = read('src/app/api/admin/marketplace-roster/route.js')
    const page = read('src/app/admin/marketplace-roster/page.jsx')
    expect(route).toContain('/^ATB-[A-Z0-9-]{4,40}$/i')
    expect(route).toContain('atb_id_review_required: !atbIdValid')
    expect(route).toContain('const publicReady = atbIdValid && publicConsent')
    expect(page).toContain('ATB ID REVIEW REQUIRED')
    expect(page).toContain('atbIdReviewCount')
  })

})