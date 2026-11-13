'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/brand'
import EventRegistrationModal, { SessionTimer } from './EventRegistrationModal'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

export default function HeroSlider() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  const upcomingSession = PROFESSIONAL_STANDARD_SERIES.find((session) => getSessionState(session) !== 'ended' && session.id !== '01') || PROFESSIONAL_STANDARD_SERIES[1]
  const upcomingState = getSessionState(upcomingSession)
  const canRegister = upcomingState === 'registration-open'

  useEffect(() => {
    if (paused || selectedSession) return undefined
    const timer = window.setInterval(() => setActive((index) => (index + 1) % 2), 9000)
    return () => window.clearInterval(timer)
  }, [paused, selectedSession])

  const goTo = (index) => setActive(index)
  const openRegistration = () => {
    if (canRegister) setSelectedSession(upcomingSession)
  }

  return (
    <section className="hero hero-slider hero-fashion-editorial" id="hero" aria-label="Valoria Institute introduction">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-slides" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className={`hero-slide ${active === 0 ? 'is-active' : ''}`} aria-hidden={active !== 0}>
          <div className="container hero-inner">
            <div className="hero-editorial-copy">
              <div className="hero-eyebrow au d1"><div className="hero-eyebrow-line" /><span className="hero-eyebrow-text">THE INSTITUTION FOR PROFESSIONAL MERIT</span></div>
              <p className="hero-editorial-issue">WORTH. BUILT. <span>— THE VALORIA STANDARD</span></p>
              <h1 className="hero-title au d2">Talent is not the problem.<br /><em>Infrastructure is.</em></h1>
              <p className="hero-sub au d3">Valoria builds the systems that develop African professionals, make merit visible and connect proven capability to meaningful opportunity.</p>
              <div className="hero-actions au d4">
                <a href={BRAND.assessmentUrl} className="btn-gold">START THE VALU TASTER <span aria-hidden="true">→</span></a>
                <a href="/about-us" className="btn-outline">THE INSTITUTION</a>
              </div>
              <p className="hero-editorial-footnote">DEVELOPMENT · VISIBILITY · CONNECTION</p>
            </div>

            <div className="hero-editorial-visual au d3">
              <img
                className="hero-editorial-image"
                src="data:image/webp;base64,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"
                alt="Valoria Institute host Temitayo Adetokunbo"
                fetchPriority="high"
              />
              <div className="hero-editorial-image-shade" aria-hidden="true" />
              <div className="hero-editorial-caption">
                <span>THE PEOPLE BEHIND THE STANDARD</span>
                <strong>Worth is recognised.<br />Merit is built.</strong>
              </div>
              <div className="valu-card" aria-label="The VALU Index structure">
                <div className="vc-label">THE VALU INDEX</div>
                <div className="vc-score"><span className="vc-num">VALU</span><span className="vc-denom">INDEX</span></div>
                <div className="vc-desig">POINTS-BASED CAPABILITY PROFILE</div>
                <div className="vc-cluster-list"><span>Presence</span><span>Relationships</span><span>Intelligence</span><span>Mastery</span><span>Enterprise</span></div>
                <div className="vc-foot">PRIME framework · results expressed in points</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`hero-slide hero-event-slide ${active === 1 ? 'is-active' : ''}`} aria-hidden={active !== 1}>
          <div className="container hero-inner">
            <div>
              <div className="hero-event-kicker">UPCOMING AT VALORIA</div>
              <h1 className="hero-title">The next conversation<br />on the <em>professional standard.</em></h1>
              <p className="hero-event-copy">The Professional Standard Series brings practical conversations on the capabilities that turn professional performance into recognised opportunity.</p>
              <div className="hero-event-meta">{formatSessionDate(upcomingSession)} · 10:00 AM WAT</div>
              <div className="hero-actions">
                <button type="button" className="btn-gold hero-register-cta" onClick={openRegistration} disabled={!canRegister}>REGISTER FOR THIS CONVERSATION →</button>
                <a href="/events" className="btn-outline">VIEW ALL EVENTS →</a>
              </div>
            </div>
            <aside className="hero-event-panel" aria-label={`Upcoming event: ${upcomingSession.title}`}>
              <div className="hero-event-cluster">{upcomingSession.cluster}</div>
              <h2>{upcomingSession.title}</h2>
              <p>{upcomingSession.description}</p>
              <div className="hero-event-status">{upcomingState === 'coming-soon' ? 'COMING SOON · DATE TO BE CONFIRMED' : formatSessionDate(upcomingSession)}</div>
              {upcomingState !== 'coming-soon' && <SessionTimer session={upcomingSession} />}
            </aside>
          </div>
        </div>
      </div>

      <div className="hero-slider-controls" aria-label="Homepage slides">
        <button type="button" className={`hero-slider-dot ${active === 0 ? 'is-active' : ''}`} onClick={() => goTo(0)} aria-label="Show Valoria introduction slide" aria-pressed={active === 0} />
        <button type="button" className={`hero-slider-dot ${active === 1 ? 'is-active' : ''}`} onClick={() => goTo(1)} aria-label="Show upcoming event slide" aria-pressed={active === 1} />
        <span className="hero-slider-index">0{active + 1} / 02</span>
      </div>
      <div className="hero-scroll-cue" aria-hidden="true"><span>DISCOVER</span><svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>

      {selectedSession && <EventRegistrationModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </section>
  )
}
