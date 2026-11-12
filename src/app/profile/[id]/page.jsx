import { notFound } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { getConsentVerifiedPublicProfile } from '@/lib/public-profile'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage({ params, searchParams }) {
  const { id } = await params
  const resolvedSearchParams = await searchParams

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  const normalizedId = String(id || '').normalize('NFKC')
  const isAtbId = /^ATB-[A-Z0-9-]{4,40}$/i.test(normalizedId)
  if (!isUuid && !isAtbId) notFound()

  const readOnlyPreview = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' && process.env.VALU_STAGING_API_ENABLED !== '1'
  if (readOnlyPreview) return <ProfileClient id={id} searchParams={resolvedSearchParams} previewUnavailable />

  let initialProfile = null
  try {
    initialProfile = await getConsentVerifiedPublicProfile(id, isUuid ? 'id' : 'atb_id')
  } catch (error) {
    console.error('Public profile route verification failed:', error)
    notFound()
  }

  const profileUrl = initialProfile?.id ? 'https://valoriainstitute.com/profile/' + initialProfile.id : null
  const profileSchema = initialProfile ? {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: profileUrl,
    mainEntity: {
      '@type': 'Person',
      identifier: initialProfile.atb_id,
      url: profileUrl,
      jobTitle: initialProfile.headline || initialProfile.current_job_title || undefined,
      description: initialProfile.assessment_summary || initialProfile.headline || undefined,
      image: initialProfile.photo_url || undefined,
      knowsAbout: initialProfile.skills?.length ? initialProfile.skills : undefined,
    },
  } : null
  const profileSchemaJson = profileSchema
    ? JSON.stringify(profileSchema).replace(/</g, '\\u003c')
    : null

  return (
    <>
      {profileSchemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: profileSchemaJson }} />}
      <ProfileClient id={id} searchParams={resolvedSearchParams} initialProfile={initialProfile} />
    </>
  )
}
