const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

// The snapshot signup flow creates the account and sends the confirmation email
// before the snapshot is submitted, so no taster_id can travel through the
// confirmation redirect: the taster_sessions row does not exist yet when the
// email link is generated. Email evidence is therefore the only link available
// on the confirmation landing, and it must be verified server-side.
describe('confirmation landing recovers a saved snapshot', () => {
  const callback = read('src/app/auth/callback/page.jsx')

  test('confirmation landing invokes the email-evidence recovery', () => {
    expect(callback).toContain("fetch('/api/claim-taster'")
    expect(callback).toContain("Authorization: `Bearer ${session.access_token}`")
  })

  test('recovery runs after a session is established, not before', () => {
    const sessionIndex = callback.indexOf('session?.access_token')
    const recoveryIndex = callback.indexOf("fetch('/api/claim-taster'")
    expect(sessionIndex).toBeGreaterThan(-1)
    expect(recoveryIndex).toBeGreaterThan(sessionIndex)
  })

  test('recovery is non-blocking so ordinary confirmation still completes', () => {
    // A zero-match recovery must not stop the user reaching the dashboard.
    expect(callback).toMatch(/catch \(recoveryError\)/)
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')")
  })

  test('recovery never treats a browser-supplied id as proof of ownership', () => {
    // The recovery request carries no identifier: the server derives the
    // candidate from the authenticated, confirmed user's email.
    const call = callback.slice(
      callback.indexOf("fetch('/api/claim-taster'"),
      callback.indexOf('claim-taster') + 600,
    )
    expect(call).not.toContain('pending_taster_id')
    expect(call).toContain('body: JSON.stringify({})')
  })

  test('the server-side route still enforces confirmed email and candidate match', () => {
    const route = read('src/app/api/claim-taster/route.js')
    expect(route).toContain('user.email_confirmed_at')
    expect(route).toContain("eq('candidate_email', email)")
    expect(route).toContain("identity_status: 'account_linked'")
    expect(route).toContain('refresh_professional_journey')
    // Never overwrite an existing verified decision for another account.
    expect(route).toContain("latestReview?.decision === 'verified_match'")
  })
})
