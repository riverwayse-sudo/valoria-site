import { createHmac, randomBytes } from 'node:crypto'

const AUDIENCE = 'valu-full-assessment'
const TOKEN_TTL_SECONDS = 4 * 60 * 60

export function createValuHandoffToken(userId, tasterId, nowSeconds = Math.floor(Date.now() / 1000)) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret || !userId || !tasterId) throw new Error('Secure VALU handoff is not configured.')

  const payload = {
    v: 1,
    aud: AUDIENCE,
    sub: userId,
    taster_id: tasterId,
    iat: nowSeconds,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
    jti: randomBytes(16).toString('base64url'),
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}
