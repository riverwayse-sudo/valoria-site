const base = process.env.SMOKE_BASE_URL || 'https://valoriainstitute.com'
const checks = [
  ['homepage', '/', 200],
  ['assessment', '/test/assessment', 200],
  ['opportunities page', '/opportunities', 200],
  ['marketplace', '/marketplace', 200],
  ['employer dashboard', '/employer/dashboard', 200],
  ['opportunities API', '/api/opportunities', 200],
  ['journey state unauthenticated', '/api/journey/state', 200],
  ['matches unauthenticated', '/api/opportunities/matches', 401],
  ['outcomes unauthenticated', '/api/outcomes', 401],
  ['journey diagnostics unauthenticated', '/api/journey/diagnostics', 401],
  ['profile applications unauthenticated', '/api/profile/applications', 401],
  ['opportunity messages unauthenticated', '/api/opportunities/messages', 401],
]

let failed = 0
for (const [name, path, expected] of checks) {
  const res = await fetch(base + path, { redirect: 'manual' })
  const body = await res.text()
  const ok = res.status === expected
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: HTTP ${res.status} (expected ${expected})`)
  if (!ok) {
    console.log(body.slice(0, 500))
    failed++
  }
}

const home = await fetch(base + '/').then(r => r.text())
for (const marker of ['START MY VALU SNAPSHOT', 'See who is already discoverable.']) {
  const ok = home.includes(marker)
  console.log(`${ok ? 'PASS' : 'FAIL'} homepage marker: ${marker}`)
  if (!ok) failed++
}

if (failed) {
  console.error(`Production smoke failed: ${failed} check(s).`)
  process.exit(1)
}
console.log('Production smoke passed.')
