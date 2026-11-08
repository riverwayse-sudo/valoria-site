import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'
export const dynamic = 'force-dynamic'
export const metadata={title:'ATB Spotlight — Speakers | Valoria Institute',description:'Discover public speakers by declared expertise and request an introduction through Valoria Institute.'}
export default async function Page() {
  let rows = []
  let counts = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  let dataUnavailable = false
  try {
    const data = await getMarketplaceDirectoryData('speaker')
    rows = data.rows
    counts = data.counts
  } catch (error) {
    console.error('Marketplace page data unavailable:', error)
    dataUnavailable = true
  }
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="speaker" dataUnavailable={dataUnavailable} />
}
