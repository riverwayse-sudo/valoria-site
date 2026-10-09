'use client'

import { useEffect, useMemo, useState } from 'react'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

const sessions = PROFESSIONAL_STANDARD_SERIES.filter((session) => session.dateApproved).slice(0, 3)

function labelForState(state) {
  if (state === 'ended') return 'DONE'
  if (state === 'live') return 'LIVE NOW'
  return 'COMING'
}

export default function HomepageEvents() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = sessions[active]
  const state = getSessionState(current)

  useEffect(() => {
    if (paused || sessions.length < 2) return undefined
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % sessions.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [paused])

  const status = useMemo(() => labelForState(state), [state])

  return (
    <section className="home-events" id="events" aria-labelledby="home-events-title">
      <div className="container">
        <div className="home-section-heading home-events-heading">
          <div>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">VALORIA IN MOTION</span></div>
            <h2 id="home-events-title">Ideas become <em>conversations.</em></h2>
          </div>
          <p>Watch what has already happened, then see what is coming next. Valoria events connect professional thinking, capability and practical action.</p>
        </div>

        <div className="home-events-feature" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="home-events-video">
            <iframe
              src="https://www.youtube.com/embed/B9dD22vTErI"
              title="Valoria Institute replay"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="home-events-slider">
            <div className="home-events-status">
              <span>{status}</span>
              <span>{String(active + 1).padStart(2, '0')} / {String(sessions.length).padStart(2, '0')}</span>
            </div>
            <div className="home-events-cluster">{current.cluster}</div>
            <h3>{current.title}</h3>
            <p>{current.description}</p>
            <div className="home-events-meta">
              <span>{formatSessionDate(current)}</span>
              <span>{current.speaker || 'VALORIA INSTITUTE'}</span>
            </div>
            <div className="home-events-controls">
              <div className="home-events-dots" role="tablist" aria-label="Valoria events">
                {sessions.map((session, index) => (
                  <button
                    key={session.id}
                    type="button"
                    className={index === active ? 'is-active' : ''}
                    onClick={() => setActive(index)}
                    aria-label={`Show event ${index + 1}: ${session.title}`}
                    aria-selected={index === active}
                    role="tab"
                  />
                ))}
              </div>
              <div className="home-events-arrows">
                <button type="button" onClick={() => setActive((active - 1 + sessions.length) % sessions.length)} aria-label="Previous event">←</button>
                <button type="button" onClick={() => setActive((active + 1) % sessions.length)} aria-label="Next event">→</button>
              </div>
            </div>
          </div>
        </div>

        <div className="home-events-footer">
          <span>PAST CONVERSATIONS · REPLAYS · UPCOMING PROGRAMMES</span>
          <a href="/events">VIEW ALL EVENTS <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  )
}
