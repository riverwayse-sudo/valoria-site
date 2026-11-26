function safeAuthConfirmationNextPath(value, requestUrl) {
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
      if (keys.length > 1) return fallback
      if (keys.length === 1) {
        const key = keys[0]
        const values = target.searchParams.getAll(key)
        if (values.length !== 1) return fallback
        if (key === 'valu_taster' && values[0] !== '1') return fallback
        if (key === 'pending_taster_id' &&
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(values[0])) return fallback
        if (!['valu_taster', 'pending_taster_id'].includes(key)) return fallback
      }
    }

    return target.pathname + target.search
  } catch {
    return fallback
  }
}

function escapeAuthConfirmationHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

function getValuTasterConfirmationRedirect(origin) {
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

module.exports = { safeAuthConfirmationNextPath, escapeAuthConfirmationHtml, getValuTasterConfirmationRedirect }
