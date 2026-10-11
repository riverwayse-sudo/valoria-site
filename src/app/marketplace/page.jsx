import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Marketplace — Valoria Institute', description: 'Discover assessed professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.' }
export default async function Page() {
  const { rows, counts } = await getMarketplaceDirectoryData('all')
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="all" />
}
