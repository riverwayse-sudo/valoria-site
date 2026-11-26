// Branded buyer welcome email. Supabase confirmation remains a separate Auth email.

import resendEmail from '@/lib/resend-email.cjs'

const { sendResendEmail, escapeHtml } = resendEmail

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, name } = body || {}
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  if (!emailRe.test(normalizedEmail)) {
    return Response.json({ ok: false, error: 'A valid email is required.' }, { status: 400 })
  }

  const firstName = escapeHtml((typeof name === 'string' ? name.trim().split(/\\s+/)[0] : '') || 'there')
  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;max-width:520px;margin:0 auto;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 16px;">VALORIA INSTITUTE</p>
      <h1 style="font-size:22px;font-weight:400;margin:0 0 16px;">Welcome to Valoria.</h1>
      <p style="margin:0 0 12px;">Hi ${firstName},</p>
      <p style="margin:0 0 12px;">Your account is ready. Here are a few ways to begin:</p>
      <ul style="margin:0 0 16px;padding-left:20px;">
        <li style="margin-bottom:6px;">Explore assessment-informed professional profiles</li>
        <li style="margin-bottom:6px;">Request an introduction to a professional, speaker or facilitator</li>
        <li>Use your dashboard to track requests and your Valoria journey</li>
      </ul>
      <a href="https://valoriainstitute.com/marketplace" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#C9A84C;color:#0F0F1A;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;">EXPLORE THE MARKETPLACE</a>
      <p style="margin:28px 0 0;font-size:12px;color:#8A8578;">— The Valoria Institute team</p>
    </div>`

  const result = await sendResendEmail({
    to: normalizedEmail,
    subject: 'Welcome to Valoria Institute',
    html,
    text: `Welcome to Valoria Institute, ${typeof name === 'string' ? name.trim() : 'there'}.\n\nExplore assessment-informed professional profiles, request introductions, and use your dashboard to track your Valoria journey.\n\nExplore the marketplace: https://valoriainstitute.com/marketplace\n\nThe Valoria Institute team`,
    tags: { category: 'welcome-email', audience: 'buyer' },
    idempotencyKey: `valoria/welcome/${normalizedEmail}`,
  })

  if (!result.ok) {
    console.error('Welcome email failed:', result.status, result.error)
    return Response.json({ ok: false, error: 'Send failed.' }, { status: result.status === 501 ? 501 : 502 })
  }
  return Response.json({ ok: true, email_id: result.id }, { status: 200 })
}
