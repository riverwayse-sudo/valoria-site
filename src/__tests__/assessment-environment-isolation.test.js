const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('assessment environment isolation', () => {
  test('staging is bound to the staging assessment Worker and staging Supabase project', () => {
    const config = JSON.parse(read('wrangler.jsonc'))
    expect(config.services).toContainEqual({ binding: 'VALU_ASSESSMENT', service: 'valoria-assessment' })
    expect(config.env.staging.name).toBe('valoria-staging-site')
    expect(config.env.staging.services).toContainEqual({ binding: 'VALU_ASSESSMENT', service: 'valoria-staging-assessment' })
    expect(config.env.staging.vars.VALU_STAGING_API_ENABLED).toBe('1')
    expect(config.env.staging.vars.SUPABASE_URL).toBe('https://yccxgjdqworgcbircnvn.supabase.co')
    expect(config.env.staging.vars.VALU_ASSESSMENT_ORIGIN).toBe('https://valoria-staging-assessment.riverwayse.workers.dev')
  })

  test('canonical assessment route and nested assets share the same isolated Worker proxy', () => {
    const rootRoute = read('src/app/valu/assessment/route.js')
    const nestedRoute = read('src/app/valu/assessment/[[...path]]/route.js')
    const proxy = read('src/lib/assessment-proxy.js')
    expect(rootRoute).toContain("import { proxyAssessment } from '@/lib/assessment-proxy'")
    expect(nestedRoute).toContain("import { proxyAssessment } from '@/lib/assessment-proxy'")
    expect(proxy).toContain("if (!suffix) return '/'")
    expect(proxy).toContain("if (suffix === 'api' || suffix.startsWith('api/'))")
  })

  test('assessment proxy permits the staging host only in the staging runtime', () => {
    const proxy = read('src/app/valu/assessment/[[...path]]/route.js')
    expect(proxy).toContain("'valoria-staging-assessment.riverwayse.workers.dev'")
    expect(proxy).toContain("process.env.VALU_STAGING_API_ENABLED === '1'")
    expect(proxy).toContain('if (stagingRuntime !== stagingAssessment) return null')
  })

  test('account confirmation links use the configured site origin in every environment', () => {
    const signup = read('src/app/signup/page.jsx')
    const professionalSignup = read('src/app/professional-signup/page.jsx')
    expect(signup).toContain("process.env.NEXT_PUBLIC_SITE_URL || 'https://valoriainstitute.com'")
    expect(professionalSignup).toContain('getAuthCallbackUrl(tasterId)')
    expect(professionalSignup).not.toContain('window.location.origin')
  })

  test('staging sitemap uses its own hostname and robots blocks indexing', () => {
    const sitemap = read('src/app/sitemap.js')
    const robots = read('src/app/robots.js')
    expect(sitemap).toContain("process.env.NEXT_PUBLIC_SITE_URL || 'https://valoriainstitute.com'")
    expect(robots).toContain("process.env.VALU_STAGING_API_ENABLED === '1'")
    expect(robots).toContain("disallow: ['/']")
  })
})
