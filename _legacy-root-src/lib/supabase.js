import { createClient } from '@supabase/supabase-js'

// Use placeholder values at build time — real values come from Vercel env vars at runtime.
// The client is only used in 'use client' components (browser) where real env vars are injected.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
