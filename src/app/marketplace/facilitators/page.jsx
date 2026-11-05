import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'ATB Spotlight — Facilitators | Valoria Institute',description:'ATB Spotlight helps training buyers discover facilitators by declared expertise. For PRIME-based team development, explore Valoria Develop.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('facilitator'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="facilitator"/>}
