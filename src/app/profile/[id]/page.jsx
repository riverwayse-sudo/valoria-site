import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
)
import ProfileClient from './ProfileClient'

export default async function ProfilePage({ params, searchParams }) {
  const { id } = params
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id, display_name, headline, current_job_title, location, industry, experience_years, bio, skills, topics, active_tracks, valu_index, cluster_scores, designation, linkedin_url, website_url, youtube_links, fee_range, salary_expectation, atb_id, availability, photo_url, username, phone, cv_summary, programme_types')
    .eq('id', id)
    .maybeSingle()

  const initialProfile = profile ? {
    ...profile,
    years_experience: profile.experience_years,
    availability: Array.isArray(profile.availability) ? (profile.availability[0] || null) : profile.availability,
    valu_score: profile.valu_index,
    active_tracks: profile.active_tracks || [],
    _source: 'real',
  } : null

  return <ProfileClient id={id} searchParams={searchParams} initialProfile={initialProfile} />
}
