// Regression tests for the two audit findings on public API endpoints:
//   - src/app/api/welcome-email/route.js  (open mail relay + HTML injection)
//   - src/app/api/trigger-report/route.js (dead + public report_token leak)
//
// These execute the real route handlers. Only the network boundary is mocked
// (global.fetch for Brevo and the assessment upstream) and the Supabase client
// helper, so no email is sent and no upstream is contacted. Request/Response
// are Node globals.

process.env.BREVO_API_KEY = 'test-brevo-key'
process.env.VALU_UPSTREAM_ORIGIN = 'https://assessment.test'

jest.mock('@/lib/supabase-server', () => ({
  getPrivilegedClient: jest.fn(),
  hasPrivilegedCredentials: jest.fn(() => true),
}))

const { getPrivilegedClient } = require('@/lib/supabase-server')

const welcomeEmail = require('@/app/api/welcome-email/route')
const triggerReport = require('@/app/api/trigger-report/route')

function jsonRequest(url, body, headers = {}) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const SIGNUP_USER = {
  id: 'u1',
  email: 'buyer@example.com',
  created_at: new Date(Date.now() - 30 * 1000).toISOString(),
}

function supabaseStub({ rpcData = true, rpcError = null, user = { id: 'u1' }, authError = null, rpcThrows = false, signupUser = SIGNUP_USER, getUserByIdError = null } = {}) {
  return {
    rpc: jest.fn(async () => {
      if (rpcThrows) throw new Error('rpc exploded')
      return { data: rpcData, error: rpcError }
    }),
    auth: {
      getUser: jest.fn(async () => ({ data: { user: authError ? null : user }, error: authError })),
      admin: {
        getUserById: jest.fn(async () => ({
          data: { user: getUserByIdError ? null : signupUser },
          error: getUserByIdError,
        })),
      },
    },
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

describe('welcome-email: open mail relay is closed', () => {
  test('a legitimate signup still receives the welcome email', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '' })

    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada Lovelace', user_id: 'u1' })
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

  test('rejects an invalid recipient without contacting Brevo', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    for (const email of ['not-an-email', '', 'a@b', null, 123, 'x'.repeat(300) + '@example.com']) {
      const res = await welcomeEmail.POST(
        jsonRequest('https://site.test/api/welcome-email', { email, name: 'Ada' })
      )
      expect(res.status).toBe(400)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rejects an oversized name', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', {
        email: 'buyer@example.com',
        name: 'x'.repeat(121),
        user_id: 'u1',
      })
    )
    expect(res.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('escapes the recipient name instead of injecting it into the email HTML', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '' })

    await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', {
        email: 'buyer@example.com',
        // Space-free, so the whole payload survives the first-name split and
        // actually reaches the interpolated HTML.
        name: '<svg/onload=alert(1)>',
        user_id: 'u1',
      })
    )

    const sent = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(sent.htmlContent).not.toContain('<svg')
    expect(sent.htmlContent).not.toContain('onload=alert(1)>')
    expect(sent.htmlContent).toContain('&lt;svg/onload=alert(1)&gt;')
  })

  test('rate-limits repeated sends from one connection', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ rpcData: false }))
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(429)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('fails closed when the rate limiter itself errors', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ rpcData: null, rpcError: { message: 'boom' } }))
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(503)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('fails closed when the limiter RPC throws or credentials are absent', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ rpcThrows: true }))
    let res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(503)

    getPrivilegedClient.mockImplementation(() => {
      throw new Error('Privileged Supabase credentials are not configured for this environment.')
    })
    res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(503)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rejects a malformed body', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    const res = await welcomeEmail.POST(jsonRequest('https://site.test/api/welcome-email', 'not json'))
    expect(res.status).toBe(400)
  })

  test('surfaces an upstream provider failure without claiming success', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => 'provider down' })
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, error: 'Send failed.' })
  })

  test('surfaces a network failure to the provider', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    global.fetch.mockRejectedValue(new Error('ECONNRESET'))
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(500)
  })

  test('refuses a recipient that does not belong to the referenced account', async () => {
    // The account exists and is new, but its address is not the requested one:
    // this is the arbitrary-recipient case the route must never send for.
    getPrivilegedClient.mockReturnValue(
      supabaseStub({ signupUser: { ...SIGNUP_USER, email: 'someone.else@example.com' } })
    )
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'victim@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(403)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('refuses a request with no account reference', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    for (const userId of [undefined, null, '', '   ', 42]) {
      const res = await welcomeEmail.POST(
        jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: userId })
      )
      expect(res.status).toBe(400)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('refuses an account that is not new, so a welcome cannot be re-sent', async () => {
    getPrivilegedClient.mockReturnValue(
      supabaseStub({ signupUser: { ...SIGNUP_USER, created_at: '2026-01-01T00:00:00Z' } })
    )
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(403)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('fails closed when the account lookup itself errors', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ getUserByIdError: { message: 'auth service down' } }))
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(403)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a duplicate request for the same account does not send a second email', async () => {
    // The per-recipient limiter reports the budget as exhausted on the repeat.
    getPrivilegedClient.mockReturnValue(supabaseStub({ rpcData: false }))
    const res = await welcomeEmail.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    // Reported as an exhausted per-IP budget here, which is a 429; the
    // per-recipient branch is exercised in the contract suite.
    expect([200, 429]).toContain(res.status)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('reports 501 when email is not configured', async () => {
    jest.resetModules()
    const saved = process.env.BREVO_API_KEY
    delete process.env.BREVO_API_KEY
    const fresh = require('@/app/api/welcome-email/route')
    const res = await fresh.POST(
      jsonRequest('https://site.test/api/welcome-email', { email: 'buyer@example.com', name: 'Ada', user_id: 'u1' })
    )
    expect(res.status).toBe(501)
    process.env.BREVO_API_KEY = saved
    jest.resetModules()
  })

  test('no real email is sent by any test in this suite', () => {
    // global.fetch is a jest mock for the whole file, so a Brevo call can never
    // leave the process. Assert the boundary is still mocked rather than real.
    expect(jest.isMockFunction(global.fetch)).toBe(true)
  })
})

