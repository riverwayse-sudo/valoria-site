import { createClient } from '@supabase/supabase-js'
import { PROFESSIONAL_STANDARD_SERIES } from '@/lib/professionalStandardSeries'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BREVO_KEY = process.env.BREVO_API_KEY
const MASTER_LIST_ID = process.env.BREVO_WEBINAR_LIST_ID || process.env.BREVO_LIST_ID
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'info@valoriainstitute.com'
const FROM_NAME = process.env.BREVO_FROM_NAME || 'Valoria Institute'
const sessions = Object.fromEntries(PROFESSIONAL_STANDARD_SERIES.filter(session => !session.replay).map(session => [session.id, session]))

function sessionListId(sessionId) { return process.env[`BREVO_SESSION_${sessionId}_LIST_ID`] || MASTER_LIST_ID }
function escapeHtml(value = '') { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])) }

async function syncToBrevo({ email, fullName, role, organisation, whatsapp, session }) {
  if (!BREVO_KEY) throw new Error('BREVO_NOT_CONFIGURED')
  const [firstName, ...rest] = fullName.split(/\s+/)
  const listId = sessionListId(session.id)
  const attributes = { FIRSTNAME: firstName || '', LASTNAME: rest.join(' ') }
  if (process.env.BREVO_CUSTOM_ATTRIBUTES_ENABLED === 'true') {
    Object.assign(attributes, { ROLE: role || '', ORGANISATION: organisation || '', WHATSAPP: whatsapp || '', EVENT_NAME: `The Professional Standard Series — Session ${session.id}`, EVENT_SESSION: session.id, EVENT_TITLE: session.title, EVENT_DATE: session.start, REGISTRATION_SOURCE: `professional_standard_session_${session.id}` })
  }
  const payload = { email, attributes, updateEnabled: true }
  if (listId) payload.listIds = [Number(listId)]
  const contactResponse = await fetch('https://api.brevo.com/v3/contacts', { method: 'POST', headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!contactResponse.ok) throw new Error(`BREVO_CONTACT_${contactResponse.status}`)

  const first = escapeHtml(firstName || 'there'), title = escapeHtml(session.title), fullNameSafe = escapeHtml(fullName)
  const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({
    sender: { name: FROM_NAME, email: FROM_EMAIL }, to: [{ email, name: fullNameSafe }], replyTo: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `You're registered for Session ${session.id}, ${firstName || 'there'}.`,
    htmlContent: `<div style="font-family:Arial,sans-serif;background:#0F0F1A;color:#F7F4EE;padding:40px"><div style="max-width:560px;margin:auto;background:#1A1A2E;border:1px solid rgba(201,168,76,.25);padding:40px"><p style="color:#C9A84C;letter-spacing:.16em;font-size:11px;font-weight:700">VALORIA INSTITUTE</p><h1 style="font-weight:400">You're registered.</h1><p>Hi ${first},</p><p>Your registration for <strong>Session ${session.id}: ${title}</strong> is confirmed.</p><p style="color:#C9A84C">Virtual · 90 minutes</p><p>We'll send the access details and important updates to this email address.</p></div></div>`,
    tags: ['professional-standard-series', `session-${session.id}`],
  }) })
  if (!emailResponse.ok) console.error('Brevo confirmation email failed:', await emailResponse.text().catch(() => ''))
  return { emailSent: emailResponse.ok }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const sessionId = String(body.session_id || '').trim(), fullName = String(body.full_name || '').trim().slice(0, 120), email = String(body.email || '').trim().toLowerCase().slice(0, 254)
    const role = String(body.role || '').trim().slice(0, 120), organisation = String(body.organisation || '').trim().slice(0, 160), whatsapp = String(body.whatsapp || '').trim().slice(0, 40), consent = body.consent === true
    const session = sessions[sessionId]
    if (!session) return Response.json({ error: 'Invalid session.' }, { status: 400 })
    if (!session.dateApproved) return Response.json({ error: 'Registration is not open for this session yet. The event date is still being confirmed.' }, { status: 409 })
    if (!fullName || !email) return Response.json({ error: 'Name and email are required.' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    if (!consent) return Response.json({ error: 'Please accept the communication consent to register.' }, { status: 400 })
    if (!BREVO_KEY) return Response.json({ error: 'Registration is temporarily unavailable. Please try again shortly.' }, { status: 503 })

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', { p_key: `session-registration:${ip}`, p_max_count: 10, p_window_seconds: 3600 })
    if (!rateLimitError && !allowed) return Response.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 })

    const registration = { session_id: sessionId, full_name: fullName, email, role: role || null, organisation: organisation || null, whatsapp: whatsapp || null, consent: true }
    const { error: saveError } = await supabase.from('professional_standard_event_registrations').upsert(registration, { onConflict: 'session_id,email' })
    if (saveError) { console.error('Session registration save error:', saveError); return Response.json({ error: 'Registration could not be saved. Please try again.' }, { status: 500 }) }

    try {
      const brevo = await syncToBrevo({ email, fullName, role, organisation, whatsapp, session })
      await supabase.from('professional_standard_event_registrations').update({ brevo_synced: true, confirmation_email_sent: brevo.emailSent }).eq('session_id', sessionId).eq('email', email)
      return Response.json({ message: 'Registration confirmed.', ...brevo }, { status: 200 })
    } catch (brevoError) {
      console.error('Brevo registration sync failed:', brevoError)
      return Response.json({ error: 'Your details were saved, but we could not connect to the event mailing system. Please try again shortly.' }, { status: 502 })
    }
  } catch (error) {
    console.error('Session registration API error:', error)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
