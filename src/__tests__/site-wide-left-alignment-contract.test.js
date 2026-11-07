const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('main website left-alignment contract', () => {
  test('the global alignment stylesheet is loaded by the root layout', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toContain("import '../styles/globals.css'")
  })

  test('all page copy is left aligned across every route, including inline-styled elements', () => {
    const css = read('src/styles/globals.css')
    expect(css).toMatch(/html body,\s*html body \*\s*\{\s*text-align:\s*left\s*!important;/)
  })

  test('desktop dropdowns, nested dropdown links and mobile navigation are explicitly covered', () => {
    const css = read('src/styles/globals.css')
    const navigation = read('src/components/Nav.jsx')
    for (const selector of ['.nav-dropdown', '.nav-dropdown-grid', '.nav-dropdown-link', '.nav-dropdown-description', '.nav-mobile', '.nav-mobile-link']) {
      expect(css).toContain(selector)
      expect(navigation).toContain(selector.replace('.', ''))
    }
  })

  test('the same global rule covers page headings, body copy, cards, forms and calls to action', () => {
    const css = read('src/styles/globals.css')
    expect(css).toContain('MAIN WEBSITE ALIGNMENT CONTRACT')
    expect(css).toContain('text-align: left !important')
    expect(css).toContain('main section')
    expect(css).toContain('main article')
    expect(css).toContain('[role="main"]')
    expect(css).toContain('html body .eyebrow-center')
    expect(css).toContain('html body .home-section-heading')
    expect(css).toContain('html body .page-hero-actions-centered')
    expect(css).toContain('html body .btn-gold')
    expect(css).toContain('html body .session-series-primary')
    expect(css).toContain('html body .session-series-secondary')
    expect(css).toContain('justify-content: flex-start !important')
  })
})
