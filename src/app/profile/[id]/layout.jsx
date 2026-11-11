import { getConsentVerifiedPublicProfile } from '@/lib/public-profile'

export async function generateMetadata({ params }) {
  const { id } = await params
  let profile = null
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    const normalizedId = String(id || '').normalize('NFKC')
    const isAtbId = /^ATB-[A-Z0-9-]{4,40}$/i.test(normalizedId)
    if (isUuid || isAtbId) {
      profile = await getConsentVerifiedPublicProfile(id, isUuid ? 'id' : 'atb_id')
    }
  } catch (error) {
    console.error('Public profile metadata verification failed:', error)
  }

  if (!profile) {
    return {
      title: 'Professional Profile | Valoria Institute',
      alternates: { canonical: `/profile/${id}` },
      robots: { index: false, follow: false },
    }
  }

  const name = String(profile.atb_id || 'VALORIA PROFESSIONAL').normalize('NFKC').replace(/\s+/g, ' ').trim()
  const type = (profile.active_tracks || []).includes('speaker') ? 'Speaker' : 'Professional'
  return {
    title: `${name} — ${type} Profile`,
    description: profile.bio?.slice(0, 160) || `${name} — ${profile.headline || type} on Valoria Institute.`,
    alternates: { canonical: `/profile/${id}` },
    openGraph: {
      title: `${name} | Valoria Institute`,
      description: profile.bio?.slice(0, 160) || `${name} on Valoria Institute.`,
      url: `/profile/${id}`,
      images: profile.photo_url ? [{ url: profile.photo_url }] : [{ url: '/logo.png?v=20260921' }],
    },
    robots: profile.indexable ? { index: true, follow: true } : { index: false, follow: true },
  }
}

export default function ProfileLayout({ children }) {
  return children
}
