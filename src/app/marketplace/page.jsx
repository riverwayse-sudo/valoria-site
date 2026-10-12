import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'Marketplace',description:'Discover assessed professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.',alternates:{canonical:'https://valoriainstitute.com/marketplace'}}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('all'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="all"/>}
