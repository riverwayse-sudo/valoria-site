import MarketplaceExperienceV2 from '@/components/MarketplaceExperienceV2'

export const metadata = {
  title: 'Marketplace — Valoria Institute',
  description: 'Discover assessed African professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.',
  alternates: {
    canonical: '/marketplace',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const VALID_TRACKS = new Set(['all', 'candidate', 'speaker', 'facilitator'])

export default async function MarketplacePage({ searchParams }) {
  const params = await searchParams
  const requestedTrack = typeof params?.track === 'string' ? params.track : 'all'
  const forcedTrack = VALID_TRACKS.has(requestedTrack) ? requestedTrack : 'all'

  return <MarketplaceExperienceV2 forcedTrack={forcedTrack} />
}