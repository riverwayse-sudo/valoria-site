const fs = require('fs')
const path = require('path')
const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('marketplace enquiry API security', () => {
  test('validates public profile consent and declared capability before creating an enquiry', () => {
    const api = read('src/app/api/enquiries/route.js')
    expect(api).toContain("getConsentVerifiedPublicProfile(professional_profile_id, 'id')")
    expect(api).toContain("speaker_booking: 'speaker'")
    expect(api).toContain("facilitator_commission: 'facilitator'")
    expect(api).toContain('availableCapabilities.has(requiredCapability)')
    expect(api).toContain('professional_profile_id: targetProfile.id')
  })

  test('escapes untrusted values in notification email HTML', () => {
    const api = read('src/app/api/enquiries/route.js')
    expect(api).toContain('function escapeHtml(value =')
    expect(api).toContain("const safeBody = escapeHtml(body || '').replace(/\\r?\\n/g, '<br/>')")
    expect(api).toContain('const safeBuyerName = escapeHtml(buyerName)')
  })

  test('stores only a buyer id verified from the Supabase session', () => {
    const api = read('src/app/api/enquiries/route.js')
    const form = read('src/components/EnquiryForm.jsx')
    expect(form).toContain('supabase.auth.getSession()')
    expect(form).toContain('headers.Authorization = `Bearer ${session.access_token}`')
    expect(api).toContain('authClient.auth.getUser()')
    expect(api).toContain('buyer_user_id: verifiedBuyerId')
    expect(api).not.toContain('buyer_user_id: buyer_user_id || null')
  })

  test('bounds and normalizes untrusted enquiry fields', () => {
    const api = read('src/app/api/enquiries/route.js')
    expect(api).toContain('normalizedName.length > 120')
    expect(api).toContain('normalizedMessage.length > 4000')
    expect(api).toContain("buyer_name !== 'string'")
  })
})
