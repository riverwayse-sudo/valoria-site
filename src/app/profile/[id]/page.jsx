import { createClient } from '@supabase/supabase-js'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FIELDS = 'id, display_name, headline, current_job_title, location, industry, experience_years, bio, skills, topics, active_tracks, valu_index, cluster_scores, designation, linkedin_url, website_url, youtube_links, fee_range, salary_expectation, atb_id, availability, photo_url, username, phone, cv_summary, programme_types'

function normalizeProfile(profile) {
  if (!profile) return null
  return { ...profile, years_experience: profile.experience_years, availability: Array.isArray(profile.availability) ? (profile.availability[0] || null) : profile.availability, valu_score: profile.valu_index, active_tracks: profile.active_tracks || [], _source: 'real' }
}

export default async function ProfilePage({ params, searchParams }) {
  const { id } = params
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return <ProfileClient id={id} searchParams={searchParams} initialProfile={null} />

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: profile, error } = await supabase.from('professional_profiles').select(FIELDS).eq('id', id).maybeSingle()
  if (error) console.error('professional_profiles fetch failed:', error)
  if (profile) return <ProfileClient id={id} searchParams={searchParams} initialProfile={normalizeProfile(profile)} />

  const { data: roster, error: rosterError } = await supabase.from('marketplace_public_roster').select('professional_id,full_name,bio,location,headline,capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation,availability_status').eq('professional_id', id).maybeSingle()
  if (rosterError) console.error('marketplace_public_roster fallback failed:', rosterError)
  if (roster) return <ProfileClient id={id} searchParams={searchParams} initialProfile={normalizeProfile({ id: roster.professional_id, display_name: roster.full_name, bio: roster.bio, location: roster.location, headline: roster.headline, active_tracks: (roster.capabilities || []).map(v => v === 'talent' ? 'candidate' : v), atb_id: roster.atb_id, display_initials: roster.display_initials, photo_url: roster.photo_url, industry: roster.industry, skills: roster.skills, topics: roster.topics, programme_types: roster.programme_types, availability: roster.availability, valu_index: roster.valu_index, cluster_scores: roster.cluster_scores, designation: roster.designation, fee_range: roster.fee_range, salary_expectation: roster.salary_expectation, availability_status: roster.availability_status })} />
  return <ProfileClient id={id} searchParams={searchParams} initialProfile={null} />
}
