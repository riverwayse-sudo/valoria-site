const { sendResendEmail, escapeHtml, getSiteOrigin } = require('../lib/resend-email.cjs')

describe('Resend transactional email helper', () => {
  const originalKey = process.env.RESEND_API_KEY
  const originalFrom = process.env.RESEND_FROM_EMAIL
  const originalFetch = global.fetch
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test_key'
    delete process.env.RESEND_FROM_EMAIL
    delete process.env.NEXT_PUBLIC_SITE_URL
    global.fetch = jest.fn()
  })

  afterEach(() => {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalKey
    if (originalFrom === undefined) delete process.env.RESEND_FROM_EMAIL
    else process.env.RESEND_FROM_EMAIL = originalFrom
    global.fetch = originalFetch
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
    jest.clearAllMocks()
  })

  test('fails closed when the Resend key is absent', async () => {
    delete process.env.RESEND_API_KEY
    const result = await sendResendEmail({ to: 'buyer@example.com', subject: 'Test', text: 'Hello' })
    expect(result).toEqual({ ok: false, status: 501, error: 'RESEND_API_KEY_NOT_CONFIGURED' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('sends text and HTML with verified sender, reply-to, tags and idempotency', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 're_test_message' }),
    })

    const result = await sendResendEmail({
      to: 'buyer@example.com',
      subject: 'Your enquiry was received',
      html: '<p>Received</p>',
      text: 'Received',
      replyTo: 'info@valoriainstitute.com',
      tags: { category: 'enquiry', enquiry_type: 'candidate' },
      idempotencyKey: 'enquiry/123/buyer',
    })

    expect(result).toEqual({ ok: true, status: 200, id: 're_test_message', error: null })
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect(options.headers.Authorization).toBe('Bearer re_test_key')
    expect(options.headers['Idempotency-Key']).toBe('enquiry/123/buyer')
    expect(JSON.parse(options.body)).toEqual({
      from: 'Valoria Institute <info@valoriainstitute.com>',
      to: ['buyer@example.com'],
      subject: 'Your enquiry was received',
      html: '<p>Received</p>',
      text: 'Received',
      reply_to: ['info@valoriainstitute.com'],
      tags: [
        { name: 'category', value: 'enquiry' },
        { name: 'enquiry_type', value: 'candidate' },
      ],
    })
  })

  test('returns provider failures without throwing', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: 'Invalid recipient' }),
    })

    const result = await sendResendEmail({ to: 'bad@example.com', subject: 'Test', text: 'Hello' })
    expect(result).toEqual({ ok: false, status: 422, id: null, error: 'Invalid recipient' })
  })

  test('uses the configured HTTPS site origin and rejects non-HTTPS origins', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.valoriainstitute.com/path'
    expect(getSiteOrigin()).toBe('https://staging.valoriainstitute.com')
    process.env.NEXT_PUBLIC_SITE_URL = 'http://untrusted.example'
    expect(getSiteOrigin()).toBe('https://valoriainstitute.com')
  })

  test('escapes user-controlled values before inserting them into email HTML', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
  })
})
