const fs = require('fs')
const path = require('path')

describe('confirmed-account Taster handoff contract', () => {
  test('routes the one-time Taster start code to the platform account-first gate that consumes it', () => {
    const route = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/valu-taster/start/route.js'),
      'utf8'
    )

    expect(route).toContain("new URL('/valu/assessment/?journey=account-first', request.url)")
    expect(route).toContain("new URLSearchParams({ taster_start_code: handoffCode })")
    expect(route).toContain("target_stage: 'taster'")
    expect(route).toContain("source: 'confirmed_account_taster_signup'")
  })
})
