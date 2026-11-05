import 'server-only'
import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,location,languages,headline,current_job_title,capability,track,capabilities,selected_capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,assessment_summary,designation,fee_range,salary_expectation,availability_status,assessment_access'
const SOURCE = 'marketplace_public_roster'
const EXCLUDED_ATB_IDS = new Set(['ATB-C-SAA-00179', 'ATB-C-OAA-00157', 'ATB-68A5E7D8', 'ATB-C-𝙾𝙴𝙾-00387'])
const PUBLIC_PROFILE_ACK_VERSION = 'public-profile-visibility-v1-2026-11-05'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Marketplace service credentials are unavailable.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

// The public roster is a projection, not proof that every source profile is complete.
// Re-check owner-controlled status fields before any profile is rendered publicly.
function isQualifiedPublicProfile(row) {
  return Boolean(
    row?.professional_id &&
    row.assessment_access === 'full' &&
    Number.isFinite(Number(row.valu_index)) &&
    typeof row.assessment_summary === 'string' && row.assessment_summary.trim().length >= 12 &&
    typeof row.full_name === 'string' && row.full_name.trim() &&
    typeof row.headline === 'string' && row.headline.trim() &&
    typeof row.designation === 'string' && row.designation.trim() &&
    typeof row.atb_id === 'string' && row.atb_id.trim() &&
    !EXCLUDED_ATB_IDS.has(row.atb_id)
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

async function getApprovedPublicProfessionalIds(admin, ids) {
  if (!ids.length) return new Set()
  const { data, error } = await admin
    .from('professional_profiles')
    .select('id,profile_complete,is_test,visibility,listing_status,revoked_at')
    .in('id', ids)

  if (error) {
    console.error('Public profile quality verification failed:', error)
    throw new Error('Public profile quality could not be verified.')
  }

  const { data: acknowledgements, error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .select('professional_id')
    .eq('acknowledgement_type', 'profile_submission')
    .eq('acknowledgement_version', PUBLIC_PROFILE_ACK_VERSION)

  if (acknowledgementError) {
    console.error('Public profile consent verification failed:', acknowledgementError)
    throw new Error('Public profile consent could not be verified.')
  }

  const consentedIds = new Set((acknowledgements || []).map(item => item.professional_id))
  return new Set((data || [])
    .filter(profile =>
      profile.profile_complete === true &&
      profile.is_test === false &&
      profile.visibility === 'public' &&
      profile.listing_status === 'listed' &&
      profile.revoked_at == null &&
      consentedIds.has(profile.id)
    )
    .map(profile => profile.id))
}

export async function getMarketplaceRows(track = 'all') {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from(SOURCE)
    .select(FIELDS)
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Marketplace query failed:', error)
    throw new Error('Marketplace listings could not be loaded.')
  }

  const projected = dedupeProfessionals((data || []).filter(isQualifiedPublicProfile))
  const approvedIds = await getApprovedPublicProfessionalIds(admin, projected.map(row => row.professional_id))
  const rows = projected.filter(row => approvedIds.has(row.professional_id))
  return rows.filter(row => track === 'all' || row.capabilities.includes(normalizeTrack(track)))
}

export async function getMarketplaceCounts() {
  const rows = await getMarketplaceRows('all')
  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }

  for (const row of rows) {
    for (const capability of row.capabilities || []) {
      if (byTrack[capability]) byTrack[capability].add(row.professional_id)
    }
  }

  return {
    all: rows.length,
    candidate: byTrack.candidate.size,
    speaker: byTrack.speaker.size,
    facilitator: byTrack.facilitator.size,
  }
}
