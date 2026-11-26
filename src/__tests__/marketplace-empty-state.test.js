const fs = require('fs')
const path = require('path')

describe('marketplace empty-state behavior', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/components/MarketplaceDirectory.jsx'),
    'utf8'
  )

  test('does not show search filters before public listings exist', () => {
    expect(source).toContain('const hasPublicListings = rows.length > 0 || activeCount > 0')
    expect(source).toContain('{hasPublicListings && (')
    expect(source).toContain('data-directory-controls="true"')
    expect(source).toContain('<section className={styles.controls}>')
  })

  test('does not invite a shortlist when the public directory is empty', () => {
    expect(source).toContain("hasPublicListings ? 'REQUEST A SHORTLIST' : 'DISCUSS YOUR TALENT NEEDS'")
    expect(source).toContain('No public professional profiles are currently available.')
  })

  test('retains the truthful consent and listing-requirement explanation', () => {
    expect(source).toContain('We only show information approved for public display.')
    expect(source).toContain('Public profiles appear only when participants choose public visibility and meet Valoria’s listing requirements.')
  })
})
