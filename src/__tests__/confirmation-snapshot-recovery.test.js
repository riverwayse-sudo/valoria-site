// Behavioural coverage for the snapshot-recovery path that runs on the
// confirmation landing.
//
// The recovery itself is /api/claim-taster, and that is what is executed here:
// the real POST handler from src/app/api/claim-taster/route.js, against an
// in-memory Supabase double. Only the database boundary is faked — no handler
// logic is mocked, and no email or network call is made.
//
// Why this path needs its own suite: the confirmation landing establishes a
// session and then asks the server to connect a saved snapshot to the
// account. That operation links a participant's historical snapshot to an
// identity, so the properties that matter are the ones asserted below:
//   - only a confirmed email can trigger it,
//   - the match is by the authenticated user's own email, never by an
//     identifier supplied by the browser,
//   - a snapshot already owned by another account is never taken over,
//   - name and role must still corroborate, so the original identity is
//     preserved,
//   - a zero-match result is harmless and non-blocking,
//   - retrying is safe and does not duplicate or overwrite history.

const URL_ = 'https://staging.supabase.co'
const ANON = 'anon-key'
const SERVICE = 'service-key'

process.env.NEXT_PUBLIC_SUPABASE_URL = URL_
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ANON
process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE

// The in-memory database. Each test gets a fresh copy.
function makeState(overrides = {}) {
  return {
    user: {
      id: 'account-1',
      email: 'participant@example.com',
      email_confirmed_at: '2026-10-20T00:00:00.000Z',
      ...(overrides.user || {}),
    },
    // Keyed by the real table names: the handler queries these tables directly.
    taster_identity_candidates: overrides.candidates || [],
    taster_sessions: overrides.tasters || [],
    identity_reconciliation_reviews: overrides.reviews || [],
    rpcErrors: overrides.rpcErrors || {},
    calls: [],
  }
}

// The mocked Supabase client. jest.mock factories may only reference globals,
// so the query builder and its filter matcher are defined inside the factory.
// Only the database boundary is faked: the handler's own logic runs unmodified.
jest.mock('@supabase/supabase-js', () => {
  const matches = (row, filters) => filters.every(([kind, col, value]) => {
    if (kind === 'eq') return row[col] === value
    if (kind === 'in') return value.includes(row[col])
    if (kind === 'is') return (row[col] ?? null) === value
    return false
  })

  // Chainable builder implementing only the operations the handler uses. It
  // honours `is(col, null)`, which the handler relies on for concurrent-claim
  // safety: a conditional update that matches nothing returns null data.
  const builder = (table, state) => {
    const query = { filters: [], op: 'select', payload: null, single: false, limit: null }
    const rows = () => state[table] || (state[table] = [])

    const run = () => {
      if (query.op === 'select') {
        let found = rows().filter((row) => matches(row, query.filters))
        if (query.limit != null) found = found.slice(0, query.limit)
        if (query.single) return { data: found[0] || null, error: null }
        return { data: found, error: null }
      }
      if (query.op === 'update') {
        const found = rows().filter((row) => matches(row, query.filters))
        if (query.single && found.length === 0) return { data: null, error: null }
        for (const row of found) Object.assign(row, query.payload)
        if (query.single) return { data: found[0] || null, error: null }
        return { data: found, error: null }
      }
      if (query.op === 'insert') {
        rows().push({ ...query.payload })
        return { data: query.payload, error: null }
      }
      return { data: null, error: null }
    }

    const api = {
      select: () => api,
      eq: (col, value) => { query.filters.push(['eq', col, value]); return api },
      in: (col, value) => { query.filters.push(['in', col, value]); return api },
      is: (col, value) => { query.filters.push(['is', col, value]); return api },
      order: () => api,
      limit: (n) => { query.limit = n; return api },
      update: (payload) => { query.op = 'update'; query.payload = payload; return api },
      insert: (payload) => { query.op = 'insert'; query.payload = payload; return api },
      maybeSingle: () => { query.single = true; return Promise.resolve(run()) },
      then: (onOk, onErr) => Promise.resolve(run()).then(onOk, onErr),
    }
    return api
  }

  return {
    createClient: (url, key) => {
      const state = globalThis.__state
      if (key === 'service-key') {
        return {
          from: (table) => builder(table, state),
          rpc: (name, args) => {
            state.calls.push({ op: 'rpc', name, args })
            const message = state.rpcErrors[name]
            return Promise.resolve(message ? { data: null, error: { message } } : { data: null, error: null })
          },
        }
      }
      // The user-scoped client. The handler only uses it to resolve the session.
      return {
        auth: {
          getUser: async () => ({ data: { user: state.user }, error: state.user ? null : { message: 'no user' } }),
        },
      }
    },
  }
})

