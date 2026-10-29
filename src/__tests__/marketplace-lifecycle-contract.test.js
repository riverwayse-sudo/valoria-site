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
    expect(rootSource).toContain("getMarketplaceRows('all')")
    expect(rootSource).toContain('getMarketplaceCounts')
    expect(rootSource).toContain('activeTrack="all"')

    for (const source of [talent, speakers, facilitators]) {
      expect(source).toContain("import MarketplaceDirectory from '@/components/MarketplaceDirectory'")
      expect(source).toContain('getMarketplaceRows')
      expect(source).toContain('getMarketplaceCounts')
      expect(source).toContain('activeTrack=')
    }
    expect(talent).toContain("getMarketplaceRows('candidate')")
    expect(speakers).toContain("getMarketplaceRows('speaker')")
    expect(facilitators).toContain("getMarketplaceRows('facilitator')")
  })

  test('marketplace data is professional-first and deduplicates capabilities', () => {
    const source = read('src/lib/marketplace-data.js')
    expect(source).toContain('professional_id')
    expect(source).toContain('new Set')
    expect(source).toContain('all: all.size')
    expect(source).toContain('candidate: byTrack.candidate.size')
    expect(source).toContain('speaker: byTrack.speaker.size')
    expect(source).toContain('facilitator: byTrack.facilitator.size')
  })

  test('open marketplace directories refresh server-rendered counts automatically', () => {
    const source = read('src/components/MarketplaceDirectory.jsx')
    expect(source).toContain('useRouter')
    expect(source).toContain('router.refresh()')
    expect(source).toContain('window.setInterval(refreshWhenVisible, 30_000)')
    expect(source).toContain("document.addEventListener('visibilitychange', refreshWhenVisible)")
    expect(source).toContain('window.clearInterval(interval)')
  })


  test('full-assessment roster projects only selected, active, eligible capabilities while preserving Basic taster listings', () => {
    const migration = read('supabase/migrations/20261029190000_marketplace_roster_capability_eligibility.sql')
    const fullBranch = migration.slice(
      migration.indexOf("if assessment_ok and p.visibility = 'public'"),
      migration.indexOf("select * into t", migration.indexOf("if assessment_ok and p.visibility = 'public'"))
    )
    const tasterBranch = migration.slice(migration.indexOf("select * into t"))

    expect(fullBranch).toContain('public.professional_capabilities')
    expect(fullBranch).toContain('pc.is_active = true')
    expect(fullBranch).toContain('pc.eligible_for_listing = true')
    expect(fullBranch).toContain("pc.eligibility_status = 'listed'")
    expect(fullBranch).toContain("caps := '{}'::text[]")
    expect(fullBranch).toContain('General marketplace presence is independent of capability readiness')
    expect(fullBranch).not.toContain('if cardinality(caps) = 0 then return; end if;')
    expect(fullBranch).not.toContain("if cardinality(caps) = 0 then caps := array['talent']")
    expect(tasterBranch).toContain("array['talent']::text[]")
    expect(tasterBranch).toContain("'basic'")
  })

  test('capability projection preserves canonical VALU Index fields and PRIME descriptor', () => {
    const migration = read('supabase/migrations/20261029190000_marketplace_roster_capability_eligibility.sql')
    expect(migration).toContain('select v.total_score, v.cluster_scores, v.designation')
    expect(migration).toContain('canonical_valu_index := coalesce(canonical_valu_index, p.valu_index)')
    expect(migration).toContain('canonical_cluster_scores := coalesce(canonical_cluster_scores, p.cluster_scores)')
    expect(migration).toContain('canonical_designation := coalesce(canonical_designation, p.designation)')
    expect(migration).toContain('Derive public summary only from structured PRIME scores')
    expect(migration).toContain("'A well-balanced capability profile across the five PRIME dimensions.'")
    expect(migration).not.toContain('report_text')
    expect(migration).not.toContain("caps := array['talent']::text[]")
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
  })

  test('assessment session schema and reconciliation protocol are governed explicitly', () => {
    const migration = read('supabase/migrations/20261014153000_assessment_sessions_owner_read_contract.sql')
    const protocol = read('docs/participant-journey-reconciliation-protocol.md')
    expect(migration).toContain('add column if not exists user_id')
    expect(migration).toContain('assessment_sessions_owner_read')
    expect(migration).toContain('using ((select auth.uid()) = user_id)')
    expect(protocol).toContain('Names, role, date proximity, score similarity')
    expect(protocol).toContain('Do not promote to production')
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

  test('public VALU pages use the authoritative PRIME vocabulary', () => {
    const valu = read('src/app/valu/page.jsx')
    const start = read('src/app/valu/start/page.jsx')
    for (const source of [valu, start]) {
      expect(source).toContain('Presence')
      expect(source).toContain('Relationships')
      expect(source).toContain('Intelligence')
      expect(source).toContain('Mastery')
      expect(source).toContain('Enterprise')
    }
    expect(start).not.toContain("'Professionalism'")
    expect(start).not.toContain("'Motivation & Stamina'")
  })
})
