import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,location,languages,headline,current_job_title,capability,track,capabilities,selected_capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,assessment_summary,designation,fee_range,salary_expectation,availability_status,assessment_access'
const SOURCE = 'marketplace_public_roster'
const EXCLUDED_ATB_IDS = new Set(['ATB-C-SAA-00179', 'ATB-C-OAA-00157', 'ATB-68A5E7D8', 'ATB-C-𝙾𝙴𝙾-00387'])

// The public roster already enforces public visibility, listing status, profile completeness,
// current assessment eligibility and revocation controls. The application adds the homepage
// quality bar so no Basic snapshot or profile without a usable assessment descriptor is shown.
function isQualifiedPublicProfile(row) {
  return Boolean(
    row?.professional_id &&
    row.assessment_access === 'full' &&
    Number.isFinite(Number(row.valu_index)) && Number(row.valu_index) >= 35 &&
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

export async function getMarketplaceRows(track = 'all') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase
    .from(SOURCE)
    .select(FIELDS)
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Marketplace query failed:', error)
    return []
  }

  const rows = dedupeProfessionals((data || []).filter(isQualifiedPublicProfile))
  return rows.filter(row => track === 'all' || row.capabilities.includes(normalizeTrack(track)))
}

export async function getMarketplaceCounts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase
    .from(SOURCE)
    .select('professional_id,capability,track,capabilities,assessment_access,assessment_summary,valu_index,designation,atb_id,full_name,headline')

  if (error) {
    console.error('Marketplace count query failed:', error)
    return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  }

  const qualifiedRows = dedupeProfessionals((data || []).filter(isQualifiedPublicProfile))
  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }
  const all = new Set()

  for (const row of qualifiedRows) {
    if (!row.professional_id) continue
    all.add(row.professional_id)
    const values = new Set([
      ...(Array.isArray(row.capabilities) ? row.capabilities : []),
      row.capability,
      row.track,
    ].map(normalizeTrack).filter(Boolean))
    for (const capability of values) {
      if (byTrack[capability]) byTrack[capability].add(row.professional_id)
    }
  }

  return {
    all: all.size,
    candidate: byTrack.candidate.size,
    speaker: byTrack.speaker.size,
    facilitator: byTrack.facilitator.size,
  }
}
