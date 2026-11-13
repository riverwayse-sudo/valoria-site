const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('three-lane capability display contract', () => {
  test('marketplace cards show Talent, Speaker and Facilitator with selected state', () => {
    const cards = read('src/components/MarketplaceDirectory.jsx')
    expect(cards).toContain("['candidate','Talent']")
    expect(cards).toContain("['speaker','Speaker']")
    expect(cards).toContain("['facilitator','Facilitator']")
    expect(cards).toContain('capabilityBadges.map')
    expect(cards).toContain('styles.capabilityUnselected')
    expect(cards).not.toContain('capabilityBadges.filter')
  })

  test('homepage profile rail renders all three lanes and differentiates selected from unselected', () => {
    const rail = read('src/components/LiveProfilesScroll.jsx')
    const styles = read('src/app/home.css')
    expect(rail).toContain('Object.entries(TRACK_META)')
    expect(rail).toContain("className={item.active ? 'is-active' : 'is-inactive'}")
    expect(styles).toContain('.vi-scroll-track-label span.is-active')
    expect(styles).toContain('.vi-scroll-track-label span.is-inactive')
  })
})
