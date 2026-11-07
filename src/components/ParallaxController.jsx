'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const MAX_PARALLAX_OFFSET = 42
const MAX_PARALLAX_SPEED = 0.16
const PAGE_ATMOSPHERE_SELECTOR = '.page-hero, .valu-hero, .vs-hero, .events-hero, .insights-hero'

/**
 * Applies restrained, transform-only parallax to decorative layers and page
 * atmosphere layers. Page content and layout geometry are never transformed.
 * Re-scan after App Router navigation so each page receives its own atmosphere.
 */
export default function ParallaxController({ rootSelector = 'body' }) {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.querySelector(rootSelector)
    if (!root) return

    const markedLayers = Array.from(root.querySelectorAll('[data-parallax-speed]'))
    const pageAtmospheres = Array.from(root.querySelectorAll(PAGE_ATMOSPHERE_SELECTOR))
    const layers = Array.from(new Set([...markedLayers, ...pageAtmospheres]))
    if (!layers.length) return

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)')
    const shouldAnimate = () => !reducedMotion?.matches && (!finePointer || finePointer.matches)
    const resetLayers = () => layers.forEach((layer) => layer.style.setProperty('--vi-parallax-y', '0px'))

    const activeLayers = new Set()
    let frameId = 0

    const update = () => {
      frameId = 0
      if (!shouldAnimate()) {
        resetLayers()
        return
      }

      const viewportHeight = window.innerHeight || 0
      activeLayers.forEach((layer) => {
        const isPageAtmosphere = layer.matches(PAGE_ATMOSPHERE_SELECTOR)
        const configuredSpeed = layer.getAttribute('data-parallax-speed')
        const speed = Number(configuredSpeed ?? (isPageAtmosphere ? '0.035' : 'NaN'))
        if (!Number.isFinite(speed) || Math.abs(speed) > MAX_PARALLAX_SPEED) {
          layer.style.setProperty('--vi-parallax-y', '0px')
          return
        }

        const rect = layer.getBoundingClientRect()
        // Marked decorative layers move directly; page atmosphere moves via
        // ::before, so its section's own bounding box remains untransformed.
        const previousOffset = isPageAtmosphere
          ? 0
          : Number.parseFloat(layer.style.getPropertyValue('--vi-parallax-y')) || 0
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
      if (!shouldAnimate()) {
        if (frameId) window.cancelAnimationFrame(frameId)
        frameId = 0
        resetLayers()
        return
      }
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

    const onMotionPreferenceChange = () => scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    reducedMotion?.addEventListener?.('change', onMotionPreferenceChange)
    finePointer?.addEventListener?.('change', onMotionPreferenceChange)
    scheduleUpdate()

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      observer?.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      reducedMotion?.removeEventListener?.('change', onMotionPreferenceChange)
      finePointer?.removeEventListener?.('change', onMotionPreferenceChange)
      resetLayers()
      activeLayers.clear()
    }
  }, [rootSelector, pathname])

  return null
}
