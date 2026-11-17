import { createEventCertificateToken, hashEventCertificateToken } from '../lib/event-certificate-token'

describe('event certificate token helpers', () => {
  test('creates a cryptographically random 256-bit hex token', () => {
    const token = createEventCertificateToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  test('hashes valid tokens to a fixed SHA-256 digest', async () => {
    const digest = await hashEventCertificateToken('a'.repeat(64))
    expect(digest).toMatch(/^[a-f0-9]{64}$/)
    expect(await hashEventCertificateToken('a'.repeat(64))).toBe(digest)
  })

  test('rejects malformed tokens before lookup', async () => {
    expect(await hashEventCertificateToken('not-a-token')).toBeNull()
    expect(await hashEventCertificateToken('')).toBeNull()
    expect(await hashEventCertificateToken('g'.repeat(64))).toBeNull()
  })
})
