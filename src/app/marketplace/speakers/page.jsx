import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows } from '@/lib/marketplace-data'

export const metadata = {
  title: 'Speaker Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria speakers across expertise, perspective and professional capability.',
  alternates: { canonical: '/marketplace/speakers' },
}

export default async function SpeakerMarketplacePage() {
  const initialRows = await getMarketplaceRows('speaker')
  return <MarketplaceExperienceV3 forcedTrack="speaker" initialRows={initialRows} />
}
