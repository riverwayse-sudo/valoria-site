import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BREVO_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME = 'Valoria Institute'

export async function POST(request) {
  try {
    const body = await request.json()
    const { full_name, email, phone, role, interest, source = 'event_session_02' } = body

    if (!full_name?.trim() || !email?.trim() || !phone?.trim()) {
      return Response.json({ error: 'Name, email and contact number are required.' }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRe = /^\+?[0-9\s().-]{7,20}$/
    if (!emailRe.test(email.trim())) return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    if (!phoneRe.test(phone.trim())) return Response.json({ error: 'Please enter a valid contact number.' }, { status: 400 })

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()
    const cleanName = full_name.trim()

    const { error: dbError } = await supabase.from('waitlist').upsert([{
      full_name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: role?.trim() || null,
      interest: interest || null,
      type: 'event',
      source,
    }], { onConflict: 'email' })

    if (dbError) {
      console.error('Event registration database error:', dbError)
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    if (BREVO_KEY && BREVO_LIST_ID) {
      const [firstName, ...rest] = cleanName.split(' ')
      const attributes = {
        FIRSTNAME: firstName || '',
        LASTNAME: rest.join(' ') || '',
        PHONE: cleanPhone,
        ROLE: role?.trim() || '',
        INTEREST: interest || '',
        SOURCE: source,
        EVENT_NAME: 'Strategic Thinking: You Are Solving the Wrong Problems',
        EVENT_DATE: 'Saturday, 26 September 2026 — 10:00–11:30 AM WAT',
      }

      const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          attributes,
          listIds: [Number(BREVO_LIST_ID)],
          updateEnabled: true,
        }),
      })

      if (!brevoRes.ok) {
        const detail = await brevoRes.text().catch(() => '')
        console.error('Brevo event registration sync failed:', brevoRes.status, detail)
      }
    }

    return Response.json({ message: 'Registration received.' }, { status: 200 })
  } catch (error) {
    console.error('Event registration error:', error)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
