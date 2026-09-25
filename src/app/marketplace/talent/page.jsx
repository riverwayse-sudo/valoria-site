import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Talent Marketplace — Valoria Institute',
  description: 'Discover assessed African talent through the Valoria Marketplace.',
  alternates: { canonical: '/marketplace/talent' },
}

export default async function TalentMarketplacePage() {
  // Track pages receive their canonical track rows from the server.
  // Counts remain sourced from the authoritative general roster so the
  // navigation and result totals cannot drift from the marketplace root.
  // Production deployment trigger: canonical candidate roster.
  const [initialRows, initialCounts] = await Promise.all([getMarketplaceRows('candidate'), getMarketplaceCounts()])
  return <MarketplaceExperienceV3 forcedTrack="candidate" initialRows={initialRows} initialCounts={initialCounts} />
}
