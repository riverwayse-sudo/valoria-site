import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'Talent Marketplace — Valoria Institute',description:'Discover assessed talent through the Valoria Marketplace.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('candidate'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="candidate"/>}
