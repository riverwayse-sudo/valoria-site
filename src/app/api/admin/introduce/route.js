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
import resendEmail from '@/lib/resend-email.cjs'

const { sendResendEmail, escapeHtml } = resendEmail

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role configuration is missing.')
  return createClient(url, key)
}

const TYPE_LABELS = {
  candidate: 'Introduction',
  speaker_booking: 'Speaker Booking',
  facilitator_commission: 'Facilitator Commission',
}

export async function POST(request) {
  try {
    const supabase = getSupabase()
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data: callerData, error: callerErr } = await supabase.auth.getUser(token)
    if (callerErr || !callerData?.user?.id) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }
    // Checks the same admin_users table middleware.js gates /admin on —
    // this route previously checked the deprecated ADMIN_EMAILS array,
    // which isn't kept in sync with admin_users, so anyone invited as an
    // admin via /admin/signup wouldn't have been recognized here.
    const { data: adminRow } = await supabase.from('admin_users').select('id').eq('id', callerData.user.id).maybeSingle()
    if (!adminRow) {
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
    if (enquiry.status === 'introduced') {
      return Response.json({ introduced: true, alreadyIntroduced: true, buyerEmailSent: false, professionalEmailSent: false }, { status: 200 })
    }

    const { data: profUser, error: profUserErr } = await supabase.auth.admin.getUserById(enquiry.professional_profile_id)
    if (profUserErr || !profUser?.user?.email) {
      return Response.json({ error: "Could not look up the professional's contact email." }, { status: 500 })
    }

    const label = TYPE_LABELS[enquiry.enquiry_type] || 'Introduction'
    const profName = enquiry.professional?.display_name || 'the professional'
    const profEmail = profUser.user.email
    const profPhone = enquiry.professional?.phone || null
    const buyerName = enquiry.buyer_name || 'there'
    const buyerEmail = enquiry.buyer_email
    const buyerCompany = enquiry.buyer_company || ''

    const safeLabel = escapeHtml(label)
    const safeProfName = escapeHtml(profName)
    const safeProfEmail = escapeHtml(profEmail)
    const safeProfPhone = escapeHtml(profPhone || '')
    const safeBuyerFirstName = escapeHtml(buyerName.split(' ')[0] || 'there')
    const safeBuyerName = escapeHtml(buyerName)
    const safeBuyerEmail = escapeHtml(buyerEmail)
    const safeBuyerCompany = escapeHtml(buyerCompany)
    const safeMessage = escapeHtml(enquiry.body || '').replace(/\r?\n/g, '<br/>')

    const toBuyerHtml = `
      <div style="font-family:'Raleway',sans-serif;font-size:14px;line-height:1.7;color:#1A1A2E;max-width:520px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">${safeLabel.toUpperCase()} — INTRODUCTION</p>
        <p>Hi ${safeBuyerFirstName},</p>
        <p>You're introduced. Here's how to reach <strong>${safeProfName}</strong> directly:</p>
        <p style="background:#F7F4EE;padding:16px;margin:16px 0;">
          <strong>Email:</strong> ${safeProfEmail}<br/>
          ${profPhone ? `<strong>Phone:</strong> ${safeProfPhone}<br/>` : ''}
        </p>
        <p>Your original message has been shared with them. Please reference "${safeLabel}" when you follow up.</p>
        <p style="color:#888;font-size:12px;">Valoria Institute &middot; African Talent Bureau Ltd</p>
      </div>`

    const toProfHtml = `
      <div style="font-family:'Raleway',sans-serif;font-size:14px;line-height:1.7;color:#1A1A2E;max-width:520px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">${safeLabel.toUpperCase()} — INTRODUCTION</p>
        <p>Hi ${escapeHtml(profName.split(' ')[0])},</p>
        <p>You're introduced. Here's who reached out and how to reach them:</p>
        <p style="background:#F7F4EE;padding:16px;margin:16px 0;">
          <strong>Name:</strong> ${safeBuyerName}<br/>
          <strong>Email:</strong> ${safeBuyerEmail}<br/>
          ${buyerCompany ? `<strong>Company:</strong> ${safeBuyerCompany}<br/>` : ''}
        </p>
        <p><strong>Their message:</strong><br/>${safeMessage}</p>
        <p style="color:#888;font-size:12px;">Valoria Institute &middot; African Talent Bureau Ltd</p>
      </div>`

    const [buyerSent, profSent] = await Promise.all([
      sendResendEmail({
        to: buyerEmail,
        replyTo: profEmail,
        subject: `You're introduced to ${profName}`,
        html: toBuyerHtml,
        text: `Hi ${buyerName.split(' ')[0] || 'there'},\n\nYou're introduced to ${profName}.\nEmail: ${profEmail}${profPhone ? `\nPhone: ${profPhone}` : ''}\n\nYour original message has been shared with them. Please reference "${label}" when you follow up.\n\nValoria Institute`,
        tags: { category: 'introduction', enquiry_type: enquiry.enquiry_type, recipient_role: 'buyer' },
        idempotencyKey: `valoria/introduction/${enquiryId}/buyer`,
      }),
      sendResendEmail({
        to: profEmail,
        replyTo: buyerEmail,
        subject: `You're introduced — ${label}`,
        html: toProfHtml,
        text: `Hi ${profName.split(' ')[0]},\n\nYou're introduced.\nName: ${buyerName}\nEmail: ${buyerEmail}${buyerCompany ? `\nCompany: ${buyerCompany}` : ''}\n\nTheir message:\n${enquiry.body || ''}\n\nValoria Institute`,
        tags: { category: 'introduction', enquiry_type: enquiry.enquiry_type, recipient_role: 'professional' },
        idempotencyKey: `valoria/introduction/${enquiryId}/professional`,
      }),
    ])

    if (!buyerSent.ok || !profSent.ok) {
      console.error('admin/introduce: both introduction emails must be accepted before status update', {
        buyerStatus: buyerSent.status,
        professionalStatus: profSent.status,
      })
      return Response.json({
        introduced: false,
        buyerEmailSent: buyerSent.ok,
        professionalEmailSent: profSent.ok,
        error: 'Both introduction emails must be accepted before the enquiry can be marked introduced.',
      }, { status: 502 })
    }

    const { error: updateErr } = await supabase.from('enquiries').update({ status: 'introduced' }).eq('id', enquiryId)
    if (updateErr) {
      console.error('admin/introduce: status update failed', updateErr)
      return Response.json({ introduced: false, buyerEmailSent: true, professionalEmailSent: true, error: 'Emails were accepted, but the enquiry status could not be updated. Retry safely.' }, { status: 502 })
    }

    return Response.json({ introduced: true, buyerEmailSent: true, professionalEmailSent: true })
  } catch (err) {
    console.error('admin/introduce error:', err)
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
