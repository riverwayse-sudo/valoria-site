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
  'assessment_completed_at',
  'assessment_expires_at',
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

function normalizePublicDisplayText(value) {
  return typeof value === 'string' ? value.normalize('NFKC').replace(/\s+/g, ' ').trim() : value
}

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
    .select('professional_id,atb_id,assessment_access,assessment_summary,capabilities,selected_capabilities,full_name,headline,current_job_title,valu_index')
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
    .select('id,acknowledgement_version')
    .eq('professional_id', professionalId)
    .eq('acknowledgement_type', 'profile_submission')
    .order('acknowledged_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (acknowledgementError) {
    console.error('Public profile consent verification failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }
  if (acknowledgement?.acknowledgement_version !== PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION) return null

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

  if (roster.assessment_access === 'full') {
    if (profile.profile_complete !== true || Number(profile.valu_index) < 35 || Number(roster.valu_index) !== Number(profile.valu_index)) return null
    const expiry = Date.parse(profile.assessment_expires_at || '')
    const profileCompletedAt = Date.parse(profile.assessment_completed_at || '')
    if (!Number.isFinite(expiry) || expiry <= Date.now() || !Number.isFinite(profileCompletedAt)) return null
    const { data: latestAssessment, error: assessmentError } = await admin
      .from('valu_assessments')
      .select('total_score,completed_at')
      .eq('user_id', professionalId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (assessmentError) {
      console.error('Full assessment validity verification failed:', assessmentError)
      throw new Error('Full assessment validity could not be verified.')
    }
    if (!latestAssessment
      || Number(latestAssessment.total_score) !== Number(profile.valu_index)
      || Date.parse(latestAssessment.completed_at || '') !== profileCompletedAt) return null
    const { data: activeCapabilities, error: capabilityError } = await admin
      .from('professional_capabilities')
      .select('capability,eligible_for_listing,eligibility_status,missing_requirements')
      .eq('professional_id', professionalId)
      .eq('is_active', true)
    if (capabilityError) {
      console.error('Full capability evidence verification failed:', capabilityError)
      throw new Error('Full profile capability evidence could not be verified.')
    }
    const capabilitiesReady = (activeCapabilities || []).length > 0
      && activeCapabilities.every(capability =>
        capability.eligible_for_listing === true
        && capability.eligibility_status === 'listed'
        && (!Array.isArray(capability.missing_requirements) || capability.missing_requirements.length === 0)
      )
    if (!capabilitiesReady) return null
  }
  if (roster.assessment_access === 'basic' && !hasBasicPublicIdentity(profile, roster)) return null

  const { profile_complete: _profileComplete, ...publicProfile } = profile
  return {
    ...publicProfile,
    display_name: normalizePublicDisplayText(profile.display_name),
    display_initials: normalizePublicDisplayText(profile.display_initials),
    headline: normalizePublicDisplayText(profile.headline),
    current_job_title: normalizePublicDisplayText(profile.current_job_title),
    // Basic listings intentionally do not display an unverified/full VALU score
    // or assessment-derived summary.
    assessment_summary: roster.assessment_access === 'full' ? roster.assessment_summary : null,
    valu_index: roster.assessment_access === 'full' ? profile.valu_index : null,
    valu_score: roster.assessment_access === 'full' ? profile.valu_index : null,
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
    .select('professional_id,assessment_access,assessment_summary,capabilities,full_name,headline,current_job_title,valu_index')
    .in('assessment_access', ['full', 'basic'])

  if (rosterError) {
    console.error('Public roster sitemap eligibility query failed:', rosterError)
    throw new Error('Public profile sitemap could not be verified.')
  }

  const rosterById = new Map((roster || [])
    .filter(row => row.assessment_access !== 'full'
      || (Array.isArray(row.capabilities) && row.capabilities.length > 0
        && row.assessment_summary && row.assessment_summary.trim().length >= 12))
    .map(row => [row.professional_id, row]))
  const candidateIds = [...rosterById.keys()]
  if (!candidateIds.length) return []

  const { data: profiles, error: profileError } = await admin
    .from('professional_profiles')
    .select('id,updated_at,display_name,headline,current_job_title,profile_complete,valu_index,assessment_completed_at,assessment_expires_at')
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

  const fullIds = profiles
    .filter(profile => rosterById.get(profile.id)?.assessment_access === 'full')
    .map(profile => profile.id)
  let fullReadyIds = new Set()
  if (fullIds.length) {
    const { data: fullAssessments, error: assessmentError } = await admin
      .from('valu_assessments')
      .select('user_id,total_score,completed_at')
      .in('user_id', fullIds)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
    if (assessmentError) {
      console.error('Full assessment sitemap validity verification failed:', assessmentError)
      throw new Error('Full assessment sitemap validity could not be verified.')
    }
    const latestAssessmentById = new Map()
    for (const assessment of fullAssessments || []) {
      if (!latestAssessmentById.has(assessment.user_id)) latestAssessmentById.set(assessment.user_id, assessment)
    }
    const { data: capabilities, error: capabilityError } = await admin
      .from('professional_capabilities')
      .select('professional_id,eligible_for_listing,eligibility_status,missing_requirements')
      .in('professional_id', fullIds)
      .eq('is_active', true)
    if (capabilityError) {
      console.error('Full profile sitemap capability verification failed:', capabilityError)
      throw new Error('Full profile sitemap capability evidence could not be verified.')
    }
    const capabilitiesById = new Map()
    for (const capability of capabilities || []) {
      const list = capabilitiesById.get(capability.professional_id) || []
      list.push(capability)
      capabilitiesById.set(capability.professional_id, list)
    }
    fullReadyIds = new Set(fullIds.filter(id => {
      const active = capabilitiesById.get(id) || []
      const profile = profiles.find(item => item.id === id)
      const assessment = latestAssessmentById.get(id)
      const expiry = Date.parse(profile?.assessment_expires_at || '')
      const profileCompletedAt = Date.parse(profile?.assessment_completed_at || '')
      return active.length > 0
        && active.every(capability =>
          capability.eligible_for_listing === true
          && capability.eligibility_status === 'listed'
          && (!Array.isArray(capability.missing_requirements) || capability.missing_requirements.length === 0)
        )
        && profile?.profile_complete === true
        && Number(profile.valu_index) >= 35
        && Number.isFinite(expiry) && expiry > Date.now()
        && assessment
        && Number(assessment.total_score) === Number(profile.valu_index)
        && Date.parse(assessment.completed_at || '') === profileCompletedAt
    }))
  }

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
    .select('professional_id,acknowledgement_version')
    .in('professional_id', profiles.map(profile => profile.id))
    .eq('acknowledgement_type', 'profile_submission')
    .order('acknowledged_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (acknowledgementError) {
    console.error('Public profile sitemap consent query failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }

  const latestAcknowledgements = new Map()
  for (const acknowledgement of acknowledgements || []) {
    if (!latestAcknowledgements.has(acknowledgement.professional_id)) {
      latestAcknowledgements.set(acknowledgement.professional_id, acknowledgement.acknowledgement_version)
    }
  }
  const consented = new Set([...latestAcknowledgements.entries()]
    .filter(([, version]) => version === PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION)
    .map(([professionalId]) => professionalId))
  return profiles.filter(profile => {
    const access = rosterById.get(profile.id)?.assessment_access
    const ready = access === 'full'
      ? profile.profile_complete === true && Number(profile.valu_index) >= 35 && Number(rosterById.get(profile.id)?.valu_index) === Number(profile.valu_index) && fullReadyIds.has(profile.id)
      : access === 'basic'
        && tasterIds.has(profile.id)
        && hasBasicPublicIdentity(profile, rosterById.get(profile.id))
    return ready && consented.has(profile.id)
  })
}
