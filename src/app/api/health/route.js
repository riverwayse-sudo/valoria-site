import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const started = Date.now()
  const checks = { database: 'unknown', waitlist: 'unknown', profiles: 'unknown' }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase environment is not configured')

    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const [waitlist, profiles] = await Promise.all([
      supabase.from('waitlist').select('id', { count: 'exact', head: true }),
      supabase.from('professional_profiles').select('id', { count: 'exact', head: true }),
    ])

    checks.database = !waitlist.error && !profiles.error ? 'ok' : 'degraded'
    checks.waitlist = waitlist.error ? 'error' : 'ok'
    checks.profiles = profiles.error ? 'error' : 'ok'

    const healthy = Object.values(checks).every((value) => value === 'ok')
    return Response.json({
      ok: healthy,
      service: 'valoria-site',
      environment: process.env.VERCEL_ENV || 'unknown',
      checks,
      counts: { waitlist: waitlist.count ?? null, profiles: profiles.count ?? null },
      latency_ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    }, { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return Response.json({
      ok: false,
      service: 'valoria-site',
      checks,
      error: error?.message || 'Health check failed',
      latency_ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
