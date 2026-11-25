import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { normalizeSupabaseProjectUrl } from '@/lib/supabase-url'
import authConfirmation from '@/lib/auth-confirmation.cjs'

const { escapeAuthConfirmationHtml, safeAuthConfirmationNextPath } = authConfirmation

const privateHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

function redirectToLogin(request, reason, status = 303) {
  return NextResponse.redirect(new URL(`/login?confirmation=${reason}`, request.url), {
    status,
    headers: privateHeaders,
  })
}

// Email security scanners commonly prefetch GET links. GET only renders a
// confirmation form; the one-time Supabase token is consumed by the POST.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash') || ''
  const type = searchParams.get('type') || ''
  const next = safeAuthConfirmationNextPath(searchParams.get('next'), request.url)

  if (!tokenHash || tokenHash.length > 512 || type !== 'email') {
    return redirectToLogin(request, 'invalid', 302)
  }

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
      <input type="hidden" name="token_hash" value="${escapeAuthConfirmationHtml(tokenHash)}">
      <input type="hidden" name="type" value="email">
      <input type="hidden" name="next" value="${escapeAuthConfirmationHtml(next)}">
      <button type="submit">CONFIRM MY EMAIL ADDRESS</button>
    </form>
    <p class="note">If you did not create a Valoria account, you can safely ignore this message.</p>
  </main>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      ...privateHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  })
}

export async function POST(request) {
  let form
  try {
    form = await request.formData()
  } catch {
    return redirectToLogin(request, 'invalid')
  }

  const tokenHash = String(form.get('token_hash') || '')
  const type = String(form.get('type') || '')
  const nextPath = safeAuthConfirmationNextPath(String(form.get('next') || ''), request.url)

  if (!tokenHash || tokenHash.length > 512 || type !== 'email') {
    return redirectToLogin(request, 'invalid')
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!configuredUrl || !anonKey) {
    return redirectToLogin(request, 'unavailable')
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), {
    status: 303,
    headers: privateHeaders,
  })

  try {
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

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })

    if (error) return redirectToLogin(request, 'expired')
    return response
  } catch {
    return redirectToLogin(request, 'unavailable')
  }
}
