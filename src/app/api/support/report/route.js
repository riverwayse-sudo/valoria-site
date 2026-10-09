import { sendSupportNotification, escapeEmailHtml } from '@/lib/support-notifications'
import { allowSupportRequest, supportClientKey } from '@/lib/support-rate-limit'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
  try {
    if (!allowSupportRequest(supportClientKey(request), 4, 60 * 60_000)) {
      return Response.json({ error: 'You have sent several reports recently. Please try again later or email info@valoriainstitute.com.' }, { status: 429 })
    }
    const length = Number(request.headers.get('content-length') || 0)
    if (length > 12000) return Response.json({ error: 'Your report is too large. Please shorten it and try again.' }, { status: 413 })

    const body = await request.json()
    // Honeypot field: bots often populate every input. Return a success-shaped response without sending mail.
    if (String(body?.website || '').trim()) return Response.json({ ok: true })

    const allowedCategories = new Set(['website', 'account', 'assessment', 'profile', 'event', 'other'])
    const requestedCategory = String(body?.category || 'other').trim()
    const category = allowedCategories.has(requestedCategory) ? requestedCategory : 'other'
    const summary = String(body?.summary || '').replace(/[\\r\\n]+/g, ' ').trim().slice(0, 180)
    const details = String(body?.details || '').replace(/\u0000/g, '').trim().slice(0, 3500)
    const email = String(body?.email || '').trim().slice(0, 254)
    const pagePath = String(body?.pagePath || '/').trim().slice(0, 300)

    if (!summary || !details) {
      return Response.json({ error: 'Please provide a short summary and describe what happened.' }, { status: 400 })
    }
    if (email && !EMAIL_RE.test(email)) {
      return Response.json({ error: 'Please enter a valid email address or leave it blank.' }, { status: 400 })
    }

    const time = new Date().toISOString()
    const subject = `Website issue — ${category}: ${summary}`
    const text = [
      'A visitor reported an issue through the Valoria website assistant.',
      `Category: ${category}`,
      `Summary: ${summary}`,
      `Details: ${details}`,
      `Page: ${pagePath}`,
      `Contact email: ${email || 'Not provided'}`,
      `Time: ${time}`,
    ].join('\n\n')
    const html = `<div style="font-family:Arial,sans-serif;color:#1A1A2E;line-height:1.6"><p style="color:#9A7428;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Website issue report</p><p><strong>Category:</strong> ${escapeEmailHtml(category)}</p><p><strong>Summary:</strong> ${escapeEmailHtml(summary)}</p><p><strong>Details:</strong><br/>${escapeEmailHtml(details).replace(/\n/g, '<br/>')}</p><p><strong>Page:</strong> ${escapeEmailHtml(pagePath)}</p><p><strong>Contact:</strong> ${escapeEmailHtml(email || 'Not provided')}</p><p><strong>Time:</strong> ${escapeEmailHtml(time)}</p></div>`
    const result = await sendSupportNotification({ subject, text, html, replyTo: email || undefined })
    if (!result.ok) {
      return Response.json({ error: 'We could not send your report right now. Please email info@valoriainstitute.com directly.' }, { status: 502 })
    }

    return Response.json({ ok: true, message: 'Thank you. Your report has been emailed to the Valoria support team.' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Support issue report failed:', error?.message || 'unknown error')
    return Response.json({ error: 'We could not process that report. Please email info@valoriainstitute.com directly.' }, { status: 500 })
  }
}
