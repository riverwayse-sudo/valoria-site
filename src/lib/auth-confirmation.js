export function safeAuthConfirmationNextPath(value, requestUrl) {
  const fallback = '/auth/callback'
  if (!value) return fallback

  try {
    const requestOrigin = new URL(requestUrl).origin
    const target = new URL(value, requestUrl)
    if (target.origin !== requestOrigin) return fallback
    if (!['/auth/callback', '/dashboard'].includes(target.pathname)) return fallback

    if (target.pathname === '/dashboard' && target.search) return fallback
    if (target.pathname === '/auth/callback') {
      const keys = [...target.searchParams.keys()]
      if (keys.some(key => key !== 'valu_taster')) return fallback
      if (target.searchParams.has('valu_taster') && target.searchParams.get('valu_taster') !== '1') return fallback
    }

    return target.pathname + target.search
  } catch {
    return fallback
  }
}

export function escapeAuthConfirmationHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

export function getValuTasterConfirmationRedirect(origin) {
  try {
    const current = new URL(origin)
    const hostname = current.hostname.toLowerCase()
    const allowedProductionOrStaging = new Set([
      'valoriainstitute.com',
      'www.valoriainstitute.com',
      'staging.valoriainstitute.com',
    ])
    const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(hostname)

    if (!allowedProductionOrStaging.has(hostname) && !isLocalDevelopment) return null
    if (!isLocalDevelopment && current.protocol !== 'https:') return null
    if (isLocalDevelopment && !['http:', 'https:'].includes(current.protocol)) return null

    const callback = new URL('/auth/callback', current.origin)
    callback.searchParams.set('valu_taster', '1')
    return callback.toString()
  } catch {
    return null
  }
}
