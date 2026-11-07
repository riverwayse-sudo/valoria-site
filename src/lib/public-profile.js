import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION } from '@/lib/profile-consent-copy'

const PUBLIC_PROFILE_FIELDS = [
  'id',
  'display_name',
  'display_initials',
  'headline',
  'current_job_title',
  'location',
  'industry',
  'experience_years',
  'skills',
  'topics',
  'facilitation_topics',
  'active_tracks',
  'valu_index',
  'cluster_scores',
  'designation',
  'youtube_links',
  'atb_id',
  'availability',
  'availability_status',
  'photo_url',
  'programme_types',
  'format_capabilities',
  'audience_sizes',
  'past_events',
  'past_clients',
  'languages',
  'linkedin_url',
  'website_url',
].join(',')

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Public profile verification is unavailable.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function hasCompletedTaster(admin, professionalId) {
  const { data, error } = await admin
    .from('taster_sessions')
    .select('id')
    .eq('user_id', professionalId)
    .not('completed_at', 'is', null)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Basic listing taster verification failed:', error)
    throw new Error('Basic listing eligibility could not be verified.')
  }
  return Boolean(data)
}

function hasBasicPublicIdentity(profile, roster = {}) {
  const displayName = profile.display_name?.trim() || roster.full_name?.trim()
  const headline = profile.headline?.trim() || profile.current_job_title?.trim() || roster.headline?.trim() || roster.current_job_title?.trim()
  return Boolean(displayName && headline)
}

export async function getConsentVerifiedPublicProfile(identifier, field = 'id') {
  if (!['id', 'atb_id'].includes(field) || !identifier) return null
  const admin = getAdminClient()
  const lookupField = field === 'atb_id' ? 'atb_id' : 'professional_id'

  // Full listings require a completed VALU report. Basic listings require an
  // account-linked completed taster and a minimal professional identity.
  const { data: roster, error: rosterError } = await admin
    .from('marketplace_public_roster')
    .select('professional_id,atb_id,assessment_access,assessment_summary,capabilities,selected_capabilities,full_name,headline,current_job_title')
    .eq(lookupField, identifier)
    .in('assessment_access', ['full', 'basic'])
    .maybeSingle()

  if (rosterError) {
    console.error('Public roster eligibility verification failed:', rosterError)
    throw new Error('Public profile eligibility could not be verified.')
  }
  if (!roster) return null

  const professionalId = roster.professional_id
  if (roster.assessment_access === 'full') {
    if (!Array.isArray(roster.capabilities) || roster.capabilities.length === 0) return null
    if (!roster.assessment_summary || roster.assessment_summary.trim().length < 12) return null
  } else if (!(await hasCompletedTaster(admin, professionalId))) {
    return null
  }

  const { data: acknowledgement, error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('acknowledgement_type', 'profile_submission')
    .eq('acknowledgement_version', PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION)
    .limit(1)
    .maybeSingle()

  if (acknowledgementError) {
    console.error('Public profile consent verification failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }
  if (!acknowledgement) return null

  const { data: profile, error: profileError } = await admin
    .from('professional_profiles')
    .select(`${PUBLIC_PROFILE_FIELDS},profile_complete`)
    .eq('id', professionalId)
    .eq('is_test', false)
    .eq('visibility', 'public')
    .eq('listing_status', 'listed')
    .is('revoked_at', null)
    .maybeSingle()

  if (profileError) {
    console.error('Public profile field projection failed:', profileError)
    throw new Error('Public profile could not be verified.')
  }
  if (!profile) return null

  if (roster.assessment_access === 'full' && profile.profile_complete !== true) return null
  if (roster.assessment_access === 'basic' && !hasBasicPublicIdentity(profile, roster)) return null

  const { profile_complete: _profileComplete, ...publicProfile } = profile
  return {
    ...publicProfile,
    // Basic listings intentionally do not display an unverified/full VALU score
    // or assessment-derived summary.
    assessment_summary: roster.assessment_access === 'full' ? roster.assessment_summary : null,
    valu_index: roster.assessment_access === 'full' ? profile.valu_index : null,
    cluster_scores: roster.assessment_access === 'full' ? profile.cluster_scores : null,
    designation: roster.assessment_access === 'full' ? profile.designation : null,
    capabilities: roster.capabilities || [],
    selected_capabilities: roster.selected_capabilities || [],
    active_tracks: roster.selected_capabilities?.length
      ? roster.selected_capabilities
      : (profile.active_tracks || []),
    assessment_access: roster.assessment_access,
  }
}

export async function getConsentVerifiedPublicProfileSitemapRows() {
  const admin = getAdminClient()
  const { data: roster, error: rosterError } = await admin
    .from('marketplace_public_roster')
    .select('professional_id,assessment_access,assessment_summary,capabilities,full_name,headline,current_job_title')
    .in('assessment_access', ['full', 'basic'])

  if (rosterError) {
    console.error('Public roster sitemap eligibility query failed:', rosterError)
    throw new Error('Public profile sitemap could not be verified.')
  }

  const rosterById = new Map((roster || [])
    .filter(row => row.assessment_access !== 'full' || (Array.isArray(row.capabilities) && row.capabilities.length > 0))
    .filter(row => row.assessment_access !== 'full'
      || (row.assessment_summary && row.assessment_summary.trim().length >= 12))
    .map(row => [row.professional_id, row]))
  const candidateIds = [...rosterById.keys()]
  if (!candidateIds.length) return []

  const { data: profiles, error: profileError } = await admin
    .from('professional_profiles')
    .select('id,updated_at,display_name,headline,current_job_title,profile_complete')
    .in('id', candidateIds)
    .eq('is_test', false)
    .eq('visibility', 'public')
    .eq('listing_status', 'listed')
    .is('revoked_at', null)

  if (profileError) {
    console.error('Public profile sitemap query failed:', profileError)
    throw new Error('Public profile sitemap could not be verified.')
  }
  if (!profiles?.length) return []

  const basicIds = profiles
    .filter(profile => rosterById.get(profile.id)?.assessment_access === 'basic')
    .map(profile => profile.id)
  let tasterIds = new Set()
  if (basicIds.length) {
    const { data: tasters, error: tasterError } = await admin
      .from('taster_sessions')
      .select('user_id')
      .in('user_id', basicIds)
      .not('completed_at', 'is', null)
    if (tasterError) {
      console.error('Basic listing sitemap taster verification failed:', tasterError)
      throw new Error('Basic profile sitemap could not be verified.')
    }
    tasterIds = new Set((tasters || []).map(row => row.user_id))
  }

  const { data: acknowledgements, error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .select('professional_id')
    .in('professional_id', profiles.map(profile => profile.id))
    .eq('acknowledgement_type', 'profile_submission')
    .eq('acknowledgement_version', PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION)

  if (acknowledgementError) {
    console.error('Public profile sitemap consent query failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }

  const consented = new Set((acknowledgements || []).map(row => row.professional_id))
  return profiles.filter(profile => {
    const access = rosterById.get(profile.id)?.assessment_access
    const ready = access === 'full'
      ? profile.profile_complete === true
      : access === 'basic'
        && tasterIds.has(profile.id)
        && hasBasicPublicIdentity(profile, rosterById.get(profile.id))
    return ready && consented.has(profile.id)
  })
}
