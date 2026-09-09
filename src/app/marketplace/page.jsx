import MarketplaceExperience from '@/components/MarketplaceExperience'

export const metadata = {
  title: 'Marketplace — Valoria Institute',
  description: 'Discover assessed African professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.',
}

export default function MarketplacePage() {
  return <MarketplaceExperience forcedTrack="all" />
}