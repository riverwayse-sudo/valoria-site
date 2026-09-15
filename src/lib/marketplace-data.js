import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,bio,location,languages,headline,capability,track,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation'

export async function getMarketplaceRows(track = 'all') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase
    .from('marketplace_professionals')
    .select(FIELDS)
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Marketplace server query failed:', error)
    return []
  }

  const rows = (data || []).map(row => ({ ...row, id: row.professional_id }))
  if (track !== 'all') return rows.filter(row => row.track === track)

  // The unified marketplace must show one professional identity even when that
  // identity is eligible for multiple capabilities. Keep the highest-VALU row
  // as the canonical card and retain all governed capabilities for navigation.
  const byProfessional = new Map()
  for (const row of rows) {
    const existing = byProfessional.get(row.professional_id)
    if (!existing) {
      byProfessional.set(row.professional_id, { ...row, tracks: [row.track] })
    } else if (!existing.tracks.includes(row.track)) {
      existing.tracks.push(row.track)
    }
  }
  return [...byProfessional.values()].map(row => ({ ...row, track: row.tracks[0] || row.track }))
}
