const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('public webinar feedback security contract', () => {
  test('feedback API validates, rate-limits and requires the server credential', () => {
    const api = read('src/app/api/feedback/route.js')
    expect(api).toContain('process.env.SUPABASE_SERVICE_ROLE_KEY')
    expect(api).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(api).toContain('Number.isInteger(overall_rating)')
    expect(api).toContain('overall_rating > 5')
    expect(api).toContain("req.headers.get('cf-connecting-ip')")
    expect(api).toContain("req.headers.get('x-real-ip')")
    expect(api).not.toContain("req.headers.get('x-forwarded-for')")
    expect(api).toContain("p_max_count: 3")
    expect(api).toContain("p_window_seconds: 3600")
    expect(api).toContain('status: 503')
    expect(api).toContain('status: 429')
  })

  test('feedback table rejects direct client writes and enforces data bounds', () => {
    const migration = read('supabase/migrations/20261112124000_secure_webinar_feedback_intake.sql')
    expect(migration).toContain('DROP POLICY IF EXISTS "public can insert feedback"')
    expect(migration).toContain('REVOKE INSERT ON TABLE public.webinar_feedback FROM anon, authenticated')
    expect(migration).toContain('GRANT INSERT ON TABLE public.webinar_feedback TO service_role')
    expect(migration).toContain('webinar_feedback_rating_range')
    expect(migration).toContain('webinar_feedback_attendance_allowed')
    expect(migration).toContain('webinar_feedback_text_lengths')
  })
})
