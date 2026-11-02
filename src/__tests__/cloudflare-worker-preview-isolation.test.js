const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(__dirname, relative), 'utf8')
const nextConfig = read('../../next.config.js')
const wrangler = read('../../wrangler.jsonc')
const workflow = read('../../.github/workflows/cloudflare-site-worker.yml')

describe('Cloudflare Worker Preview isolation contract', () => {
  test('Worker Preview is distinguished from production before choosing the assessment origin', () => {
    expect(nextConfig).toContain("process.env.CF_WORKERS_PREVIEW === '1'")
    expect(nextConfig).toContain("const isCloudflareWorker = process.env.CF_WORKERS === '1'")
    expect(nextConfig).toContain("const isCloudflareWorkerProduction = isCloudflareWorker && !isCloudflarePreview")
    expect(nextConfig).toContain("process.env.CF_PAGES_BRANCH === 'main'")
    expect(nextConfig).toContain('const configuredVALUOrigin = isPreview')
    expect(nextConfig).toContain('process.env.VALU_PREVIEW_ASSESSMENT_ORIGIN')
    expect(nextConfig).toContain("preview.hostname === 'assessment.valoriainstitute.com'")
  })

  test('Wrangler preview runtime sets an explicit non-production marker', () => {
    expect(wrangler).toContain('"CF_WORKERS_PREVIEW": "1"')
  })

  test('Cloudflare build validation uses placeholder credentials and a dry-run only', () => {
    expect(workflow).toContain('https://placeholder.supabase.co')
    expect(workflow).toContain('CF_WORKERS_PREVIEW=1')
    expect(workflow).toContain('https://assessment-preview.invalid')
    expect(workflow).toContain('wrangler deploy --dry-run')
    expect(workflow).not.toContain('wrangler deploy --config wrangler.jsonc\n')
  })
})
