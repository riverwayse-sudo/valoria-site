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

  let initialProfile = null
  try {
    initialProfile = await getConsentVerifiedPublicProfile(id, isUuid ? 'id' : 'atb_id')
  } catch (error) {
    console.error('Public profile route verification failed:', error)
    notFound()
  }

  return <ProfileClient id={id} searchParams={resolvedSearchParams} initialProfile={initialProfile} />
}
