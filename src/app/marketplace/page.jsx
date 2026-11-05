import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceRows, getMarketplaceCounts } from '@/lib/marketplace-data'
export const dynamic = 'force-dynamic'
export const metadata={title:'Marketplace',description:'Discover assessed professionals across Talent, Speakers and Facilitators through the Valoria Marketplace.',alternates:{canonical:'https://valoriainstitute.com/marketplace'}}
export default async function Page() {
  let rows = []
  let counts = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  let dataUnavailable = false
  try {
    ;[rows, counts] = await Promise.all([getMarketplaceRows('all'), getMarketplaceCounts()])
  } catch (error) {
    console.error('Marketplace page data unavailable:', error)
    dataUnavailable = true
  }
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="all" dataUnavailable={dataUnavailable} />
}
