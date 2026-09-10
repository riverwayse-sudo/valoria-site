import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BREVO_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_WEBINAR_LIST_ID || process.env.BREVO_LIST_ID
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME = 'Valoria Institute'

const sessions = {
  '02': {
    title: 'Strategic Thinking: You Are Solving the Wrong Problems',
    start: 'September 26, 2026 — 10:00 AM WAT',
  },
  '03': {
    title: 'Execution Without Burnout: Why High Performers Plateau',
    start: 'October 17, 2026 — 10:00 AM WAT',
  },
  '04': {
    title: 'Emotional Intelligence Is Not About Being Nice',
    start: 'November 14, 2026 — 10:00 AM WAT',
  },
  '05': {
    title: 'Influence Without Authority: The Real Currency of Organisational Power',
    start: 'December 05, 2026 — 10:00 AM WAT',
  },
}

async function syncRegistration(email, fullName, role, organisation, session) {
  if (!BREVO_KEY) return
  const [firstName, ...rest] = fullName.split(' ')
  const attributes = {
    FIRSTNAME: firstName || '',
    LASTNAME: rest.join(' '),
    ROLE: role || '',
    ORGANISATION: organisation || '',
    EVENT_NAME: `The Professional Standard Series — Session ${session.id}`,
    EVENT_SESSION: session.id,
    EVENT_TITLE: session.title,
    EVENT_DATE: session.start,
    SOURCE: `professional_standard_session_${session.id}`,
  }

  const payload = { email, attributes, updateEnabled: true }
  if (BREVO_LIST_ID) payload.listIds = [Number(BREVO_LIST_ID)]

  const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!contactResponse.ok) {
    console.error('Brevo event registration sync failed:', await contactResponse.text().catch(() => ''))
  }

  const first = firstName || 'there'
  const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: fullName }],
      replyTo: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `You're registered for Session ${session.id}, ${first}.`,
      htmlContent: `<div style="font-family:Arial,sans-serif;background:#0F0F1A;color:#F7F4EE;padding:40px"><div style="max-width:560px;margin:auto;background:#1A1A2E;border:1px solid rgba(201,168,76,.25);padding:40px"><p style="color:#C9A84C;letter-spacing:.16em;font-size:11px;font-weight:700">VALORIA INSTITUTE</p><h1 style="font-weight:400">You're registered.</h1><p>Hi ${first},</p><p>Your registration for <strong>Session ${session.id}: ${session.title}</strong> is confirmed.</p><p style="color:#C9A84C">${session.start} · Virtual · 90 minutes</p><p>We'll send the access details and any important updates to this email address.</p></div></div>`,
      tags: ['professional-standard-series', `session-${session.id}`],
    }),
  })
  if (!emailResponse.ok) console.error('Brevo registration email failed:', await emailResponse.text().catch(() => ''))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const fullName = String(body.full_name || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 254)
    const role = String(body.role || '').trim().slice(0, 120)
    const organisation = String(body.organisation || '').trim().slice(0, 160)
    const session = sessions[String(body.session_id || '').trim()]

    if (!session) return Response.json({ error: 'Invalid session.' }, { status: 400 })
    if (!fullName || !email) return Response.json({ error: 'Name and email are required.' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_key: `session-registration:${ip}`,
      p_max_count: 10,
      p_window_seconds: 3600,
    })
    if (!rateLimitError && !allowed) return Response.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 })

    const { error } = await supabase.from('professional_standard_event_registrations').insert({
      session_id: String(body.session_id).trim(),
      full_name: fullName,
      email,
      role: role || null,
      organisation: organisation || null,
    })

    if (error?.code === '23505') return Response.json({ error: 'This email is already registered for this session.' }, { status: 409 })
    if (error) {
      console.error('Session registration insert error:', error)
      return Response.json({ error: 'Registration could not be saved. Please try again.' }, { status: 500 })
    }

    syncRegistration(email, fullName, role, organisation, { ...session, id: body.session_id }).catch((err) => console.error('Registration notification error:', err))

    return Response.json({ message: 'Registration confirmed.' }, { status: 200 })
  } catch (error) {
    console.error('Session registration API error:', error)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
