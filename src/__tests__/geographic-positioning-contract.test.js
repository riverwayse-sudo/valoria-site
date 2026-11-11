const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('Africa-first public positioning contract', () => {
  test('organization structured data does not declare the United States as a served market', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toContain("areaServed:[{'@type':'Country',name:'Nigeria'}]")
    expect(layout).not.toContain("{'@type':'Country',name:'United States'}")
    expect(layout).toContain("Africa is Valoria's first market, with Nigeria as its jurisdiction.")
  })

  test('homepage hero states the approved geographic scope without implying unlaunched markets', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('AFRICA-FIRST · NIGERIA JURISDICTION')
    expect(hero).toContain("Africa is its first market, with Nigeria as its jurisdiction.")
    expect(hero).not.toContain('across industries and markets')
  })

  test('taster audience copy does not imply service across unspecified geographic markets', () => {
    const page = read('src/app/valu/start/page.jsx')
    expect(page).toContain('professionals across industries—including')
    expect(page).not.toContain('professionals across industries and markets')
  })
})
