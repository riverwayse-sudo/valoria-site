const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Valoria transactional email provider contract', () => {
  const routePaths = [
    'src/app/api/enquiries/route.js',
    'src/app/api/admin/introduce/route.js',
    'src/app/api/welcome-email/route.js',
    'src/app/api/waitlist/route.js',
  ]

  test('core marketplace and onboarding sends use Resend, not Brevo', () => {
    for (const file of routePaths) {
      const source = read(file)
      expect(source).toContain('sendResendEmail')
      expect(source).not.toContain('BREVO_API_KEY')
      expect(source).toContain('text:')
    }
  })

  test('marketplace notifications use stable idempotency keys', () => {
    const enquiries = read('src/app/api/enquiries/route.js')
    const introductions = read('src/app/api/admin/introduce/route.js')
    expect(enquiries).toContain('valoria/enquiry/\u0024{enquiryId}/admin')
    expect(enquiries).toContain('valoria/enquiry/\u0024{enquiryId}/buyer')
    expect(enquiries).toContain('valoria/enquiry/\u0024{enquiryId}/professional')
    expect(introductions).toContain('valoria/introduction/\u0024{enquiryId}/buyer')
    expect(introductions).toContain('valoria/introduction/\u0024{enquiryId}/professional')
  })

  test('public welcome emails are rate-limited and waitlist links use configured HTTPS origin', () => {
    const welcome = read('src/app/api/welcome-email/route.js')
    const waitlist = read('src/app/api/waitlist/route.js')
    expect(welcome).toContain('welcome-email:ip:')
    expect(welcome).toContain('welcome-email:email:')
    expect(waitlist).toContain('const siteOrigin = getSiteOrigin()')
    expect(waitlist).not.toContain('new URL(request.url).origin')
  })

  test('already-introduced enquiries do not send duplicate introduction emails', () => {
    const introductions = read('src/app/api/admin/introduce/route.js')
    const guard = introductions.indexOf("if (enquiry.status === 'introduced')")
    const send = introductions.indexOf('sendResendEmail(')
    expect(guard).toBeGreaterThan(-1)
    expect(send).toBeGreaterThan(guard)
  })

  test('an enquiry is marked introduced only after both emails are accepted', () => {
    const introductions = read('src/app/api/admin/introduce/route.js')
    const gate = introductions.indexOf('if (!buyerSent.ok || !profSent.ok)')
    const statusUpdate = introductions.indexOf("update({ status: 'introduced' })")
    expect(gate).toBeGreaterThan(-1)
    expect(statusUpdate).toBeGreaterThan(gate)
  })

  test('transactional email HTML uses the Valoria Raleway typeface', () => {
    for (const file of routePaths) {
      expect(read(file)).toContain("font-family:'Raleway',sans-serif")
    }
  })
})
