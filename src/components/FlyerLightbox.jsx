'use client'

import { useEffect, useState } from 'react'

export default function FlyerLightbox({ src, position = 'left', alt }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const close = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = '' }
  }, [open])
  const offset = position === 'right' ? '-50%' : '0%'
  return <>
    <button className="session-series-flyer" type="button" onClick={() => setOpen(true)} aria-label={`View ${alt} full size`}>
      <img src={src} alt={alt} style={{ transform: `translateX(${offset})` }} />
      <span className="flyer-expand">VIEW FLYER ↗</span>
    </button>
    {open && <div className="flyer-lightbox" role="presentation" onMouseDown={e => e.target === e.currentTarget && setOpen(false)}>
      <button className="flyer-lightbox-close" type="button" onClick={() => setOpen(false)} aria-label="Close flyer">×</button>
      <div className="flyer-lightbox-frame"><img src={src} alt={alt} style={{ transform: `translateX(${offset})` }} /></div>
      <p>CLICK OUTSIDE OR PRESS ESC TO CLOSE</p>
    </div>}
  </>
}
