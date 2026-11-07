import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'Facilitator Marketplace — Valoria Institute',description:'Discover facilitators through capability-led professional profiles and relevant experience.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('facilitator'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="facilitator"/>}
