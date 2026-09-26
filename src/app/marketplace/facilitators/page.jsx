import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data
export const dynamic='force-dynamic'
export const metadata={title:'Facilitator Marketplace — Valoria Institute',description:'Discover assessed Valoria facilitators.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('facilitator'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="facilitator"/>}
