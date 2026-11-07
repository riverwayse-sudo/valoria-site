const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('production assessment Worker proxy', () => {
  test('forwards interactive API methods and request bodies to the Worker API paths', () => {
    const route = read('src/app/valu/assessment/[[...path]]/route.js')
    expect(route).toContain("suffix === 'api' || suffix.startsWith('api/')")
    expect(route).toContain("return `/${suffix}`")
    expect(route).toContain('init.body = request.body')
    expect(route).toContain('export async function POST(request)')
    expect(route).toContain('export async function OPTIONS(request)')
    expect(route).not.toContain('VALU_PREVIEW_ASSESSMENT_ORIGIN')
    expect(route).not.toContain('valoria-staging-assessment.riverwayse.workers.dev')
    expect(route).toContain("const isApiRequest = target.pathname.startsWith('/api/')")
    expect(route).toContain("responseHeaders.set('cache-control', isApiRequest ? 'no-store'")
  })

  test('keeps Vite assets under the assessment mount and binds the production Worker', () => {
    const route = read('src/app/valu/assessment/[[...path]]/route.js')
    const wrangler = read('wrangler.jsonc')
    expect(route).toContain('return `/valu/assessment/${suffix}`')
    expect(wrangler).toContain('"binding": "VALU_ASSESSMENT"')
    expect(wrangler).toContain('"service": "valoria-assessment"')
    expect(wrangler).toContain('"run_worker_first": true')
  })

  test('public VALU pages describe registration before the taster and a separate secure account', () => {
    const start = read('src/app/valu/start/page.jsx')
    const valu = read('src/app/valu/page.jsx')
    const signup = read('src/app/signup/page.jsx')
    expect(start).toContain('Register your contact and professional details before the taster')
    expect(start).toContain('This is not your Valoria account')
    expect(valu).toContain('Register your details first')
    expect(valu).not.toContain('no account required')
    expect(signup).toContain('register your contact and professional details before taking the VALU taster')
  })
})
