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

    // Send welcome email (fire and forget — don't block the response)
    sendWelcomeEmail(email.trim().toLowerCase(), full_name.trim(), interest, role?.trim()).catch(
      err => console.error('Brevo email error:', err)
    )

    return Response.json({ message: 'Joined successfully.' }, { status: 200 })
  } catch (err) {
    console.error('Waitlist API error:', err)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
