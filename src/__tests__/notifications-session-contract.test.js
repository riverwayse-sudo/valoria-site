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
  test('dashboard continue action issues a dashboard-only one-time handoff', () => {
    const dashboard = fs.readFileSync(
      path.join(process.cwd(), 'src/app/dashboard/page.jsx'),
      'utf8'
    )
    expect(dashboard).toContain("? '/dashboard/continue-assessment'")
    expect(dashboard).toContain('dashboardOnly')
    expect(dashboard).not.toContain("? '/valu/start'")
  })

  test('sitewide assessment nudge returns participants to the dashboard', () => {
    const nudge = fs.readFileSync(
      path.join(process.cwd(), 'src/components/ValuCompletionNudge.jsx'),
      'utf8'
    )
    expect(nudge).toContain('assessmentStarted?"/dashboard":"/valu/start"')
    expect(nudge).toContain('OPEN MY DASHBOARD')
  })
})
