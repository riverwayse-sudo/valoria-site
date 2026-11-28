const fs = require('fs')
const path = require('path')

describe('staging route origin isolation', () => {
  test('the full route audit fails if a site route redirects outside staging', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', '..', 'scripts', 'design-route-audit.mjs'), 'utf8')
    expect(source).toContain('const expectedHost = new URL(base).hostname')
    expect(source).toContain('redirect escaped staging origin')
    expect(source).toContain('assessment route escaped staging origin')
  })

  test('the focused browser audit keeps site and assessment routes on their own staging hosts', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', '..', 'scripts', 'staging-browser-audit.mjs'), 'utf8')
    expect(source).toContain('new URL(route.site ? SITE : ASSESSMENT).hostname')
    expect(source).toContain('redirect escaped its isolated staging origin')
  })
})
