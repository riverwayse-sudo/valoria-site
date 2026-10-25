// src/lib/supabase-url.js
//
// Validated Supabase URL resolution.
//
// @supabase/supabase-js / @supabase/ssr throw synchronously on a malformed URL
// ("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL."). Several modules
// build their client at import time, so a bad or missing value did not just
// disable Supabase — it crashed the module and turned the whole route into a
// 500 (observed on /certificate/[token], /profile/[id] and, via middleware,
// every page on the site).
//
// A configuration problem must degrade to "no data" rather than "site down".
// resolveSupabaseUrl() returns the configured value only when it is a real
// http(s) URL, and the placeholder otherwise. The placeholder resolves nothing,
// so callers naturally produce empty results instead of throwing.
//
// CommonJS, matching the other src/lib helpers, so it is directly unit-testable
// and importable from both server and client modules.

'use strict'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'

function resolveSupabaseUrl(value) {
  if (value) {
    try {
      const parsed = new URL(value)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return value
    } catch {
      // not a URL at all — fall through to the placeholder
    }
  }
  return PLACEHOLDER_URL
}

module.exports = { PLACEHOLDER_URL, resolveSupabaseUrl }
