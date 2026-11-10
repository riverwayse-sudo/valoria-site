import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { toPublicProfile, PUBLIC_PROFILE_SELECT } from '@/lib/public-profile'
import { isPublicProfileContentReady } from '@/lib/marketplace-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage({ params, searchParams }) {
  const { id } = await params
  const resolvedSearchParams = await searchParams

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const isAtbId = /^ATB-[A-Z0-9-]{4,40}$/i.test(String(id).normalize('NFKC'))
  if (!isUuid && !isAtbId) notFound()

  const readOnlyPreview = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' && process.env.VALU_STAGING_API_ENABLED !== '1'
  if (readOnlyPreview) {
    return <ProfileClient id={id} searchParams={resolvedSearchParams} previewUnavailable />
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return <ProfileClient id={id} searchParams={resolvedSearchParams} />

  const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })

  // Public profile pages read only the deliberately limited public roster
  // projection. The underlying professional_profiles table remains private.
  const { data: row, error } = await supabase
    .from('marketplace_public_roster')
    .select(PUBLIC_PROFILE_SELECT)
    .eq(isUuid ? 'professional_id' : 'atb_id', id)
    .maybeSingle()

  if (error) console.error('public Marketplace profile fetch failed:', error)

  const profileContentNotReady = Boolean(row && !isPublicProfileContentReady(row))
  const publicProfile = isPublicProfileContentReady(row) ? toPublicProfile(row) : null
  const profileUrl = publicProfile?.id ? 'https://valoriainstitute.com/profile/' + publicProfile.id : null
  const profileSchema = publicProfile ? {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: profileUrl,
    mainEntity: {
      '@type': 'Person',
      name: publicProfile.display_name,
      url: profileUrl,
      jobTitle: publicProfile.headline || publicProfile.current_job_title || undefined,
      description: publicProfile.assessment_summary || publicProfile.bio || publicProfile.headline || undefined,
      image: publicProfile.photo_url || undefined,
      knowsAbout: publicProfile.skills?.length ? publicProfile.skills : undefined,
    },
  } : null
  const profileSchemaJson = profileSchema
    ? JSON.stringify(profileSchema).replace(/</g, '\\u003c')
    : null

  return (
    <>
      {profileSchemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: profileSchemaJson }} />}
      <ProfileClient id={id} searchParams={resolvedSearchParams} initialProfile={publicProfile} profileContentNotReady={profileContentNotReady} />
    </>
  )
}
