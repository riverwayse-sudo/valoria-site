'use client'

import { useCallback, useEffect, useState } from 'react'
import EventPoster from '@/components/EventPoster'
import EventRegistrationTrigger from '@/components/EventRegistrationTrigger'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState } from '@/lib/professionalStandardSeries'

const SESSION = PROFESSIONAL_STANDARD_SERIES.find((item) => item.id === '03')
const DISMISS_KEY = 'valoria-home-event-popup-dismissed-2026-10'

export default function HomepageEventPopup() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }, [])

  useEffect(() => {
    if (!SESSION || getSessionState(SESSION) !== 'registration-open') return undefined

    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') return undefined
    } catch {}

    const timer = window.setTimeout(() => setOpen(true), 2200)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  if (!SESSION || !open) return null

  return (
    <div className="events-page homepage-event-popup-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close()
    }}>
      <section className="homepage-event-popup" role="dialog" aria-modal="true" aria-labelledby="homepage-event-popup-title">
        <button className="homepage-event-popup-close" type="button" onClick={close} aria-label="Close event announcement">×</button>
        <div className="homepage-event-popup-poster">
          <EventPoster session={SESSION} />
        </div>
        <div className="homepage-event-popup-copy">
          <p className="homepage-event-popup-eyebrow">THE NEXT VALORIA CONVERSATION</p>
          <h2 id="homepage-event-popup-title">Your next level of performance should not cost you your wellbeing.</h2>
          <p>Explore the gap between being busy and creating impact — and how high performers can build a more sustainable way to work.</p>
          <div className="homepage-event-popup-actions">
            <EventRegistrationTrigger session={SESSION} className="event-register-button" >RESERVE YOUR PLACE <span aria-hidden="true">→</span></EventRegistrationTrigger>
            <button className="homepage-event-popup-dismiss" type="button" onClick={close}>Maybe later</button>
          </div>
        </div>
      </section>
    </div>
  )
}
