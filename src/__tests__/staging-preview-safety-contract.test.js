const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('staging preview safety boundary', () => {
  test('site API routes are blocked before the unauthenticated preview bypass', () => {
    const middleware = read('src/middleware.js')
    expect(middleware).toContain("process.env.VALU_PREVIEW === '1'")
    expect(middleware).toContain("if (isPreview && pathname.startsWith('/api/'))")
    expect(middleware).toContain("status: 503")
    expect(middleware).toContain('API access is disabled.')
    expect(middleware.indexOf("if (isPreview && pathname.startsWith('/api/'))")).toBeLessThan(middleware.indexOf('if (isPreview) return NextResponse.next()'))
  })

  test('preview navigation, journey cards, and reminders do not query account data', () => {
    expect(read('src/components/Nav.jsx')).toContain("if (process.env.NEXT_PUBLIC_VALU_PREVIEW === '1') { setUser(null); setAuthChecked(true); return }")
    expect(read('src/components/ValoriaJourneyCards.jsx')).toContain("if (process.env.NEXT_PUBLIC_VALU_PREVIEW === '1') { setLoading(false); return }")
    expect(read('src/components/ValuCompletionNudge.jsx')).toContain("if(process.env.NEXT_PUBLIC_VALU_PREVIEW === '1') return")
  })

  test('preview metadata is not indexable and production analytics are disabled', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toContain('index: false')
    expect(layout).toContain('follow: false')
    expect(layout).toContain('IS_STAGING')
    expect(layout).toContain('!IS_STAGING')
  })
})
