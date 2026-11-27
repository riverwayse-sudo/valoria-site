const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('homepage call-to-action hierarchy', () => {
  test('the VALU conversion section has one primary Taster action', () => {
    const home = read('src/app/page.jsx')
    expect(home.match(/START THE VALU INDEX TASTER/g)).toHaveLength(1)
    expect(home).not.toContain('vcc-bottom-cta')
    expect(home).toContain('SEE HOW THE VALU INDEX WORKS')
  })

  test('the registry section stays focused on marketplace discovery', () => {
    const registry = read('src/components/LiveProfilesScroll.jsx')
    expect(registry).toContain('VIEW THE MARKETPLACE')
    expect(registry).not.toContain('live-profiles-professional-cta')
    expect(registry).not.toContain('AssessmentStartLink')
    expect(registry).toContain('getMarketplaceDirectoryData')
  })
})
