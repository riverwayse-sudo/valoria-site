import MarketplaceDirectory from '@/components/MarketplaceDirectory'
import { getMarketplaceDirectoryData } from '@/lib/marketplace-data'
export const dynamic = 'force-dynamic'
export const metadata={title:'ATB Spotlight — Facilitators | Valoria Institute',description:'ATB Spotlight helps training buyers discover facilitators by declared expertise. For PRIME-based team development, explore Valoria Develop.'}
export default async function Page() {
  let rows = []
  let counts = { all: 0, candidate: 0, speaker: 0, facilitator: 0 }
  let dataUnavailable = false
  try {
    const data = await getMarketplaceDirectoryData('facilitator')
    rows = data.rows
    counts = data.counts
  } catch (error) {
    console.error('Marketplace page data unavailable:', error)
    dataUnavailable = true
  }
  return <MarketplaceDirectory rows={rows} counts={counts} activeTrack="facilitator" dataUnavailable={dataUnavailable} />
}
