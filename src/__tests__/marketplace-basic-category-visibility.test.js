const fs = require('fs')
const path = require('path')
const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Marketplace category visibility', () => {
  test('selected capabilities determine category membership for Basic and Full listings', () => {
    const source = read('src/lib/marketplace-data.js')
    const component = read('src/components/MarketplaceDirectory.jsx')
    expect(source).toContain("row.assessment_access === 'basic'")
    expect(source).toContain('assessmentAccess: row.assessment_access')
    expect(source).toContain('valu_index: null, cluster_scores: null, assessment_summary: null, designation: null')
    expect(source).toContain('row.selectedCapabilities.includes(normalizeTrack(track))')
    expect(source).toContain('row.capabilities.includes(normalizeTrack(track))')
    expect(source).toContain('[...(row.capabilities || []), ...(row.selectedCapabilities || [])]')
    expect(component).toContain('p.selectedCapabilities || p.selected_capabilities || []')
    expect(component).not.toContain("p.assessment_access === 'basic' ?")
  })
})
