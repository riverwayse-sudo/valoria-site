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

export async function getConsentVerifiedPublicProfile(identifier, field = 'id') {
  if (!['id', 'atb_id'].includes(field) || !identifier) return null
  const admin = getAdminClient()
  const lookupField = field === 'atb_id' ? 'atb_id' : 'professional_id'

  // The roster is the canonical capability/assessment eligibility gate.
  // A profile row alone is not sufficient for public discovery.
  const { data: roster, error: rosterError } = await admin
    .from('marketplace_public_roster')
    .select('professional_id,atb_id,assessment_access,assessment_summary,capabilities,selected_capabilities')
    .eq(lookupField, identifier)
    .eq('assessment_access', 'full')
    .maybeSingle()

  if (rosterError) {
    console.error('Public roster eligibility verification failed:', rosterError)
    throw new Error('Public profile eligibility could not be verified.')
  }
  if (!roster || !roster.assessment_summary || roster.assessment_summary.trim().length < 12) return null

  const professionalId = roster.professional_id
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
    .select(PUBLIC_PROFILE_FIELDS)
    .eq('id', professionalId)
    .eq('profile_complete', true)
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

  return {
    ...profile,
    assessment_summary: roster.assessment_summary,
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
    .select('professional_id,assessment_access,assessment_summary')
    .eq('assessment_access', 'full')

  if (rosterError) {
    console.error('Public roster sitemap eligibility query failed:', rosterError)
    throw new Error('Public profile sitemap could not be verified.')
  }

  const eligibleIds = (roster || [])
    .filter(row => row.assessment_summary && row.assessment_summary.trim().length >= 12)
    .map(row => row.professional_id)
  if (!eligibleIds.length) return []

  const { data: profiles, error: profileError } = await admin
    .from('professional_profiles')
    .select('id,updated_at')
    .in('id', eligibleIds)
    .eq('profile_complete', true)
    .eq('is_test', false)
    .eq('visibility', 'public')
    .eq('listing_status', 'listed')
    .is('revoked_at', null)

  if (profileError) {
    console.error('Public profile sitemap query failed:', profileError)
    throw new Error('Public profile sitemap could not be verified.')
  }
  if (!profiles?.length) return []

  const { data: acknowledgements, error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .select('professional_id')
    .in('professional_id', profiles.map(profile => profile.id))
    .eq('acknowledgement_type', 'profile_submission')
    .eq('acknowledgement_version', PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION)

  if (acknowledgementError) {
    console.error('Public profile sitemap consent query failed:', acknowledgementError)
    throw new Error('Public profile sitemap consent could not be verified.')
  }

  const consented = new Set((acknowledgements || []).map(row => row.professional_id))
  return profiles.filter(profile => consented.has(profile.id))
}
