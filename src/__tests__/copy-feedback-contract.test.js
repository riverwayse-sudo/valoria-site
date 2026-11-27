const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('profile share copy-feedback contract', () => {
  test('the share action confirms success only after the clipboard write resolves', () => {
    const component = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(component).toContain('async function copyLink()')
    expect(component).toContain('await navigator.clipboard.writeText(window.location.href)')
    expect(component).toContain("setCopyState('success')")
    expect(component).toContain("setCopyState('error')")
    expect(component).not.toContain('.catch(() => {})')
  })

  test('the existing share action morphs in place and announces its actual state', () => {
    const component = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(component).toContain('className="vi-copy-morph"')
    expect(component).toContain('data-state={copyState}')
    expect(component).toContain('aria-live="polite"')
    expect(component).toContain("'LINK COPIED'")
    expect(component).toContain("'COPY FAILED'")
  })

  test('copy feedback preserves its target size and respects reduced motion', () => {
    const styles = read('src/styles/design-constitution.css')
    expect(styles).toContain('.vi-copy-morph {')
    expect(styles).toContain('min-height: 48px;')
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toContain('.vi-copy-morph:active { transform: none; }')
  })
})
