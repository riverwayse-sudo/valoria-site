const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('Valoria SEO and discovery foundation', () => {
  test('Knowledge Hub pages exist and use canonical metadata', () => {
    const pages = [
      ['src/app/knowledge/page.jsx', '/knowledge'],
      ['src/app/knowledge/valu-index/page.jsx', '/knowledge/valu-index'],
      ['src/app/knowledge/prime-framework/page.jsx', '/knowledge/prime-framework'],
      ['src/app/knowledge/professional-capability/page.jsx', '/knowledge/professional-capability'],
    ]
    for (const [file, canonical] of pages) {
      const source = read(file)
      expect(source).toContain(`canonical: 'https://valoriainstitute.com${canonical}'`)
    }
  })

  test('profile indexing and metadata use only the consented public roster', () => {
    const layout = read('src/app/profile/[id]/layout.jsx')
    expect(layout).toContain('getConsentVerifiedPublicProfile')
    expect(layout).toContain('if (IS_STAGING) return')
    const directoryData = read('src/lib/marketplace-data.js')
    expect(directoryData).toContain("assessmentAccess === 'full'")
    expect(directoryData).toContain('assessmentSummary.length >= 12')
    expect(directoryData).toContain("assessment_access,valu_index,cluster_scores,assessment_summary")
    expect(directoryData).toContain("assessmentAccess === 'basic'")
    expect(directoryData).toContain('fullAssessmentReady')
    expect(layout).not.toContain(".from('professional_profiles')")
    expect(layout).toContain('robots: { index: false, follow: false }')
    expect(layout).toContain('openGraph:')
    const profilePage = read('src/app/profile/[id]/page.jsx')
    const profileClient = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(profilePage).toContain('getConsentVerifiedPublicProfile')
    expect(profilePage).toContain('initialProfile={initialProfile}')
    expect(profileClient).not.toContain(".from('marketplace_public_roster')")
    expect(profileClient).toContain('if (!user || user.id !== id)')
  })

  test('public profile and marketplace pages expose appropriate structured data', () => {
    const profile = read('src/app/profile/[id]/page.jsx')
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(profile).toContain("'@type': 'ProfilePage'")
    expect(profile).toContain("'@type': 'Person'")
    expect(directory).toContain("'@type': 'ItemList'")
    expect(directory).toContain("'@type': 'ListItem'")
  })

  test('homepage leads with the global institutional proposition while preserving truthful operating boundaries', () => {
    const hero = read('src/components/HeroSlider.jsx')
    const about = read('src/app/about-us/page.jsx')
    expect(hero).toContain('BUILT FOR A GLOBAL PROFESSIONAL LANDSCAPE')
    expect(hero).toContain('Valoria Institute is designed for accomplished professionals and institutions making consequential decisions.')
    expect(about).toContain('no credential should be represented as awarded')
    expect(about).toContain('At senior levels, decisions about people carry significant consequences.')
    expect(hero).not.toMatch(/Africa-first|Nigeria as its initial operating jurisdiction/i)
  })

  test('root layout publishes Organization and WebSite entities', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toContain('organizationSchema')
    expect(layout).toContain('websiteSchema')
    expect(layout).toContain("'@type': 'WebSite'")
  })

  test('machine-readable reference uses current PRIME and VALU decisions', () => {
    const llms = read('public/llms.txt')
    expect(llms).toContain('17 skills')
    expect(llms).toContain('https://valoriainstitute.com/jobs')
    expect(llms).toContain('AI Fluency')
    expect(llms).toContain('Human-AI Collaboration')
    expect(llms).toContain('points, not percentages')
    expect(llms).not.toMatch(/15[- ]question|54[- ]question/i)
    expect(llms).not.toContain('Composure Under Scrutiny')
    expect(llms).not.toContain('Systems Building')
  })

  test('event structured data excludes provisional event dates', () => {
    const events = read('src/app/events/page.jsx')
    expect(events).toContain("'@type': 'Event'")
    expect(events).toContain('filter(session => session.dateApproved)')
    expect(events).toContain('EventScheduled')
    expect(events).toContain("'@type': 'VirtualLocation'")
  })

  test('footer exposes Knowledge Hub once without duplicate navigation entries', () => {
    const footer = read('src/components/Footer.jsx')
    expect(footer.split('<Link href="/knowledge">Knowledge Hub</Link>').length - 1).toBe(1)
  })

  test('dedicated Jobs discovery route is linked and not redirected away', () => {
    expect(read('src/app/jobs/page.jsx')).toContain('export default')
    expect(read('src/app/jobs/layout.jsx')).toContain("canonical: 'https://valoriainstitute.com/jobs'")
    expect(read('src/config/navigation.js')).toContain("href: '/jobs'")
    expect(read('src/components/Footer.jsx')).toContain('href="/jobs"')
    expect(read('src/app/sitemap.js')).toContain("path: '/jobs'")
    expect(read('next.config.js')).not.toContain("source: '/jobs'")
  })
})
