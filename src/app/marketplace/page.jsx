import MarketplaceView from '@/components/MarketplaceView'

export const metadata = {
  title: 'Marketplace — Valoria Institute',
  description: 'Discover assessed African professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.',
}

export default function MarketplacePage() {
  return <MarketplaceView forcedTrack="all" />
}
