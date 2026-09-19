import { PROFESSIONAL_STANDARD_SERIES } from '@/lib/professionalStandardSeries'

const MASTER_LIST_ID = process.env.BREVO_WEBINAR_LIST_ID || process.env.BREVO_LIST_ID
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'info@valoriainstitute.com'
const FROM_NAME = process.env.BREVO_FROM_NAME || 'Valoria Institute'

function sessionListId(sessionId) { return process.env[`BREVO_SESSION_${sessionId}_LIST_ID`] || MASTER_LIST_ID }
function escapeHtml(value = '') { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])) }

export async function syncEventRegistrationToBrevo({ email, fullName, role, organisation, whatsapp, session }) {
  const key = process.env.BREVO_API_KEY
  if (!key) return { synced: false, emailSent: false, errorCode: 'BREVO_NOT_CONFIGURED' }

  const [firstName, ...rest] = fullName.split(/\s+/)
  const attributes = { FIRSTNAME: firstName || '', LASTNAME: rest.join(' ') }
  if (process.env.BREVO_CUSTOM_ATTRIBUTES_ENABLED === 'true') {
    Object.assign(attributes, {
      ROLE: role || '',
      ORGANISATION: organisation || '',
      WHATSAPP: whatsapp || '',
      EVENT_NAME: `The Professional Standard Series — Session ${session.id}`,
      EVENT_SESSION: session.id,
      EVENT_TITLE: session.title,
      EVENT_DATE: session.start,
      REGISTRATION_SOURCE: `professional_standard_session_${session.id}`,
    })
  }

  const payload = { email, attributes, updateEnabled: true }
  const listId = sessionListId(session.id)
  if (listId) payload.listIds = [Number(listId)]

  const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!contactResponse.ok) throw new Error(`BREVO_CONTACT_${contactResponse.status}`)

  const first = escapeHtml(firstName || 'there')
  const title = escapeHtml(session.title)
  const fullNameSafe = escapeHtml(fullName)
  const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: fullNameSafe }],
      replyTo: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `You're registered for Session ${session.id}, ${firstName || 'there'}.`,
      htmlContent: `<div style="font-family:Arial,sans-serif;background:#0F0F1A;color:#F7F4EE;padding:40px"><div style="max-width:560px;margin:auto;background:#1A1A2E;border:1px solid rgba(201,168,76,.25);padding:40px"><p style="color:#C9A84C;letter-spacing:.16em;font-size:11px;font-weight:700">VALORIA INSTITUTE</p><h1 style="font-weight:400">You're registered.</h1><p>Hi ${first},</p><p>Your registration for <strong>Session ${session.id}: ${title}</strong> is confirmed.</p><p style="color:#C9A84C">Virtual · 90 minutes</p><p>We'll send the access details and important updates to this email address.</p></div></div>`,
      tags: ['professional-standard-series', `session-${session.id}`],
    }),
  })

  return { synced: true, emailSent: emailResponse.ok, errorCode: emailResponse.ok ? null : `BREVO_EMAIL_${emailResponse.status}` }
}

export const EVENT_SESSIONS = Object.fromEntries(
  PROFESSIONAL_STANDARD_SERIES.filter(session => !session.replay).map(session => [session.id, session])
)
