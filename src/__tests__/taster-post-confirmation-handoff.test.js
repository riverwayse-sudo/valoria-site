const fs = require('fs')
const path = require('path')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')

describe('post-Taster confirmation handoff', () => {
  test('already-confirmed retry preserves the completed Taster through sign-in', () => {
    const confirmation = read('app/valu/confirm-taster/page.jsx')
    expect(confirmation).toContain('pending_taster_id=${encodeURIComponent(tasterId)}')
    expect(confirmation).toContain('returnTo=%2Fdashboard')
  })

  test('login consumes the pending Taster after verifying the account session', () => {
    const login = read('app/login/page.jsx')
    expect(login).toContain("params.get('pending_taster_id')")
    expect(login).toContain("localStorage.setItem('pending_taster_id', pendingTasterId)")
    expect(login).toContain("fetch('/api/link-taster'")
    expect(login).toContain('Authorization: `Bearer ${session.access_token}`')
  })
})
