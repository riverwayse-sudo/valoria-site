// Public Marketplace enquiry capture. Public visibility and capability eligibility
// are verified through the anon-key roster; writes use the isolated server key.
import { createClient } from '@supabase/supabase-js'

const IS_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1'
  || process.env.VALU_PREVIEW === '1'
  || process.env.VERCEL_ENV === 'preview'
  || process.env.CF_WORKERS_PREVIEW === '1'
const EMAIL_DELIVERY_ENABLED = !IS_PREVIEW || process.env.VALU_STAGING_EMAILS_ENABLED === '1'
const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME = 'Valoria Institute'
const PRIVACY_NOTICE_VERSION = '2026-11-07-draft'

const TYPE_LABELS = {
  candidate: 'Candidate Introduction',
  speaker_booking: 'Speaker Enquiry',
  facilitator_commission: 'Facilitator Enquiry',
}
const TYPE_CAPABILITY = {
  candidate: 'candidate',
  speaker_booking: 'speaker',
  facilitator_commission: 'facilitator',
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Isolated Supabase server configuration is missing.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Public Supabase configuration is missing.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function normaliseCapability(value) {
  const track = String(value || '').trim().toLowerCase()
  return track === 'talent' ? 'candidate' : track
}

async function notifyAdmin({ enquiryType, atbId, buyerName, buyerEmail, buyerCompany, subject, body }) {
  if (!BREVO_KEY || !EMAIL_DELIVERY_ENABLED) return
  const label = TYPE_LABELS[enquiryType] || 'Enquiry'
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">NEW ${escapeHtml(label.toUpperCase())}</p>
      <p><strong>Professional:</strong> ${escapeHtml(atbId)}</p>
      <p><strong>From:</strong> ${escapeHtml(buyerName)} &lt;${escapeHtml(buyerEmail)}&gt;${buyerCompany ? ` — ${escapeHtml(buyerCompany)}` : ''}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject || '(none given)')}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(body).replace(/\n/g, '<br/>')}</p>
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
  if (!BREVO_KEY || !EMAIL_DELIVERY_ENABLED) return
  const label = (TYPE_LABELS[enquiryType] || 'enquiry').toLowerCase()
  const firstName = escapeHtml(buyerName.trim().split(/\s+/)[0] || 'there')
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1A1A2E;">
      <p>Hi ${firstName},</p>
      <p>We have received your ${escapeHtml(label)} regarding <strong>${escapeHtml(atbId)}</strong>. The Valoria team will review the request and follow up where further information is needed.</p>
      <p style="color:#888;font-size:12px;">Valoria Institute · Nigeria</p>
    </div>`
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: buyerEmail, name: buyerName }],
      replyTo: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `We received your ${label}`,
      htmlContent: html,
      tags: ['enquiry-confirmation', enquiryType],
    }),
  })
  if (!res.ok) console.error('Enquiry buyer confirmation failed:', res.status, await res.text().catch(() => ''))
}

async function notifyProfessional({ supabase, professionalProfileId, enquiryType, atbId, buyerName, buyerCompany, actionUrl }) {
  const label = TYPE_LABELS[enquiryType] || 'Enquiry'
  const { error: notificationError } = await supabase.from('platform_notifications').insert([{
    user_id: professionalProfileId,
    type: 'enquiry',
    title: `New ${label.toLowerCase()}`,
    body: `${buyerName}${buyerCompany ? ` (${buyerCompany})` : ''} wants to connect with you.`,
    action_url: actionUrl,
  }])
  if (notificationError) console.error('Enquiry in-app notification failed:', notificationError)

  if (!BREVO_KEY || !EMAIL_DELIVERY_ENABLED) return
  const { data: userRow, error: userError } = await supabase.auth.admin.getUserById(professionalProfileId)
  if (userError || !userRow?.user?.email) {
    console.error('Enquiry professional email lookup failed:', userError)
    return
  }
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 12px;">NEW ${escapeHtml(label.toUpperCase())}</p>
      <p>${escapeHtml(buyerName)}${buyerCompany ? ` from ${escapeHtml(buyerCompany)}` : ''} has requested an introduction through Valoria Institute.</p>
      <p>The Valoria team will review the request and contact you if your input is needed.</p>
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
    const publicSupabase = getPublicSupabase()
    const body = await request.json()
    const {
      professional_profile_id, enquiry_type, buyer_name, buyer_email,
      buyer_company, subject, message, privacy_consent,
    } = body || {}

    if (!UUID_RE.test(String(professional_profile_id || '')) || !enquiry_type) {
      return Response.json({ error: 'A valid professional profile and enquiry type are required.' }, { status: 400 })
    }
    if (!buyer_name?.trim() || !buyer_email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Name, email and message are required.' }, { status: 400 })
    }
    if (buyer_name.trim().length > 200 || buyer_email.trim().length > 254 || String(message).trim().length > 5000 || String(buyer_company || '').trim().length > 200) {
      return Response.json({ error: 'One or more fields exceed the allowed length.' }, { status: 400 })
    }
    const normalizedEmail = buyer_email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (privacy_consent !== true) {
      return Response.json({ error: 'Please acknowledge the Privacy Notice before submitting.' }, { status: 400 })
    }
    if (!Object.prototype.hasOwnProperty.call(TYPE_CAPABILITY, enquiry_type)) {
      return Response.json({ error: 'Invalid enquiry type.' }, { status: 400 })
    }

    // Resolve the target through the anon-key public projection. This applies
    // roster RLS and prevents enquiries to registered-only or revoked profiles.
    const { data: publicProfile, error: publicProfileError } = await publicSupabase
      .from('marketplace_public_roster')
      .select('professional_id,atb_id,capabilities,track')
      .eq('professional_id', professional_profile_id)
      .maybeSingle()

    if (publicProfileError) {
      console.error('Public Marketplace profile validation failed:', publicProfileError)
      return Response.json({ error: 'Marketplace availability could not be verified. Please try again.' }, { status: 503 })
    }
    if (!publicProfile) {
      return Response.json({ error: 'This professional is not currently available for public enquiries.' }, { status: 404 })
    }

    const capabilities = (Array.isArray(publicProfile.capabilities) ? publicProfile.capabilities : [publicProfile.track])
      .map(normaliseCapability).filter(Boolean)
    const requiredCapability = TYPE_CAPABILITY[enquiry_type]
    if (!capabilities.includes(requiredCapability)) {
      return Response.json({ error: 'This enquiry type is not available for the selected professional.' }, { status: 400 })
    }

    const ip = request.headers.get('cf-connecting-ip')
      || request.headers.get('x-real-ip')
      || request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || 'unknown'
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_key: `enquiry:${ip}`, p_max_count: 5, p_window_seconds: 3600,
    })
    if (rateLimitError) {
      console.error('Enquiry rate-limit check failed:', rateLimitError)
    } else if (!allowed) {
      return Response.json({ error: 'Too many requests from this connection. Please try again later.' }, { status: 429 })
    }

    const normalizedName = buyer_name.trim()
    const normalizedCompany = buyer_company?.trim() || null
    const normalizedMessage = message.trim()
    const canonicalAtbId = publicProfile.atb_id || 'Valoria professional'
    const { error: insertError } = await supabase.from('enquiries').insert([{
      buyer_user_id: null,
      buyer_name: normalizedName,
      buyer_email: normalizedEmail,
      buyer_company: normalizedCompany,
      professional_profile_id,
      subject: subject?.trim() || null,
      body: normalizedMessage,
      enquiry_type,
      status: 'pending',
      privacy_consent: true,
      privacy_consent_at: new Date().toISOString(),
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
    }])

    if (insertError) {
      console.error('Enquiry insert failed:', insertError)
      return Response.json({ error: 'The enquiry could not be saved. Please try again.' }, { status: 500 })
    }

    const actionUrl = `/profile/${professional_profile_id}`
    notifyAdmin({ enquiryType: enquiry_type, atbId: canonicalAtbId, buyerName: normalizedName, buyerEmail: normalizedEmail, buyerCompany: normalizedCompany, subject, body: normalizedMessage })
      .catch(error => console.error('Admin enquiry notification failed:', error))
    confirmToBuyer({ enquiryType: enquiry_type, atbId: canonicalAtbId, buyerName: normalizedName, buyerEmail: normalizedEmail })
      .catch(error => console.error('Buyer enquiry confirmation failed:', error))
    notifyProfessional({ supabase, professionalProfileId: professional_profile_id, enquiryType: enquiry_type, atbId: canonicalAtbId, buyerName: normalizedName, buyerCompany: normalizedCompany, actionUrl })
      .catch(error => console.error('Professional enquiry notification failed:', error))

    return Response.json({
      message: 'Enquiry submitted.',
      preview: IS_PREVIEW,
      email_notifications_enabled: Boolean(BREVO_KEY && EMAIL_DELIVERY_ENABLED),
    }, { status: 200 })
  } catch (error) {
    console.error('Enquiries API error:', error)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
