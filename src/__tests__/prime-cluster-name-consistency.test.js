const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('canonical PRIME cluster names', () => {
  test('all public profile and marketplace surfaces consume the shared cluster mapping', () => {
    const brand = read('src/lib/brand.js')
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const profile = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(brand).toContain('export const PRIME_CLUSTER_NAMES = Object.freeze(')
    expect(brand).toContain('PRIME_CLUSTERS.map(cluster => [cluster.letter, cluster.name])')
    expect(directory).toContain('CLUSTER_NAMES = PRIME_CLUSTER_NAMES')
    expect(profile).toContain('CLUSTER_NAMES = PRIME_CLUSTER_NAMES')
    expect(profile).toContain('PRIME_CLUSTERS.map(cluster =>')
  })
})
