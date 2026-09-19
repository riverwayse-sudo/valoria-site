import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'

export const metadata = {
  title: 'Speaker Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria speakers across expertise, perspective and professional capability.',
  alternates: { canonical: '/marketplace/speakers' },
}

export default async function SpeakerMarketplacePage() {
  const [initialRows, initialCounts] = await Promise.all([getMarketplaceRows('speaker'), getMarketplaceCounts()])
  return <MarketplaceExperienceV3 forcedTrack="speaker" initialRows={initialRows} initialCounts={initialCounts} />
}
