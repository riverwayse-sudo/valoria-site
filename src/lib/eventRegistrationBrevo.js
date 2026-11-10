import { PROFESSIONAL_STANDARD_SERIES } from '@/lib/professionalStandardSeries'
import { renderEventRegistrationEmail } from '@/lib/valoriaEmailDesign'

const MASTER_LIST_ID = process.env.BREVO_WEBINAR_LIST_ID || process.env.BREVO_LIST_ID
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'info@valoriainstitute.com'
const FROM_NAME = process.env.BREVO_FROM_NAME || 'Valoria Institute'

function sessionListId(sessionId) {
  return process.env[`BREVO_SESSION_${sessionId}_LIST_ID`] || MASTER_LIST_ID
}

export async function syncEventRegistrationToBrevo({ email, fullName, role, organisation, whatsapp, session, journeyUrl }) {
  const key = process.env.BREVO_API_KEY
  if (!key) return { synced: false, emailSent: false, errorCode: 'BREVO_NOT_CONFIGURED' }

  const [firstName, ...rest] = String(fullName || '').trim().split(/\s+/)
  const attributes = { FIRSTNAME: firstName || '', LASTNAME: rest.join(' ') }
  if (process.env.BREVO_CUSTOM_ATTRIBUTES_ENABLED === 'true') {
    Object.assign(attributes, {
      ROLE: role || '',
      ORGANISATION: organisation || '',
      WHATSAPP: whatsapp || '',
      EVENT_NAME: `The Professional Standard Series — ${session.title}`,
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

  const message = renderEventRegistrationEmail({ fullName, session, journeyUrl })
  const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: String(fullName || firstName || 'Valoria participant') }],
      replyTo: { email: FROM_EMAIL, name: FROM_NAME },
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
      tags: ['professional-standard-series', 'event-registration', `session-${session.id}`],
    }),
  })

  return {
    synced: true,
    emailSent: emailResponse.ok,
    errorCode: emailResponse.ok ? null : `BREVO_EMAIL_${emailResponse.status}`,
  }
}

export const EVENT_SESSIONS = Object.fromEntries(
  PROFESSIONAL_STANDARD_SERIES.filter(session => !session.replay).map(session => [session.id, session])
)
