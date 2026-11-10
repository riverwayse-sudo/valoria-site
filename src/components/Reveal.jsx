'use client'

import { useEffect, useRef } from 'react'

export default function Reveal({ children, className = '', as: Tag = 'div', delay = 0, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('visible')
      return
    }

    let observer = null
    const timer = window.setTimeout(() => {
      if (!el.isConnected) return
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          el.classList.add('visible')
          observer?.disconnect()
          observer = null
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      )
      observer.observe(el)
    }, Math.max(0, delay * 1000))

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      observer = null
    }
  }, [delay])

  return <Tag ref={ref} className={`reveal ${className}`} {...props}>{children}</Tag>
}
