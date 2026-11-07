const fs = require('fs')
const path = require('path')
const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('public sitemap privacy and route contract', () => {
  const sitemap = read('src/app/sitemap.js')

  test('dynamic profile URLs come only from the public Marketplace projection', () => {
    expect(sitemap).toContain(".from('marketplace_public_roster')")
    expect(sitemap).toContain("select('professional_id,projection_refreshed_at')")
    expect(sitemap).not.toContain(".from('professional_profiles')")
  })

  test('sitemap includes the current public pathways and excludes retired/auth routes', () => {
    for (const route of ['/valu', '/opportunities', '/atb-connect', '/atb-spotlight', '/events', '/insights', '/develop']) {
      expect(sitemap).toContain(`path: '${route}'`)
    }
    for (const route of ["path: '/facilitators'", "path: '/programmes'", "path: '/signup'", "path: '/login'"]) {
      expect(sitemap).not.toContain(route)
    }
  })

  test('staging sitemap uses the staging host', () => {
    expect(sitemap).toContain("process.env.VALU_PREVIEW === '1'")
    expect(sitemap).toContain('https://staging.valoriainstitute.com')
  })
})


describe('staging crawler isolation', () => {
  test('preview robots block indexing and do not advertise a sitemap', () => {
    const robots = read('src/app/robots.js')
    expect(robots).toContain("process.env.VALU_PREVIEW === '1'")
    expect(robots).toContain("disallow: '/'")
    expect(robots).toContain("https://valoriainstitute.com/sitemap.xml")
  })
})
