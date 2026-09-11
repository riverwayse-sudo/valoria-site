'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs/lib/anime.es.js'
import { motion, useReducedMotion } from 'motion/react'

export default function ValuMotion({ children, className = '' }) {
  const radar = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!radar.current || reduced) return
    const points = radar.current.querySelectorAll('[data-valu-point]')
    const animation = anime({
      targets: points,
      scale: [0.75, 1],
      opacity: [0.25, 1],
      delay: anime.stagger(110),
      duration: 700,
      easing: 'easeOutElastic(1, .7)',
    })
    return () => animation.pause()
  }, [reduced])

  return (
    <motion.div
      ref={radar}
      className={`valu-motion ${className}`}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
