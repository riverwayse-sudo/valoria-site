import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'
export const dynamic = 'force-dynamic'
export const metadata={title:'ATB Connect — Valoria Institute',description:'ATB Connect helps employers request capability-led sourcing. Public talent listings appear when profiles meet Valoria’s listing and visibility requirements.'}
export default async function Page() {
  let rows = []
  let counts = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  let dataUnavailable = false
  try {
    const data = await getMarketplaceDirectoryData('candidate')
    rows = data.rows
    counts = data.counts
  } catch (error) {
    console.error('Marketplace page data unavailable:', error)
    dataUnavailable = true
  }
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="candidate" dataUnavailable={dataUnavailable} />
}
