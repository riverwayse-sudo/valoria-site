const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(__dirname, relative), 'utf8')

describe('Cloudflare release VALU presentation contract', () => {
  test('homepage reflects the account-first 9 + 49 question journey', () => {
    const homepage = read('../app/page.jsx')
    expect(homepage).toContain('<b>9</b> QUESTIONS')
    expect(homepage).toContain('Create your account, then complete the first 9 questions')
    expect(homepage).toContain('remaining 49 questions')
    expect(homepage).not.toContain('<b>15</b> QUESTIONS')
    expect(homepage).not.toContain('no account needed')
  })

  test('illustrative desktop and mobile VALU cards use points and the current merit designation', () => {
    const hero = read('../components/HeroSlider.jsx')
    expect(hero).toContain('<span className="vc-denom">POINTS</span>')
    expect(hero).toContain('POINTS</small>')
    expect(hero.match(/FORCE TO ALIGN WITH/g)).toHaveLength(2)
    expect(hero).not.toContain('<span className="vc-denom">/ 100</span>')
    expect(hero).not.toContain('DISTINGUISHED')
  })

  test('live professional cards use points rather than /100', () => {
    const live = read('../components/LiveProfilesScroll.jsx')
    expect(live).toContain('<span className="vi-scroll-score-max">points</span>')
    expect(live).not.toContain('valu_index}%')
    expect(live).not.toContain('/100</span>')
  })

  test('value activation signals use points rather than /100', () => {
    const activation = read('../components/ValueActivationCard.jsx')
    expect(activation).toContain('VALU {x.score} points')
    expect(activation).toContain('Current signal {x.score} points')
    expect(activation).not.toContain('{x.score}/100')
  })
})
