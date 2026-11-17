const fs = require('fs')
const path = require('path')

describe('event certificate token contract', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/event-certificate-token.js'),
    'utf8'
  )

  test('generates a cryptographically random 256-bit token', () => {
    expect(source).toContain('new Uint8Array(32)')
    expect(source).toContain('crypto.getRandomValues(bytes)')
    expect(source).toContain("toString(16).padStart(2, '0')")
  })

  test('stores only a SHA-256 digest of a valid 64-character hex token', () => {
    expect(source).toContain("!/^[a-f0-9]{64}$/.test(value)")
    expect(source).toContain("subtle.digest('SHA-256'")
  })

  test('returns no digest for malformed tokens', () => {
    expect(source).toContain('if (!/^[a-f0-9]{64}$/.test(value)) return null')
  })
})
