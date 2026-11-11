const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('authenticated journey visual density', () => {
  test('login uses a compact viewport fit and comfortable form rhythm', () => {
    const login = read('src/app/login/page.jsx')
    expect(login).toContain("padding: '48px 20px 56px'")
    expect(login).toContain("padding: 'clamp(24px, 4vw, 40px)'")
    expect(login).toContain("flexDirection: 'column', gap: '12px'")
  })

  test('signup reduces card bulk without removing required account fields', () => {
    const signup = read('src/app/signup/page.jsx')
    expect(signup).toContain("maxWidth: '520px'")
    expect(signup).toContain("padding: 'clamp(24px,4vw,40px)'")
    for (const field of ['Full Name', 'Work Email Address', 'Password', 'Confirm Password']) {
      expect(signup).toContain(field)
    }
  })

  test('account confirmation removes repeated handoff explanation', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    expect(signup).toContain('Confirm your email to sign in and return to your dashboard.')
    expect(signup).toContain('Your taster is saved; your full VALU Index will be ready there.')
    expect(signup).not.toContain('returned to your dashboard automatically')
  })

  test('profile onboarding keeps essential fields prominent and defers optional work', () => {
    const onboarding = read('src/app/profile/onboarding/page.jsx')
    expect(onboarding).toContain("fontSize:'clamp(32px,5.5vw,52px)'")
    expect(onboarding).toContain("fontSize:13,lineHeight:1.65")
    expect(onboarding).toContain('NOT REQUIRED TODAY')
    expect(onboarding).toContain('Save & continue later')
  })

  test('dashboard header, cover and primary content use a shorter vertical footprint', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain("height:'88px', overflow:'hidden'")
    expect(dashboard).toContain('size={76}')
    expect(dashboard).toContain("margin:'28px auto 56px'")
    expect(dashboard).toContain('grid-template-columns:240px minmax(0,1fr) !important')
  })

  test('report layout is compact while preserving the full result and next-step content', () => {
    const report = read('src/app/report/page.jsx')
    expect(report).toContain("padding:'56px 18px 64px'")
    expect(report).toContain("fontSize:14,lineHeight:1.75")
    expect(report).toContain('What your result means')
    expect(report).toContain('Turn your insight into a professional presence.')
  })
})
