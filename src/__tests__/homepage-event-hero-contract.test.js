const fs = require('fs')
const path = require('path')
const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('homepage expired event promotion removal', () => {
  test('the homepage no longer mounts the event invitation popup', () => {
    const page = read('src/app/page.jsx')
    expect(page).not.toContain("import HomepageEventPopup from '@/components/HomepageEventPopup'")
    expect(page).not.toContain('<HomepageEventPopup')
  })

  test('the hero contains only the institutional introduction and no event invitation', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('Capability should decide')
    expect(hero).toContain('START THE VALU INDEX TASTER')
    expect(hero).not.toContain('hero-event-slide')
    expect(hero).not.toContain('JOIN THE LIVE EVENT')
    expect(hero).not.toContain('EventRegistrationModal')
    expect(hero).not.toContain('upcomingSession')
    expect(hero).not.toContain('hero-slider-controls')
  })

  test('the homepage events section remains available for event archive and replay content', () => {
    const page = read('src/app/page.jsx')
    expect(page).toContain('<HomepageEvents />')
  })
})
