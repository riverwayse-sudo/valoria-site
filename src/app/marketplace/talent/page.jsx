import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows } from '@/lib/marketplace-data'

export const metadata = {
  title: 'Talent Marketplace — Valoria Institute',
  description: 'Discover assessed African talent through the Valoria Marketplace.',
  alternates: { canonical: '/marketplace/talent' },
}

export default async function TalentMarketplacePage() {
  const initialRows = await getMarketplaceRows('candidate')
  return <MarketplaceExperienceV3 forcedTrack="candidate" initialRows={initialRows} />
}
