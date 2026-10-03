import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import HeroSlider from '@/components/HeroSlider'
import EntryPointsGrid from '@/components/EntryPointsGrid'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import EventRegistrationTrigger from '@/components/EventRegistrationTrigger'
import { SessionTimer } from '@/components/EventRegistrationModal'
import { BRAND } from '@/lib/brand'
import { PROFESSIONAL_STANDARD_SERIES, formatSessionDate } from '@/lib/professionalStandardSeries'
import './home.css'
import './home-ux.css'
import './valu-home.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Worth. Built.',
  description: 'Valoria Institute builds the infrastructure that develops, surfaces and connects professional merit to opportunity.'
}

const pathwayCards = [
  { label: 'FOR PROFESSIONALS', title: 'Build a verified professional presence.', body: 'Understand where you stand, complete your profile and become discoverable for the right opportunities.', href: '/valu', cta: 'START WITH VALU' },
  { label: 'FOR EMPLOYERS', title: 'Find capability with context.', body: 'Discover professionals through structured profiles built around capability, experience and verified pathways.', href: '/marketplace', cta: 'EXPLORE MARKETPLACE' },
  { label: 'FOR EVENT ORGANISERS', title: 'Find speakers and facilitators.', body: 'Access professionals with relevant expertise for conversations, programmes and organisational moments.', href: '/marketplace/speakers', cta: 'FIND PROFESSIONALS' }
]

function getUpcomingEvent() {
  const now = Date.now()
  return PROFESSIONAL_STANDARD_SERIES.find(session => session.dateApproved && !session.replay && new Date(session.end).getTime() > now) || null
}

