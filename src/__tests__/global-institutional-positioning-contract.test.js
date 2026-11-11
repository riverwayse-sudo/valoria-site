const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Global institutional redesign content contract', () => {
  const homepage = read('src/app/page.jsx')
  const hero = read('src/components/HeroSlider.jsx')
  const layout = read('src/app/layout.jsx')
  const about = read('src/app/about-us/page.jsx')

  test('public positioning addresses an international audience without overstating service footprint', () => {
    expect(homepage).toContain('BUILT FOR A GLOBAL PROFESSIONAL LANDSCAPE')
    expect(homepage).not.toMatch(/Africa-first|Nigeria as its initial operating jurisdiction/i)
    expect(about).not.toMatch(/Africa-first|Africa's premier professional capability marketplace/i)
    expect(layout).toContain("locale:'en_US'")
    expect(layout).toContain("inLanguage: 'en-US'")
    expect(layout).toContain("name:'Nigeria'")
  })

  test('the homepage states the institutional proposition and employer trust boundary', () => {
    expect(hero).toContain('AN INSTITUTION FOR PROFESSIONAL CAPABILITY')
    expect(hero).toContain('We assess professional capability through PRIME and the VALU Index')
    expect(homepage).toContain('VALU results inform discovery; they do not replace independent credential checks')
  })

  test('the VALU assessment is not represented as an awarded certification', () => {
    expect(about).toContain('The VALU Index is not itself a certification')
    expect(about).toContain('no credential should be represented as awarded')
    expect(about).toContain('distinct from a professional certification or credential')
  })

  test('American English is used in the redesigned public-facing copy', () => {
    expect(homepage).toContain('event organizers')
    expect(homepage).toContain('organizations')
    expect(about).toContain('event organizers')
    expect(about).toContain('organizations')
  })
})
