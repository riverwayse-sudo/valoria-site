// src/app/api/enquiries/route.js
// Real enquiry capture: writes to `enquiries` (so demand-side activity is no
// longer invisible to the platform) and notifies info@valoriainstitute.com
// via Brevo. Previously the "REQUEST INTRO" / "BOOK SPEAKER" / "REQUEST
// FACILITATOR" buttons were plain mailto: links — no DB record, no admin
// visibility, no way to measure conversion. This is the fix.

import { createClient } from '@supabase/supabase-js'
import { getConsentVerifiedPublicProfile } from '@/lib/public-profile'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase server configuration is missing.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

const TYPE_LABELS = {
  candidate: 'Candidate Introduction',
  speaker_booking: 'Speaker Booking',
  facilitator_commission: 'Facilitator Commission',
  training: 'Valoria Develop Programme Enquiry',
  general: 'General Enquiry',
}

const escapeHtml = value => String(value ?? '').replace(/[&<>\"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[char]))

async function notifyAdmin({ enquiryType, atbId, buyerName, buyerEmail, buyerCompany, subject, body }) {
  if (!BREVO_KEY) return
  const label = TYPE_LABELS[enquiryType] || 'Enquiry'
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">NEW ${label.toUpperCase()}</p>
      <p><strong>Professional:</strong> ${escapeHtml(atbId)}</p>
      <p><strong>From:</strong> ${escapeHtml(buyerName)} &lt;${escapeHtml(buyerEmail)}&gt;${buyerCompany ? ` — ${escapeHtml(buyerCompany)}` : ''}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject || '(none given)')}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(body || '').replace(/\n/g, '<br/>')}</p>
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
      <p>Hi ${escapeHtml(buyerName.split(' ')[0] || 'there')},</p>
      <p>We've received your ${label.toLowerCase()} regarding <strong>${escapeHtml(atbId)}</strong>. Valoria Institute facilitates all introductions — someone from our team will be in touch shortly.</p>
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

async function notifyProfessional(supabase, { professionalProfileId, enquiryType, atbId, buyerName, buyerCompany, actionUrl }) {
  // In-app bell notification — goes in platform_notifications, the table
  // NotificationBell.jsx actually reads (see that file's fix note).
  const label = TYPE_LABELS[enquiryType] || 'Enquiry'
  const { error: notifError } = await supabase.from('platform_notifications').insert([{
    user_id: professionalProfileId,
    type: 'enquiry',
    title: `New ${label.toLowerCase()}`,
    body: `${buyerName}${buyerCompany ? ` (${buyerCompany})` : ''} wants to connect with you.`,
    action_url: actionUrl,
  }])
  if (notifError) console.error('Enquiry professional in-app notify failed:', notifError)

  if (!BREVO_KEY) return
  // The professional's email lives on auth.users, not professional_profiles.
  const { data: userRow, error: userErr } = await supabase.auth.admin.getUserById(professionalProfileId)
  if (userErr || !userRow?.user?.email) {
    console.error('Enquiry professional email lookup failed:', userErr)
    return
  }
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">NEW ${label.toUpperCase()}</p>
      <p>${escapeHtml(buyerName)}${buyerCompany ? ` from ${escapeHtml(buyerCompany)}` : ''} has requested an introduction through Valoria Institute.</p>
      <p>Valoria will review and be in touch with next steps — no action needed from you right now.</p>
      <p style="margin-top:20px;"><a href="https://valoriainstitute.com${actionUrl}">View your profile</a></p>
    </div>`
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: userRow.user.email }],
      subject: `New ${label.toLowerCase()} — ${atbId}`,
      htmlContent: html,
      tags: ['enquiry-professional-notify', enquiryType],
    }),
  })
  if (!res.ok) console.error('Enquiry professional email notify failed:', res.status, await res.text().catch(() => ''))
}

export async function POST(request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const {
      professional_profile_id,
      enquiry_type,
      buyer_name,
      buyer_email,
      buyer_company,
      subject,
      message,
    } = body

    const allowedTypes = ['candidate', 'speaker_booking', 'facilitator_commission', 'training', 'general']
    if (!enquiry_type || !allowedTypes.includes(enquiry_type)) {
      return Response.json({ error: 'Select a valid enquiry type.' }, { status: 400 })
    }
    if (!buyer_name?.trim() || !buyer_email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(buyer_email.trim())) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    let buyerUserId = null
    const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim()
    if (token) {
      const { data: authData, error: authError } = await supabase.auth.getUser(token)
      if (authError || !authData?.user?.id) {
        return Response.json({ error: 'Your session could not be verified. Please sign in again.' }, { status: 401 })
      }
      buyerUserId = authData.user.id
    }

    let profile = null
    if (professional_profile_id) {
      try {
        profile = await getConsentVerifiedPublicProfile(professional_profile_id)
      } catch (error) {
        console.error('Enquiry target profile verification failed:', error)
        return Response.json({ error: 'The professional profile could not be verified.' }, { status: 503 })
      }
      if (!profile) {
        return Response.json({ error: 'This professional is not currently accepting public enquiries.' }, { status: 404 })
      }
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_key: `enquiry:${ip}`, p_max_count: 5, p_window_seconds: 3600,
    })
    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError)
    } else if (!allowed) {
      return Response.json({ error: 'Too many requests from this connection — please try again later.' }, { status: 429 })
    }

    const atbId = profile?.atb_id || (enquiry_type === 'training' ? 'Valoria Develop' : 'Valoria Institute')
    const { error } = await supabase.from('enquiries').insert([{
      buyer_user_id: buyerUserId,
      buyer_name: buyer_name.trim(),
      buyer_email: buyer_email.trim().toLowerCase(),
      buyer_company: buyer_company?.trim() || null,
      professional_profile_id: profile?.id || null,
      subject: subject?.trim() || null,
      body: message.trim(),
      enquiry_type,
      status: 'pending',
    }])

    if (error) {
      console.error('Enquiry insert error:', error)
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    notifyAdmin({
      enquiryType: enquiry_type,
      atbId,
      buyerName: buyer_name.trim(),
      buyerEmail: buyer_email.trim(),
      buyerCompany: buyer_company?.trim(),
      subject,
      body: message,
    }).catch(error => console.error('notifyAdmin error:', error))

    confirmToBuyer({
      enquiryType: enquiry_type,
      atbId,
      buyerName: buyer_name.trim(),
      buyerEmail: buyer_email.trim(),
    }).catch(error => console.error('confirmToBuyer error:', error))

    if (profile?.id) {
      notifyProfessional(supabase, {
        professionalProfileId: profile.id,
        enquiryType: enquiry_type,
        atbId,
        buyerName: buyer_name.trim(),
        buyerCompany: buyer_company?.trim(),
        actionUrl: `/profile/${profile.atb_id || profile.id}`,
      }).catch(error => console.error('notifyProfessional error:', error))
    }

    return Response.json({ message: 'Enquiry received.' }, { status: 200 })
  } catch (err) {
    console.error('Enquiries API error:', err)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
