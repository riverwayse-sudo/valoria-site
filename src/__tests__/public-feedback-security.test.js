const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('public webinar feedback security contract', () => {
  test('feedback API requires the server-only service credential', () => {
    const api = read('src/app/api/feedback/route.js')
    expect(api).toContain('process.env.SUPABASE_SERVICE_ROLE_KEY')
    expect(api).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(api).toContain("if (!supabase)")
    expect(api).toContain("status: 503")
  })

  test('feedback API validates bounded input and rating ranges', () => {
    const api = read('src/app/api/feedback/route.js')
    expect(api).toContain('Number.isInteger(overall_rating)')
    expect(api).toContain('overall_rating > 5')
    expect(api).toContain("attended != null && !['live', 'replay', 'no'].includes(attended)")
    expect(api).toContain('optionalText(most_valuable, 2000')
    expect(api).toContain('optionalText(improvements, 2000')
    expect(api).toContain('optionalText(name, 200')
    expect(api).toContain('optionalText(email, 320)')
  })

  test('feedback submissions use trusted edge IP rate limiting', () => {
    const api = read('src/app/api/feedback/route.js')
    expect(api).toContain("req.headers.get('cf-connecting-ip')")
    expect(api).toContain("req.headers.get('x-real-ip')")
    expect(api).not.toContain("req.headers.get('x-forwarded-for')")
    expect(api).toContain("p_max_count: 3")
    expect(api).toContain("p_window_seconds: 3600")
  })
})
