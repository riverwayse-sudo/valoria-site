const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(__dirname, relative), 'utf8')
const data = read('../lib/marketplace-data.js')
const directory = read('../components/MarketplaceDirectory.jsx')

describe('marketplace roster contract', () => {
  test('the public roster query selects only real projection columns', () => {
    for (const field of ['professional_id', 'full_name', 'atb_id', 'capabilities', 'valu_index', 'assessment_access', 'assessment_summary', 'assessment_summary']) {
      expect(data).toContain(field)
    }
    for (const staleField of ['profile_summary', 'created_at', 'profile_complete', 'listing_status', 'visibility']) {
      expect(data).not.toContain(staleField)
    }
    expect(data).toContain("order('valu_index'")
  })

  test('cards use the VALU report summary and retain general-directory accounts', () => {
    expect(directory).toContain('p.assessment_summary')
    expect(directory).toContain('GENERAL DIRECTORY')
    expect(directory).toContain('p.full_name')
    expect(directory).toContain('p.atb_id')
  })

  test('the official score sits with the member identity', () => {
    expect(directory).toContain('styles.identityScore')
    expect(directory).toContain('POINTS')
  })
})
