import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,location,languages,headline,current_job_title,capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,assessment_summary,designation,fee_range,salary_expectation,availability_status,assessment_access'
const SOURCE = 'marketplace_public_roster'
const EMPTY_COUNTS = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }

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
      })
    }
    const target = map.get(row.professional_id)
    const values = [
      ...(Array.isArray(row.capabilities) ? row.capabilities : []),
      row.capability,
      row.track,
    ].map(normalizeTrack).filter(Boolean)
    target.capabilities = [...new Set([...target.capabilities, ...values])]
    target.tracks = target.capabilities
  }
  return [...map.values()]
}

function countCapabilities(rows) {
  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }
  const all = new Set()
  for (const row of rows) {
    if (!row.professional_id) continue
    all.add(row.professional_id)
    for (const capability of row.capabilities || []) {
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

// The directory and category counts are derived from the same roster response.
// This avoids two independent Supabase requests delaying the first complete render.
export async function getMarketplaceDirectoryData(track = 'all') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { rows: [], counts: EMPTY_COUNTS }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase
    .from(SOURCE)
    .select(FIELDS)
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Marketplace directory query failed:', error)
    return { rows: [], counts: EMPTY_COUNTS }
  }

  const allRows = dedupeProfessionals(data)
  const counts = countCapabilities(allRows)
  const rows = allRows.filter(row => track === 'all' || row.capabilities.includes(normalizeTrack(track)))
  return { rows, counts }
}

// Kept for compatibility with any callers outside the directory routes.
export async function getMarketplaceRows(track = 'all') {
  const { rows } = await getMarketplaceDirectoryData(track)
  return rows
}

export async function getMarketplaceCounts() {
  const { counts } = await getMarketplaceDirectoryData('all')
  return counts
}
