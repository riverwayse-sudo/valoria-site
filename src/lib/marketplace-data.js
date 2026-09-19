import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,bio,location,languages,headline,capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation,availability_status,listing_status,eligible_for_listing,listed_at'

function normalizeTrack(value) {
  const v = String(value || '').toLowerCase()
  return v === 'talent' ? 'candidate' : v
}

export async function getMarketplaceRows(track = 'all') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const source = track === 'all' ? 'marketplace_professionals_general' : 'marketplace_professionals'
  const { data, error } = await supabase
    .from(source)
    .select(FIELDS)
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error(`Marketplace query failed (${source}):`, error)
    return []
  }

  return (data || []).map(row => {
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
  }).filter(row => track === 'all' || row.track === track)
}
