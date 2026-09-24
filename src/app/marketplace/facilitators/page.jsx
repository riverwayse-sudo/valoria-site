import MarketplaceExperienceV3 from '@/components/MarketplaceExperienceV3'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Facilitator Marketplace — Valoria Institute',
  description: 'Discover assessed Valoria facilitators aligned to PRIME-based capability development.',
  alternates: { canonical: '/marketplace/facilitators' },
  robots: { index: true, follow: true },
}

export default async function FacilitatorMarketplacePage() {
  const [initialRows, initialCounts] = await Promise.all([getMarketplaceRows('facilitator'), getMarketplaceCounts()])
  const itemList = initialRows.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${'https://valoriainstitute.com'}/profile/${p.id}`, name: p.full_name }))
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'ItemList','name':'Valoria Facilitator Marketplace','itemListElement':itemList})}} /><MarketplaceExperienceV3 forcedTrack="facilitator" initialRows={initialRows} initialCounts={initialCounts} /></>
}
