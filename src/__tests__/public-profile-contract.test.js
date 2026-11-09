const fs = require('fs')
const path = require('path')
const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('public professional profile privacy and presentation', () => {
  test('public profile routes use only the Marketplace roster projection', () => {
    const page = read('src/app/profile/[id]/page.jsx')
    const client = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(page).toContain("rpc('get_marketplace_public_roster_v1'")
    expect(client).toContain("rpc('get_marketplace_public_roster_v1'")
    expect(page).not.toContain(".from('professional_profiles')")
    expect(client).not.toContain(".from('professional_profiles')")
    const marketplace = read('src/lib/marketplace-data.js')
    expect(marketplace).toContain("supabase.rpc('get_marketplace_public_roster_v1')")
    expect(marketplace).not.toContain('professional_profiles!inner')
  })

  test('homepage public profile reads never bypass roster RLS with service-role credentials', () => {
    const homepage = read('src/components/LiveProfilesScroll.jsx')
    expect(homepage).toContain('const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(homepage).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/)
  })

  test('public profile mapping excludes private contact and account fields', () => {
    const mapper = read('src/lib/public-profile.js')
    expect(mapper).toContain('phone: null')
    expect(mapper).toContain('linkedin_url: null')
    expect(mapper).toContain('website_url: null')
    expect(mapper).toContain('username: null')
    expect(mapper).toContain('assessment_summary: row.assessment_summary || null')
  })

  test('profile summary prioritises the VALU report and avoids unsupported verification labels', () => {
    const client = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(client).toContain('VALU Capability Summary')
    expect(client).toContain('SELF-REPORTED OVERVIEW')
    expect(client).toContain('MARKETPLACE PROFILE')
    expect(client).not.toMatch(/Verified Facilitator|Verified Speaker|Registered with African Talent Bureau Ltd/)
  })
})
