import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,bio,location,languages,headline,current_job_title,capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation,availability_status'
const SOURCE = 'marketplace_public_roster'

function normalizeTrack(value) {
  const v = String(value || '').toLowerCase()
  return v === 'talent' ? 'candidate' : v
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

  return (data || []).map(row => {
    const capabilities = [...new Set(
      (Array.isArray(row.capabilities) ? row.capabilities : [row.capability, row.track])
        .map(normalizeTrack)
        .filter(Boolean)
    )]
    return {
      ...row,
      id: row.professional_id,
      track: normalizeTrack(row.track || row.capability || capabilities[0]),
      capabilities,
      tracks: capabilities,
    }
  }).filter(row => track === 'all' || row.capabilities.includes(normalizeTrack(track)))
}

export async function getMarketplaceCounts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase
    .from(SOURCE)
    .select('professional_id,capabilities')

  if (error) {
    console.error('Marketplace count query failed:', error)
    return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  }

  const byTrack = { candidate: new Set(), speaker: new Set(), facilitator: new Set() }
  const all = new Set()

  for (const row of data || []) {
    if (!row.professional_id) continue
    all.add(row.professional_id)
    for (const capability of new Set((row.capabilities || []).map(normalizeTrack))) {
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
