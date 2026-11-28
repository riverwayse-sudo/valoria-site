const fs = require('fs')
const path = require('path')

describe('waitlist registration redirect', () => {
  test('uses the current origin so staging never sends participants to production', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'app', 'waitlist', 'page.jsx'),
      'utf8'
    )
    expect(source).toContain("redirect('/valu/register/?journey=valu_taster')")
    expect(source).not.toContain('https://valoriainstitute.com')
    expect(source).not.toContain('https://www.valoriainstitute.com')
  })
})
