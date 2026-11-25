const fs = require('fs')
const path = require('path')
const {
  safeAuthConfirmationNextPath,
  escapeAuthConfirmationHtml,
  getValuTasterConfirmationRedirect,
} = require('../lib/auth-confirmation.cjs')

describe('scanner-safe Supabase email confirmation', () => {
  test('allows the same-origin account callback and preserves only the Taster handoff flag', () => {
    expect(safeAuthConfirmationNextPath(
      'https://valoriainstitute.com/auth/callback?valu_taster=1',
      'https://valoriainstitute.com/auth/confirm?token_hash=test&type=email',
    )).toBe('/auth/callback?valu_taster=1')
  })

  test('rejects external, protocol-relative, unsupported and identity-bearing destinations', () => {
    const origin = 'https://valoriainstitute.com/auth/confirm'
    expect(safeAuthConfirmationNextPath('https://evil.example/steal', origin)).toBe('/auth/callback')
    expect(safeAuthConfirmationNextPath('//evil.example/steal', origin)).toBe('/auth/callback')
    expect(safeAuthConfirmationNextPath('/api/admin', origin)).toBe('/auth/callback')
    expect(safeAuthConfirmationNextPath('/auth/callback?valu_taster=1&taster_id=abc', origin)).toBe('/auth/callback')
    expect(safeAuthConfirmationNextPath('/dashboard?next=https://evil.example', origin)).toBe('/auth/callback')
  })

  test('keeps confirmation redirects on approved production, staging and local origins only', () => {
    expect(getValuTasterConfirmationRedirect('https://valoriainstitute.com'))
      .toBe('https://valoriainstitute.com/auth/callback?valu_taster=1')
    expect(getValuTasterConfirmationRedirect('https://www.valoriainstitute.com'))
      .toBe('https://www.valoriainstitute.com/auth/callback?valu_taster=1')
    expect(getValuTasterConfirmationRedirect('https://staging.valoriainstitute.com'))
      .toBe('https://staging.valoriainstitute.com/auth/callback?valu_taster=1')
    expect(getValuTasterConfirmationRedirect('http://localhost:3000'))
      .toBe('http://localhost:3000/auth/callback?valu_taster=1')
    expect(getValuTasterConfirmationRedirect('https://valoria-preview.vercel.app')).toBeNull()
    expect(getValuTasterConfirmationRedirect('http://valoriainstitute.com')).toBeNull()
  })

  test('escapes every HTML-sensitive token character before placing it in the confirmation form', () => {
    expect(escapeAuthConfirmationHtml(`<img src=x onerror="x">&'`))
      .toBe('&lt;img src=x onerror=&quot;x&quot;&gt;&amp;&#39;')
  })

  test('GET only renders the form and POST is the only code path that consumes the token', () => {
    const route = fs.readFileSync(path.join(__dirname, '../app/auth/confirm/route.js'), 'utf8')
    const getHandler = route.split('export async function POST')[0]
    expect(getHandler).toContain('method="post" action="/auth/confirm"')
    expect(getHandler).not.toContain('verifyOtp')
    expect(route).toContain('supabase.auth.verifyOtp')
    expect(route).toContain("type: 'email'")
    expect(route).toContain("'Cache-Control': 'no-store, max-age=0'")
    expect(route).toContain("form-action 'self'")
  })
})
