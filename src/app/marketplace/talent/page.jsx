import MarketplaceExperience from '@/components/MarketplaceExperience'

export const metadata = {
  title: 'Talent Marketplace — Valoria Institute',
  description: 'Discover assessed African talent through the Valoria Marketplace.',
}

export default function TalentMarketplacePage() {
  return <MarketplaceExperience forcedTrack="candidate" />
}