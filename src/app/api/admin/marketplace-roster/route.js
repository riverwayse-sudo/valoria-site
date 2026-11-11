import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Keep identity, assessment and consent reconciliation behind admin authentication.

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function normaliseName(value) {
  return String(value || '').normalize('NFKC').trim().toLocaleLowerCase('en')
}

function isValidAtbId(value) {
  return /^ATB-[A-Z0-9-]{4,40}$/i.test(String(value || '').trim())
}

function namesAlign(profileName, accountName) {
  const profile = normaliseName(profileName)
  const account = normaliseName(accountName)
  // The auth/profile UUID join is the ownership proof. Allow a profile display name
  // that is exactly the account's first name, but never arbitrary prefix similarity.
  const accountFirstName = account.split(/\s+/)[0]
  return Boolean(profile && account && (profile === account || profile === accountFirstName))
}

export async function GET(request) {
  const supabase = getSupabase()
  if (!supabase) return Response.json({ error: 'Roster service is not configured.' }, { status: 503 })

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: callerData, error: callerError } = await supabase.auth.getUser(token)
  if (callerError || !callerData?.user?.id) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', callerData.user.id)
    .maybeSingle()
  if (adminError || !adminRow) return Response.json({ error: 'Admin access required.' }, { status: 403 })

  const [
    profilesResult,
    accountsResult,
    assessmentsResult,
    tastersResult,
    acknowledgementsResult,
    capabilitiesResult,
  ] = await Promise.all([
    supabase.from('professional_profiles')
      .select('id,display_name,atb_id,headline,active_tracks,listing_status,visibility,eligible_for_listing,is_test,industry,profile_complete,valu_index,revoked_at')
      .order('display_name', { ascending: true }),
    supabase.from('users').select('id,full_name,user_type'),
    supabase.from('valu_assessments').select('user_id,total_score,completed_at')
      .not('completed_at', 'is', null).order('completed_at', { ascending: false }),
    supabase.from('taster_sessions').select('user_id,completed_at')
      .not('completed_at', 'is', null),
    supabase.from('professional_profile_acknowledgements')
      .select('professional_id,acknowledgement_type,acknowledgement_version,acknowledged_at,created_at')
      .eq('acknowledgement_type', 'profile_submission')
      .order('acknowledged_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase.from('professional_capabilities')
      .select('professional_id,capability,is_active,eligible_for_listing,eligibility_status,missing_requirements'),
  ])

  const results = [profilesResult, accountsResult, assessmentsResult, tastersResult, acknowledgementsResult, capabilitiesResult]
  const failed = results.find(result => result.error)
  if (failed) {
    console.error('Admin marketplace roster query failed:', failed.error)
    return Response.json({ error: 'Could not load the professional roster review.' }, { status: 500 })
  }

  const accountById = new Map((accountsResult.data || []).map(row => [row.id, row]))
  const latestFullById = new Map()
  for (const row of assessmentsResult.data || []) {
    if (row.user_id && !latestFullById.has(row.user_id)) latestFullById.set(row.user_id, row)
  }

  const tasterCountById = new Map()
  for (const row of tastersResult.data || []) {
    if (row.user_id) tasterCountById.set(row.user_id, (tasterCountById.get(row.user_id) || 0) + 1)
  }

  const latestAcknowledgementById = new Map()
  for (const row of acknowledgementsResult.data || []) {
    if (row.professional_id && !latestAcknowledgementById.has(row.professional_id)) {
      latestAcknowledgementById.set(row.professional_id, row)
    }
  }

  const capabilitiesById = new Map()
  for (const row of capabilitiesResult.data || []) {
    if (!row.professional_id || !row.is_active) continue
    const rows = capabilitiesById.get(row.professional_id) || []
    rows.push(row)
    capabilitiesById.set(row.professional_id, rows)
  }

  const candidates = (profilesResult.data || []).flatMap(profile => {
    const account = accountById.get(profile.id)
    if (profile.is_test || profile.revoked_at || account?.user_type !== 'professional' || !namesAlign(profile.display_name, account.full_name)) return []

    const fullAssessment = latestFullById.get(profile.id)
    const completedTasters = tasterCountById.get(profile.id) || 0
    const assessmentAccess = fullAssessment ? 'full' : completedTasters > 0 ? 'basic' : null
    if (!assessmentAccess) return []

    const acknowledgement = latestAcknowledgementById.get(profile.id)
    const publicConsent = acknowledgement?.acknowledgement_version === 'public-profile-visibility-v3-2026-11-07'
    const activeCapabilities = capabilitiesById.get(profile.id) || []
    // A professional may be publicly listed in one approved capability while
    // another selected capability remains under review. Match the public roster
    // projection: at least one active capability must be fully approved.
    const capabilitiesReady = activeCapabilities.some(capability =>
      capability.eligible_for_listing === true &&
      capability.eligibility_status === 'listed' &&
      (!Array.isArray(capability.missing_requirements) || capability.missing_requirements.length === 0)
    )
    const fullProfileReady = assessmentAccess === 'full' &&
      profile.profile_complete === true &&
      Number(profile.valu_index || 0) >= 35 &&
      capabilitiesReady

    const atbIdValid = isValidAtbId(profile.atb_id)
    const publicReady = atbIdValid && publicConsent &&
      profile.listing_status === 'listed' &&
      profile.visibility === 'public' &&
      profile.eligible_for_listing === true &&
      profile.revoked_at == null &&
      !profile.is_test &&
      (assessmentAccess === 'basic' ? completedTasters > 0 : fullProfileReady)

    return [{
      id: profile.id,
      display_name: profile.display_name,
      account_name: account.full_name,
      atb_id: profile.atb_id,
      headline: profile.headline,
      active_tracks: profile.active_tracks || [],
      capability_labels: activeCapabilities.map(capability => capability.capability),
      capability_issues: activeCapabilities
        .filter(capability => !(capability.eligible_for_listing === true && capability.eligibility_status === 'listed'))
        .flatMap(capability => {
          const missing = Array.isArray(capability.missing_requirements) ? capability.missing_requirements : []
          return missing.length
            ? missing.map(requirement => `${capability.capability}: ${requirement}`)
            : [`${capability.capability}: awaiting Valoria eligibility review`]
        }),
      assessment_access: assessmentAccess,
      valu_points: assessmentAccess === 'full' ? Number(fullAssessment.total_score) : null,
      completed_taster_count: completedTasters,
      profile_complete: profile.profile_complete === true,
      listing_status: profile.listing_status || 'unlisted',
      visibility: profile.visibility || 'registered_only',
      eligible_for_listing: profile.eligible_for_listing === true,
      public_consent: publicConsent,
      atb_id_review_required: !atbIdValid,
      atb_id_review_reason: atbIdValid ? null : 'This identifier does not match the canonical ATB-ID format. Review it before public publication.',
      public_ready: publicReady,
    }]
  })

  // A shared normalized account/profile name across different authenticated IDs is
  // a manual identity-review condition, not proof that the records are duplicates.
  // Keep both records visible to administrators, but fail closed for publication.
  const candidateIdsByName = new Map()
  for (const candidate of candidates) {
    const keys = [...new Set([normaliseName(candidate.display_name), normaliseName(candidate.account_name)].filter(Boolean))]
    for (const key of keys) {
      const ids = candidateIdsByName.get(key) || new Set()
      ids.add(candidate.id)
      candidateIdsByName.set(key, ids)
    }
  }

  const reviewedCandidates = candidates.map(candidate => {
    const keys = [...new Set([normaliseName(candidate.display_name), normaliseName(candidate.account_name)].filter(Boolean))]
    const identityReviewRequired = keys.some(key => (candidateIdsByName.get(key)?.size || 0) > 1)
    return {
      ...candidate,
      identity_review_required: identityReviewRequired,
      identity_review_reason: identityReviewRequired
        ? 'Another account uses the same normalized profile or account name. Confirm whether these are separate people before publication.'
        : null,
      public_ready: candidate.public_ready && !identityReviewRequired,
    }
  })

  return Response.json({ candidates: reviewedCandidates })
}
