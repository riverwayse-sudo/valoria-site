const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('touch-safe card motion contract', () => {
  test('card hover transforms are limited to fine hover pointers', () => {
    const styles = read('src/styles/motion.css')
    expect(styles).toContain('@media (hover: hover) and (pointer: fine)')
    expect(styles).toContain('.ps-card:hover { transform: translate3d(0,-3px,0); }')
    expect(styles).toContain('.ps-card-cta:hover { transform: translate3d(2px,0,0); }')
  })

  test('coarse pointers do not inherit persistent hover transforms', () => {
    const styles = read('src/styles/motion.css')
    expect(styles).toContain('@media (hover: none), (pointer: coarse)')
    expect(styles).toContain('.ps-card:hover,\n  .ps-card-cta:hover { transform: none; }')
  })

  test('keyboard focus remains visibly indicated', () => {
    const styles = read('src/styles/motion.css')
    expect(styles).toContain('.ps-card:focus-visible')
    expect(styles).toContain('.ps-card-cta:focus-visible')
  })
})
