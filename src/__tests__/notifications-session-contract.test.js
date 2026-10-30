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

describe('authenticated VALU continuation entry points', () => {
  test('dashboard continue action resumes through the signed-in journey handoff', () => {
    const dashboard = fs.readFileSync(
      path.join(process.cwd(), 'src/app/dashboard/page.jsx'),
      'utf8'
    )
    expect(dashboard).toContain("? '/journey/continue?stage=assess'")
    expect(dashboard).not.toContain("? '/valu/start'")
  })

  test('in-progress assessment nudge uses the authenticated continuation route', () => {
    const nudge = fs.readFileSync(
      path.join(process.cwd(), 'src/components/ValuCompletionNudge.jsx'),
      'utf8'
    )
    expect(nudge).toContain('assessmentStarted?"/journey/continue?stage=assess":"/valu/start"')
  })
})
