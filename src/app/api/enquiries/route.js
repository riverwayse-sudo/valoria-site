// src/app/api/enquiries/route.js
// Real enquiry capture: writes to `enquiries` (so demand-side activity is no
// longer invisible to the platform) and notifies info@valoriainstitute.com
// via Brevo. Previously the "REQUEST INTRO" / "BOOK SPEAKER" / "REQUEST
// FACILITATOR" buttons were plain mailto: links — no DB record, no admin
// visibility, no way to measure conversion. This is the fix.

import { createClient } from '@supabase/supabase-js'
import { getConsentVerifiedPublicProfile } from '@/lib/public-profile'

function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#39;',
  })[character])
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
}

async function notifyAdmin({ enquiryType, atbId, buyerName, buyerEmail, buyerCompany, subject, body }) {
  if (!BREVO_KEY) return
  const label = TYPE_LABELS[enquiryType] || 'Enquiry'
  const safeAtbId = escapeHtml(atbId)
  const safeBuyerName = escapeHtml(buyerName)
  const safeBuyerEmail = escapeHtml(buyerEmail)
  const safeBuyerCompany = escapeHtml(buyerCompany || 'Not provided')
  const safeSubject = escapeHtml(subject || '(none given)')
  const safeBody = escapeHtml(body || '').replace(/\r?\n/g, '<br/>')
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">NEW ${label.toUpperCase()}</p>
      <p><strong>Professional:</strong> ${safeAtbId}</p>
      <p><strong>From:</strong> ${safeBuyerName} &lt;${safeBuyerEmail}&gt;${buyerCompany ? ` — ${safeBuyerCompany}` : ''}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong><br/>${safeBody}</p>
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
  const safeFirstName = escapeHtml(buyerName.split(' ')[0] || 'there')
  const safeAtbId = escapeHtml(atbId)
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1A1A2E;">
      <p>Hi ${safeFirstName},</p>
      <p>We've received your ${label.toLowerCase()} regarding <strong>${safeAtbId}</strong>. Valoria Institute facilitates all introductions — someone from our team will be in touch shortly.</p>
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

async function notifyProfessional({ supabase, professionalProfileId, enquiryType, atbId, buyerName, buyerCompany, actionUrl }) {
  // In-app bell notification — goes in platform_notifications, the table
  // NotificationBell.jsx actually reads (see that file's fix note).
  const label = TYPE_LABELS[enquiryType] || 'Enquiry'
  const safeAtbId = escapeHtml(atbId)
  const safeBuyerName = escapeHtml(buyerName)
  const safeBuyerCompany = escapeHtml(buyerCompany || '')
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
      <p>${safeBuyerName}${buyerCompany ? ` from ${safeBuyerCompany}` : ''} has requested an introduction through Valoria Institute.</p>
      <p>Valoria will review and be in touch with next steps — no action needed from you right now.</p>
      <p style="margin-top:20px;"><a href="https://valoriainstitute.com${actionUrl}">View your profile</a></p>
    </div>`
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: userRow.user.email }],
      subject: `New ${label.toLowerCase()} — ${safeAtbId}`,
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
      professional_profile_id, enquiry_type,
      buyer_name, buyer_email, buyer_company,
      subject, message,
    } = body

    if (!professional_profile_id || !enquiry_type) {
      return Response.json({ error: 'Missing profile or enquiry type.' }, { status: 400 })
    }
    if (typeof buyer_name !== 'string' || typeof buyer_email !== 'string' || typeof message !== 'string' || !buyer_name.trim() || !buyer_email.trim() || !message.trim()) {
      return Response.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }
    const normalizedName = buyer_name.replace(/[\r\n\t]+/g, ' ').trim()
    const normalizedEmail = String(buyer_email).trim().toLowerCase()
    const normalizedCompany = String(typeof buyer_company === 'string' ? buyer_company : '').replace(/[\r\n\t]+/g, ' ').trim()
    const normalizedSubject = String(typeof subject === 'string' ? subject : '').replace(/[\r\n\t]+/g, ' ').trim()
    const normalizedMessage = message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(normalizedEmail)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (normalizedName.length > 120 || normalizedEmail.length > 254 || normalizedCompany.length > 160 || normalizedSubject.length > 180 || normalizedMessage.length > 4000) {
      return Response.json({ error: 'One or more fields are too long. Please shorten your details and try again.' }, { status: 400 })
    }
    if (!['candidate', 'speaker_booking', 'facilitator_commission'].includes(enquiry_type)) {
      return Response.json({ error: 'Invalid enquiry type.' }, { status: 400 })
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(professional_profile_id))) {
      return Response.json({ error: 'This professional profile is not available for introductions.' }, { status: 404 })
    }

    // Rate limiting — this is a public, unauthenticated form (anyone can
    // submit an enquiry without an account), and had zero abuse protection
    // until now. Keyed by IP, not email, since buyer_email is
    // self-reported and trivially spoofable per-request.
    // Trust only headers set by the hosting edge. Do not fall back to
    // caller-controlled X-Forwarded-For values, which can be spoofed to
    // rotate rate-limit keys.
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'unknown'
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_key: `enquiry:${ip}`, p_max_count: 5, p_window_seconds: 3600,
    })
    if (rateLimitError) {
      // Do not bypass abuse controls when the limiter is unavailable.
      // Return an explicit retryable error rather than silently accepting
      // an unthrottled public enquiry.
      console.error('Rate limit check failed:', rateLimitError)
      return Response.json({ error: 'Enquiry service is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    }
    if (!allowed) {
      return Response.json({ error: 'Too many requests from this connection — please try again later.' }, { status: 429 })
    }

    const targetProfile = await getConsentVerifiedPublicProfile(professional_profile_id, 'id')
    if (!targetProfile) {
      return Response.json({ error: 'This professional is no longer available for public introductions.' }, { status: 404 })
    }

    const requiredCapability = {
      candidate: 'candidate',
      speaker_booking: 'speaker',
      facilitator_commission: 'facilitator',
    }[enquiry_type]
    const normalizeCapability = value => {
      const normalized = String(value || '').trim().toLowerCase()
      return normalized === 'talent' ? 'candidate' : normalized
    }
    const availableCapabilities = new Set([
      ...(targetProfile.capabilities || []),
      ...(targetProfile.selected_capabilities || []),
      ...(targetProfile.active_tracks || []),
    ].map(normalizeCapability))
    if (!availableCapabilities.has(requiredCapability)) {
      return Response.json({ error: 'This introduction type is not declared on this professional’s public listing.' }, { status: 400 })
    }

    const authorization = request.headers.get('authorization') || ''
    let verifiedBuyerId = null
    if (authorization.startsWith('Bearer ')) {
      const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } }
      )
      const { data: { user }, error: authError } = await authClient.auth.getUser()
      if (!authError) verifiedBuyerId = user?.id || null
    }

    const atbId = targetProfile.atb_id || 'a Valoria professional'
    const { error } = await supabase.from('enquiries').insert([{
      buyer_user_id: verifiedBuyerId,
      buyer_name: normalizedName,
      buyer_email: normalizedEmail,
      buyer_company: normalizedCompany || null,
      professional_profile_id: targetProfile.id,
      subject: normalizedSubject || null,
      body: normalizedMessage,
      enquiry_type,
      status: 'pending',
    }])

    if (error) {
      console.error('Enquiry insert error:', error)
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    notifyAdmin({ enquiryType: enquiry_type, atbId, buyerName: normalizedName, buyerEmail: normalizedEmail, buyerCompany: normalizedCompany, subject: normalizedSubject, body: normalizedMessage }).catch(e => console.error('notifyAdmin error:', e))
    confirmToBuyer({ enquiryType: enquiry_type, atbId, buyerName: normalizedName, buyerEmail: normalizedEmail }).catch(e => console.error('confirmToBuyer error:', e))
    notifyProfessional({ supabase, professionalProfileId: targetProfile.id, enquiryType: enquiry_type, atbId, buyerName: normalizedName, buyerCompany: normalizedCompany, actionUrl: `/profile/${targetProfile.id}` }).catch(e => console.error('notifyProfessional error:', e))

    return Response.json({ message: 'Enquiry sent.' }, { status: 200 })
  } catch (err) {
    console.error('Enquiries API error:', err)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
