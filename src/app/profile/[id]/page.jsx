import { createClient } from '@supabase/supabase-js'
import ProfileClient from './ProfileClient'

const SITE_URL = 'https://valoriainstitute.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export default async function ProfilePage({ params, searchParams }) {
  const { id } = params
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('id, display_name, headline, current_job_title, location, industry, experience_years, bio, skills, topics, active_tracks, valu_index, cluster_scores, designation, linkedin_url, website_url, youtube_links, fee_range, salary_expectation, atb_id, availability, photo_url, username, phone, cv_summary, programme_types, listing_status, visibility, updated_at')
    .eq('id', id)
    .maybeSingle()

  const publicProfile = Boolean(profile && profile.listing_status === 'listed' && profile.visibility !== 'private' && profile.display_name)

  const initialProfile = publicProfile ? {
    ...profile,
    years_experience: profile.experience_years,
    availability: Array.isArray(profile.availability) ? (profile.availability[0] || null) : profile.availability,
    valu_score: profile.valu_index,
    active_tracks: profile.active_tracks || [],
    _source: 'real',
  } : null

  const name = profile?.display_name || 'Valoria Professional'
  const tracks = profile?.active_tracks || []
  const profileUrl = `${SITE_URL}/profile/${id}`
  const profileSchema = publicProfile ? {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': profileUrl,
    url: profileUrl,
    name: `${name} — Valoria Institute`,
    dateModified: profile.updated_at || undefined,
    mainEntity: {
      '@type': 'Person',
      name,
      jobTitle: profile.current_job_title || profile.headline || undefined,
      description: profile.bio || undefined,
      image: profile.photo_url || undefined,
      url: profileUrl,
      sameAs: [profile.linkedin_url, profile.website_url, ...(Array.isArray(profile.youtube_links) ? profile.youtube_links : [])].filter(Boolean),
      knowsAbout: [...(Array.isArray(profile.skills) ? profile.skills : []), ...(Array.isArray(profile.topics) ? profile.topics : [])],
      worksFor: profile.current_job_title ? { '@type': 'Organization', name: 'Valoria Institute' } : undefined,
    },
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
  } : null

  return <>
    {profileSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />}
    <ProfileClient id={id} searchParams={searchParams} initialProfile={initialProfile} />
  </>
}
