import 'server-only'
import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,location,languages,headline,current_job_title,capability,track,capabilities,selected_capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,assessment_summary,designation,availability_status,assessment_access'
const SOURCE = 'marketplace_public_roster'
const PUBLIC_PROFILE_ACK_VERSION = 'public-profile-visibility-v2-2026-11-06'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Marketplace service credentials are unavailable.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function isQualifiedPublicProfile(row) {
  const hasIdentity = Boolean(
    row?.professional_id &&
    typeof row.full_name === 'string' && row.full_name.trim() &&
    typeof row.headline === 'string' && row.headline.trim() &&
    typeof row.atb_id === 'string' && row.atb_id.trim()
  )
  if (!hasIdentity) return false

  if (row.assessment_access === 'basic') return true
  return Boolean(
    row.assessment_access === 'full' &&
    Array.isArray(row.capabilities) && row.capabilities.length > 0 &&
    row.valu_index !== null && row.valu_index !== undefined && Number.isFinite(Number(row.valu_index)) &&
    typeof row.assessment_summary === 'string' && row.assessment_summary.trim().length >= 12 &&
    typeof row.designation === 'string' && row.designation.trim()
  )
}

function normalizeTrack(value) {
  const v = String(value || '').toLowerCase()
  return v === 'talent' ? 'candidate' : v
}

function dedupeProfessionals(rows) {
  const map = new Map()
  for (const row of rows || []) {
    if (!row.professional_id) continue
    if (!map.has(row.professional_id)) {
      map.set(row.professional_id, {
        ...row,
        id: row.professional_id,
        capabilities: [],
        tracks: [],
        selectedCapabilities: [],
      })
    }
    const target = map.get(row.professional_id)
    const values = [
      ...(Array.isArray(row.capabilities) ? row.capabilities : []),
      row.capability,
      row.track,
    ].map(normalizeTrack).filter(Boolean)
    const selectedValues = (Array.isArray(row.selected_capabilities) ? row.selected_capabilities : [])
      .map(normalizeTrack).filter(Boolean)
    target.capabilities = [...new Set([...target.capabilities, ...values])]
    target.tracks = target.capabilities
    target.selectedCapabilities = [...new Set([...target.selectedCapabilities, ...selectedValues])]
  }
  return [...map.values()]
}

async function getApprovedPublicProfessionalIds(admin, rows) {
  if (!rows.length) return new Set()
  const ids = rows.map(row => row.professional_id)
  const { data: profiles, error } = await admin
    .from('professional_profiles')
    .select('id,display_name,headline,current_job_title,profile_complete,is_test,visibility,listing_status,revoked_at')
    .in('id', ids)

  if (error) {
    console.error('Public profile quality verification failed:', error)
    throw new Error('Public profile quality could not be verified.')
  }

  const basicIds = rows
    .filter(row => row.assessment_access === 'basic')
    .map(row => row.professional_id)
  let linkedTasterIds = new Set()
  if (basicIds.length) {
    const { data: tasters, error: tasterError } = await admin
      .from('taster_sessions')
      .select('user_id')
      .in('user_id', basicIds)
      .not('completed_at', 'is', null)

    if (tasterError) {
      console.error('Basic listing taster verification failed:', tasterError)
      throw new Error('Basic listing eligibility could not be verified.')
    }
    linkedTasterIds = new Set((tasters || []).map(row => row.user_id))
  }

  const { data: acknowledgements, error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .select('professional_id')
    .eq('acknowledgement_type', 'profile_submission')
    .eq('acknowledgement_version', PUBLIC_PROFILE_ACK_VERSION)
    .in('professional_id', ids)

  if (acknowledgementError) {
    console.error('Public profile consent verification failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }

  const consentedIds = new Set((acknowledgements || []).map(item => item.professional_id))
  const profileById = new Map((profiles || []).map(profile => [profile.id, profile]))
  return new Set(rows.filter(row => {
    const profile = profileById.get(row.professional_id)
    if (!profile || profile.is_test !== false || profile.visibility !== 'public'
      || profile.listing_status !== 'listed' || profile.revoked_at != null
      || !consentedIds.has(profile.id)) return false

    if (row.assessment_access === 'full') return profile.profile_complete === true
    return row.assessment_access === 'basic'
      && linkedTasterIds.has(profile.id)
      && Boolean(profile.display_name?.trim())
      && Boolean(profile.headline?.trim() || profile.current_job_title?.trim())
  }).map(row => row.professional_id))
}

export async function getMarketplaceRows(track = 'all') {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from(SOURCE)
    .select(FIELDS)
    .in('assessment_access', ['full', 'basic'])
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Marketplace query failed:', error)
    throw new Error('Marketplace listings could not be loaded.')
  }

  const projected = dedupeProfessionals((data || []).filter(isQualifiedPublicProfile))
  const approvedIds = await getApprovedPublicProfessionalIds(admin, projected)
  const rows = projected
    .filter(row => approvedIds.has(row.professional_id))
    .map(row => row.assessment_access === 'basic'
      ? { ...row, valu_index: null, cluster_scores: null, assessment_summary: null, designation: null }
      : row)
  return rows.filter(row => track === 'all' || row.capabilities.includes(normalizeTrack(track)))
}

function countMarketplaceRows(rows) {
  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }

  for (const row of rows || []) {
    for (const capability of row.capabilities || []) {
      if (byTrack[capability]) byTrack[capability].add(row.professional_id)
    }
  }

  return {
    all: (rows || []).length,
    candidate: byTrack.candidate.size,
    speaker: byTrack.speaker.size,
    facilitator: byTrack.facilitator.size,
  }
}

export async function getMarketplaceCounts(existingRows) {
  const rows = Array.isArray(existingRows) ? existingRows : await getMarketplaceRows('all')
  return countMarketplaceRows(rows)
}

export async function getMarketplaceDirectoryData(track = 'all') {
  const allRows = await getMarketplaceRows('all')
  const normalizedTrack = normalizeTrack(track)
  return {
    rows: normalizedTrack === 'all' ? allRows : allRows.filter(row => row.capabilities.includes(normalizedTrack)),
    counts: countMarketplaceRows(allRows),
  }
}
