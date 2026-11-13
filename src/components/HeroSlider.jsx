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
                src="/images/temitayo-adetokunbo-host.webp"
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
