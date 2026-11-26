import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function fail(message, status) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) return fail('The confirmation service is not configured.', 503)

  let body
  try { body = await request.json() } catch { return fail('Invalid confirmation request.', 400) }
  const tasterId = String(body?.taster_id || '')
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tasterId)) {
    return fail('The completed Taster reference is invalid.', 400)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: taster, error: tasterError } = await admin.from('taster_sessions')
    .select('id,name,role,completed_at,lead_capture_id')
    .eq('id', tasterId)
    .maybeSingle()
  if (tasterError) return fail('We could not verify your completed Taster.', 502)
  if (!taster?.completed_at || !taster.lead_capture_id) return fail('Complete your Taster before requesting email confirmation.', 409)

  const { data: candidate, error: candidateError } = await admin.from('taster_identity_candidates')
    .select('candidate_name,candidate_role,candidate_email,lead_capture_id')
    .eq('taster_id', tasterId)
    .maybeSingle()
  if (candidateError) return fail('We could not verify the Taster registration identity.', 502)
  if (!candidate?.candidate_email || candidate.lead_capture_id !== taster.lead_capture_id ||
      candidate.candidate_name !== taster.name || candidate.candidate_role !== taster.role) {
    return fail('The completed Taster does not match its registered account details. Contact Valoria support.', 403)
  }

  const { data: lead, error: leadError } = await admin.from('lead_captures')
    .select('id,email,external_id,source')
    .eq('id', taster.lead_capture_id)
    .maybeSingle()
  if (leadError) return fail('We could not verify your registration record.', 502)
  const match = /^valu-taster:([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.exec(String(lead?.external_id || ''))
  const email = String(candidate.candidate_email).trim().toLowerCase()
  if (!match || lead?.source !== 'valu_taster_signup' || String(lead.email || '').trim().toLowerCase() !== email) {
    return fail('The registration record cannot be securely matched to an account. Contact Valoria support.', 403)
  }

  const { data: authData, error: authError } = await admin.auth.admin.getUserById(match[1])
  const user = authData?.user
  if (authError || !user || String(user.email || '').trim().toLowerCase() !== email) {
    return fail('The registered Valoria account could not be verified.', 403)
  }
  if (user.email_confirmed_at) {
    return NextResponse.json({ already_confirmed: true }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const publicClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const redirect = new URL('/auth/callback', request.url)
  redirect.searchParams.set('pending_taster_id', tasterId)
  const { error: resendError } = await publicClient.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: redirect.toString() },
  })
  if (resendError) {
    console.error('VALU Taster confirmation request failed:', resendError.message)
    return fail('Your confirmation email could not be sent right now. Please retry shortly.', 503)
  }
  return NextResponse.json({ sent: true }, { headers: { 'Cache-Control': 'no-store' } })
}