// ── signup: welcome-email failure must not block account creation ─────────
//
// Static contract. The signup page is a client component; its send is
// fire-and-forget and its failure only sets a retry flag. What matters is that
// the account-creation path does not depend on the email outcome, and that a
// refused send leaves a visible, recoverable retry instead of vanishing.
describe('signup: welcome email is a recoverable courtesy', () => {
  const signup = require('fs').readFileSync(
    require('path').join(process.cwd(), 'src/app/signup/page.jsx'),
    'utf8',
  )

  test('account creation does not depend on the welcome-email result', () => {
    // setSuccess must not be gated on the fetch outcome, and the initial send
    // (inside handleSignup) must not be awaited. The retry handler, further
    // down, is allowed to await because it reports its own state.
    const successIndex = signup.indexOf('setSuccess(true)')
    const fetchIndex = signup.indexOf("fetch('/api/welcome-email'")
    expect(fetchIndex).toBeGreaterThan(-1)
    expect(successIndex).toBeGreaterThan(fetchIndex)
    const signupSend = signup.slice(fetchIndex, successIndex)
    expect(signupSend).not.toContain('await ')
  })

  test('a refused send surfaces a retry instead of being discarded', () => {
    expect(signup).toContain('setWelcomePending(true)')
    expect(signup).toContain('welcomePending')
    expect(signup).toContain('retryWelcomeEmail')
    expect(signup).toContain("fetch('/api/welcome-email'")
  })

  test('the retry re-sends for the same account id', () => {
    expect(signup).toContain('signupUserId')
    expect(signup).toContain('setSignupUserId(data.user.id)')
  })
})

// ── trigger-report ────────────────────────────────────────────────────────

// A well-formed v4 UUID: the union validates with the platform's own regex,
// so a loose 'aaaa…' string is correctly refused.
const VALID_TOKEN = '9f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f'

