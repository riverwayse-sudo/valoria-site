'use client'

import { useEffect } from 'react'

const ASSESSMENT_HOST = 'assessment.valoriainstitute.com'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

function track(name, params = {}) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag === 'function') window.gtag('event', name, params)
  if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params)
}

export default function MarketingInstrumentation() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utm = Object.fromEntries(UTM_KEYS.filter((key) => params.get(key)).map((key) => [key, params.get(key)]))

    const links = document.querySelectorAll('a[href*="assessment.valoriainstitute.com"]')
    links.forEach((link) => {
      try {
        const url = new URL(link.href)
        Object.entries(utm).forEach(([key, value]) => url.searchParams.set(key, value))
        link.href = url.toString()
      } catch {}
    })

    const onClick = (event) => {
      const link = event.target.closest?.('a[href]')
      if (!link) return

      let url
      try { url = new URL(link.href, window.location.href) } catch { return }
      const label = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120)

      if (url.hostname === ASSESSMENT_HOST) {
        track('valu_start_click', { cta_label: label, destination: url.pathname, ...utm })
      } else if (url.pathname.startsWith('/marketplace')) {
        track('marketplace_click', { cta_label: label, destination: url.pathname, ...utm })
      } else if (url.pathname === '/signup' || url.pathname.includes('/professional-signup')) {
        track('signup_start', { cta_label: label, destination: url.pathname, ...utm })
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
