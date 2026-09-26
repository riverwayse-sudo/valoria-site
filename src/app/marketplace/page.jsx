import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'Marketplace — Valoria Institute',description:'Discover assessed professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('all'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="all"/>}
