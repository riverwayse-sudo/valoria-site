const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('public route discovery', () => {
  test('sitemap uses canonical public page routes', () => {
    const sitemap = read('src/app/sitemap.js')
    expect(sitemap).toContain("{ path: '/about-us'")
    expect(sitemap).toContain("{ path: '/events'")
    expect(sitemap).toContain("{ path: '/insights'")
    expect(sitemap).toContain("{ path: '/valu'")
    expect(sitemap).toContain("{ path: '/valu/start'")
    expect(sitemap).not.toContain("{ path: '/about'")
    expect(sitemap).not.toContain("{ path: '/develop'")
  })

  test('robots excludes authenticated and prototype routes without blocking public profiles', () => {
    const robots = read('src/app/robots.js')
    for (const route of ['/dashboard', '/admin', '/profile/setup', '/profile/settings', '/profile/applications', '/employer/dashboard', '/test/assessment']) {
      expect(robots).toContain("'" + route + "'")
    }
    expect(robots).not.toContain("'/profile',")
  })
})
