import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Talent Marketplace — Valoria Institute', description: 'Discover assessed talent through the Valoria Marketplace.' }
export default async function Page() {
  const { rows, counts } = await getMarketplaceDirectoryData('candidate')
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="candidate" />
}
