import { createClient } from '@supabase/supabase-js'
import { getSessionState } from '@/lib/professionalStandardSeries'
import { EVENT_SESSIONS, syncEventRegistrationToBrevo } from '@/lib/eventRegistrationBrevo'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role configuration is missing.')
  return createClient(url, key)
}

function normaliseError(error) { return String(error?.message || 'BREVO_SYNC_FAILED').slice(0, 160) }

export async function POST(request) {
  try {
    const body = await request.json()
    const sessionId = String(body.session_id || '').trim()
    const fullName = String(body.full_name || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 254)
    const role = String(body.role || '').trim().slice(0, 120)
    const organisation = String(body.organisation || '').trim().slice(0, 160)
    const whatsapp = String(body.whatsapp || '').trim().slice(0, 40)
    const consent = body.consent === true
    const session = EVENT_SESSIONS[sessionId]

    if (!session) return Response.json({ error: 'Invalid session.' }, { status: 400 })
    if (getSessionState(session) !== 'registration-open') return Response.json({ error: 'Registration is not open for this session.' }, { status: 409 })
    if (!fullName || !email) return Response.json({ error: 'Name and email are required.' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    if (!consent) return Response.json({ error: 'Please accept the communication consent to register.' }, { status: 400 })

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
    const { data: allowed, error: rateLimitError } = await getSupabase().rpc('check_rate_limit', {
      p_key: `session-registration:${ip}`, p_max_count: 10, p_window_seconds: 3600,
    })
    if (!rateLimitError && !allowed) return Response.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 })

    const registration = {
      session_id: sessionId, full_name: fullName, email,
      role: role || null, organisation: organisation || null, whatsapp: whatsapp || null, consent: true,
    }
    const { error: saveError } = await supabase
      .from('professional_standard_event_registrations')
      .upsert(registration, { onConflict: 'session_id,email' })
    if (saveError) {
      console.error('Session registration save error:', saveError)
      return Response.json({ error: 'Registration could not be saved. Please try again.' }, { status: 500 })
    }

    const { data: savedRow } = await supabase
      .from('professional_standard_event_registrations')
      .select('brevo_attempt_count')
      .eq('session_id', sessionId)
      .eq('email', email)
      .maybeSingle()
    const nextAttemptCount = Number(savedRow?.brevo_attempt_count || 0) + 1

    await supabase
      .from('professional_standard_event_registrations')
      .update({ brevo_last_attempt_at: new Date().toISOString(), brevo_attempt_count: nextAttemptCount })
      .eq('session_id', sessionId)
      .eq('email', email)

    try {
      const brevo = await syncEventRegistrationToBrevo({ email, fullName, role, organisation, whatsapp, session })
      await getSupabase().from('professional_standard_event_registrations').update({
        brevo_synced: brevo.synced, confirmation_email_sent: brevo.emailSent, brevo_last_error: brevo.errorCode,
      }).eq('session_id', sessionId).eq('email', email)

      return Response.json({
        message: brevo.synced
          ? 'Registration confirmed.'
          : 'Registration confirmed. Confirmation delivery is being retried automatically.',
        brevo_synced: brevo.synced,
        confirmation_email_sent: brevo.emailSent,
      })
    } catch (brevoError) {
      const syncError = normaliseError(brevoError)
      console.warn('Brevo registration sync deferred:', syncError)
      await getSupabase().from('professional_standard_event_registrations').update({
        brevo_synced: false, confirmation_email_sent: false, brevo_last_error: syncError,
      }).eq('session_id', sessionId).eq('email', email)

      return Response.json({
        message: 'Registration confirmed. Confirmation delivery is being retried automatically.',
        brevo_synced: false, confirmation_email_sent: false,
      })
    }
  } catch (error) {
    console.error('Session registration API error:', error)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
