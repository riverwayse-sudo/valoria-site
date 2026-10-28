// src/lib/site-url.js
//
// Single source of truth for the site's own public origin.
//
// Every auth redirect (email confirmation, password recovery) must point at a
// domain that is (a) stable for the deployment environment and (b) present in
// the Supabase Auth redirect allowlist. Historically these were hardcoded to
// https://valoriainstitute.com in client signup code, which meant a staging or
// preview deployment sent confirmation emails to the production domain — or,
// when someone "fixed" it by deriving the origin from window.location, sent
// them to a throwaway preview host that is not allowlisted and expires.
//
// Resolution order:
//   1. NEXT_PUBLIC_SITE_URL — the explicit, environment-specific canonical URL.
//      Set this to the staging origin on staging and the production origin on
//      production. This is the intended control point.
//   2. window.location.origin in the browser — correct for whatever host the
//      user is actually on (including Vercel previews), but only used as a
//      fallback so local/dev and unconfigured environments still work.
//   3. The production origin — last-resort fallback for server rendering where
//      no browser origin exists.
//
// CommonJS on purpose: this repo's unit-tested lib modules are CJS, and Next
// interops CJS named imports without issue.

const PRODUCTION_SITE_URL = 'https://valoriainstitute.com'

function normalizeOrigin(origin) {
  if (!origin) return null
  try {
    return new URL(origin).origin
  } catch {
    return null
  }
}

function getSiteOrigin() {
  const configured = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL)
  if (configured) return configured
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return normalizeOrigin(window.location.origin) || PRODUCTION_SITE_URL
  }
  return PRODUCTION_SITE_URL
}

// Absolute URL for a site-relative path (e.g. '/auth/callback').
function siteUrl(pathname = '/') {
  const base = getSiteOrigin()
  return `${base}${String(pathname).startsWith('/') ? pathname : `/${pathname}`}`
}

// Canonical email-confirmation callback for this environment.
function authCallbackUrl(query = {}) {
  const url = new URL(siteUrl('/auth/callback'))
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}

// Canonical password-recovery destination for this environment.
function passwordResetUrl() {
  return siteUrl('/reset-password')
}

module.exports = {
  PRODUCTION_SITE_URL,
  normalizeOrigin,
  getSiteOrigin,
  siteUrl,
  authCallbackUrl,
  passwordResetUrl,
}
