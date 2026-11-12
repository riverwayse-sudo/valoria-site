const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('authenticated email confirmation handoff', () => {
  test('exchanges the confirmation code before reading any existing browser session', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    const exchange = callback.indexOf('supabase.auth.exchangeCodeForSession(code)')
    const sessionRead = callback.indexOf('supabase.auth.getSession()')
    expect(callback).toContain("const code = params.get('code')")
    expect(exchange).toBeGreaterThan(-1)
    expect(sessionRead).toBeGreaterThan(-1)
    expect(exchange).toBeLessThan(sessionRead)
  })

  test('links the saved taster only after verifying the authenticated user', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    expect(callback).toContain('supabase.auth.getUser()')
    expect(callback).toContain("params.get('pending_taster_id') || localStorage.getItem('pending_taster_id')")
    expect(callback).toContain("fetch('/api/link-taster'")
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')")
  })

  test('signup and resend only use allowlisted Valoria callback origins', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    const helper = read('src/lib/auth-callback-url.js')
    expect(signup).toContain('getProfessionalAuthCallbackUrl(window.location.origin, tasterId)')
    expect(signup).not.toContain('process.env.NEXT_PUBLIC_SITE_URL ||')
    expect(helper).toContain('https://valoriainstitute.com')
    expect(helper).toContain('https://staging.valoriainstitute.com')
    expect(helper).toContain('return null')
  })

  test('the server-side taster linker requires confirmed email and matching identity evidence', () => {
    const route = read('src/app/api/link-taster/route.js')
    expect(route).toContain("if (!user.email_confirmed_at)")
    expect(route).toContain("norm(identityCandidate.candidate_email) !== norm(user.email)")
    expect(route).toContain("if (taster.user_id && taster.user_id !== user.id)")
  })
})
