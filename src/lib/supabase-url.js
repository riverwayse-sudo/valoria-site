/**
 * Normalize a Supabase API URL to the project root expected by supabase-js.
 * The REST endpoint is derived internally as /rest/v1 and Auth as /auth/v1.
 */
export function normalizeSupabaseProjectUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Supabase project URL is not configured.')
  }

  const parsed = new URL(value.trim())
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
    throw new Error('Supabase project URL must use HTTPS.')
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('Supabase project URL must not contain credentials, query parameters, or a fragment.')
  }

  parsed.pathname = parsed.pathname
    .replace(/\\/rest\\/v1\\/?$/i, '')
    .replace(/\\/+$/, '')

  return parsed.toString().replace(/\\/$/, '')
}
