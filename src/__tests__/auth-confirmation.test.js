const fs = require('fs')
const path = require('path')
const {
  safeAuthConfirmationNextPath,
  escapeAuthConfirmationHtml,
  getValuTasterConfirmationRedirect,
} = require('../lib/auth-confirmation.cjs')

describe('scanner-safe Supabase email confirmation', () => {
  test('allows the same-origin legacy callback and preserves only its approved Taster flag', () => {
    expect(safeAuthConfirmationNextPath(
      'https://valoriainstitute.com/auth/callback?valu_taster=1',
      'https://valoriainstitute.com/auth/confirm?token_hash=test&type=email',
    )).toBe('/auth/callback?valu_taster=1')
  })

  test('allows the post-Taster callback only with one valid completed-Taster UUID', () => {
    const tasterId = '66666666-6666-4666-8666-666666666666'
    expect(safeAuthConfirmationNextPath(
      `https://valoriainstitute.com/auth/callback?pending_taster_id=${tasterId}`,
      'https://valoriainstitute.com/auth/confirm?token_hash=test&type=email',
    )).toBe(`/auth/callback?pending_taster_id=${tasterId}`)
  })

  test('rejects malformed, duplicated or combined Taster identity parameters', () => {
    const origin = 'https://valoriainstitute.com/auth/confirm'
    const tasterId = '66666666-6666-4666-8666-666666666666'
    expect(safeAuthConfirmationNextPath('/auth/callback?pending_taster_id=not-a-uuid', origin)).toBe('/auth/callback')
    expect(safeAuthConfirmationNextPath(`/auth/callback?pending_taster_id=${tasterId}&pending_taster_id=${tasterId}`, origin)).toBe('/auth/callback')
    expect(safeAuthConfirmationNextPath(`/auth/callback?pending_taster_id=${tasterId}&valu_taster=1`, origin)).toBe('/auth/callback')
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


  test('published Supabase confirmation template matches the token-hash POST contract', () => {
    const template = fs.readFileSync(path.join(__dirname, '../../docs/supabase-auth-email-template.md'), 'utf8')
    expect(template).toContain('{{ .TokenHash }}')
    expect(template).toContain('token_hash={{ .TokenHash }}')
    expect(template).toContain('/auth/confirm?token_hash=')
    expect(template).not.toContain('{{ .ConfirmationURL }}')
    expect(template).not.toMatch(/\{\{\s*\.Token\s*\}\}/)
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
