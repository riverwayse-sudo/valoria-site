import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'

export const metadata = {
  title: 'Talent Marketplace — Valoria Institute',
  description: 'Discover assessed African talent through the Valoria Marketplace.',
  alternates: { canonical: '/marketplace/talent' },
}

export default async function TalentMarketplacePage() {
  const [initialRows, initialCounts] = await Promise.all([getMarketplaceRows('candidate'), getMarketplaceCounts()])
  return <MarketplaceExperienceV3 forcedTrack="candidate" initialRows={initialRows} initialCounts={initialCounts} />
}
