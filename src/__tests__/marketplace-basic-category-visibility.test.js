const fs = require('fs')
const path = require('path')
const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Basic listing capability directories', () => {
  test('Basic listings appear in categories they have declared without becoming Full listings', () => {
    const source = read('src/lib/marketplace-data.js')
    expect(source).toContain("row.assessment_access === 'basic'")
    expect(source).toContain('assessmentAccess: row.assessment_access')
    expect(source).toContain('valu_index: null, cluster_scores: null, assessment_summary: null, designation: null')
    expect(source).toContain('row.selectedCapabilities.includes(normalizedTrack)')
    expect(source).toContain('...(row.selectedCapabilities || [])')
    expect(source).toContain("row.capabilities.includes(normalizedTrack)")
  })
})
