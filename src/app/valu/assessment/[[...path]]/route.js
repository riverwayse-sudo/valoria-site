const ALLOWED_ASSESSMENT_HOSTS = new Set([
  'assessment.valoriainstitute.com',
  'valoria-platform.riverwayse.workers.dev',
  'valoria-staging-assessment.riverwayse.workers.dev',
])

function getAssessmentOrigin() {
  const configured =
    process.env.VALU_PREVIEW_ASSESSMENT_ORIGIN ||
    process.env.VALU_UPSTREAM_ORIGIN ||
    process.env.NEXT_PUBLIC_VALU_ASSESSMENT_ORIGIN ||
    'https://assessment.valoriainstitute.com'

  try {
    const origin = new URL(configured)
    if (origin.protocol !== 'https:' || !ALLOWED_ASSESSMENT_HOSTS.has(origin.hostname)) return null
    return origin
  } catch {
    return null
  }
}

async function proxyAssessment(request) {
  const origin = getAssessmentOrigin()
  if (!origin) {
    return new Response('Assessment service is not configured for this environment.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  }

  const incoming = new URL(request.url)
  const suffix = incoming.pathname.replace(/^\/valu\/assessment\/?/, '')
  const target = new URL(suffix ? `/valu/assessment/${suffix}` : '/', origin)
  target.search = incoming.search

  const headers = new Headers()
  for (const name of ['accept', 'accept-language', 'range', 'if-none-match', 'if-modified-since', 'user-agent']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  try {
    const upstream = await fetch(target, {
      method: request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers,
      redirect: 'follow',
    })
    const responseHeaders = new Headers(upstream.headers)
    responseHeaders.set('cache-control', responseHeaders.get('cache-control') || 'public, max-age=60')
    responseHeaders.set('x-content-type-options', 'nosniff')
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch {
    return new Response('The assessment service is temporarily unavailable. Please try again.', {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  return proxyAssessment(request)
}

export async function HEAD(request) {
  return proxyAssessment(request)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { allow: 'GET, HEAD, OPTIONS', 'cache-control': 'no-store' },
  })
}
