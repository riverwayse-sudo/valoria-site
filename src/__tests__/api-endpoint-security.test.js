// Regression tests for the two audit findings on public API endpoints:
//   - src/app/api/welcome-email/route.js  (open mail relay + HTML injection)
//   - src/app/api/trigger-report/route.js (guessable credential + dead relay)
//
// These execute the real route handlers. Only the network boundary
// (global.fetch for Brevo and the assessment upstream) and the Supabase client
// helper are stubbed, so no email is sent and no upstream is contacted.
// Request/Response are Node globals.

process.env.BREVO_API_KEY = 'test-brevo-key'
process.env.VALU_UPSTREAM_ORIGIN = 'https://assessment.test'

jest.mock('@/lib/supabase-server', () => ({
  getPrivilegedClient: jest.fn(),
  hasPrivilegedCredentials: jest.fn(() => true),
}))

const { getPrivilegedClient } = require('@/lib/supabase-server')

const welcomeEmail = require('@/app/api/welcome-email/route')
const triggerReport = require('@/app/api/trigger-report/route')

// A well-formed v4 UUID, the shape the platform issues as report_token.
const VALID_TOKEN = '00000000-0000-4000-8000-000000000000'
const IP_HEADERS = { 'x-forwarded-for': '203.0.113.9' }

function jsonRequest(url, body, headers = {}) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

// Supabase stub. `limits` is consulted in call order, so a test can make the
// IP limit pass and the per-recipient limit fail (or vice versa).
function supabaseStub({ limits = [true, true], rpcError = null, rpcThrows = false, user = null, authError = null } = {}) {
  let call = 0
  return {
    rpc: jest.fn(async () => {
      if (rpcThrows) throw new Error('rpc exploded')
      if (rpcError) return { data: null, error: rpcError }
      const value = limits[call] ?? limits[limits.length - 1]
      call += 1
      return { data: value, error: null }
    }),
    auth: {
      admin: {
        getUserById: jest.fn(async () => ({
          data: { user: authError ? null : user },
          error: authError,
        })),
      },
    },
  }
}

function freshUser(overrides = {}) {
  return {
    id: 'user-1',
    email: 'buyer@example.com',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

afterAll(() => {
  delete global.fetch
})

// ── welcome-email ─────────────────────────────────────────────────────────

describe('welcome-email: the open mail relay is closed', () => {
  test('a legitimate new signup still receives the welcome email', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    global.fetch.mockResolvedValue({ ok: true, status: 200 })

    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada Lovelace', user_id: 'user-1' },
        IP_HEADERS
      )
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.brevo.com/v3/smtp/email')
    const sent = JSON.parse(init.body)
    expect(sent.to[0].email).toBe('buyer@example.com')
    expect(sent.htmlContent).toContain('Hi Ada,')
  })

  test('an arbitrary recipient is refused, so the route is not an open relay', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'victim@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(403)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a pre-existing account cannot be used to send a welcome email', async () => {
    getPrivilegedClient.mockReturnValue(
      supabaseStub({ user: freshUser({ created_at: '2026-01-01T00:00:00Z' }) })
    )
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(403)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a missing or unknown user_id is refused', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: null }))
    for (const body of [
      { email: 'buyer@example.com', name: 'Ada' },
      { email: 'buyer@example.com', name: 'Ada', user_id: 'nobody' },
    ]) {
      const res = await welcomeEmail.POST(
        jsonRequest('https://site.test/api/welcome-email', body, IP_HEADERS)
      )
      expect(res.status).toBe(403)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a repeat welcome for the same address is a no-op, not a second email', async () => {
    // IP limit allows, per-recipient limit is exhausted.
    getPrivilegedClient.mockReturnValue(supabaseStub({ limits: [true, false], user: freshUser() }))
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, skipped: 'already_sent' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('bulk sending from one connection is limited', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ limits: [false, true] }))
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(429)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rejects an invalid recipient without contacting Brevo', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    for (const email of ['not-an-email', '', 'a@b', null, 123, 'x'.repeat(300) + '@example.com']) {
      const res = await welcomeEmail.POST(
        jsonRequest('https://site.test/api/welcome-email', { email, name: 'Ada' }, IP_HEADERS)
      )
      expect(res.status).toBe(400)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rejects an oversized name', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'x'.repeat(121), user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('escapes the recipient name instead of injecting it into the email HTML', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    global.fetch.mockResolvedValue({ ok: true, status: 200 })

    await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        // Space-free, so the whole payload survives the first-name split and
        // actually reaches the interpolated HTML.
        { email: 'buyer@example.com', name: '<svg/onload=alert(1)>', user_id: 'user-1' },
        IP_HEADERS
      )
    )

    const sent = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(sent.htmlContent).not.toContain('<svg')
    expect(sent.htmlContent).not.toContain('onload=alert(1)>')
    expect(sent.htmlContent).toContain('&lt;svg/onload=alert(1)&gt;')
  })

  test('a limiter outage fails open, and eligibility still closes the relay', async () => {
    // Both limit calls fail; eligibility must still refuse a non-matching address.
    getPrivilegedClient.mockReturnValue(
      supabaseStub({ rpcError: { message: 'boom' }, user: freshUser() })
    )
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'victim@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(403)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a limiter outage still lets a legitimate signup through', async () => {
    getPrivilegedClient.mockReturnValue(
      supabaseStub({ rpcThrows: true, user: freshUser() })
    )
    global.fetch.mockResolvedValue({ ok: true, status: 200 })
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('rejects a malformed body', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', 'not json', IP_HEADERS)
    )
    expect(res.status).toBe(400)
  })

  test('surfaces an upstream provider failure without claiming success', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    global.fetch.mockResolvedValue({ ok: false, status: 500 })
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, error: 'Send failed.' })
  })

  test('surfaces a network failure to the provider', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ user: freshUser() }))
    global.fetch.mockRejectedValue(new Error('ECONNRESET'))
    const res = await welcomeEmail.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(500)
  })

  test('reports 501 when email is not configured', async () => {
    const saved = process.env.BREVO_API_KEY
    delete process.env.BREVO_API_KEY
    jest.resetModules()
    const fresh = require('@/app/api/welcome-email/route')
    const res = await fresh.POST(
      jsonRequest(
        'https://site.test/api/welcome-email',
        { email: 'buyer@example.com', name: 'Ada', user_id: 'user-1' },
        IP_HEADERS
      )
    )
    expect(res.status).toBe(501)
    process.env.BREVO_API_KEY = saved
    jest.resetModules()
  })
})

