const fs = require('fs')
const path = require('path')
const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Marketplace enquiry safety and consent', () => {
  test('the public form requires acknowledgement of the Privacy Notice', () => {
    const form = read('src/components/EnquiryForm.jsx')
    expect(form).toContain('privacy_consent: false')
    expect(form).toContain('form.privacy_consent')
    expect(form).toContain('Privacy Notice')
    expect(form).toContain('privacy_consent: form.privacy_consent')
  })

  test('the API verifies the public target and its eligible capability before accepting an enquiry', () => {
    const api = read('src/app/api/enquiries/route.js')
    expect(api).toContain(".from('marketplace_public_roster')")
    expect(api).toContain('privacy_consent !== true')
    expect(api).toContain('capabilities.includes(requiredCapability)')
    expect(api).toContain('buyer_user_id: null')
    expect(api).not.toContain('buyer_user_id,')
  })

  test('staging stores enquiries without sending external email', () => {
    const api = read('src/app/api/enquiries/route.js')
    expect(api).toContain("const EMAIL_DELIVERY_ENABLED = !IS_PREVIEW")
    expect(api).toContain('if (!BREVO_KEY || !EMAIL_DELIVERY_ENABLED) return')
    expect(api).toContain('preview: IS_PREVIEW')
    expect(api).toContain('notifyProfessional({ supabase,')
  })
})
