import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET(request) {
  const supabase = getAdminClient()
  if (!supabase) return Response.json({ error: 'Roster service is not configured.' }, { status: 503 })

  const token = (request.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  const userId = authData?.user?.id
  if (authError || !userId) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  if (adminError || !admin) return Response.json({ error: 'Admin access required.' }, { status: 403 })

  const { data: roster, error: rosterError } = await supabase
    .from('marketplace_public_roster')
    .select('professional_id,full_name,headline,atb_id,display_initials,photo_url,industry,valu_index,cluster_scores,designation,assessment_access,assessment_summary,selected_capabilities,capabilities,projection_refreshed_at')
    .order('full_name', { ascending: true })
  if (rosterError) {
    console.error('Admin marketplace roster query failed:', rosterError)
    return Response.json({ error: 'Could not load the public marketplace roster.' }, { status: 500 })
  }

  const ids = [...new Set((roster || []).map(row => row.professional_id).filter(Boolean))]
  if (!ids.length) return Response.json({ candidates: [], summary: { total: 0, full: 0, basic: 0 } })

  const [profilesResult, capabilitiesResult, acknowledgementsResult] = await Promise.all([
    supabase.from('professional_profiles')
      .select('id,profile_complete,visibility,listing_status,eligible_for_listing,is_test,revoked_at')
      .in('id', ids),
    supabase.from('professional_capabilities')
      .select('professional_id,capability,is_active,eligible_for_listing,eligibility_status,missing_requirements')
      .in('professional_id', ids),
    supabase.from('professional_profile_acknowledgements')
      .select('professional_id,acknowledgement_type,acknowledgement_version,acknowledged_at,created_at')
      .eq('acknowledgement_type', 'profile_submission')
      .in('professional_id', ids)
      .order('acknowledged_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
  ])

  const failed = [profilesResult, capabilitiesResult, acknowledgementsResult].find(result => result.error)
  if (failed) {
    console.error('Admin marketplace roster detail query failed:', failed.error)
    return Response.json({ error: 'Could not load roster readiness details.' }, { status: 500 })
  }

  const profileById = new Map((profilesResult.data || []).map(row => [row.id, row]))
  const capabilitiesById = new Map()
  for (const capability of capabilitiesResult.data || []) {
    if (!capability.professional_id || !capability.is_active) continue
    const rows = capabilitiesById.get(capability.professional_id) || []
    rows.push({
      capability: capability.capability,
      eligible: capability.eligible_for_listing === true && capability.eligibility_status === 'listed' &&
        (!Array.isArray(capability.missing_requirements) || capability.missing_requirements.length === 0),
      eligibility_status: capability.eligibility_status || 'pending',
      missing_requirements: Array.isArray(capability.missing_requirements) ? capability.missing_requirements : [],
    })
    capabilitiesById.set(capability.professional_id, rows)
  }

  const acknowledgementById = new Map()
  for (const acknowledgement of acknowledgementsResult.data || []) {
    if (acknowledgement.professional_id && !acknowledgementById.has(acknowledgement.professional_id)) {
      acknowledgementById.set(acknowledgement.professional_id, acknowledgement)
    }
  }

  const candidates = (roster || []).flatMap(row => {
    const profile = profileById.get(row.professional_id)
    if (!profile || profile.is_test || profile.revoked_at) return []
    const acknowledgement = acknowledgementById.get(row.professional_id)
    const publicConsent = acknowledgement?.acknowledgement_version === 'public-profile-visibility-v3-2026-11-07'
    const capabilityRows = capabilitiesById.get(row.professional_id) || []
    const eligibleCapabilities = capabilityRows.filter(item => item.eligible).map(item => item.capability)

    return [{
      id: row.professional_id,
      display_name: row.full_name,
      headline: row.headline,
      atb_id: row.atb_id,
      initials: row.display_initials,
      photo_url: row.photo_url,
      industry: row.industry,
      assessment_access: row.assessment_access,
      valu_points: row.assessment_access === 'full' ? row.valu_index : null,
      designation: row.assessment_access === 'full' ? row.designation : null,
      assessment_summary: row.assessment_access === 'full' ? row.assessment_summary : null,
      selected_capabilities: Array.isArray(row.selected_capabilities) ? row.selected_capabilities : [],
      eligible_capabilities: eligibleCapabilities,
      capability_status: capabilityRows,
      profile_complete: profile.profile_complete === true,
      public_consent: publicConsent,
      visibility: profile.visibility || 'registered_only',
      listing_status: profile.listing_status || 'unlisted',
      public_ready: publicConsent && profile.visibility === 'public' && profile.listing_status === 'listed',
      projection_refreshed_at: row.projection_refreshed_at,
    }]
  })

  return Response.json({
    candidates,
    summary: {
      total: candidates.length,
      full: candidates.filter(row => row.assessment_access === 'full').length,
      basic: candidates.filter(row => row.assessment_access === 'basic').length,
      public: candidates.filter(row => row.public_ready).length,
      incomplete: candidates.filter(row => !row.profile_complete).length,
    },
  })
}
