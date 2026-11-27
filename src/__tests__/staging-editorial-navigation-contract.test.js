const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('staging editorial navigation contract', () => {
  test('only the staging layout receives the staging-site scope', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toContain("className={IS_STAGING ? 'staging-site' : undefined}")
  })

  test('desktop staging navigation is centered, pill-shaped and non-sticky', () => {
    const styles = read('src/styles/navigation-awakening.css')
    expect(styles).toContain('body.staging-site nav.vi-nav')
    expect(styles).toContain('position: relative !important;')
    expect(styles).toContain('border-radius: 999px;')
    expect(styles).toContain('margin: 22px auto 0;')
    expect(styles).toContain('@media (min-width: 1241px)')
  })

  test('the staging navigation refinement does not override the mobile layout', () => {
    const styles = read('src/styles/navigation-awakening.css')
    expect(styles).toContain('@media (min-width: 1241px)')
    expect(styles).not.toContain('body.staging-site .nav-mobile')
  })
})
