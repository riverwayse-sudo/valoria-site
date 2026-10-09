const DEFAULT_SUPPORT_EMAIL = 'info@valoriainstitute.com'
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME = 'Valoria Institute Support'

export function escapeEmailHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendSupportNotification({ subject, text, html, replyTo, timeoutMs = 8000 }) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error('Support notification not sent: BREVO_API_KEY is not configured.')
    return { ok: false, reason: 'email_not_configured' }
  }

  const recipient = process.env.SUPPORT_NOTIFICATION_EMAIL || DEFAULT_SUPPORT_EMAIL
  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: recipient, name: 'Valoria Support' }],
    subject: String(subject || 'Valoria support notification').slice(0, 180),
    textContent: String(text || '').slice(0, 12000),
    htmlContent: html || `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeEmailHtml(text || '')}</pre>`,
    tags: ['valoria-support'],
  }
  if (replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
    payload.replyTo = { email: replyTo }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error('Support notification provider rejected email:', response.status, detail.slice(0, 500))
      return { ok: false, reason: 'provider_rejected' }
    }
    return { ok: true }
  } catch (error) {
    console.error('Support notification delivery failed:', error?.message || 'unknown error')
    return { ok: false, reason: 'provider_unavailable' }
  }
}
