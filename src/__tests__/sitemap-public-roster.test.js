const fs = require('fs')
const path = require('path')
const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('public sitemap privacy and route contract', () => {
  const sitemap = read('src/app/sitemap.js')

  test('dynamic profile URLs come only from the public Marketplace projection', () => {
    expect(sitemap).toContain("client.rpc('get_marketplace_public_roster_v1')")
    expect(sitemap).not.toContain(".from('marketplace_public_roster')")
    expect(sitemap).toContain('filter(isPublicProfileContentReady)')
    expect(sitemap).not.toContain(".from('professional_profiles')")
  })

  test('sitemap includes the current public pathways and excludes retired/auth routes', () => {
    for (const route of ['/valu', '/knowledge', '/knowledge/valu-index', '/knowledge/prime-framework', '/knowledge/professional-capability', '/jobs', '/opportunities', '/atb-connect', '/atb-spotlight', '/events', '/insights', '/develop']) {
      expect(sitemap).toContain(`path: '${route}'`)
    }
    for (const route of ["path: '/facilitators'", "path: '/programmes'", "path: '/signup'", "path: '/login'"]) {
      expect(sitemap).not.toContain(route)
    }
  })

  test('staging sitemap uses the staging host', () => {
    expect(sitemap).toContain('const IS_PREVIEW =')
    expect(sitemap).toContain('https://valoria-staging-site.riverwayse.workers.dev')
    expect(sitemap).toContain('process.env.VALU_PREVIEW_SITE_ORIGIN')
  })
})


describe('staging crawler isolation', () => {
  test('preview robots block indexing and do not advertise a sitemap', () => {
    const robots = read('src/app/robots.js')
    expect(robots).toContain('const IS_PREVIEW =')
    expect(robots).toContain("disallow: '/'")
    expect(robots).toContain('sitemap: `${SITE_URL}/sitemap.xml`')
  })
})
