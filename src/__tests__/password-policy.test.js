const { PASSWORD_POLICY, validatePassword, passwordPolicyMessage } = require('../lib/password-policy')

describe('Valoria password policy', () => {
  test('defines a shared 12–128 character length range', () => {
    expect(PASSWORD_POLICY.minLength).toBe(12)
    expect(PASSWORD_POLICY.maxLength).toBe(128)
  })

  test('accepts a password that meets every policy requirement', () => {
    expect(validatePassword('Correct-Horse-Battery-9!').valid).toBe(true)
  })

  test('rejects passwords shorter than the minimum', () => {
    expect(validatePassword('Short9!').valid).toBe(false)
  })

  test('rejects passwords longer than the server-enforced maximum', () => {
    const result = validatePassword('A'.repeat(125) + 'a1!x')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Use no more than 128 characters.')
  })

  test('rejects common passwords and missing character classes', () => {
    expect(validatePassword('password123!').valid).toBe(false)
    expect(validatePassword('correcthorsebattery').valid).toBe(false)
  })

  test('communicates the same length range used by the API', () => {
    expect(passwordPolicyMessage()).toContain('12–128 characters')
  })
})
