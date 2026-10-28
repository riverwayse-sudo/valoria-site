import { createBrowserClient } from '@supabase/ssr'
import { resolveSupabaseUrl } from '@/lib/supabase-url'

// Use placeholder values at build time — real values come from Vercel env vars at runtime.
// The client is only used in 'use client' components (browser) where real env vars are injected.
//
// resolveSupabaseUrl validates the value first: createBrowserClient throws
// synchronously on a malformed URL, and because this module is evaluated at
// import time that throw surfaced as an unhandled rejection during server
// rendering of every page that imports it (including /auth/callback). A bad or
// missing value must degrade to the placeholder, not crash the render.
const supabaseUrl = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// createBrowserClient (rather than plain createClient) writes the session to
// a `sb-*-auth-token` cookie in addition to localStorage. middleware.js and
// the /api/notifications, /api/saved-searches, /api/enquiries routes already
// read that cookie to identify the signed-in user server-side — with the
// plain client, that cookie was never actually set, so those server-side
// checks always saw "no session" regardless of whether the person was
// signed in. This was silently breaking the profile-completeness redirect
// gate and every cookie-authenticated API route, and is the most likely
// cause of people appearing to get signed out when moving between
// server-rendered and client-rendered pages (e.g. profile -> marketplace):
// the browser still had a valid session, but the server side of the app
// couldn't see it.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
