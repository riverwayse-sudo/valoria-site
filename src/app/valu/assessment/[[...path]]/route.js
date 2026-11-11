import { getCloudflareContext } from '@opennextjs/cloudflare'

const ALLOWED_ASSESSMENT_HOSTS = new Set([
  'assessment.valoriainstitute.com',
  'valoria-platform.riverwayse.workers.dev',
  'valoria-staging-assessment.riverwayse.workers.dev',
])

function getAssessmentOrigin() {
  const configured =
    process.env.VALU_ASSESSMENT_ORIGIN ||
    process.env.NEXT_PUBLIC_VALU_ASSESSMENT_ORIGIN ||
    'https://assessment.valoriainstitute.com'

  try {
    const origin = new URL(configured)
    if (origin.protocol !== 'https:' || !ALLOWED_ASSESSMENT_HOSTS.has(origin.hostname)) return null

    // Enforce environment isolation in both directions: staging may call only
    // the staging assessment Worker; production may never call staging.
    const stagingRuntime = process.env.VALU_STAGING_API_ENABLED === '1'
    const stagingAssessment = origin.hostname === 'valoria-staging-assessment.riverwayse.workers.dev'
    if (stagingRuntime !== stagingAssessment) return null

    return origin
  } catch {
    return null
  }
}

function getUpstreamPath(pathname) {
  const suffix = pathname.replace(/^\/valu\/assessment\/?/, '')
  if (!suffix) return '/'
  // The Vite app is mounted below /valu/assessment, but its API handlers are
  // registered at /api/* in the assessment Worker. Strip the mount prefix only
  // for API requests; preserve it for the app shell and static assets.
  if (suffix === 'api' || suffix.startsWith('api/')) return `/${suffix}`
  return `/valu/assessment/${suffix}`
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
  const target = new URL(getUpstreamPath(incoming.pathname), origin)
  target.search = incoming.search

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('content-length')

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
  }

  try {
    const upstreamRequest = new Request(target, init)
    let service
    try {
      service = getCloudflareContext().env.VALU_ASSESSMENT
    } catch {
      service = null
    }
    const upstream = service
      ? await service.fetch(upstreamRequest)
      : await fetch(upstreamRequest)

    const responseHeaders = new Headers(upstream.headers)
    const isApiRequest = target.pathname.startsWith('/api/')
    responseHeaders.set('cache-control', isApiRequest ? 'no-store' : (responseHeaders.get('cache-control') || 'public, max-age=60'))
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

export const dynamic = 'force-dynamic'

export async function GET(request) {
  return proxyAssessment(request)
}

export async function HEAD(request) {
  return proxyAssessment(request)
}

export async function POST(request) {
  return proxyAssessment(request)
}

export async function OPTIONS(request) {
  return proxyAssessment(request)
}
