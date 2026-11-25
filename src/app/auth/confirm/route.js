import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { normalizeSupabaseProjectUrl } from '@/lib/supabase-url'

function safeNextPath(value, requestUrl) {
  const fallback = '/auth/callback'
  if (!value) return fallback
  try {
    const target = new URL(value, requestUrl)
    if (target.origin !== new URL(requestUrl).origin) return fallback
    if (!['/auth/callback', '/dashboard'].includes(target.pathname)) return fallback
    return target.pathname + target.search
  } catch {
    return fallback
  }
}

// Email security scanners commonly prefetch GET links. Do not consume the
// one-time token on GET; require an explicit human form submission instead.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash') || ''
  const type = searchParams.get('type') || ''
  const next = safeNextPath(searchParams.get('next'), request.url)

  if (!tokenHash || type !== 'email') {
    return NextResponse.redirect(new URL('/login?confirmation=invalid', request.url))
  }

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Confirm your Valoria account</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#0F0F1A;color:#F7F4EE;font-family:Raleway,Arial,sans-serif}
    main{width:100%;max-width:520px;padding:clamp(28px,5vw,52px);border:1px solid rgba(201,168,76,.25);border-radius:16px;background:#1A1A2E;text-align:center}
    .brand{color:#C9A84C;font-size:12px;font-weight:800;letter-spacing:.24em}.tag{margin-top:8px;color:#EDE8DC;font-family:Georgia,serif}
    h1{margin:34px 0 12px;font-size:30px;font-weight:600}.copy{color:#EDE8DC;font-size:15px;line-height:1.8}
    button{width:100%;margin-top:22px;padding:15px 20px;border:0;border-radius:999px;background:#C9A84C;color:#1A1A2E;font-size:12px;font-weight:800;letter-spacing:.1em;cursor:pointer}
    .note{margin-top:18px;color:rgba(247,244,238,.6);font-size:12px;line-height:1.6}
  </style>
</head>
<body>
  <main>
    <div class="brand">VALORIA INSTITUTE</div><div class="tag">Worth. Built.</div>
    <h1>Confirm your email</h1>
    <p class="copy">Select the button below to confirm your email address and securely open your Valoria account.</p>
    <form method="post" action="/auth/confirm">
      <input type="hidden" name="token_hash" value="${escapeHtml(tokenHash)}">
      <input type="hidden" name="type" value="email">
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <button type="submit">CONFIRM MY EMAIL ADDRESS</button>
    </form>
    <p class="note">If you did not create a Valoria account, you can safely ignore this message.</p>
  </main>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

export async function POST(request) {
  let form
  try {
    form = await request.formData()
  } catch {
    return NextResponse.redirect(new URL('/login?confirmation=invalid', request.url), 303)
  }

  const tokenHash = String(form.get('token_hash') || '')
  const type = String(form.get('type') || '')
  const nextPath = safeNextPath(String(form.get('next') || ''), request.url)

  if (!tokenHash || type !== 'email') {
    return NextResponse.redirect(new URL('/login?confirmation=invalid', request.url))
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!configuredUrl || !anonKey) {
    return NextResponse.redirect(new URL('/login?confirmation=unavailable', request.url), 303)
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303)
  const supabase = createServerClient(
    normalizeSupabaseProjectUrl(configuredUrl),
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  })

  if (error) {
    return NextResponse.redirect(new URL('/login?confirmation=expired', request.url), 303)
  }

  // A malformed or stale cross-environment RedirectTo is rejected by
  // safeNextPath. Recover the account-first Taster journey from the verified
  // user's metadata rather than losing the signup intent and landing on the
  // ordinary dashboard. This is evaluated only after the one-time token has
  // been verified; no client-supplied identity is trusted for this decision.
  if (
    nextPath === '/auth/callback' &&
    data?.user?.user_metadata?.valu_taster_signup === true
  ) {
    response.headers.set('Location', new URL('/auth/callback?valu_taster=1', request.url).toString())
  }

  return response
}
