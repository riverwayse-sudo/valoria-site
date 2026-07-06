'use client'
import { useState, useEffect } from 'react'
import WaitlistModal from './WaitlistModal'

const GATE_KEY = 'vi_waitlist_gate_v2'
const COOKIE_KEY = 'vi_waitlist_v2'

export default function WaitlistGate() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const inLocal = localStorage.getItem(GATE_KEY)
    const inCookie = document.cookie.includes(COOKIE_KEY)
    if (!inLocal && !inCookie) {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  return <WaitlistModal open={visible} onClose={null} source="site_gate" />
}
