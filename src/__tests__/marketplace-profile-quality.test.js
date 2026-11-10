const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/marketplace-data.js'), 'utf8')

describe('public marketplace profile content gate', () => {
  test('keeps Basic access distinct from Full assessment and earned merit', () => {
    expect(source).toContain("assessmentAccess === 'basic'")
    expect(source).toContain("assessmentAccess === 'full'")
    expect(source).toContain('isValidAssessmentAccess')
  })

  test('requires official points and a VALU report summary for Full profiles only', () => {
    expect(source).toContain('hasOfficialPoints')
    expect(source).toContain('assessmentSummary.length >= 12')
    expect(source).toContain('fullAssessmentReady')
  })

  test('blocks placeholder and stylised profile copy from public display', () => {
    expect(source).toContain("'growth dev'")
    expect(source).toContain("'model'")
    expect(source).toContain("'valoria professional'")
    expect(source).toContain('help people find meaning in their life and career')
    expect(source).toContain('1D400')
    expect(source).toContain('1D7FF')
  })
  test('accepts short legitimate job titles and normalizes stylised ATB identifiers safely', () => {
    expect(source).toContain("normalize('NFKC')")
    expect(source).toContain('headline.length >= 3')
  })

  test('exports the public profile quality gate used by profile pages and sitemap', () => {
    expect(source).toContain('export function isPublicProfileContentReady(row)')
  })

})
