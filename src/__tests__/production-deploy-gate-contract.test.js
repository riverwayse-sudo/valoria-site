const fs = require('fs')
const path = require('path')

const workflow = fs.readFileSync(
  path.join(__dirname, '../../.github/workflows/cloudflare-site-worker-deploy.yml'),
  'utf8'
)

describe('production deployment authorization contract', () => {
  test('push-based production deployment requires an explicit commit annotation', () => {
    expect(workflow).toContain("contains(github.event.head_commit.message, '[deploy-production]')")
  })

  test('manual production deployment requires an explicit DEPLOY selection', () => {
    expect(workflow).toContain('github.event.inputs.deploy == \'DEPLOY\'')
    expect(workflow).toContain('default: "NO"')
  })

  test('the production job is bound to the production environment', () => {
    expect(workflow).toContain('environment: production')
  })
})
