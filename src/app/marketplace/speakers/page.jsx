import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'Speaker Marketplace — Valoria Institute',description:'Discover assessed Valoria speakers.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('speaker'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="speaker"/>}