function requestWith(authorization) {
  return { headers: { get: (name) => (name.toLowerCase() === 'authorization' ? authorization : null) } }
}

function loadRoute() {
  jest.resetModules()
  return require('@/app/api/claim-taster/route')
}

function candidate(overrides = {}) {
  return {
    taster_id: 'taster-1',
    candidate_email: 'participant@example.com',
    candidate_name: 'Ada Lovelace',
    candidate_role: 'Founder',
    identity_status: 'contact_candidate',
    linked_user_id: null,
    ...overrides,
  }
}

function taster(overrides = {}) {
  return {
    id: 'taster-1',
    name: 'Ada Lovelace',
    role: 'Founder',
    user_id: null,
    linked_at: null,
    completed_at: '2026-10-19T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => { globalThis.__state = makeState() })

describe('snapshot recovery requires a confirmed, authenticated account', () => {
  test('rejects a request with no bearer token', async () => {
    globalThis.__state = makeState()
    const { POST } = loadRoute()
    const res = await POST(requestWith(null))
    expect(res.status).toBe(401)
  })

  test('rejects an unconfirmed email', async () => {
    globalThis.__state = makeState({ user: { email_confirmed_at: null } })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    expect(res.status).toBe(403)
  })

  test('reports misconfiguration instead of throwing', async () => {
    globalThis.__state = makeState()
    const saved = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    expect(res.status).toBe(503)
    process.env.SUPABASE_SERVICE_ROLE_KEY = saved
  })
})

describe('snapshot recovery links a matching saved snapshot', () => {
  test('links by the authenticated email and reports one link', async () => {
    globalThis.__state = makeState({
      candidates: [candidate()],
      tasters: [taster()],
    })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.linked).toBe(1)
    expect(body.taster_ids).toEqual(['taster-1'])

    const linkedTaster = globalThis.__state.taster_sessions.find((t) => t.id === 'taster-1')
    expect(linkedTaster.user_id).toBe('account-1')

    const linkedCandidate = globalThis.__state.taster_identity_candidates.find((c) => c.taster_id === 'taster-1')
    expect(linkedCandidate.identity_status).toBe('account_linked')
    expect(linkedCandidate.linked_user_id).toBe('account-1')
  })

  test('records an auditable verified_match decision', async () => {
    globalThis.__state = makeState({ candidates: [candidate()], tasters: [taster()] })
    const { POST } = loadRoute()
    await POST(requestWith('Bearer token'))

    const review = globalThis.__state.identity_reconciliation_reviews[0]
    expect(review.decision).toBe('verified_match')
    expect(review.candidate_record_id).toBe('account-1')
    expect(review.source_record_id).toBe('taster-1')
    // The snapshot itself must be preserved, not rewritten.
    expect(globalThis.__state.taster_sessions[0].completed_at).toBe('2026-10-19T00:00:00.000Z')
    expect(globalThis.__state.taster_sessions[0].name).toBe('Ada Lovelace')
  })

  test('a zero-match recovery is harmless and non-blocking', async () => {
    globalThis.__state = makeState({ candidates: [], tasters: [] })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.linked).toBe(0)
    expect(body.reconciled).toBe(0)
  })

  test('ignores a snapshot whose email does not match the account', async () => {
    globalThis.__state = makeState({
      candidates: [candidate({ candidate_email: 'someone.else@example.com' })],
      tasters: [taster()],
    })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    const body = await res.json()
    expect(body.linked).toBe(0)
    expect(globalThis.__state.taster_sessions[0].user_id).toBeNull()
  })
})

