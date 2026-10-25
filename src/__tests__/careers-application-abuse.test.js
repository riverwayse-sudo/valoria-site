// Regression tests for the audit finding on the public careers application
// endpoint: src/app/api/careers/applications/route.js
//
// The route accepted unlimited public POSTs. Each accepted request writes up to
// 4 MB to Supabase storage and triggers two Brevo emails, one of them addressed
// to a caller-supplied address. With no limiter it was an unmetered storage-fill
// and mail-amplification vector, and the only public form in the repo without
// one.
//
// These tests execute the real handler. Only the Supabase client and the Brevo
// network boundary are stubbed, so nothing is stored and no email is sent.

// The route builds its own client with createClient(), so that module is what
// must be faked. The factory reads a per-test stub from a module-scoped holder,
// which keeps each test's limits independent.
const holder = { stub: null }

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => holder.stub),
}))

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.BREVO_API_KEY = 'test-brevo-key'

const careers = require('@/app/api/careers/applications/route')

const IP = '203.0.113.11'

function validForm() {
  const form = new FormData()
  form.set('fullName', 'Test Candidate')
  form.set('email', 'candidate@example.com')
  form.set('phone', '+2348000000000')
  form.set('location', 'Lagos')
  form.set('experience', 'x'.repeat(60))
  form.set('achievement', 'y'.repeat(60))
  form.set('motivation', 'z'.repeat(40))
  form.set('consent', 'true')
  form.set(
    'cv',
    new File([Buffer.from('%PDF-1.7 test')], 'cv.pdf', { type: 'application/pdf' })
  )
  return form
}

function request(form = validForm(), headers = { 'x-forwarded-for': IP }) {
  return new Request('https://valoriainstitute.com/api/careers/applications', {
    method: 'POST',
    headers,
    body: form,
  })
}

// `limits` is consumed in call order: [ip, email]. `rpcError` fails both.
function supabaseStub({ limits = [true, true], rpcError = null, rpcThrows = false, existing = null } = {}) {
  let call = 0
  const upload = jest.fn(async () => ({ error: null }))
  const insert = jest.fn(async () => ({ error: null }))
  const remove = jest.fn(async () => ({ error: null }))
  return {
    rpc: jest.fn(async () => {
      if (rpcThrows) throw new Error('rpc exploded')
      if (rpcError) return { data: null, error: rpcError }
      const value = limits[call] ?? limits[limits.length - 1]
      call += 1
      return { data: value, error: null }
    }),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ eq: jest.fn(() => ({ maybeSingle: jest.fn(async () => ({ data: existing, error: null })) })) })),
      })),
      insert,
    })),
    storage: { from: jest.fn(() => ({ upload, remove })) },
    __upload: upload,
    __insert: insert,
  }
}

function install(stub) {
  holder.stub = stub
  return stub
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
})

afterAll(() => {
  delete global.fetch
})

describe('careers applications: the public POST is rate limited', () => {
  test('a first application from a new connection is accepted', async () => {
    const stub = install(supabaseStub())
    const res = await careers.POST(request())
    expect(res.status).toBe(201)
    expect(stub.__insert).toHaveBeenCalled()
  })

  test('the IP budget is consulted with a bounded window', async () => {
    const stub = install(supabaseStub())
    await careers.POST(request())
    const [first] = stub.rpc.mock.calls
    expect(first[0]).toBe('check_rate_limit')
    expect(first[1].p_key).toContain(IP)
    expect(first[1].p_max_count).toBeGreaterThan(0)
    expect(first[1].p_window_seconds).toBeGreaterThan(0)
  })

  test('an exhausted IP budget is refused before anything is stored', async () => {
    const stub = install(supabaseStub({ limits: [false, true] }))
    const res = await careers.POST(request())
    expect(res.status).toBe(429)
    expect(stub.__upload).not.toHaveBeenCalled()
    expect(stub.__insert).not.toHaveBeenCalled()
  })

  test('an exhausted per-email budget is refused before anything is stored', async () => {
    const stub = install(supabaseStub({ limits: [true, false] }))
    const res = await careers.POST(request())
    expect(res.status).toBe(429)
    expect(stub.__upload).not.toHaveBeenCalled()
    expect(stub.__insert).not.toHaveBeenCalled()
  })

  test('no email is sent when the limit is hit', async () => {
    install(supabaseStub({ limits: [false, true] }))
    await careers.POST(request())
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('a refusal names no internals', async () => {
    install(supabaseStub({ limits: [false, true] }))
    const res = await careers.POST(request())
    const body = await res.text()
    expect(body).not.toMatch(/supabase|rpc|stack|check_rate_limit/i)
  })
})

describe('careers applications: the limiter fails closed', () => {
  // This is the deliberate difference from welcome-email. That route can fail
  // open because an eligibility check still refuses arbitrary recipients. Here
  // the limiter is the only control, so an outage must not become an unmetered
  // path to storage and mail.
  test('a limiter error refuses the request', async () => {
    const stub = install(supabaseStub({ rpcError: { message: 'db down' } }))
    const res = await careers.POST(request())
    expect(res.status).toBe(503)
    expect(stub.__upload).not.toHaveBeenCalled()
    expect(stub.__insert).not.toHaveBeenCalled()
  })

  test('a limiter that throws refuses the request', async () => {
    const stub = install(supabaseStub({ rpcThrows: true }))
    const res = await careers.POST(request())
    expect(res.status).toBe(503)
    expect(stub.__insert).not.toHaveBeenCalled()
  })

  test('the error response does not leak the limiter failure reason', async () => {
    install(supabaseStub({ rpcError: { message: 'connection to 10.0.0.5 refused' } }))
    const res = await careers.POST(request())
    const body = await res.text()
    expect(body).not.toContain('10.0.0.5')
    expect(body).not.toMatch(/connection/i)
  })
})

describe('careers applications: existing controls still hold', () => {
  test('the honeypot still returns a silent success without a limiter call', async () => {
    const stub = install(supabaseStub())
    const form = validForm()
    form.set('website', 'http://spam.example')
    const res = await careers.POST(request(form))
    expect(res.status).toBe(200)
    expect(stub.rpc).not.toHaveBeenCalled()
    expect(stub.__insert).not.toHaveBeenCalled()
  })

  test('an invalid submission is rejected before the limiter is consulted', async () => {
    const stub = install(supabaseStub())
    const form = validForm()
    form.set('email', 'not-an-email')
    const res = await careers.POST(request(form))
    expect(res.status).toBe(400)
    expect(stub.rpc).not.toHaveBeenCalled()
  })

  test('a non-PDF payload with a PDF name is rejected before storage', async () => {
    const stub = install(supabaseStub())
    const form = validForm()
    form.set('cv', new File([Buffer.from('not a pdf at all')], 'cv.pdf', { type: 'application/pdf' }))
    const res = await careers.POST(request(form))
    expect(res.status).toBe(400)
    expect(stub.__upload).not.toHaveBeenCalled()
  })
})
