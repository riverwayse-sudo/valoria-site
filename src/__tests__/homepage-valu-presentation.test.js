const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('homepage VALU presentation contract', () => {
  test('illustrative VALU score is labelled in points on desktop and mobile', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('<span className="vc-denom">POINTS</span>')
    expect(hero).toContain('POINTS</small>')
    expect(hero).not.toContain('<span className="vc-denom">/ 100</span>')
    expect(hero).not.toContain('DISTINGUISHED')
  })

  test('homepage describes the 9-question taster as part of the 58-question assessment', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('<b>9</b> QUESTIONS')
    expect(home).toContain('remaining 49 questions')
    expect(home).not.toContain('<b>15</b> QUESTIONS')
    expect(home).not.toContain('55 questions')
  })

  test('homepage does not promise anonymous assessment access before account creation', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('Create your account, then complete the first 9 questions')
    expect(home).not.toContain('no account needed')
  })

  test('homepage live professional cards use points rather than a percentage suffix', () => {
    const live = read('src/components/LiveProfilesScroll.jsx')
    expect(live).toContain('<span className="vi-scroll-score-max">points</span>')
    expect(live).not.toContain('valu_index}%')
    expect(live).not.toContain('valu_index}%</')
  })
})
