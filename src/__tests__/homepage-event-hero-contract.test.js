const fs = require('fs')
const path = require('path')
const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('homepage featured event panel', () => {
  test('the homepage displays only the approved event date and start time', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('10:00 AM WAT')
    expect(hero).not.toContain('VIRTUAL')
    expect(hero).not.toContain('90 MINUTES')
  })

  test('the featured event card compacts on short desktop viewports', () => {
    const css = read('src/app/home.css')
    expect(css).toContain('@media (max-height: 700px) and (min-width: 901px)')
    expect(css).toContain('.hero-slider .hero-event-panel h2')
    expect(css).toContain('font-size: clamp(22px, 2vw, 26px)')
    expect(css).toContain('.hero-slider .hero-event-panel .session-timer')
  })

  test('the featured event card keeps a usable desktop width and responsive countdown tiles', () => {
    const css = read('src/app/home.css')
    expect(css).toContain('grid-template-columns: minmax(0, 1fr) minmax(420px, .88fr)')
    expect(css).toContain('max-width: 460px')
    expect(css).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))')
    expect(css).toContain('@media (max-width: 900px)')
    expect(css).toContain('max-width: 560px')
  })
})
