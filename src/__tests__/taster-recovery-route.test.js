const fs = require('fs')
const path = require('path')

describe('VALU taster recovery entry route', () => {
  const page = fs.readFileSync(path.join(process.cwd(), 'src/app/professional-signup/recover/page.jsx'), 'utf8')
  const login = fs.readFileSync(path.join(process.cwd(), 'src/app/login/page.jsx'), 'utf8')
  const claim = fs.readFileSync(path.join(process.cwd(), 'src/app/api/claim-taster/route.js'), 'utf8')

  test('recovery entry sends participants to authenticated sign-in with a dashboard return', () => {
    expect(page).toContain('/login?returnTo=%2Fdashboard')
    expect(page).toContain('same email address')
    expect(page).toContain('/signup')
  })

  test('sign-in automatically claims eligible taster records using the verified account session', () => {
    expect(login).toContain("fetch('/api/claim-taster'")
    expect(login).toContain('Authorization: `Bearer ${session.access_token}`')
    expect(claim).toContain('user.email_confirmed_at')
    expect(claim).toContain(".eq('candidate_email', email)")
    expect(claim).toContain(".in('identity_status', ['contact_candidate', 'unresolved', 'account_linked'])")
    expect(claim).toContain(".is('user_id', null)")
  })
})
