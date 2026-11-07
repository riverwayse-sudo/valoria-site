'use client'

import { useEffect } from 'react'

const MAX_PARALLAX_OFFSET = 42
const MAX_PARALLAX_SPEED = 0.16

/**
 * Applies restrained, transform-only parallax to explicitly marked decorative
 * layers inside one page region. Native scrolling remains untouched.
 */
export default function ParallaxController({ rootSelector = '#main-content' }) {
  useEffect(() => {
    const root = document.querySelector(rootSelector)
    if (!root) return

    const layers = Array.from(root.querySelectorAll('[data-parallax-speed]'))
    if (!layers.length) return

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)')
    if (reducedMotion?.matches || (finePointer && !finePointer.matches)) return

    const activeLayers = new Set()
    let frameId = 0

    const update = () => {
      frameId = 0
      const viewportHeight = window.innerHeight || 0

      activeLayers.forEach((layer) => {
        const speed = Number(layer.getAttribute('data-parallax-speed'))
        if (!Number.isFinite(speed) || Math.abs(speed) > MAX_PARALLAX_SPEED) {
          layer.style.setProperty('--vi-parallax-y', '0px')
          return
        }

        const rect = layer.getBoundingClientRect()
        // getBoundingClientRect includes the previous transform. Remove it before
        // calculating the next frame to prevent cumulative parallax feedback.
        const previousOffset = Number.parseFloat(layer.style.getPropertyValue('--vi-parallax-y')) || 0
        const elementCenter = rect.top + rect.height / 2 - previousOffset
        const distanceFromViewportCenter = viewportHeight / 2 - elementCenter
        const offset = Math.max(
          -MAX_PARALLAX_OFFSET,
          Math.min(MAX_PARALLAX_OFFSET, distanceFromViewportCenter * speed)
        )

        layer.style.setProperty('--vi-parallax-y', `${offset.toFixed(2)}px`)
      })
    }

    const scheduleUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update)
    }

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activeLayers.add(entry.target)
            } else {
              activeLayers.delete(entry.target)
              entry.target.style.setProperty('--vi-parallax-y', '0px')
            }
          })
          scheduleUpdate()
        }, { rootMargin: '160px 0px' })

    layers.forEach((layer) => {
      if (observer) observer.observe(layer)
      else activeLayers.add(layer)
    })

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    scheduleUpdate()

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      observer?.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      layers.forEach((layer) => layer.style.removeProperty('--vi-parallax-y'))
      activeLayers.clear()
    }
  }, [rootSelector])

  return null
}
