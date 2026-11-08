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

  test('shared public-page and homepage shells use one content width and gutter', () => {
    const pages = read('src/app/pages.css')
    const home = read('src/app/home.css')
    expect(pages).toContain('calc(100% - 2 * var(--pad))')
    expect(pages).toContain('var(--vi-content,1160px)')
    expect(pages).toContain('.page-section-inner{width:min(var(--vi-content,1160px),calc(100% - 2 * var(--pad)))')
    expect(pages).toContain('.vs-shell{width:min(var(--vi-content,1160px),calc(100% - 2 * var(--pad)))')
    const components = read('src/styles/component-system.css')
    expect(components).toContain('.journey-shell{width:min(var(--vi-content,1160px),calc(100% - 2 * var(--pad)))')
    expect(components).toContain('.session-showcase-inner{position:relative;z-index:1;width:100%;max-width:var(--vi-content,1160px)')
    expect(components).toContain('.session-series-inner{width:100%;max-width:var(--vi-content,1160px)')
    expect(components).toContain('.uf-grid{width:100%;max-width:var(--vi-content,1160px)')
    expect(components).toContain('.uf-bottom{width:100%;max-width:var(--vi-content,1160px)')
    expect(pages).toContain('.page-hero{position:relative;padding:152px 0 88px')
    expect(pages).toContain('.page-section{padding:clamp(72px,8vw,112px) 0')
    expect(home).toContain('--space-content-width: var(--vi-content, 1160px)')
    expect(home).toContain('calc(100% - 2 * var(--pad))')
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


  test('homepage section headings use the shared left-aligned editorial grid', () => {
    const css = read('src/app/home.css')
    expect(css).toContain('grid-template-columns: minmax(0, 1.1fr) minmax(260px, .9fr)')
    expect(css).toContain('text-align: left')
    expect(css).toContain('justify-content: flex-start')
    expect(css).toContain('.home-section-heading {')
    expect(css).toContain('grid-template-columns: 1fr')
  })

  test('homepage replay does not depend on an owner-disabled embedded player', () => {
    const source = read('src/components/HomepageEvents.jsx')
    expect(source).toContain('home-events-video-link')
    expect(source).toContain('i.ytimg.com/vi/')
    expect(source).not.toContain('youtube-nocookie.com/embed/')
  })

  test('empty marketplace state offers truthful sourcing routes without implying public listings exist', () => {
    const source = read('src/components/LiveProfilesScroll.jsx')
    expect(source).toContain('The registry is opening through verified capability.')
    expect(source).toContain('/contact-us?type=candidate')
    expect(source).toContain('/contact-us?type=speaker_booking')
    expect(source).toContain('/contact-us?type=training')
  })


  test('fixed navigation and footer container share the public-page content grid', () => {
    const components = read('src/styles/component-system.css')
    expect(components).toContain('padding-inline:max(var(--pad),calc((100vw - var(--vi-content,1160px))/2))')
    expect(components).toContain('.vi-footer > .container{')
    expect(components).toContain('max-width:none;')
    expect(components).toContain('.uf-bottom{align-items:flex-start;text-align:left}')
  })

})
