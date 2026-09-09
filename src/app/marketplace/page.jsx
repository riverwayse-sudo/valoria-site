import MarketplaceExperienceV2 from '@/components/MarketplaceExperienceV2'

export const metadata = {
  title: 'Marketplace — Valoria Institute',
  description: 'Discover assessed African professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.',
}

export default function MarketplacePage() {
  return <MarketplaceExperienceV2 forcedTrack="all" />
}