const windows = new Map()

// Best-effort per-instance protection for serverless deployments. Keep provider-side
// spend limits and edge/WAF rate limits enabled as the durable control.
export function allowSupportRequest(key, limit, windowMs) {
  const now = Date.now()
  const id = String(key || 'unknown').slice(0, 120)
  let entry = windows.get(id)
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs }
    windows.set(id, entry)
  }
  if (entry.count >= limit) return false
  entry.count += 1

  if (windows.size > 2000) {
    for (const [storedKey, storedEntry] of windows) {
      if (storedEntry.resetAt <= now) windows.delete(storedKey)
    }
  }
  return true
}

export function supportClientKey(request) {
  const forwarded = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || ''
  return forwarded.split(',')[0].trim().slice(0, 120) || 'unknown'
}
