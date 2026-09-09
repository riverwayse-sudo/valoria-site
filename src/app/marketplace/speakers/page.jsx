import MarketplaceView from '@/components/MarketplaceView'

export const metadata = {
  title: 'Speaker Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria speakers across expertise, perspective and professional capability.',
}

export default function SpeakerMarketplacePage() {
  return <MarketplaceView forcedTrack="speaker" />
}
