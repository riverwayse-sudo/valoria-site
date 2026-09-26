const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('VALUI marketplace lifecycle contract', () => {
  test('marketplace has one canonical root and three capability routes', () => {
    const rootSource = read('src/app/marketplace/page.jsx')
    const talent = read('src/app/marketplace/talent/page.jsx')
    const speakers = read('src/app/marketplace/speakers/page.jsx')
    const facilitators = read('src/app/marketplace/facilitators/page.jsx')

    for (const source of [rootSource, talent, speakers, facilitators]) {
      expect(source).toContain("import MarketplaceDirectory from '@/components/MarketplaceDirectory'")
      expect(source).toContain('getMarketplaceRows')
      expect(source).toContain('getMarketplaceCounts')
      expect(source).toContain('activeTrack=')
    }
    expect(rootSource).toContain("getMarketplaceRows('all')")
    expect(talent).toContain("getMarketplaceRows('candidate')")
    expect(speakers).toContain("getMarketplaceRows('speaker')")
    expect(facilitators).toContain("getMarketplaceRows('facilitator')")
  })

  test('marketplace data is professional-first and deduplicates capabilities', () => {
    const source = read('src/lib/marketplace-data.js')
    expect(source).toContain("professional_id")
    expect(source).toContain("new Set")
    expect(source).toContain("all: all.size")
    expect(source).toContain("candidate: byTrack.candidate.size")
    expect(source).toContain("speaker: byTrack.speaker.size")
    expect(source).toContain("facilitator: byTrack.facilitator.size")
  })

  test('profile onboarding does not submit platform-owned governance fields', () => {
    const source = read('src/app/profile/setup/page.jsx')
    const start = source.indexOf('async function saveProgress')
    const end = source.indexOf('  // Mirrors the assessment\'s pattern', start)
    const saveBlock = source.slice(start, end)
    expect(saveBlock).toBeTruthy()
    expect(saveBlock).not.toContain('existingListingStatusRef')
    expect(saveBlock).not.toMatch(/listing_status\s*:/)
    expect(saveBlock).not.toMatch(/eligible_for_listing\s*:/)
    expect(saveBlock).not.toMatch(/profile_complete\s*:/)
    expect(saveBlock).not.toMatch(/visibility\s*:/)
    expect(saveBlock).not.toMatch(/valu_index\s*:/)
    expect(saveBlock).not.toMatch(/assessment_completed_at\s*:/)
  })

  test('taster handoff derives ownership from the authenticated session', () => {
    const source = read('src/app/api/link-taster/route.js')
    expect(source).toContain("request.headers.get('authorization')")
    expect(source).toContain('userClient.auth.getUser()')
    expect(source).not.toContain('const { taster_id: tasterId, user_id: userId')
    expect(source).not.toContain('getUserById(userId)')
  })

  test('assessment identity handoff is server-side and email-bound', () => {
    const source = read('src/app/api/link-assessment/route.js')
    expect(source).toContain('userClient.auth.getUser()')
    expect(source).toContain('assessment.email')
    expect(source).toMatch(/admin\s*\.from\(['"]valu_assessments['"]\)/)
    expect(source).toContain(".update({ user_id: user.id })")
  })

  test('email confirmation preserves the pending taster handoff', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    const login = read('src/app/login/page.jsx')
    expect(signup).toContain('pending_taster_id')
    expect(signup).toContain('emailRedirectTo')
    expect(login).toContain('pending_taster_id')
    expect(login).toContain('/api/link-taster')
  })

  test('public VALU pages use the authoritative PRIME vocabulary', () => {
    const valu = read('src/app/valu/page.jsx')
    const start = read('src/app/valu/start/page.jsx')
    for (const source of [valu, start]) {
      expect(source).toContain('Presence')
      expect(source).toContain('Relationships')
      expect(source).toContain('Intelligence')
      expect(source).toContain('Mastery')
      expect(source).toContain('Enterprise')
    }
    expect(start).not.toContain("'Professionalism'")
    expect(start).not.toContain("'Motivation & Stamina'")
  })
})
