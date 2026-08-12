// src/app/api/facilitate-introduction/route.js
//
// The actual mechanism behind "the admin makes the introduction available."
// Every gated field (phone, salary/fee, LinkedIn, website) has said
// "visible after introduction" since the fixes shipped this session — but
// nothing has ever actually made that happen. Clicking a status pill to
// 'introduced' in admin just changed a label; it never told either party
// anything or revealed anyone's contact details. This route is the missing
// half: it's what a human admin used to have to do by hand (email both
// sides from their own inbox) — now triggered by one action on the
// website, with a consistent format every time.
//
// Sends two emails:
//  - to the buyer, with the professional's contact details
//  - to the professional, with the buyer's contact details
// Then marks the enquiry 'introduced'. Only ever fires once per enquiry —
// re-running it on an already-introduced enquiry is refused, so nobody
// gets a duplicate round of emails from a double-click.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

const TYPE_LABELS = {
  candidate: 'introduction',
  speaker_booking: 'speaker booking',
  facilitator_commission: 'facilitator commission',
}

function introEmailHtml({ heading, intro, name, role, contactLines }) {
  return `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;max-width:520px;margin:0 auto;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 16px;">VALORIA INSTITUTE — INTRODUCTION</p>
      <h1 style="font-size:20px;font-weight:400;margin:0 0 16px;">${heading}</h1>
      <p style="margin:0 0 16px;">${intro}</p>
      <div style="background:#F7F4EE;border:1px solid #E5DFC8;border-radius:6px;padding:20px;margin:0 0 16px;">
        <div style="font-size:15px;font-weight:600;margin-bottom:2px;">${name}</div>
        ${role ? `<div style="font-size:12px;color:#8A8578;margin-bottom:10px;">${role}</div>` : ''}
        ${contactLines.map(l => `<div style="font-size:13px;margin-bottom:4px;">${l}</div>`).join('')}
      </div>
      <p style="margin:0;font-size:12px;color:#8A8578;">Please reach out directly to take things further. Reply to this email if you need anything from Valoria.</p>
      <p style="margin:20px 0 0;font-size:12px;color:#8A8578;">— The Valoria Institute team</p>
    </div>`
}

async function sendEmail(to, subject, html, tag) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      tags: ['facilitate-introduction', tag],
    }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Brevo send failed (${to}): ${res.status} ${errText.slice(0, 200)}`)
  }
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return Response.json({ error: 'Not authenticated.' }, { status: 401 })
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return Response.json({ error: 'Not authenticated.' }, { status: 401 })
  }
  const { data: isAdmin } = await supabase.rpc('is_valoria_admin')
  if (!isAdmin) {
    return Response.json({ error: 'Admin access required.' }, { status: 403 })
  }

  if (!BREVO_KEY) {
    return Response.json({ error: 'Email not configured (BREVO_API_KEY missing).' }, { status: 501 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  const { enquiry_id } = body || {}
  if (!enquiry_id) {
    return Response.json({ error: 'enquiry_id is required.' }, { status: 400 })
  }

  const { data: enquiry, error: enquiryError } = await supabase
    .from('enquiries')
    .select('*')
    .eq('id', enquiry_id)
    .maybeSingle()
  if (enquiryError || !enquiry) {
    return Response.json({ error: 'Enquiry not found.' }, { status: 404 })
  }
  if (enquiry.status === 'introduced' || enquiry.status === 'completed') {
    return Response.json({ error: 'This introduction has already been facilitated — refusing to send it twice.' }, { status: 409 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('professional_profiles')
    .select('display_name, headline, phone, linkedin_url, website_url')
    .eq('id', enquiry.professional_profile_id)
    .maybeSingle()
  if (profileError || !profile) {
    return Response.json({ error: 'Professional profile not found.' }, { status: 404 })
  }

  const { data: profUser, error: profUserError } = await supabase.auth.admin.getUserById(enquiry.professional_profile_id)
  if (profUserError || !profUser?.user?.email) {
    return Response.json({ error: 'Could not look up the professional\u2019s email.' }, { status: 500 })
  }

  const typeLabel = TYPE_LABELS[enquiry.enquiry_type] || 'introduction'

  const buyerContactLines = [
    `Email: ${enquiry.buyer_email}`,
    ...(enquiry.buyer_company ? [`Company: ${enquiry.buyer_company}`] : []),
  ]
  const profContactLines = [
    `Email: ${profUser.user.email}`,
    ...(profile.phone ? [`Phone: ${profile.phone}`] : []),
    ...(profile.linkedin_url ? [`LinkedIn: ${profile.linkedin_url}`] : []),
    ...(profile.website_url ? [`Website: ${profile.website_url}`] : []),
  ]

  try {
    await sendEmail(
      enquiry.buyer_email,
      `Your ${typeLabel} — introduced to ${profile.display_name}`,
      introEmailHtml({
        heading: `You\u2019re introduced.`,
        intro: `Valoria Institute has reviewed your request and is connecting you with ${profile.display_name}.`,
        name: profile.display_name,
        role: profile.headline,
        contactLines: profContactLines,
      }),
      'to-buyer'
    )
    await sendEmail(
      profUser.user.email,
      `You\u2019ve been introduced — ${enquiry.buyer_name}${enquiry.buyer_company ? ` (${enquiry.buyer_company})` : ''}`,
      introEmailHtml({
        heading: `You\u2019re introduced.`,
        intro: `Valoria Institute is connecting you with ${enquiry.buyer_name}, who requested a ${typeLabel}${enquiry.message ? '' : ''}.${enquiry.body ? ` Their message: \u201c${enquiry.body}\u201d` : ''}`,
        name: enquiry.buyer_name,
        role: enquiry.buyer_company || null,
        contactLines: buyerContactLines,
      }),
      'to-professional'
    )
  } catch (err) {
    console.error('Facilitate introduction email failed:', err)
    return Response.json({ error: err.message || 'Sending the introduction emails failed.' }, { status: 502 })
  }

  const { error: updateError } = await supabase
    .from('enquiries')
    .update({ status: 'introduced' })
    .eq('id', enquiry_id)
  if (updateError) {
    console.error('Failed to mark enquiry introduced after sending emails:', updateError)
    return Response.json({ warning: 'Emails sent, but updating the status failed — check the enquiry manually.' }, { status: 200 })
  }

  return Response.json({ ok: true })
}
