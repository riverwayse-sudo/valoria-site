'use client'

import { useRef } from 'react'

export default function BacklitSurface({ children, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)

  function move(event) {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--light-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--light-y', `${event.clientY - rect.top}px`)
  }

  return <Tag ref={ref} className={`backlit-surface ${className}`} onPointerMove={move}>{children}</Tag>
}
