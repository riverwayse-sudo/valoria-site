// src/app/api/admin/introduce/route.js
//
// Per Femi's explicit direction (10 Aug): in-app messaging isn't a chat
// system — when a buyer's enquiry needs an introduction, admin reviews it
// and makes the connection via the website, in a defined format. Until
// now, "Mark as Introduced" in the admin queue only changed a status label
// (see admin/page.jsx updateMessageStatus) — nothing actually connected the
// two parties. This route is the real action: it sends both sides a proper
// introduction email with each other's contact details, then marks the
// enquiry introduced. This IS the "format" — a real, unauthenticated-caller-
// proof, admin-gated action, not a bare status flip.
//
// This is a genuinely privileged action (exposes both parties' contact
// info to each other), so unlike the admin page's other actions it's gated
// server-side, not left to the client-side ADMIN_EMAILS check alone.

import { createClient } from '@supabase/supabase-js'
import { ADMIN_EMAILS } from '@/lib/adminEmails'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

const TYPE_LABELS = {
  candidate: 'Introduction',
  speaker_booking: 'Speaker Booking',
  facilitator_commission: 'Facilitator Commission',
}

async function sendEmail({ to, toName, subject, html, tags }) {
  if (!BREVO_KEY) { console.error('admin/introduce: BREVO_API_KEY not set, skipping send.'); return false }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to, name: toName || undefined }],
      subject, htmlContent: html, tags,
    }),
  })
  if (!res.ok) console.error('admin/introduce send failed:', res.status, await res.text().catch(() => ''))
  return res.ok
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data: callerData, error: callerErr } = await supabase.auth.getUser(token)
    if (callerErr || !callerData?.user?.email || !ADMIN_EMAILS.includes(callerData.user.email)) {
      return Response.json({ error: 'Not authorized.' }, { status: 403 })
    }

    const { enquiryId } = await request.json()
    if (!enquiryId) return Response.json({ error: 'enquiryId is required.' }, { status: 400 })

    const { data: enquiry, error: enqErr } = await supabase
      .from('enquiries')
      .select('*, professional:professional_profile_id ( id, display_name, phone, active_tracks )')
      .eq('id', enquiryId)
      .single()
    if (enqErr || !enquiry) return Response.json({ error: 'Enquiry not found.' }, { status: 404 })

    const { data: profUser, error: profUserErr } = await supabase.auth.admin.getUserById(enquiry.professional_profile_id)
    if (profUserErr || !profUser?.user?.email) {
      return Response.json({ error: "Could not look up the professional's contact email." }, { status: 500 })
    }

    const label = TYPE_LABELS[enquiry.enquiry_type] || 'Introduction'
    const profName = enquiry.professional?.display_name || 'the professional'
    const profEmail = profUser.user.email
    const profPhone = enquiry.professional?.phone || null

    const toBuyerHtml = `
      <div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1A1A2E;max-width:520px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">${label.toUpperCase()} — INTRODUCTION</p>
        <p>Hi ${enquiry.buyer_name?.split(' ')[0] || 'there'},</p>
        <p>You're introduced. Here's how to reach <strong>${profName}</strong> directly:</p>
        <p style="background:#F7F4EE;padding:16px;margin:16px 0;">
          <strong>Email:</strong> ${profEmail}<br/>
          ${profPhone ? `<strong>Phone:</strong> ${profPhone}<br/>` : ''}
        </p>
        <p>Your original message has been shared with them. Please reference "${label}" when you follow up.</p>
        <p style="color:#888;font-size:12px;">Valoria Institute &middot; African Talent Bureau Ltd &middot; Lagos, Nigeria</p>
      </div>`

    const toProfHtml = `
      <div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1A1A2E;max-width:520px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">${label.toUpperCase()} — INTRODUCTION</p>
        <p>Hi ${profName.split(' ')[0]},</p>
        <p>You're introduced. Here's who reached out and how to reach them:</p>
        <p style="background:#F7F4EE;padding:16px;margin:16px 0;">
          <strong>Name:</strong> ${enquiry.buyer_name}<br/>
          <strong>Email:</strong> ${enquiry.buyer_email}<br/>
          ${enquiry.buyer_company ? `<strong>Company:</strong> ${enquiry.buyer_company}<br/>` : ''}
        </p>
        <p><strong>Their message:</strong><br/>${(enquiry.body || '').replace(/\n/g, '<br/>')}</p>
        <p style="color:#888;font-size:12px;">Valoria Institute &middot; African Talent Bureau Ltd &middot; Lagos, Nigeria</p>
      </div>`

    const [buyerSent, profSent] = await Promise.all([
      sendEmail({ to: enquiry.buyer_email, toName: enquiry.buyer_name, subject: `You're introduced to ${profName}`, html: toBuyerHtml, tags: ['introduction', enquiry.enquiry_type] }),
      sendEmail({ to: profEmail, toName: profName, subject: `You're introduced — ${label}`, html: toProfHtml, tags: ['introduction', enquiry.enquiry_type] }),
    ])

    const { error: updateErr } = await supabase.from('enquiries').update({ status: 'introduced' }).eq('id', enquiryId)
    if (updateErr) console.error('admin/introduce: status update failed', updateErr)

    return Response.json({ introduced: true, buyerEmailSent: buyerSent, professionalEmailSent: profSent })
  } catch (err) {
    console.error('admin/introduce error:', err)
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
