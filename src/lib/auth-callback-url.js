const CALLBACK_ORIGINS = {
  'valoriainstitute.com': 'https://valoriainstitute.com',
  'www.valoriainstitute.com': 'https://valoriainstitute.com',
  'staging.valoriainstitute.com': 'https://staging.valoriainstitute.com',
}

export function getProfessionalAuthCallbackUrl(origin, tasterId) {
  if (!origin || !tasterId) return null

  let current
  try {
    current = new URL(origin)
  } catch {
    return null
  }

  if (!['https:', 'http:'].includes(current.protocol)) return null

  const callbackOrigin = CALLBACK_ORIGINS[current.hostname.toLowerCase()]
    || (['localhost', '127.0.0.1'].includes(current.hostname.toLowerCase()) ? current.origin : null)

  // Unknown preview hosts must fail closed; never redirect confirmation tokens
  // to an arbitrary preview origin or silently send staging users to production.
  if (!callbackOrigin) return null

  const callback = new URL('/auth/callback', callbackOrigin)
  callback.searchParams.set('pending_taster_id', String(tasterId))
  return callback.toString()
}
