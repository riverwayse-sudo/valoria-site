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
    expect(source).toContain('!fullAssessmentReady')
  })

  test('blocks placeholder and stylised profile copy from public display', () => {
    expect(source).toContain("'growth dev'")
    expect(source).toContain("'model'")
    expect(source).toContain("'valoria professional'")
    expect(source).toContain('help people find meaning in their life and career')
    expect(source).toContain('1D400')
    expect(source).toContain('1D7FF')
  })
})
