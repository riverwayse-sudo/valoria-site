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
