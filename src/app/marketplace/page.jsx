import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'Marketplace — Valoria Institute',description:'Discover professionals assessed through the VALU Index and represented through Valoria capability badges.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('all'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="all"/>}
