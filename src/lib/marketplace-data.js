import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,bio,location,languages,headline,capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation,availability_status,listing_status,eligible_for_listing,listed_at'

function normalizeTrack(value) {
  const v = String(value || '').toLowerCase()
  return v === 'talent' ? 'candidate' : v
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch(input, init = {}) {
        return fetch(input, { ...init, cache: 'no-store' })
      },
    },
  })
}

export async function getMarketplaceRows(track = 'all') {
  const supabase = getClient()
  if (!supabase) return []

  // Both the overall marketplace and category pages read from the same
  // authoritative capability projection. This prevents the category route
  // from drifting behind the aggregate marketplace.
  const { data, error } = await supabase
    .from('marketplace_professionals')
    .select(FIELDS)
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Marketplace query failed:', error)
    return []
  }

  const rows = (data || []).map(row => {
    const capabilities = [...new Set(
      (Array.isArray(row.capabilities) && row.capabilities.length ? row.capabilities : [row.capability, row.track])
        .map(normalizeTrack)
        .filter(Boolean)
    )]
    const rowTrack = normalizeTrack(row.track || row.capability || capabilities[0])
    return {
      ...row,
      id: row.professional_id,
      track: rowTrack,
      capabilities,
      tracks: capabilities,
    }
  })

  // A category page must show every authoritative capability row for that
  // category. The same professional may therefore appear in multiple
  // capability categories, while remaining one professional identity.
  return track === 'all' ? rows : rows.filter(row => row.track === normalizeTrack(track))
}

export async function getMarketplaceCounts() {
  const supabase = getClient()
  if (!supabase) return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }

  const { data, error } = await supabase
    .from('marketplace_professionals')
    .select('professional_id,track')

  if (error) {
    console.error('Marketplace count query failed:', error)
    return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  }

  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }
  const all = new Set()
  for (const row of data || []) {
    const track = normalizeTrack(row.track)
    if (!row.professional_id) continue
    all.add(row.professional_id)
    if (byTrack[track]) byTrack[track].add(row.professional_id)
  }

  return {
    all: all.size,
    candidate: byTrack.candidate.size,
    speaker: byTrack.speaker.size,
    facilitator: byTrack.facilitator.size,
  }
}
