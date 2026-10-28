// src/lib/supabase-server.js
//
// Server-only Supabase clients.
//
// Several server routes used to build their client with
//   key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// which silently downgraded a privileged operation to the public anonymous role
// whenever the service-role key was missing or misnamed in an environment. That
// failure mode is dangerous precisely because it is quiet: the route keeps
// responding, but RLS now decides the outcome, so behaviour differs between
// environments and misconfiguration looks like a data problem.
//
// getPrivilegedClient() fails closed instead: a privileged route that cannot
// obtain the service-role key throws a clear configuration error rather than
// running with a weaker identity. Callers that can degrade gracefully (public
// read-only surfaces) catch the error and return their own fallback response.
//
// CommonJS so the helper is unit-testable in the same way as the other libs.

const { createClient } = require('@supabase/supabase-js')

function hasPrivilegedCredentials() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function getPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Privileged Supabase credentials are not configured for this environment.')
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

module.exports = { hasPrivilegedCredentials, getPrivilegedClient }
