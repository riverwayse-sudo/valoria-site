import MarketplaceExperienceV2 from '@/components/MarketplaceExperienceV2'

export const metadata = {
  title: 'Facilitator Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria facilitators aligned to PRIME-based capability development.',
}

export default function FacilitatorMarketplacePage() {
  return <MarketplaceExperienceV2 forcedTrack="facilitator" />
}