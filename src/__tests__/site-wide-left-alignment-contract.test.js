const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('main website left-alignment contract', () => {
  test('the global alignment stylesheet is loaded by the root layout', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toContain("import '../styles/globals.css'")
    expect(layout).toContain('href="#site-content-start"')
  })

  test('all page copy is left aligned across every route', () => {
    const css = read('src/styles/globals.css')
    expect(css).toContain('html body *')
    expect(css).toContain('text-align: left !important')
  })

  test('desktop dropdowns and mobile navigation are explicitly covered', () => {
    const css = read('src/styles/globals.css')
    for (const selector of ['.nav-dropdown', '.nav-dropdown-grid', '.nav-dropdown-link', '.nav-dropdown-description', '.nav-mobile', '.nav-mobile-link', '.page-hero-actions-centered', '.eyebrow-center']) {
      expect(css).toContain(selector)
    }
  })

  test('the global contract preserves reduced-motion accessibility', () => {
    const css = read('src/styles/globals.css')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('justify-content: flex-start !important')
  })
  test('main website JSX does not overwrite layout classes with duplicate className props', () => {
    for (const path of [
      'src/app/facilitators/page.jsx',
      'src/app/contact-us/page.jsx',
      'src/app/programmes/page.jsx',
    ]) {
      const source = read(path)
      expect(source).not.toMatch(/className="[^"]+"\s+className="/)
    }
  })

})
