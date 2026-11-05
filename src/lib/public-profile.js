import 'server-only'
import { createClient } from '@supabase/supabase-js'

export const PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION = 'public-profile-visibility-v1-2026-11-05'

const PUBLIC_PROFILE_FIELDS = [
  'id',
  'display_name',
  'headline',
  'current_job_title',
  'location',
  'industry',
  'experience_years',
  'bio',
  'skills',
  'topics',
  'active_tracks',
  'valu_index',
  'cluster_scores',
  'designation',
  'youtube_links',
  'atb_id',
  'availability',
  'photo_url',
  'programme_types',
  'profile_complete',
  'visibility',
  'listing_status',
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
  const { data: profile, error } = await admin
    .from('professional_profiles')
    .select(PUBLIC_PROFILE_FIELDS)
    .eq(field, identifier)
    .eq('profile_complete', true)
    .eq('is_test', false)
    .eq('visibility', 'public')
    .eq('listing_status', 'listed')
    .is('revoked_at', null)
    .maybeSingle()

  if (error) {
    console.error('Public profile verification failed:', error)
    throw new Error('Public profile could not be verified.')
  }
  if (!profile) return null

  const { data: acknowledgement, error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .select('id')
    .eq('professional_id', profile.id)
    .eq('acknowledgement_type', 'profile_submission')
    .eq('acknowledgement_version', PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION)
    .limit(1)
    .maybeSingle()

  if (acknowledgementError) {
    console.error('Public profile consent verification failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }

  return acknowledgement ? profile : null
}

export async function getConsentVerifiedPublicProfileSitemapRows() {
  const admin = getAdminClient()
  const { data: profiles, error } = await admin
    .from('professional_profiles')
    .select('id,updated_at')
    .eq('profile_complete', true)
    .eq('is_test', false)
    .eq('visibility', 'public')
    .eq('listing_status', 'listed')
    .is('revoked_at', null)

  if (error) {
    console.error('Public profile sitemap query failed:', error)
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
