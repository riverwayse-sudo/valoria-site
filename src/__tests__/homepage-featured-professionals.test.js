const fs = require('fs')

describe('homepage featured professional cards', () => {
  const source = fs.readFileSync('src/components/LiveProfilesScroll.jsx', 'utf8')
  const css = fs.readFileSync('src/app/home.css', 'utf8')

  test('homepage previews only four real public profiles without cloning a marquee', () => {
    expect(source).toContain('profiles.slice(0, 4)')
    expect(source).not.toContain('qualityProfiles')
    expect(source).not.toContain('isClone')
    expect(source).toContain('getMarketplaceDirectoryData')
  })

  test('featured cards use concise identity, capability and VALU Index information', () => {
    expect(source).toContain('vi-featured-main')
    expect(source).toContain('vi-featured-capabilities')
    expect(source).toContain('vi-featured-score')
    expect(source).not.toContain('vi-scroll-summary')
    expect(source).not.toContain('vi-scroll-development')
  })

  test('featured cards use a responsive four-column grid that collapses cleanly', () => {
    expect(css).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))')
    expect(css).toContain('@media (max-width: 1100px)')
    expect(css).toContain('@media (max-width: 640px)')
    expect(css).toContain('.vi-scroll-card.vi-featured-card')
  })
})
