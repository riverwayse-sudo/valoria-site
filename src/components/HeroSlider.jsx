'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/brand'
import MarketplaceCTA from './MarketplaceCTA'
import EventRegistrationModal, { SessionTimer } from './EventRegistrationModal'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

export default function HeroSlider() {
  const bars = [88, 90, 82, 80, 75]
  const scores = [['P', 88], ['R', 90], ['I', 82], ['M', 80], ['E', 75]]
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
    <section className="hero hero-slider" id="hero" aria-label="Valoria Institute introduction">
      <style>{`
        .hero-slider{position:relative;overflow:hidden}
        .hero-slider .hero-slides{position:relative;min-height:clamp(690px,88vh,900px)}
        .hero-slider .hero-slide{position:absolute;inset:0;opacity:0;visibility:hidden;pointer-events:none;transform:translateX(24px);transition:opacity .7s ease,transform .8s cubic-bezier(.22,.61,.36,1),visibility .7s ease}
        .hero-slider .hero-slide.is-active{opacity:1;visibility:visible;pointer-events:auto;transform:translateX(0);z-index:2}
        .hero-event-slide .hero-inner{grid-template-columns:minmax(0,1.04fr) minmax(360px,.96fr);gap:clamp(40px,5.5vw,82px);align-items:center}
        .hero-event-slide .hero-title{max-width:760px}
        .hero-event-kicker{display:flex;align-items:center;gap:10px;font:800 10px var(--font);letter-spacing:.2em;color:#C9A84C;margin-bottom:20px;text-transform:uppercase}
        .hero-event-kicker:before{content:'';width:34px;height:1px;background:#C9A84C}
        .hero-event-copy{font-size:clamp(15px,1.4vw,18px);line-height:1.7;color:rgba(247,244,238,.68);max-width:620px;margin:0 0 22px}
        .hero-event-meta{font:700 10px var(--font);letter-spacing:.13em;text-transform:uppercase;color:rgba(247,244,238,.45);margin-bottom:24px}
        .hero-event-panel{align-self:center;display:flex;flex-direction:column;padding:clamp(30px,3.5vw,44px);border:1px solid rgba(201,168,76,.28);background:linear-gradient(145deg,rgba(201,168,76,.08),rgba(255,255,255,.025));box-shadow:0 30px 90px rgba(0,0,0,.22);position:relative;overflow:hidden;min-height:520px;box-sizing:border-box}
        .hero-event-panel:before{content:'';position:absolute;width:280px;height:280px;border:1px solid rgba(201,168,76,.12);border-radius:50%;right:-130px;top:-130px;box-shadow:0 0 0 50px rgba(201,168,76,.025),0 0 0 100px rgba(201,168,76,.018)}
        .hero-event-panel>*{position:relative;z-index:1}
        .hero-event-number{font:100 72px/.72 var(--font);letter-spacing:-.08em;color:rgba(201,168,76,.12);margin:0 0 18px}
        .hero-event-cluster{font:800 9px var(--font);letter-spacing:.18em;color:#C9A84C;text-transform:uppercase;margin-bottom:12px}
        .hero-event-panel h2{font:350 clamp(27px,3vw,41px)/1.08 var(--font);letter-spacing:-.025em;color:#F7F4EE;margin:0 0 16px;max-width:500px}
        .hero-event-panel p{font:300 13px/1.68 var(--font);color:rgba(247,244,238,.56);margin:0;max-width:500px}
        .hero-event-status{font:800 9px var(--font);letter-spacing:.15em;color:rgba(247,244,238,.48);text-transform:uppercase;margin:24px 0 0;padding-top:18px;border-top:1px solid rgba(201,168,76,.14)}
        .hero-event-panel .session-timer{margin-top:18px;padding-top:0;width:100%}
        .hero-event-panel .session-timer-open,.hero-event-panel .session-timer-locked,.hero-event-panel .session-timer-live{display:block}
        .hero-event-panel .session-timer > span{display:block;font:800 8px var(--font);letter-spacing:.16em;color:rgba(247,244,238,.46);text-transform:uppercase}
        .hero-event-panel .event-modal-countdown{margin:0;padding:0;border:0}
        .hero-event-panel .event-modal-countdown-heading{display:flex;align-items:center;gap:7px;font:800 8px var(--font);letter-spacing:.18em;color:rgba(201,168,76,.72);text-transform:uppercase;margin:0 0 10px}
        .hero-event-panel .event-modal-countdown-dot{width:5px;height:5px;flex:0 0 5px;border-radius:50%;background:#C9A84C;box-shadow:0 0 0 4px rgba(201,168,76,.1);animation:eventHeroCountdownPulse 1.8s ease-in-out infinite}
        .hero-event-panel .event-modal-countdown-units{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;width:100%}
        .hero-event-panel .event-modal-countdown-unit{min-width:0;padding:11px 4px 10px;background:rgba(26,26,46,.36);border:1px solid rgba(201,168,76,.14);text-align:center;box-sizing:border-box}
        .hero-event-panel .event-modal-countdown-unit strong{display:block;font:300 clamp(22px,2.3vw,30px)/1 var(--font);color:#F7F4EE;font-variant-numeric:tabular-nums;letter-spacing:-.035em;white-space:nowrap}
        .hero-event-panel .event-modal-countdown-unit span{display:block;margin-top:6px;font:800 7px/1 var(--font);letter-spacing:.12em;color:rgba(247,244,238,.32)}
        .hero-event-panel .session-timer-live{font:800 9px var(--font);letter-spacing:.15em;color:#8ed0a2;text-transform:uppercase}
        .hero-event-panel .session-timer-live .event-modal-countdown{margin-top:10px}
        .hero-event-panel .session-timer-ended{font:800 9px var(--font);letter-spacing:.15em;color:rgba(247,244,238,.38);text-transform:uppercase}
        .hero-event-actions{display:flex;flex-wrap:wrap;gap:10px}
        .hero-event-panel .hero-event-actions{margin-top:auto;padding-top:24px}
        .hero-event-actions .btn-gold,.hero-event-actions .btn-outline{min-height:48px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}
        .hero-event-actions .hero-register-cta{cursor:pointer;border:0}
        .hero-event-actions .hero-register-cta[disabled]{cursor:not-allowed;opacity:.45}
        .hero-slider-controls{position:absolute;z-index:10;left:max(var(--pad),calc((100vw - 1240px)/2));bottom:28px;display:flex;align-items:center;gap:12px}
        .hero-slider-dot{width:48px;height:3px;padding:0;border:0;background:rgba(247,244,238,.22);cursor:pointer;transition:width .25s ease,background .25s ease}
        .hero-slider-dot.is-active{width:82px;background:#C9A84C}
        .hero-slider-dot:focus-visible{outline:2px solid #C9A84C;outline-offset:5px}
        .hero-slider-index{font:700 9px var(--font);letter-spacing:.16em;color:rgba(247,244,238,.38);margin-left:4px}
        @keyframes eventHeroCountdownPulse{0%,100%{opacity:.45;transform:scale(.9)}50%{opacity:1;transform:scale(1)}}
        @media(max-width:800px){.hero-slider .hero-slides{min-height:780px}.hero-event-slide .hero-inner{grid-template-columns:1fr;gap:34px}.hero-event-panel{min-height:0;align-self:start}.hero-event-number{font-size:58px}.hero-slider-controls{left:var(--pad);bottom:24px}.hero-slider-dot{width:34px}.hero-slider-dot.is-active{width:58px}}
        @media(max-width:520px){.hero-event-panel{padding:28px 24px}.hero-event-panel .event-modal-countdown-units{gap:5px}.hero-event-panel .event-modal-countdown-unit{padding:10px 2px}.hero-event-panel .event-modal-countdown-unit strong{font-size:21px}.hero-event-panel .event-modal-countdown-unit span{font-size:6px}}
        @media(prefers-reduced-motion:reduce){.hero-slider .hero-slide{transition:none}.hero-slider-dot{transition:none}.hero-event-panel .event-modal-countdown-dot{animation:none}}
      `}</style>

      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-slides" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className={`hero-slide ${active === 0 ? 'is-active' : ''}`} aria-hidden={active !== 0}>
          <div className="container hero-inner">
            <div>
              <div className="hero-eyebrow au d1"><div className="hero-eyebrow-line" /><span className="hero-eyebrow-text">AFRICA'S HUMAN CAPITAL INSTITUTION</span></div>
              <h1 className="hero-title au d2">Talent is not<br />the problem.<br /><em>Infrastructure is.</em></h1>
              <p className="hero-sub au d3">Valoria Institute builds the infrastructure through which African professional merit is developed, surfaced and connected to opportunity with precision.</p>
              <div className="hero-actions au d4"><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">START THE VALU INDEX</a><MarketplaceCTA className="btn-outline">EXPLORE THE BUREAU</MarketplaceCTA></div>
              <div className="hero-mobile-card au d5" aria-hidden="true"><div className="hmc-row"><div className="hmc-score">84</div><div className="hmc-right"><div className="hmc-desig">DISTINGUISHED · ✦✦</div><div className="hmc-bars">{bars.map((w, i) => <div key={i} className="hmc-bar" style={{ background: '#C9A84C', width: `${w}%` }} />)}</div></div></div></div>
            </div>
            <div className="valu-card au d4" aria-label="Illustrative VALU profile">
              <div className="vc-label">VALU INDEX · ILLUSTRATIVE PROFILE</div><div className="vc-score"><span className="vc-num">84</span><span className="vc-denom">/ 100</span></div><div className="vc-desig">DISTINGUISHED · ✦✦</div>
              <div className="vc-modalities"><span className="mod-pill" style={{ background: 'rgba(201,168,76,.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.25)' }}>CANDIDATE</span><span className="mod-pill" style={{ background: 'rgba(201,168,76,.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.25)' }}>SPEAKER</span></div>
              <div className="vc-bars">{scores.map(([l, s]) => <div className="vb" key={l}><span className="vb-l">{l}</span><div className="vb-bg"><div className="vb-fill" style={{ width: `${s}%`, background: '#C9A84C' }} /></div><span className="vb-s">{s}</span></div>)}</div><div className="vc-foot">illustrative profile · merit made visible</div>
            </div>
          </div>
        </div>

        <div className={`hero-slide hero-event-slide ${active === 1 ? 'is-active' : ''}`} aria-hidden={active !== 1}>
          <div className="container hero-inner">
            <div>
              <div className="hero-event-kicker">UPCOMING AT VALORIA</div>
              <h1 className="hero-title">The next conversation<br />on the <em>professional standard.</em></h1>
              <p className="hero-event-copy">The Professional Standard Series brings practical conversations on the capabilities that turn professional performance into recognised opportunity.</p>
              <div className="hero-event-meta">{formatSessionDate(upcomingSession)} · 10:00 AM WAT · VIRTUAL · 90 MINUTES</div>
              <div className="hero-actions">
                <button type="button" className="btn-gold hero-register-cta" onClick={openRegistration} disabled={!canRegister}>REGISTER FOR THIS SESSION →</button>
                <a href="/events" className="btn-outline">VIEW ALL EVENTS →</a>
              </div>
            </div>
            <aside className="hero-event-panel" aria-label={`Upcoming event: ${upcomingSession.title}`}>
              <div className="hero-event-number">{upcomingSession.id}</div>
              <div className="hero-event-cluster">{upcomingSession.cluster}</div>
              <h2>{upcomingSession.title}</h2>
              <p>{upcomingSession.description}</p>
              <div className="hero-event-status">{upcomingState === 'coming-soon' ? 'COMING SOON · DATE TO BE CONFIRMED' : formatSessionDate(upcomingSession)}</div>
              {upcomingState !== 'coming-soon' && <SessionTimer session={upcomingSession} />}
              <div className="hero-event-actions">
                <button type="button" className="btn-gold hero-register-cta" onClick={openRegistration} disabled={!canRegister}>{canRegister ? 'REGISTER FOR THIS SESSION →' : upcomingState === 'live' ? 'SESSION IS LIVE' : 'REGISTRATION UNAVAILABLE'}</button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="hero-slider-controls" aria-label="Homepage slides">
        <button type="button" className={`hero-slider-dot ${active === 0 ? 'is-active' : ''}`} onClick={() => goTo(0)} aria-label="Show Valoria introduction slide" aria-pressed={active === 0} />
        <button type="button" className={`hero-slider-dot ${active === 1 ? 'is-active' : ''}`} onClick={() => goTo(1)} aria-label="Show upcoming event slide" aria-pressed={active === 1} />
        <span className="hero-slider-index">0{active + 1} / 02</span>
      </div>
      <div className="hero-scroll-cue" aria-hidden="true"><span>Scroll</span><svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>

      {selectedSession && <EventRegistrationModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </section>
  )
}
