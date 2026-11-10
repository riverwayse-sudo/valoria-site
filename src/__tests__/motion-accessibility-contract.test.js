const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Valoria motion accessibility and resilience', () => {
  test('scroll reveal is progressively enhanced and never hides content without observer support', () => {
    const reveal = read('src/components/Reveal.jsx')
    const motion = read('src/styles/motion.css')

    expect(reveal).toContain("typeof IntersectionObserver === 'undefined'")
    expect(reveal).toContain("el.classList.add('visible')")
    expect(reveal).toContain("el.classList.add('is-pending')")
    expect(reveal).toContain("el.classList.remove('is-pending')")
    expect(reveal).toContain('observer?.disconnect()')
    expect(reveal).toContain('window.clearTimeout(timer)')
    expect(motion).toMatch(/\.reveal\s*\{\s*opacity:\s*1;\s*transform:\s*none;/)
    expect(motion).toContain('.reveal.is-pending')
  })

  test('reduced-motion users receive static reveal and parallax states', () => {
    const motion = read('src/styles/motion.css')
    const parallax = read('src/components/ParallaxController.jsx')

    expect(motion).toContain('@media (prefers-reduced-motion: reduce)')
    expect(motion).toMatch(/\.reveal,[\s\S]*?opacity:\s*1 !important/)
    expect(motion).toContain('[data-parallax-speed]')
    expect(parallax).toContain("window.matchMedia?.('(prefers-reduced-motion: reduce)')")
    expect(parallax).toContain('reducedMotion?.matches')
  })

  test('parallax listeners, observer and animation frame are cleaned up', () => {
    const parallax = read('src/components/ParallaxController.jsx')

    expect(parallax).toContain('window.cancelAnimationFrame(frameId)')
    expect(parallax).toContain('observer?.disconnect()')
    expect(parallax).toContain("window.removeEventListener('scroll', scheduleUpdate)")
    expect(parallax).toContain("window.removeEventListener('resize', scheduleUpdate)")
    expect(parallax).toContain("layers.forEach((layer) => layer.style.removeProperty('--vi-parallax-y'))")
  })
})
