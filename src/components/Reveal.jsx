'use client'

import { useEffect, useRef } from 'react'

export default function Reveal({ children, className = '', as: Tag = 'div', delay = 0, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.classList.add('visible')
      return
    }

    const timer = window.setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          el.classList.add('visible')
          observer.disconnect()
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      )
      observer.observe(el)
      return () => observer.disconnect()
    }, Math.max(0, delay * 1000))

    return () => window.clearTimeout(timer)
  }, [delay])

  return <Tag ref={ref} className={`reveal ${className}`} {...props}>{children}</Tag>
}
