const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('staging preview safety boundary', () => {
  test('site API routes are blocked before the unauthenticated preview bypass', () => {
    const middleware = read('src/middleware.js')
    expect(middleware).toContain("process.env.VALU_PREVIEW === '1'")
    expect(middleware).toContain("if (isReadOnlyPreview && pathname.startsWith('/api/'))")
    expect(middleware).toContain("status: 503")
    expect(middleware).toContain('Staging preview is simulation-only; API access is disabled.')
    expect(middleware.indexOf("if (isReadOnlyPreview && pathname.startsWith('/api/'))")).toBeLessThan(middleware.indexOf('if (isReadOnlyPreview) return NextResponse.next()'))
  })

  test('preview navigation, journey cards, and reminders do not query account data', () => {
    expect(read('src/components/Nav.jsx')).toContain("if (process.env.NEXT_PUBLIC_VALU_PREVIEW === '1') { setUser(null); setAuthChecked(true); return }")
    expect(read('src/components/ValoriaJourneyCards.jsx')).toContain("if (process.env.NEXT_PUBLIC_VALU_PREVIEW === '1') { setLoading(false); return }")
    expect(read('src/components/ValuCompletionNudge.jsx')).toContain("if(process.env.NEXT_PUBLIC_VALU_PREVIEW === '1') return")
  })

  test('read-only preview never queries the live public roster or lists member profile URLs', () => {
    const marketplace = read('src/lib/marketplace-data.js')
    expect(marketplace).toContain("const IS_READ_ONLY_PREVIEW = process.env.VALU_PREVIEW === '1' || process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.CF_WORKERS_PREVIEW === '1'")
    expect(marketplace).toContain('if (IS_READ_ONLY_PREVIEW) return []')
    expect(marketplace).toContain('if (IS_READ_ONLY_PREVIEW) return { all: 0, candidate: 0, speaker: 0, facilitator: 0 }')
    expect(marketplace.indexOf('if (IS_READ_ONLY_PREVIEW) return []')).toBeLessThan(marketplace.indexOf('createClient(url, key'))

    const sitemap = read('src/app/sitemap.js')
    expect(sitemap).toContain('if (IS_PREVIEW) return staticEntries')
    expect(sitemap.indexOf('if (IS_PREVIEW) return staticEntries')).toBeLessThan(sitemap.indexOf("await import('@supabase/supabase-js')"))
  })

  test('the OpenNext Worker handles dynamic routes before static asset fallback', () => {
    const wrangler = read('wrangler.jsonc')
    const nextConfig = read('next.config.js')
    const assessmentProxy = read('src/app/valu/assessment/[[...path]]/route.js')
    expect(wrangler).toContain('"run_worker_first": true')
    expect(wrangler).toContain('"VALU_PREVIEW_ASSESSMENT_ORIGIN": "https://valoria-staging-assessment.riverwayse.workers.dev"')
    expect(wrangler).toContain('"binding": "VALU_ASSESSMENT"')
    expect(wrangler).toContain('"service": "valoria-staging-assessment"')
    expect(assessmentProxy).toContain('ALLOWED_ASSESSMENT_HOSTS')
    expect(assessmentProxy).toContain('process.env.VALU_PREVIEW_ASSESSMENT_ORIGIN')
    expect(assessmentProxy).toContain("suffix ? `/valu/assessment/${suffix}` : '/'")
    expect(nextConfig).not.toContain("source: '/valu/assessment'")
  })

  test('preview metadata is not indexable and production analytics are disabled', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toMatch(/index:\s*false/)
    expect(layout).toMatch(/follow:\s*false/)
    expect(layout).toContain('IS_STAGING')
    expect(layout).toContain('!IS_STAGING')
  })
})
