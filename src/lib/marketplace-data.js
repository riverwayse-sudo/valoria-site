import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,location,languages,headline,current_job_title,capability,track,capabilities,selected_capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,assessment_summary,designation,availability_status,assessment_access'
const SOURCE = 'marketplace_public_roster'
const IS_READ_ONLY_PREVIEW = (process.env.VALU_PREVIEW === '1' || process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.CF_WORKERS_PREVIEW === '1') && process.env.VALU_STAGING_API_ENABLED !== '1'

const PLACEHOLDER_HEADLINES = new Set([
  'model',
  'growth dev',
  'help people find meaning in their life and career',
  'valoria professional',
])

export // Only canonical route-safe ATB identifiers can enter the public profile projection.
function isValidAtbId(value) {
  return /^ATB-[A-Z0-9-]{4,40}$/i.test(String(value || '').normalize('NFKC').trim())
}

export function isPublicProfileContentReady(row) {
  const headline = String(row.headline || row.current_job_title || '').trim()
  const assessmentAccess = row.assessment_access
  const isValidAssessmentAccess = assessmentAccess === 'basic' || assessmentAccess === 'full'
  const hasOfficialPoints = row.valu_index !== null && row.valu_index !== undefined
  const assessmentSummary = String(row.assessment_summary || '').trim()
  const fullAssessmentReady = assessmentAccess !== 'full' || (hasOfficialPoints && assessmentSummary.length >= 12)
  return Boolean(
    row.full_name &&
    isValidAtbId(row.atb_id) &&
    headline.length >= 3 &&
    !PLACEHOLDER_HEADLINES.has(headline.toLowerCase()) &&
    !/[\u{1D400}-\u{1D7FF}]/u.test(headline) &&
    isValidAssessmentAccess &&
    fullAssessmentReady
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
  if (IS_READ_ONLY_PREVIEW) return []

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

  const rows = dedupeProfessionals(data)
  // Suppress incomplete or placeholder public-facing records until an
  // administrator can correct them using verified professional information.
  // The underlying account and professional profile remain intact.
  return rows.filter(row => isPublicProfileContentReady(row) && (track === 'all' || row.selectedCapabilities.includes(normalizeTrack(track))))
}

export async function getMarketplaceCounts() {
  if (IS_READ_ONLY_PREVIEW) return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase
    .from(SOURCE)
    .select('professional_id,full_name,atb_id,headline,current_job_title,assessment_access,valu_index,assessment_summary,capability,track,capabilities,selected_capabilities')

  if (error) {
    console.error('Marketplace count query failed:', error)
    return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  }

  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }
  const all = new Set()

  for (const row of data || []) {
    if (!row.professional_id || !isPublicProfileContentReady(row)) continue
    all.add(row.professional_id)
    const values = new Set((Array.isArray(row.selected_capabilities) ? row.selected_capabilities : []).map(normalizeTrack).filter(Boolean))
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
