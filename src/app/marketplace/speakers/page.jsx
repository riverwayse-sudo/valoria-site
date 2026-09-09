import MarketplaceExperienceV2 from '@/components/MarketplaceExperienceV2'

export const metadata = {
  title: 'Speaker Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria speakers across expertise, perspective and professional capability.',
}

export default function SpeakerMarketplacePage() {
  return <MarketplaceExperienceV2 forcedTrack="speaker" />
}