export default function HomePage() {
  const upcomingEvent = getUpcomingEvent()

  return <>
    <Nav />
    <main id="main-content">
      <HeroSlider />
      <section className="home-pathways" aria-labelledby="pathways-title"><div className="container"><Reveal className="home-section-heading"><div><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">START HERE</span></div><h2 id="pathways-title">What brings you<br/><em>to Valoria?</em></h2></div><p>Choose the path that matches what you need today. Valoria connects professional development, visibility and opportunity through one institutional standard.</p></Reveal><Reveal className="home-pathway-grid" as="div">{pathwayCards.map((card, index) => <a className={`home-pathway-card ${index === 0 ? 'is-primary' : ''}`} href={card.href} key={card.label} style={{color:'#1A1A2E',WebkitTextFillColor:'#1A1A2E',backgroundColor:'#FFFFFF'}}><span className="home-pathway-number" style={{color:'#9A7428',WebkitTextFillColor:'#9A7428'}}>0{index + 1}</span><span className="home-pathway-label" style={{color:'#555565',WebkitTextFillColor:'#555565'}}>{card.label}</span><h3 style={{color:'#1A1A2E',WebkitTextFillColor:'#1A1A2E'}}>{card.title}</h3><p style={{color:'#555565',WebkitTextFillColor:'#555565'}}>{card.body}</p><span className="home-pathway-cta" style={{color:'#1A1A2E',WebkitTextFillColor:'#1A1A2E'}}>{card.cta} <span aria-hidden="true" style={{color:'#9A7428',WebkitTextFillColor:'#9A7428'}}>→</span></span></a>)}</Reveal></div></section>
      <section className="valu-section valu-conversion" id="valu" aria-labelledby="home-valu-title">
        <div className="container valu-conversion-shell">
          <Reveal className="valu-conversion-intro">
            <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">START WITH VALU</span></div>
            <h2 id="home-valu-title" className="valu-title">Before you build your next move, <em>know where you stand.</em></h2>
            <p className="valu-desc">The VALU Index gives you a directional picture of your professional capability across Presence, Relationships, Intelligence, Mastery and Enterprise — so you can see what to strengthen, what to surface and what to build next.</p>
            <div className="valu-conversion-proof" aria-label="Assessment details">
              <span><b>15</b> QUESTIONS</span><i>·</i><span><b>FREE</b> ENTRY</span><i>·</i><span><b>5</b> PRIME DIMENSIONS</span>
            </div>
            <div className="home-dual-actions">
              <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">START MY VALU SNAPSHOT <span aria-hidden="true">→</span></a>
              <a href="/valu" className="text-link">SEE HOW VALU WORKS <span aria-hidden="true">→</span></a>
            </div>
            <p className="valu-conversion-note">Your first result is directional. It is the starting signal for the wider Valoria journey — not a label and not the end of the process.</p>
          </Reveal>

          <Reveal className="valu-conversion-card">
            <div className="vcc-top"><span>YOUR ENTRY POINT</span><strong>VALU INDEX</strong></div>
            <div className="vcc-radar" aria-hidden="true">
              <svg className="vcc-radar-svg" viewBox="0 0 100 100" role="presentation">
                <g className="vcc-radar-grid">
                  <polygon points="50,42 57.6,44.5 54.7,53.6 45.3,53.6 42.4,44.5"/>
                  <polygon points="50,34 65.2,39 59.5,57.3 40.5,57.3 34.8,39"/>
                  <polygon points="50,26 72.8,33.5 64.3,61 35.7,61 27.2,33.5"/>
                  <polygon points="50,18 80.4,28 69,64.6 31,64.6 19.6,28"/>
                  <polygon points="50,10 88,22.5 73.8,68.2 26.2,68.2 12,22.5"/>
                  <line x1="50" y1="50" x2="50" y2="10"/><line x1="50" y1="50" x2="88" y2="22.5"/><line x1="50" y1="50" x2="73.8" y2="68.2"/><line x1="50" y1="50" x2="26.2" y2="68.2"/><line x1="50" y1="50" x2="12" y2="22.5"/>
                </g>
                <polygon className="vcc-radar-area" points="50,20 78,30 67,62 31,60 20,29"/>
                <g className="vcc-radar-points"><circle cx="50" cy="20" r="1.8"/><circle cx="78" cy="30" r="1.8"/><circle cx="67" cy="62" r="1.8"/><circle cx="31" cy="60" r="1.8"/><circle cx="20" cy="29" r="1.8"/></g>
                <g className="vcc-radar-labels">
                  <text x="50" y="5" textAnchor="middle">PRESENCE</text><text x="94" y="21" textAnchor="end">RELATIONSHIPS</text><text x="79" y="78" textAnchor="middle">INTELLIGENCE</text><text x="21" y="78" textAnchor="middle">MASTERY</text><text x="6" y="21">ENTERPRISE</text>
                </g>
              </svg>
              <div className="vcc-radar-center">VALU</div>
            </div>
            <div className="vcc-steps">
              <div className="vcc-step is-active"><span>01</span><div><b>See your signal</b><small>15-question snapshot</small></div></div>
              <div className="vcc-step"><span>02</span><div><b>Build your picture</b><small>Full VALU assessment + profile</small></div></div>
              <div className="vcc-step"><span>03</span><div><b>Become discoverable</b><small>Capability, eligibility and marketplace</small></div></div>
            </div>
            <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="vcc-bottom-cta">BEGIN THE FIRST 15 QUESTIONS <span>→</span></a>
          </Reveal>
        </div>
      </section>
      <LiveProfilesScroll />
      <section className="alignment" id="alignment"><div className="container"><Reveal className="alignment-inner"><div className="eyebrow" style={{justifyContent:'center'}}><div className="eyebrow-line"/><span className="eyebrow-text">THE VALORIA PROMISE</span><div className="eyebrow-line"/></div><blockquote className="alignment-quote">&ldquo;We will <span className="highlight">develop you, surface you, and connect you</span> to the opportunity you have earned.&rdquo;</blockquote><p className="alignment-sub">Valoria builds the infrastructure through which capability is developed, merit becomes visible and opportunity can be matched with precision.</p><div className="alignment-cats" aria-label="The Valoria promise"><div className="cat-item"><div className="cat-num">01</div><div className="cat-name">Develop</div></div><div className="cat-item cat-highlight"><div className="cat-num">02</div><div className="cat-name">Surface</div></div><div className="cat-item"><div className="cat-num">03</div><div className="cat-name">Connect</div></div></div></Reveal></div></section>
      <section className="entry-points" id="entry-points"><div className="container"><Reveal className="ep-header"><div><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">ONE INSTITUTION · MULTIPLE PATHWAYS</span></div><h2 className="home-entry-title">One institution.<br/><em>Multiple ways in.</em></h2></div><p className="ep-desc">Whether you are developing your career, hiring capability or sourcing a speaker, the same institutional standard connects the experience.</p></Reveal><Reveal className="ep-grid" as="div"><EntryPointsGrid/></Reveal></div></section>
      <section className="home-featured-event" aria-labelledby="event-title"><div className="container home-event-shell">{upcomingEvent ? <><Reveal className="home-event-header"><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">UPCOMING SESSION</span></div><div className="home-event-meta-top">SESSION {upcomingEvent.id} <span aria-hidden="true">·</span> {upcomingEvent.cluster}</div><h2 id="event-title">{upcomingEvent.title}</h2><p className="home-event-description">{upcomingEvent.description}</p></Reveal><Reveal className="home-event-footer"><div className="home-event-facts" aria-label="Session details"><div><span className="home-event-fact-label">DATE</span><strong>{formatSessionDate(upcomingEvent)}</strong></div><div><span className="home-event-fact-label">TIME</span><strong>10:00 AM WAT</strong></div><div><span className="home-event-fact-label">FORMAT</span><strong>VIRTUAL · 90 MINUTES</strong></div>{upcomingEvent.speaker && <div><span className="home-event-fact-label">WITH</span><strong>{upcomingEvent.speaker}</strong></div>}</div><div className="home-event-actions"><EventRegistrationTrigger session={upcomingEvent} className="btn-gold">REGISTER FOR THIS SESSION <span aria-hidden="true">→</span></EventRegistrationTrigger><a href="/events" className="text-link">VIEW ALL EVENTS <span aria-hidden="true">→</span></a></div></Reveal><div className="home-event-countdown" aria-label="Webinar countdown"><div className="home-event-countdown-label">NEXT LIVE SESSION</div><div className="home-event-countdown-title">STRATEGIC THINKING: YOU ARE SOLVING THE WRONG PROBLEMS</div><SessionTimer session={upcomingEvent}/></div></> : <><Reveal className="home-event-header"><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">COMING SOON</span></div><h2 id="event-title">The professional<br/><em>standard series.</em></h2><p className="home-event-description">Live conversations on capability, leadership, influence, relationships and enterprise. New sessions are announced as registration opens.</p></Reveal><Reveal className="home-event-footer"><div/><div className="home-event-actions"><a href="/events" className="btn-gold">VIEW EVENTS <span aria-hidden="true">→</span></a><a href="/insights" className="text-link">READ INSIGHTS <span aria-hidden="true">→</span></a></div></Reveal></>}</div></section>
      <section className="webinar-replay" id="webinar" aria-labelledby="replay-title"><div className="container"><Reveal className="wr-inner"><div className="eyebrow" style={{justifyContent:'center'}}><div className="eyebrow-line"/><span className="eyebrow-text">SESSION 01 · WATCH THE REPLAY</span><div className="eyebrow-line"/></div><h2 id="replay-title" className="wr-title">Why being good at your job<br/>is no longer <em>enough.</em></h2><p className="wr-sub">Watch the full session on the VALU Index, the PRIME framework and Valoria’s belief that talent is not the problem — infrastructure is.</p><div className="wr-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute — Launch Webinar Replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><a href="/valu" className="btn-gold" style={{marginTop:'clamp(28px,4vw,40px)'}}>EXPLORE THE VALU INDEX <span aria-hidden="true">→</span></a></Reveal></div></section>
    </main>
    <Footer />
    <style>{`
      .valu-conversion{background:#F7F4EE;color:#1A1A2E;position:relative;overflow:hidden}
      .valu-conversion-shell{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(360px,.72fr);gap:clamp(45px,8vw,110px);align-items:center}
      .valu-conversion-intro{max-width:720px}
      .valu-conversion .valu-title{max-width:760px;margin-bottom:22px}
      .valu-conversion .valu-desc{max-width:680px}
      .valu-conversion-proof{display:flex;align-items:center;gap:13px;margin:30px 0 28px;flex-wrap:wrap;font:800 9px/1 Raleway,sans-serif;letter-spacing:.15em;color:#6D6B76}
      .valu-conversion-proof b{color:#1A1A2E;font-size:12px;margin-right:4px}
      .valu-conversion-proof i{font-style:normal;color:#C9A84C}
      .valu-conversion-note{max-width:600px;margin:20px 0 0;color:#777582;font-size:12px;line-height:1.65}
      .valu-conversion-card{position:relative;min-height:560px;padding:28px;background:#1A1A2E;border:1px solid rgba(201,168,76,.4);box-shadow:0 28px 80px rgba(26,26,46,.18);display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}
      .valu-conversion-card:before{content:"";position:absolute;width:330px;height:330px;border-radius:50%;border:1px solid rgba(201,168,76,.11);right:-150px;top:-130px}
      .vcc-top{display:flex;justify-content:space-between;gap:15px;font:800 8px/1 Raleway,sans-serif;letter-spacing:.18em;color:rgba(247,244,238,.4)}
      .vcc-top strong{color:#C9A84C}
      .vcc-radar{height:250px;position:relative;display:flex;align-items:center;justify-content:center}
      .vcc-radar-svg{width:min(100%,310px);height:250px;overflow:visible}
      .vcc-radar-grid polygon,.vcc-radar-grid line{fill:none;stroke:rgba(247,244,238,.13);stroke-width:.45}
      .vcc-radar-grid polygon:first-child{stroke:rgba(201,168,76,.22)}
      .vcc-radar-area{fill:rgba(201,168,76,.22);stroke:#C9A84C;stroke-width:1.1;vector-effect:non-scaling-stroke}
      .vcc-radar-points circle{fill:#C9A84C;stroke:#1A1A2E;stroke-width:1.2}
      .vcc-radar-labels text{fill:rgba(247,244,238,.52);font:800 3.1px/1 Raleway,sans-serif;letter-spacing:.14px}
      .vcc-radar-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:52px;height:52px;border:1px solid rgba(201,168,76,.55);border-radius:50%;background:#1A1A2E;color:#C9A84C;display:flex;align-items:center;justify-content:center;font:800 9px/1 Raleway,sans-serif;letter-spacing:.1em;box-shadow:0 0 28px rgba(201,168,76,.12)}
      .vcc-steps{border-top:1px solid rgba(247,244,238,.12)}
      .vcc-step{display:grid;grid-template-columns:34px 1fr;gap:12px;padding:16px 0;border-bottom:1px solid rgba(247,244,238,.1);align-items:start}
      .vcc-step>span{font:800 8px/1 Raleway,sans-serif;letter-spacing:.1em;color:#C9A84C;padding-top:3px}
      .vcc-step b{display:block;font:500 13px/1.2 Raleway,sans-serif;color:#F7F4EE}.vcc-step small{display:block;margin-top:5px;font:400 10px/1.4 Raleway,sans-serif;color:rgba(247,244,238,.4)}
      .vcc-bottom-cta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;padding:15px 16px;background:#C9A84C;color:#1A1A2E;text-decoration:none;font:800 9px/1 Raleway,sans-serif;letter-spacing:.12em;transition:transform .2s ease,box-shadow .2s ease}
      .vcc-bottom-cta:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(201,168,76,.18)}
      @media(max-width:900px){.valu-conversion-shell{grid-template-columns:1fr}.valu-conversion-intro{max-width:760px}.valu-conversion-card{min-height:500px;max-width:620px}}
      @media(max-width:600px){.valu-conversion-shell{gap:34px}.valu-conversion-card{min-height:490px;padding:22px}.vcc-radar{height:205px}.vcc-radar-svg{height:205px}.vcc-radar-labels text{font-size:3px}.valu-conversion-proof{gap:9px}.valu-conversion-note{font-size:11px}}
\n      .home-event-countdown{margin-top:clamp(38px,5vw,64px);padding:clamp(28px,4vw,44px) clamp(22px,4vw,48px);background:#1A1A2E;border:1px solid rgba(201,168,76,.42);text-align:center;box-shadow:0 18px 55px rgba(26,26,46,.14)}\n      .home-event-countdown-label{font:800 10px/1 Raleway,sans-serif;letter-spacing:.24em;color:#C9A84C;text-transform:uppercase}\n      .home-event-countdown-title{margin:13px auto 24px;max-width:760px;font:500 clamp(18px,2.1vw,27px)/1.2 Raleway,sans-serif;letter-spacing:-.015em;color:#F7F4EE;text-transform:uppercase}\n      .home-event-countdown .session-timer{margin:0;border:0;background:transparent;padding:0}\n      .home-event-countdown .event-countdown-label{display:none}\n      .home-event-countdown .event-countdown-units{justify-content:center;gap:clamp(12px,2.8vw,34px)}\n      .home-event-countdown .event-countdown-unit{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:clamp(68px,10vw,118px);padding:0;background:transparent;border:0}\n      .home-event-countdown .event-countdown-unit strong{font:300 clamp(42px,7vw,82px)/.9 Raleway,sans-serif;letter-spacing:-.055em;color:#F7F4EE;font-variant-numeric:tabular-nums}\n      .home-event-countdown .event-countdown-unit span{font:800 8px/1 Raleway,sans-serif;letter-spacing:.2em;color:rgba(247,244,238,.42)}\n      .home-event-countdown .session-timer-live{color:#8ed0a2;font-size:12px;letter-spacing:.18em}\n      .home-event-countdown .session-timer-live .event-countdown{display:block;margin-top:15px}\n      .home-event-countdown .session-timer-live .event-countdown-units{display:flex;margin-left:0}\n      .home-event-countdown .session-timer-live .event-countdown-label{display:none}\n      .home-event-countdown .session-timer-ended{font:800 12px/1 Raleway,sans-serif;letter-spacing:.18em;color:rgba(247,244,238,.42)}\n      @media(max-width:600px){.home-event-countdown{padding:26px 12px}.home-event-countdown-title{font-size:15px;margin-bottom:22px}.home-event-countdown .event-countdown-units{gap:4px}.home-event-countdown .event-countdown-unit{min-width:calc((100vw - 52px)/4)}.home-event-countdown .event-countdown-unit strong{font-size:clamp(30px,11vw,48px)}.home-event-countdown .event-countdown-unit span{font-size:7px;letter-spacing:.12em}}\n    `}</style>
  </>
}