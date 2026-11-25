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
    return `${target.pathname}${target.search}`
  } catch {
    return fallback
  }
}

export async function GET(request) {
  const requestUrl = request.url
  const { searchParams } = new URL(requestUrl)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const nextPath = safeNextPath(searchParams.get('next'), requestUrl)

  if (!tokenHash || type !== 'email') {
    return NextResponse.redirect(new URL('/login?confirmation=invalid', requestUrl))
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!configuredUrl || !anonKey) {
    return NextResponse.redirect(new URL('/login?confirmation=unavailable', requestUrl))
  }

  const response = NextResponse.redirect(new URL(nextPath, requestUrl))
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

  if (error) {
    return NextResponse.redirect(new URL('/login?confirmation=expired', requestUrl))
  }

  return response
}