// ── trigger-report ────────────────────────────────────────────────────────

describe('trigger-report: the guessable credential is no longer forwarded', () => {
  test('requires a well-formed report_token', async () => {
    for (const body of [
      {},
      { identity_hash: 'fp_abc123' },
      { report_token: 'short' },
      { report_token: 'fp_1a2b3c' },
      { report_token: 42 },
      { report_token: null },
    ]) {
      const res = await triggerReport.POST(jsonRequest('https://site.test/api/trigger-report', body))
      expect(res.status).toBe(400)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('the identity_hash alone cannot authorise report generation', async () => {
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { identity_hash: 'fp_guessable' })
    )
    expect(res.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rejects a token that is not a v4 UUID, so a forged value cannot pass', async () => {
    for (const bad of [
      '00000000-0000-9000-8000-000000000000', // version nibble 9
      '00000000-0000-4000-c000-000000000000', // variant nibble c
    ]) {
      const res = await triggerReport.POST(
        jsonRequest('https://site.test/api/trigger-report', { report_token: bad })
      )
      expect(res.status).toBe(400)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a legitimate pre-sign-in caller is not blocked by a session requirement', async () => {
    // /login fires this before sign-in, so there is no Authorization header.
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN })
    )
    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('forwards only the report_token and does not echo the upstream body', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, report_token: 'SECRET-TOKEN', results: { valuIndex: 61 } }),
    })

    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true })
    expect(JSON.stringify(body)).not.toContain('SECRET-TOKEN')
    expect(JSON.stringify(body)).not.toContain('valuIndex')

    const [url, init] = global.fetch.mock.calls[0]
    expect(url).toBe('https://assessment.test/api/generate-and-send-report')
    expect(JSON.parse(init.body)).toEqual({ report_token: VALID_TOKEN })
    // The guessable fingerprint must not travel.
    expect(init.body).not.toContain('identity_hash')
  })

  test('accepts a token that arrives with surrounding whitespace', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: `  ${VALID_TOKEN}  ` })
    )
    expect(res.status).toBe(200)
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).report_token).toBe(VALID_TOKEN)
  })

  test('maps an upstream rejection to 502 without leaking the upstream body', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, error: 'Valid report token is required' }),
    })
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN })
    )
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).not.toContain('Valid report token')
    expect(JSON.stringify(body)).not.toContain('report_token')
  })

  test('reports 502 when the assessment app is unreachable', async () => {
    global.fetch.mockRejectedValue(new Error('ENOTFOUND'))
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN })
    )
    expect(res.status).toBe(502)
  })

  test('rejects a malformed request body', async () => {
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', 'not json')
    )
    expect(res.status).toBe(400)
  })
})
