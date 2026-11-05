import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'ATB Connect — Valoria Institute',description:'ATB Connect helps employers request capability-led sourcing. Public talent listings appear when profiles meet Valoria’s listing and visibility requirements.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('candidate'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="candidate"/>}
