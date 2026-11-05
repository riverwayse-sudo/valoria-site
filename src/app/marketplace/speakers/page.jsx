import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic='force-dynamic'
export const metadata={title:'ATB Spotlight — Speakers | Valoria Institute',description:'ATB Spotlight helps event organisers discover speakers by declared expertise. Public listings appear when profiles meet Valoria’s listing and visibility requirements.'}
export default async function Page(){const [rows,counts]=await Promise.all([getMarketplaceRows('speaker'),getMarketplaceCounts()]);return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="speaker"/>}
