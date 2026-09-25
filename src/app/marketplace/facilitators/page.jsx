import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Facilitator Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria facilitators aligned to PRIME-based capability development.',
  alternates: { canonical: '/marketplace/facilitators' },
}

export default async function FacilitatorMarketplacePage() {
  const [initialRows, initialCounts] = await Promise.all([getMarketplaceRows('all'), getMarketplaceCounts()])
  return <MarketplaceExperienceV3 forcedTrack="facilitator" initialRows={initialRows} initialCounts={initialCounts} />
}
