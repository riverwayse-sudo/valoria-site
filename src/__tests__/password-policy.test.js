const { PASSWORD_POLICY, passwordPolicyMessage, validatePassword } = require('@/lib/password-policy')

describe('password security policy', () => {
  test('requires a 12-character mixed password', () => {
    expect(validatePassword('Short1!').valid).toBe(false)
    expect(validatePassword('ValoriaStrong1!').valid).toBe(true)
  })

  test('rejects common passwords', () => {
    expect(validatePassword('Password123!').valid).toBe(false)
  })

  test('exposes the configured minimum consistently', () => {
    expect(PASSWORD_POLICY.minLength).toBe(12)
    expect(passwordPolicyMessage()).toContain('12 characters')
  })
})
