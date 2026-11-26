const DEFAULT_FROM = 'Valoria Institute <info@valoriainstitute.com>'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

function normalizeTags(tags) {
  if (!tags) return []
  const entries = Array.isArray(tags)
    ? tags.map((value, index) => [`tag_${index + 1}`, value])
    : Object.entries(tags)

  return entries
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
    .map(([name, value]) => ({
      name: String(name).toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 50) || 'category',
      value: String(value).toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 256),
    }))
}

async function sendResendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  tags,
  idempotencyKey,
  from,
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, status: 501, error: 'RESEND_API_KEY_NOT_CONFIGURED' }
  }

  const recipients = (Array.isArray(to) ? to : [to])
    .filter(value => typeof value === 'string' && value.trim())
    .map(value => value.trim())

  if (!recipients.length || !subject || (!html && !text)) {
    return { ok: false, status: 400, error: 'RESEND_EMAIL_PAYLOAD_INVALID' }
  }

  const payload = {
    from: from || process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
    to: recipients,
    subject: String(subject).slice(0, 200),
  }
  if (html) payload.html = html
  if (text) payload.text = text
  if (replyTo) payload.reply_to = Array.isArray(replyTo) ? replyTo : [replyTo]

  const normalizedTags = normalizeTags(tags)
  if (normalizedTags.length) payload.tags = normalizedTags

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  if (idempotencyKey) headers['Idempotency-Key'] = String(idempotencyKey).slice(0, 256)

  try {
    const requestOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      requestOptions.signal = AbortSignal.timeout(12000)
    }
    const response = await fetch(RESEND_ENDPOINT, requestOptions)
    const result = await response.json().catch(() => ({}))
    return {
      ok: response.ok,
      status: response.status,
      id: result.id || null,
      error: response.ok ? null : (result.message || result.error || `RESEND_${response.status}`),
    }
  } catch {
    return { ok: false, status: 0, error: 'RESEND_NETWORK_ERROR' }
  }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

module.exports = { sendResendEmail, escapeHtml }
