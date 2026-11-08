const fs = require('fs')
const path = require('path')
const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('homepage event popup layout', () => {
  test('popup is compact and keeps poster content inside a scrollable viewport', () => {
    const css = read('src/app/pages.css')
    expect(css).toContain('width:min(780px,100%)')
    expect(css).toContain('max-height:min(82svh,680px)')
    expect(css).toContain('.homepage-event-popup .event-poster{\n  min-height:0;height:auto;')
    expect(css).toContain('max-width:420px;max-height:88svh')
    expect(css).toContain('@media(max-height:700px) and (min-width:701px)')
  })
})
