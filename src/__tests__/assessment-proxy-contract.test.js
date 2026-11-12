const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(process.cwd(), relative), 'utf8')

describe('same-origin assessment Worker proxy', () => {
  test('forwards interactive API methods and request bodies to the Worker API paths', () => {
    const route = read('src/app/valu/assessment/[[...path]]/route.js')
    expect(route).toContain("suffix === 'api' || suffix.startsWith('api/')")
    expect(route).toContain("return `/${suffix}`")
    expect(route).toContain('init.body = request.body')
    expect(route).toContain('export async function POST(request)')
    expect(route).toContain('export async function OPTIONS(request)')
    expect(route).toContain("const isApiRequest = target.pathname.startsWith('/api/')")
    expect(route).toContain("responseHeaders.set('cache-control', isApiRequest ? 'no-store'")
  })

  test('keeps Vite assets under the assessment mount and binds the correct Worker', () => {
    const route = read('src/app/valu/assessment/[[...path]]/route.js')
    const wrangler = read('wrangler.jsonc')
    expect(route).toContain('return `/valu/assessment/${suffix}`')
    expect(wrangler).toContain('"binding": "VALU_ASSESSMENT"')
    expect(wrangler).toContain('"service": "valoria-staging-assessment"')
    expect(wrangler).toContain('"run_worker_first": true')
  })

  test('staging empty marketplace explains that genuine profiles require explicit consent', () => {
    const marketplace = read('src/components/MarketplaceDirectory.jsx')
    expect(marketplace).toContain('Approved public profiles are being prepared.')
    expect(marketplace).toContain('the professional has chosen visibility')
    expect(marketplace).toContain("process.env.NEXT_PUBLIC_VALU_PREVIEW === '1'")
  })
})
