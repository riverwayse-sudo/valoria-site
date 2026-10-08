export const PASSWORD_POLICY = Object.freeze({
  minLength: 12,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresNumber: true,
  requiresSymbol: true,
})

const COMMON_PASSWORDS = new Set([
  'password123!', 'password123', 'password!', 'qwerty123!', 'qwerty123',
  '123456789012', '1234567890!', 'valoria123!', 'valoria123', 'welcome123!',
  'admin123!', 'letmein123!', 'changeme123!',
])

export function validatePassword(password = '') {
  const value = String(password)
  const errors = []

  if (value.length < PASSWORD_POLICY.minLength) {
    errors.push(`Use at least ${PASSWORD_POLICY.minLength} characters.`)
  }
  if (PASSWORD_POLICY.requiresUppercase && !/[A-Z]/.test(value)) {
    errors.push('Include at least one uppercase letter.')
  }
  if (PASSWORD_POLICY.requiresLowercase && !/[a-z]/.test(value)) {
    errors.push('Include at least one lowercase letter.')
  }
  if (PASSWORD_POLICY.requiresNumber && !/[0-9]/.test(value)) {
    errors.push('Include at least one number.')
  }
  if (PASSWORD_POLICY.requiresSymbol && !/[^A-Za-z0-9]/.test(value)) {
    errors.push('Include at least one symbol.')
  }
  if (COMMON_PASSWORDS.has(value.toLowerCase())) {
    errors.push('Choose a password that is not a commonly used password.')
  }

  return { valid: errors.length === 0, errors }
}

export function passwordPolicyMessage() {
  return 'Use at least 12 characters with uppercase, lowercase, a number, and a symbol. Avoid common passwords.'
}
