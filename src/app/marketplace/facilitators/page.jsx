import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Facilitator Marketplace — Valoria Institute', description: 'Discover assessed Valoria facilitators.' }
export default async function Page() {
  const { rows, counts } = await getMarketplaceDirectoryData('facilitator')
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="facilitator" />
}
