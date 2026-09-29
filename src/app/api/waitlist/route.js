import { createClient } from '@supabase/supabase-js'

async function sendWelcomeEmail({ email, fullName, journeyUrl }) {
  const key=process.env.BREVO_API_KEY
  if(!key)return
  const fromEmail=process.env.BREVO_FROM_EMAIL||'info@valoriainstitute.com'
  const fromName=process.env.BREVO_FROM_NAME||'Valoria Institute'
  const escape=v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
  const first=escape(fullName.split(/\s+/)[0]||'there')
  const res=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':key,'Content-Type':'application/json'},body:JSON.stringify({sender:{name:fromName,email:fromEmail},to:[{email,name:fullName}],replyTo:{email:fromEmail,name:fromName},subject:'Your Valoria journey starts here.',htmlContent:`<div style="font-family:Arial,sans-serif;background:#0F0F1A;color:#F7F4EE;padding:40px"><div style="max-width:560px;margin:auto;background:#1A1A2E;padding:40px"><p style="color:#C9A84C;letter-spacing:.16em;font-size:11px;font-weight:700">VALORIA INSTITUTE</p><h1 style="font-weight:400">Your place is saved.</h1><p>Hi ${first},</p><p>We've saved your interest with Valoria. You do not need to start over when you return.</p><p style="margin-top:28px"><a href="${escape(journeyUrl)}" style="display:inline-block;background:#C9A84C;color:#1A1A2E;padding:14px 20px;text-decoration:none;font-weight:700">CONTINUE YOUR VALORIA JOURNEY →</a></p><p style="color:rgba(247,244,238,.55);font-size:12px">This continuation link is valid for 30 days.</p></div></div>`,tags:['valoria-lead','journey-continuity']})});if(!res.ok)throw new Error(`BREVO_EMAIL_${res.status}`)
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { full_name, email, role, interest, type, source, utm_source, utm_medium, utm_campaign } = body

    if (!full_name?.trim() || !email?.trim()) {
      return Response.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_key: `waitlist:${ip}`, p_max_count: 5, p_window_seconds: 3600,
    })
    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError)
    } else if (!allowed) {
      return Response.json({ error: 'Too many requests from this connection — please try again later.' }, { status: 429 })
    }

    const baseSource = source || 'waitlist_page'
    // Fold UTM into the existing `source` text column instead of adding new
    // Supabase columns — avoids a schema migration while still keeping full
    // attribution readable in the admin dashboard / CSV export.
    const hasUtm = utm_source || utm_medium || utm_campaign
    const sourceForDb = hasUtm
      ? `${baseSource} [utm:${utm_source || '-'}/${utm_medium || '-'}/${utm_campaign || '-'}]`
      : baseSource

    const { error } = await supabase
      .from('waitlist')
      .insert([{
        full_name: full_name.trim(),
        email:     email.trim().toLowerCase(),
        role:      role?.trim() || null,
        interest:  interest || null,
        type:      type || 'standalone',
        source:    sourceForDb,
      }])

    if (error && error.code !== '23505') {
      console.error('Waitlist insert error:', error)
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: reentry } = await supabase.from('valoria_reentry_links').insert({
      token,
      entry_point: 'lead_capture',
      target_stage: 'assess',
      source: 'website_waitlist',
      source_id: email.trim().toLowerCase(),
      expires_at: expiresAt,
    }).select('token').single()
    const journeyUrl = reentry?.token
      ? `${new URL(request.url).origin}/journey/continue?token=${encodeURIComponent(reentry.token)}`
      : `${new URL(request.url).origin}/journey`

    // Send welcome email (fire and forget — don't block the response)
    sendWelcomeEmail(email.trim().toLowerCase(), full_name.trim(), interest, role?.trim()).catch(
      err => console.error('Brevo email error:', err)
    )

    return Response.json({ message: 'Joined successfully.', journey_url: journeyUrl }, { status: 200 })
  } catch (err) {
    console.error('Waitlist API error:', err)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
