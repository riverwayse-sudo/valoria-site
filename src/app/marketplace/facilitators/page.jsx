import MarketplaceExperience from '@/components/MarketplaceExperience'

export const metadata = {
  title: 'Facilitator Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria facilitators aligned to PRIME-based capability development.',
}

export default function FacilitatorMarketplacePage() {
  return <MarketplaceExperience forcedTrack="facilitator" />
}