import MarketplaceExperienceV2 from '@/components/MarketplaceExperienceV2'

export const metadata = {
  title: 'Talent Marketplace — Valoria Institute',
  description: 'Discover assessed African talent through the Valoria Marketplace.',
}

export default function TalentMarketplacePage() {
  return <MarketplaceExperienceV2 forcedTrack="candidate" />
}