import { createBrowserClient } from '@supabase/ssr'
import { normalizeSupabaseProjectUrl } from '@/lib/supabase-url'

// Supabase clients require the project root URL. Some deployment configurations
// accidentally provide the Data REST URL ending in /rest/v1; passing that value
// to supabase-js makes Auth requests resolve to /rest/v1/auth/v1/* (PGRST125).
const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseUrl = normalizeSupabaseProjectUrl(configuredSupabaseUrl)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// createBrowserClient persists the session in cookies and localStorage so the
// middleware and authenticated API routes can read the same session.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
