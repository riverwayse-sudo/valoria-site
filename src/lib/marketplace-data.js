import { createClient } from '@supabase/supabase-js'

const FIELDS = 'professional_id,full_name,bio,location,languages,headline,capability,track,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation,availability_status,listing_status,eligible_for_listing,listed_at'

export async function getMarketplaceRows(track = 'all') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // General marketplace: one governed row per professional identity.
  // Category marketplace: one governed row per eligible capability.
  // Neither path reads the retired marketplace_profiles table.
  const source = track === 'all' ? 'marketplace_professionals_general' : 'marketplace_professionals'
  const query = supabase
    .from(source)
    .select(FIELDS)
    .order('valu_index', { ascending: false, nullsFirst: false })
    .order('full_name', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error(`Marketplace query failed (${source}):`, error)
    return []
  }

  const rows = (data || []).map(row => ({ ...row, id: row.professional_id }))
  if (track !== 'all') return rows.filter(row => row.track === track)

  // The general projection is already one row per professional. Keep a
  // defensive dedupe in case the view is ever expanded to multiple rows.
  const byProfessional = new Map()
  for (const row of rows) {
    const existing = byProfessional.get(row.professional_id)
    if (!existing) {
      byProfessional.set(row.professional_id, { ...row, tracks: row.track ? [row.track] : [] })
    } else if (row.track && !existing.tracks.includes(row.track)) {
      existing.tracks.push(row.track)
    }
  }

  return [...byProfessional.values()].map(row => ({
    ...row,
    track: row.tracks[0] || row.track,
  }))
}
