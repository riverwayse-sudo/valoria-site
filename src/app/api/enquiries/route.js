// src/app/api/enquiries/route.js
// Real enquiry capture: writes to `enquiries` (so demand-side activity is no
// longer invisible to the platform) and notifies info@valoriainstitute.com
// via Brevo. Previously the "REQUEST INTRO" / "BOOK SPEAKER" / "REQUEST
// FACILITATOR" buttons were plain mailto: links — no DB record, no admin
// visibility, no way to measure conversion. This is the fix.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

const TYPE_LABELS = {
  candidate: 'Candidate Introduction',
  speaker_booking: 'Speaker Booking',
  facilitator_commission: 'Facilitator Commission',
}

async function notifyAdmin({ enquiryType, atbId, buyerName, buyerEmail, buyerCompany, subject, body }) {
  if (!BREVO_KEY) return
  const label = TYPE_LABELS[enquiryType] || 'Enquiry'
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">NEW ${label.toUpperCase()}</p>
      <p><strong>Professional:</strong> ${atbId}</p>
      <p><strong>From:</strong> ${buyerName} &lt;${buyerEmail}&gt;${buyerCompany ? ` — ${buyerCompany}` : ''}</p>
      <p><strong>Subject:</strong> ${subject || '(none given)'}</p>
      <p><strong>Message:</strong><br/>${(body || '').replace(/\n/g, '<br/>')}</p>
      <p style="margin-top:20px;"><a href="https://valoriainstitute.com/admin">Review in admin dashboard</a></p>
    </div>`
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: FROM_EMAIL, name: FROM_NAME }],
      replyTo: { email: buyerEmail, name: buyerName },
      subject: `${label} — ${atbId}`,
      htmlContent: html,
      tags: ['enquiry', enquiryType],
    }),
  })
  if (!res.ok) console.error('Enquiry admin notify failed:', res.status, await res.text().catch(() => ''))
}

async function confirmToBuyer({ enquiryType, atbId, buyerName, buyerEmail }) {
  if (!BREVO_KEY) return
  const label = TYPE_LABELS[enquiryType] || 'enquiry'
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1A1A2E;">
      <p>Hi ${buyerName.split(' ')[0] || 'there'},</p>
      <p>We've received your ${label.toLowerCase()} regarding <strong>${atbId}</strong>. Valoria Institute facilitates all introductions — someone from our team will be in touch shortly.</p>
      <p style="color:#888;font-size:12px;">Valoria Institute · African Talent Bureau Ltd · Lagos, Nigeria</p>
    </div>`
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: buyerEmail, name: buyerName }],
      replyTo: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `We've received your ${label.toLowerCase()}`,
      htmlContent: html,
      tags: ['enquiry-confirmation', enquiryType],
    }),
  })
  if (!res.ok) console.error('Enquiry buyer confirm failed:', res.status, await res.text().catch(() => ''))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      professional_profile_id, atb_id, enquiry_type,
      buyer_name, buyer_email, buyer_company,
      subject, message, buyer_user_id,
    } = body

    if (!professional_profile_id || !enquiry_type) {
      return Response.json({ error: 'Missing profile or enquiry type.' }, { status: 400 })
    }
    if (!buyer_name?.trim() || !buyer_email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(buyer_email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (!['candidate', 'speaker_booking', 'facilitator_commission'].includes(enquiry_type)) {
      return Response.json({ error: 'Invalid enquiry type.' }, { status: 400 })
    }

    const { error } = await supabase.from('enquiries').insert([{
      buyer_user_id: buyer_user_id || null,
      buyer_name: buyer_name.trim(),
      buyer_email: buyer_email.trim().toLowerCase(),
      buyer_company: buyer_company?.trim() || null,
      professional_profile_id,
      subject: subject?.trim() || null,
      body: message.trim(),
      enquiry_type,
      status: 'pending',
    }])

    if (error) {
      console.error('Enquiry insert error:', error)
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    const atbId = atb_id || 'a Valoria professional'
    notifyAdmin({ enquiryType: enquiry_type, atbId, buyerName: buyer_name.trim(), buyerEmail: buyer_email.trim(), buyerCompany: buyer_company?.trim(), subject, body: message }).catch(e => console.error('notifyAdmin error:', e))
    confirmToBuyer({ enquiryType: enquiry_type, atbId, buyerName: buyer_name.trim(), buyerEmail: buyer_email.trim() }).catch(e => console.error('confirmToBuyer error:', e))

    return Response.json({ message: 'Enquiry sent.' }, { status: 200 })
  } catch (err) {
    console.error('Enquiries API error:', err)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
