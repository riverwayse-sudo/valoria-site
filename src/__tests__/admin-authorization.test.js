const { authorizeAdmin } = require('../lib/server/admin-auth.cjs')

function makeRequest(authorization) {
  return { headers: { get: () => authorization } }
}

function makeSupabase({ user, authError, admin, adminError, thrown } = {}) {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    maybeSingle: jest.fn(async () => {
      if (thrown) throw thrown
      return { data: admin ?? null, error: adminError ?? null }
    }),
  }
  return {
    client: {
      auth: {
        getUser: jest.fn(async token => {
          if (thrown) throw thrown
          return { data: { user: user ?? null }, error: authError ?? null }
        }),
      },
      from: jest.fn(() => query),
    },
    query,
  }
}

describe('authorizeAdmin', () => {
  test('rejects missing and malformed bearer credentials before database access', async () => {
    const { client } = makeSupabase()
    const missing = await authorizeAdmin(makeRequest(null), client)
    const malformed = await authorizeAdmin(makeRequest('Basic abc'), client)
    expect(missing.response.status).toBe(401)
    expect(malformed.response.status).toBe(401)
    expect(client.auth.getUser).not.toHaveBeenCalled()
    expect(client.from).not.toHaveBeenCalled()
  })

  test('passes only the extracted bearer token to Supabase', async () => {
    const { client } = makeSupabase({ user: { id: 'user-1' }, admin: { id: 'user-1' } })
    const result = await authorizeAdmin(makeRequest('Bearer valid-token'), client)
    expect(client.auth.getUser).toHaveBeenCalledWith('valid-token')
    expect(result.user).toEqual({ id: 'user-1' })
    expect(result.response).toBeNull()
  })

  test('rejects invalid sessions with 401 and does not query admin membership', async () => {
    const { client } = makeSupabase({ authError: new Error('invalid token') })
    const result = await authorizeAdmin(makeRequest('Bearer bad-token'), client)
    expect(result.response.status).toBe(401)
    expect(client.from).not.toHaveBeenCalled()
  })

  test('rejects authenticated non-admin users with 403', async () => {
    const { client } = makeSupabase({ user: { id: 'user-2' }, admin: null })
    const result = await authorizeAdmin(makeRequest('Bearer valid-token'), client)
    expect(result.response.status).toBe(403)
    expect(client.from).toHaveBeenCalledWith('admin_users')
  })

  test('fails closed when administrator membership cannot be verified', async () => {
    const { client } = makeSupabase({
      user: { id: 'user-3' },
      adminError: new Error('database unavailable'),
    })
    const result = await authorizeAdmin(makeRequest('Bearer valid-token'), client)
    expect(result.response.status).toBe(500)
    expect(result.user).toBeNull()
  })

  test('allows a verified administrator', async () => {
    const user = { id: 'admin-1', email: 'admin@example.com' }
    const { client, query } = makeSupabase({ user, admin: { id: 'admin-1' } })
    const result = await authorizeAdmin(makeRequest('Bearer valid-token'), client)
    expect(query.select).toHaveBeenCalledWith('id')
    expect(query.eq).toHaveBeenCalledWith('id', 'admin-1')
    expect(result).toEqual({ user, response: null })
  })
})
