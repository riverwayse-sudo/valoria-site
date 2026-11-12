const fs = require('fs')
const path = require('path')

describe('VALU Index Taster recovery entry route', () => {
  const page = fs.readFileSync(path.join(process.cwd(), 'src/app/professional-signup/recover/page.jsx'), 'utf8')
  const login = fs.readFileSync(path.join(process.cwd(), 'src/app/login/page.jsx'), 'utf8')
  const claim = fs.readFileSync(path.join(process.cwd(), 'src/app/api/claim-taster/route.js'), 'utf8')

  test('recovery entry sends participants to authenticated sign-in with a dashboard return', () => {
    expect(page).toContain('/login?returnTo=%2Fdashboard')
    expect(page).toContain('same email address')
    expect(page).toContain('VALU Index Taster')
    expect(page).toContain('/signup')
    expect(page).not.toContain('identity evidence')
    expect(page).not.toContain('identity_status')
  })

  test('recovery route is included in staging and production release smoke checks', () => {
    const productionSmoke = fs.readFileSync(path.join(process.cwd(), 'scripts/production-smoke.mjs'), 'utf8')
    const stagingAudit = fs.readFileSync(path.join(process.cwd(), 'scripts/staging-browser-audit.mjs'), 'utf8')
    expect(productionSmoke).toContain("'/professional-signup/recover'")
    expect(stagingAudit).toContain("${SITE}/professional-signup/recover")
  })

  test('sign-in claims eligible taster records using the verified account session', () => {
    expect(login).toContain("fetch('/api/claim-taster'")
    expect(login).toContain('Authorization: `Bearer ${session.access_token}`')
    expect(claim).toContain('user.email_confirmed_at')
    expect(claim).toContain(".eq('candidate_email', email)")
    expect(claim).toContain(".is('user_id', null)")
  })
})
