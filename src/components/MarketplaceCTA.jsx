'use client'
import { useState } from 'react'
import MarketplaceModal from './MarketplaceModal'

// Drop-in replacement for a direct <a href="/atb-connect"> or <Link href="/marketplace">
// that goes straight to one marketplace. Renders as a real <a> (href="#") so every
// existing className/style at each call site keeps working exactly as before —
// only the click behavior changes, from "navigate" to "open the choice popup".
export default function MarketplaceCTA({ children, className, style }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <a
        href="#"
        className={className}
        style={style}
        onClick={(e) => { e.preventDefault(); setOpen(true) }}
      >
        {children}
      </a>
      <MarketplaceModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
