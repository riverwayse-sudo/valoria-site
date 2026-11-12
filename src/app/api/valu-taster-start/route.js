import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { getValuAssessmentOrigin } from '@/lib/valu-origin'

const HANDOFF_TTL_SECONDS = 60

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return json({ error: 'Authentication service is not configured.' }, 503)

  const authorization = request.headers.get('authorization') || ''
  const accessToken = authorization.replace(/^Bearer\\s+/i, '').trim()
  if (!accessToken) return json({ error: 'Sign in to your confirmed Valoria account first.' }, 401)

  const verifier = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await verifier.auth.getUser(accessToken)
  if (error || !data?.user) return json({ error: 'Your Valoria session could not be verified. Sign in again.' }, 401)
  const user = data.user
  if (!user.email_confirmed_at || !user.email) {
    return json({ error: 'Confirm your Valoria account email before starting the taster.' }, 403)
  }

  const assessmentOrigin = getValuAssessmentOrigin(process.env)
  if (!assessmentOrigin) return json({ error: 'The assessment environment is not configured for this site.' }, 503)

  const handoffCode = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(handoffCode).digest('hex')
  const expiresAt = new Date(Date.now() + HANDOFF_TTL_SECONDS * 1000).toISOString()
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error: insertError } = await admin.from('valoria_reentry_links').insert({
    user_id: user.id,
    token: tokenHash,
    entry_point: 'taster_start',
    target_stage: 'taster',
    source: 'confirmed_account_signup',
    source_id: user.id,
    expires_at: expiresAt,
  })
  if (insertError) {
    console.error('VALU taster-start handoff issuance failed:', insertError.message)
    return json({ error: 'Secure taster access is temporarily unavailable. Please try again.' }, 503)
  }

  const destination = new URL('/', assessmentOrigin)
  destination.hash = new URLSearchParams({ taster_start_code: handoffCode }).toString()
  return json({ url: destination.toString(), expires_in: HANDOFF_TTL_SECONDS })
}
