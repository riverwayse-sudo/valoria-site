const fs = require('fs')
const path = require('path')

describe('notifications session authentication', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/app/api/notifications/route.js'),
    'utf8'
  )

  test('uses Supabase SSR cookie handling for encoded and chunked sessions', () => {
    expect(source).toContain("import { createServerClient } from '@supabase/ssr'")
    expect(source).toContain('getAll() { return request.cookies.getAll() }')
    expect(source).toContain('await supabase.auth.getUser()')
    expect(source).not.toContain('function getAccessToken')
    expect(source).not.toContain('JSON.parse(raw)')
  })

  test('notification queries remain scoped to the authenticated user', () => {
    expect(source).toContain(".eq('user_id', user.id)")
    expect(source).toContain("from('platform_notifications')")
  })
})
