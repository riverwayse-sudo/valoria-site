import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TalentMarketplacePage() {
  const [rows, counts] = await Promise.all([getMarketplaceRows('candidate'), getMarketplaceCounts()])
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="talent" />
}
