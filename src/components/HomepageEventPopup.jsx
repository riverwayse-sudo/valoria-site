'use client'

import { useCallback, useEffect, useState } from 'react'
import EventPoster from '@/components/EventPoster'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState } from '@/lib/professionalStandardSeries'

const SESSION = PROFESSIONAL_STANDARD_SERIES.find((item) => item.id === '04')
const DISMISS_KEY = 'valoria-home-event-popup-dismissed-2026-11-v3'
const MEET_URL = 'https://meet.google.com/hde-owjd-mwc'

export default function HomepageEventPopup() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }, [])

  useEffect(() => {
    if (!SESSION || !['registration-open', 'live'].includes(getSessionState(SESSION))) return undefined

    try {
      if (window.localStorage.getItem(DISMISS_KEY) === '1') return undefined
    } catch {}

    const timer = window.setTimeout(() => {
      setOpen(true)
    }, 10000)
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
        <button className="homepage-event-popup-close" type="button" onClick={close} aria-label="Close event announcement" autoFocus>×</button>
        <div className="homepage-event-popup-poster">
          <EventPoster session={SESSION} />
        </div>
        <div className="homepage-event-popup-copy">
          <p className="homepage-event-popup-eyebrow">LIVE AT VALORIA · PROFESSIONAL STANDARD SERIES</p>
          <h2 id="homepage-event-popup-title">The conversation is live.</h2>
          <p>{SESSION.description}</p>
          <div className="homepage-event-popup-actions">
            <a className="event-register-button" href={MEET_URL} target="_blank" rel="noopener noreferrer">JOIN THE LIVE EVENT <span aria-hidden="true">→</span></a>
            <button className="homepage-event-popup-dismiss" type="button" onClick={close}>Maybe later</button>
          </div>
        </div>
      </section>
    </div>
  )
}
