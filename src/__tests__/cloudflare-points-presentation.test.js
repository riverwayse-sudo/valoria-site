const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(__dirname, relative), 'utf8')

describe('Cloudflare release VALU presentation contract', () => {
  test('homepage presents the approved nine-question opening', () => {
    const homepage = read('../app/page.jsx')
    expect(homepage).toContain('<b>9</b> QUESTIONS')
    expect(homepage).not.toContain('<b>15</b> QUESTIONS')
  })

  test('homepage VALU Index card uses points rather than a percentage denominator', () => {
    const hero = read('../components/HeroSlider.jsx')
    expect(hero).toContain('<span className="vc-denom">POINTS</span>')
    expect(hero).not.toContain('<span className="vc-denom">/ 100</span>')
  })

  test('value activation signals use points rather than /100', () => {
    const activation = read('../components/ValueActivationCard.jsx')
    expect(activation).toContain('VALU {x.score} points')
    expect(activation).toContain('Current signal {x.score} points')
    expect(activation).not.toContain('{x.score}/100')
  })
})