describe('snapshot recovery never takes over another account\'s snapshot', () => {
  test('refuses a candidate already linked to a different account', async () => {
    globalThis.__state = makeState({
      candidates: [candidate({ linked_user_id: 'account-2', identity_status: 'account_linked' })],
      tasters: [taster({ user_id: 'account-2' })],
    })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    const body = await res.json()

    expect(body.linked).toBe(0)
    expect(body.conflicts).toBe(1)
    expect(globalThis.__state.taster_sessions[0].user_id).toBe('account-2')
  })

  test('refuses a candidate marked linked to another account even when the taster row is unset', async () => {
    // Isolates the candidate-level guard. In the case above, the taster row also
    // carries the other account's id, so the later taster.user_id check would
    // catch a takeover on its own. Here the taster row is unset, so only the
    // candidate-level check stands between this account and the other's snapshot.
    globalThis.__state = makeState({
      candidates: [candidate({ linked_user_id: 'account-2', identity_status: 'account_linked' })],
      tasters: [taster({ user_id: null })],
    })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    const body = await res.json()

    expect(body.linked).toBe(0)
    expect(body.conflicts).toBe(1)
    expect(globalThis.__state.taster_sessions[0].user_id).toBeNull()
  })

  test('refuses when a verified_match decision names a different account', async () => {
    globalThis.__state = makeState({
      candidates: [candidate()],
      tasters: [taster()],
      reviews: [{
        source_record_type: 'taster',
        source_record_id: 'taster-1',
        candidate_record_id: 'account-2',
        decision: 'verified_match',
        created_at: '2026-10-19T00:00:00.000Z',
      }],
    })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    const body = await res.json()

    expect(body.linked).toBe(0)
    expect(body.conflicts).toBe(1)
    expect(globalThis.__state.taster_sessions[0].user_id).toBeNull()
    // The prior decision must not be overwritten.
    expect(globalThis.__state.identity_reconciliation_reviews).toHaveLength(1)
  })

  test('refuses when the saved name or role does not corroborate', async () => {
    globalThis.__state = makeState({
      candidates: [candidate({ candidate_name: 'Grace Hopper' })],
      tasters: [taster({ name: 'Ada Lovelace' })],
    })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    const body = await res.json()
    expect(body.linked).toBe(0)
    expect(body.conflicts).toBe(1)
    expect(globalThis.__state.taster_sessions[0].user_id).toBeNull()
  })
})

describe('snapshot recovery is safe to retry', () => {
  test('a second run does not relink or duplicate the audit record', async () => {
    globalThis.__state = makeState({ candidates: [candidate()], tasters: [taster()] })
    const { POST } = loadRoute()

    const first = await (await POST(requestWith('Bearer token'))).json()
    const second = await (await POST(requestWith('Bearer token'))).json()

    expect(first.linked).toBe(1)
    // Already linked to this account: nothing changes on the retry.
    expect(second.linked).toBe(0)
    expect(second.reconciled).toBe(1)
    expect(globalThis.__state.identity_reconciliation_reviews).toHaveLength(1)
    expect(globalThis.__state.taster_sessions[0].user_id).toBe('account-1')
  })

  test('a failed journey refresh is reported so the client can retry', async () => {
    globalThis.__state = makeState({
      candidates: [candidate()],
      tasters: [taster()],
      rpcErrors: { refresh_professional_journey: 'journey unavailable' },
    })
    const { POST } = loadRoute()
    const res = await POST(requestWith('Bearer token'))
    expect(res.status).toBe(502)
    const body = await res.json()
    // The snapshot link itself is persisted; the message must not imply total failure.
    expect(body.error).toMatch(/retry/i)
    expect(globalThis.__state.taster_sessions[0].user_id).toBe('account-1')
  })

  test('the journey and readiness refreshes are both attempted', async () => {
    globalThis.__state = makeState({ candidates: [candidate()], tasters: [taster()] })
    const { POST } = loadRoute()
    await POST(requestWith('Bearer token'))
    const rpcs = globalThis.__state.calls.filter((c) => c.op === 'rpc').map((c) => c.name)
    expect(rpcs).toContain('refresh_professional_journey')
    expect(rpcs).toContain('sync_professional_listing_status')
  })
})
