import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows } from '@/lib/marketplace-data'

export const metadata = {
  title: 'Facilitator Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria facilitators aligned to PRIME-based capability development.',
  alternates: { canonical: '/marketplace/facilitators' },
}

export default async function FacilitatorMarketplacePage() {
  const initialRows = await getMarketplaceRows('facilitator')
  return <MarketplaceExperienceV3 forcedTrack="facilitator" initialRows={initialRows} />
}
