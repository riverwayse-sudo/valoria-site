import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { redirect } from 'next/navigation'

// Keep canonical track redirects server-side so the root marketplace route remains deterministic.
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Marketplace — Valoria Institute',
  description: 'Discover assessed African professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.',
  alternates: { canonical: '/marketplace' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
}

const VALID_TRACKS = new Set(['all','candidate','speaker','facilitator'])
const CANONICAL = { candidate:'/marketplace/talent', speaker:'/marketplace/speakers', facilitator:'/marketplace/facilitators' }

export default async function MarketplacePage({ searchParams }) {
  const params = await searchParams
  const requestedTrack = typeof params?.track === 'string' ? params.track : 'all'
  const forcedTrack = VALID_TRACKS.has(requestedTrack) ? requestedTrack : 'all'
  if (forcedTrack !== 'all') redirect(CANONICAL[forcedTrack])
  const [initialRows, initialCounts] = await Promise.all([getMarketplaceRows('all'), getMarketplaceCounts()])
  return <MarketplaceExperienceV3 forcedTrack="all" initialRows={initialRows} initialCounts={initialCounts} />
}