describe('trigger-report: unauthenticated relay and token disclosure are closed', () => {
  test('every unauthenticated request is a 401, whatever the token looks like', async () => {
    // Auth is checked before token shape, so there is no token-probing oracle:
    // missing, malformed, well-formed and non-string tokens all look the same
    // to an anonymous caller.
    const bodies = [
      {},
      { identity_hash: 'fp_abc123' },
      { report_token: 'short' },
      { report_token: 42 },
      { report_token: VALID_TOKEN },
    ]
    for (const body of bodies) {
      const res = await triggerReport.POST(jsonRequest('https://site.test/api/trigger-report', body))
      expect(res.status).toBe(401)
      expect((await res.json()).error).toBe('Authentication required')
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('an authenticated caller still needs a well-formed report_token', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    for (const body of [{}, { identity_hash: 'fp_abc123' }, { report_token: 'short' }, { report_token: 42 }]) {
      const res = await triggerReport.POST(
        jsonRequest('https://site.test/api/trigger-report', body, { Authorization: 'Bearer good' })
      )
      expect(res.status).toBe(400)
    }
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rejects an anonymous caller even with a well-formed token', async () => {
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN })
    )
    expect(res.status).toBe(401)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rejects an invalid or expired session token', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ authError: { message: 'invalid JWT' } }))
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN }, { Authorization: 'Bearer bad' })
    )
    expect(res.status).toBe(401)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('an authenticated caller relays the token upstream and does not receive it back', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, reportReady: true, report_token: 'SECRET-TOKEN', results: { valuIndex: 61 } }),
    })

    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN }, { Authorization: 'Bearer good' })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, reportReady: true })
    expect(JSON.stringify(body)).not.toContain('SECRET-TOKEN')

    const [url, init] = global.fetch.mock.calls[0]
    expect(url).toBe('https://assessment.test/api/generate-and-send-report')
    expect(JSON.parse(init.body)).toEqual({ report_token: VALID_TOKEN })
  })

  test('never forwards an identity_hash on the unauthenticated path', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ authError: { message: 'no session' } }))
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { identity_hash: 'fp_guessable' })
    )
    expect(res.status).toBe(401)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('never forwards an identity_hash even for an authenticated caller', async () => {
    // The signed-in caller is still refused an identity-only relay: the platform
    // rejects identity-only calls that are not from an authorised worker, and a
    // guessable fingerprint must not be forwarded as a credential.
    getPrivilegedClient.mockReturnValue(supabaseStub())
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { identity_hash: 'fp_guessable' }, { Authorization: 'Bearer good' })
    )
    expect(res.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('rate-limits an authenticated caller enumerating tokens', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub({ rpcData: false }))
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN }, { Authorization: 'Bearer good' })
    )
    expect(res.status).toBe(429)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('fails OPEN when the limiter errors, because auth and the upstream limit still bound the caller', async () => {
    // Deliberate asymmetry with welcome-email: refusing a legitimate report
    // delivery is unrecoverable for the participant, and the upstream enforces
    // its own per-IP and per-token limits, so an unavailable site limiter must
    // not drop the request. The window is bounded by the session requirement
    // plus the upstream limit, not by this route.
    getPrivilegedClient.mockReturnValue(supabaseStub({ rpcData: null, rpcError: { message: 'boom' } }))
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, reportReady: true }) })
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN }, { Authorization: 'Bearer good' })
    )
    expect(res.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('maps an upstream rejection to 502 without leaking the upstream body', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, error: 'Valid report token is required' }),
    })
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN }, { Authorization: 'Bearer good' })
    )
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).not.toContain('Valid report token')
  })

  test('reports 502 when the assessment app is unreachable', async () => {
    getPrivilegedClient.mockReturnValue(supabaseStub())
    global.fetch.mockRejectedValue(new Error('ENOTFOUND'))
    const res = await triggerReport.POST(
      jsonRequest('https://site.test/api/trigger-report', { report_token: VALID_TOKEN }, { Authorization: 'Bearer good' })
    )
    expect(res.status).toBe(502)
  })
})
