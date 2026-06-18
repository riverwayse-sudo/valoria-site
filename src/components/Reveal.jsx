'use client'
import { useEffect, useRef } from 'react'

// Wraps children and adds 'visible' class when scrolled into view,
// replicating the original site's IntersectionObserver reveal behavior.
export default function Reveal({ children, className = '', as: Tag = 'div', ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${className}`} {...props}>
      {children}
    </Tag>
  )
}
