'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function PremiumMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Editorial reveal system. Existing [data-reveal] and .au elements are
      // upgraded from CSS-only reveals to GPU-friendly GSAP transforms.
      gsap.utils.toArray('[data-reveal], .reveal').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform,opacity,visibility',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })

      // Hero atmosphere moves slightly with scroll; this stays deliberately
      // restrained so the institutional message remains the focal point.
      gsap.utils.toArray('.hero-bg, .hero-grid').forEach((element, index) => {
        gsap.to(element, {
          yPercent: index === 0 ? 7 : 3,
          ease: 'none',
          scrollTrigger: {
            trigger: element.closest('section') || document.body,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      })

      // Premium card lift without layout movement or heavy shadows.
      gsap.utils.toArray('.vi-card, .card, .event-card').forEach((card) => {
        const onEnter = () => gsap.to(card, { y: -4, duration: 0.28, ease: 'power2.out', overwrite: true })
        const onLeave = () => gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out', overwrite: true })
        card.addEventListener('mouseenter', onEnter)
        card.addEventListener('mouseleave', onLeave)
        card._valoriaMotionCleanup = () => {
          card.removeEventListener('mouseenter', onEnter)
          card.removeEventListener('mouseleave', onLeave)
        }
      })

      // Small, controlled CTA response. No magnetic movement on touch devices.
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        gsap.utils.toArray('.btn-gold, .btn-secondary, .btn-tertiary, .btn-ghost, .btn-outline').forEach((button) => {
          const onEnter = () => gsap.to(button, { y: -2, duration: 0.22, ease: 'power2.out', overwrite: true })
          const onLeave = () => gsap.to(button, { y: 0, duration: 0.3, ease: 'power2.out', overwrite: true })
          button.addEventListener('mouseenter', onEnter)
          button.addEventListener('mouseleave', onLeave)
          button._valoriaMotionCleanup = () => {
            button.removeEventListener('mouseenter', onEnter)
            button.removeEventListener('mouseleave', onLeave)
          }
        })
      }
    })

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      document.querySelectorAll('.vi-card, .card, .event-card, .btn-gold, .btn-secondary, .btn-tertiary, .btn-ghost, .btn-outline').forEach((element) => {
        element._valoriaMotionCleanup?.()
        delete element._valoriaMotionCleanup
      })
    }
  }, [])

  return null
}
