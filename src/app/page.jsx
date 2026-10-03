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
      <section className="home-pathways" aria-labelledby="pathways-title"><div className="container"><Reveal className="home-section-heading"><div><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">START HERE</span></div><h2 id="pathways-title">What brings you<br/><em>to Valoria?</em></h2></div><p>Choose the path that matches what you need today. Valoria connects professional development, visibility and opportunity through one institutional standard.</p></Reveal><Reveal className="home-pathway-grid" as="div">{pathwayCards.map((card, index) => <a className={`home-pathway-card ${index === 0 ? 'is-primary' : ''}`} href={card.href} key={card.label}><span className="home-pathway-number">0{index + 1}</span><span className="home-pathway-label">{card.label}</span><h3>{card.title}</h3><p>{card.body}</p><span className="home-pathway-cta">{card.cta} <span aria-hidden="true">→</span></span></a>)}</Reveal></div></section>
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
      <section className="alignment" id="alignment"><div className="container"><Reveal className="alignment-inner"><div className="eyebrow eyebrow--center"><div className="eyebrow-line"/><span className="eyebrow-text">THE VALORIA PROMISE</span><div className="eyebrow-line"/></div><blockquote className="alignment-quote">&ldquo;We will <span className="highlight">develop you, surface you, and connect you</span> to the opportunity you have earned.&rdquo;</blockquote><p className="alignment-sub">Valoria builds the infrastructure through which capability is developed, merit becomes visible and opportunity can be matched with precision.</p><div className="alignment-cats" aria-label="The Valoria promise"><div className="cat-item"><div className="cat-num">01</div><div className="cat-name">Develop</div></div><div className="cat-item cat-highlight"><div className="cat-num">02</div><div className="cat-name">Surface</div></div><div className="cat-item"><div className="cat-num">03</div><div className="cat-name">Connect</div></div></div></Reveal></div></section>
      <section className="entry-points" id="entry-points"><div className="container"><Reveal className="ep-header"><div><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">ONE INSTITUTION · MULTIPLE PATHWAYS</span></div><h2 className="home-entry-title">One institution.<br/><em>Multiple ways in.</em></h2></div><p className="ep-desc">Whether you are developing your career, hiring capability or sourcing a speaker, the same institutional standard connects the experience.</p></Reveal><Reveal className="ep-grid" as="div"><EntryPointsGrid/></Reveal></div></section>
      <section className="home-featured-event" aria-labelledby="event-title"><div className="container home-event-shell">{upcomingEvent ? <><Reveal className="home-event-header"><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">UPCOMING SESSION</span></div><div className="home-event-meta-top">SESSION {upcomingEvent.id} <span aria-hidden="true">·</span> {upcomingEvent.cluster}</div><h2 id="event-title">{upcomingEvent.title}</h2><p className="home-event-description">{upcomingEvent.description}</p></Reveal><Reveal className="home-event-footer"><div className="home-event-facts" aria-label="Session details"><div><span className="home-event-fact-label">DATE</span><strong>{formatSessionDate(upcomingEvent)}</strong></div><div><span className="home-event-fact-label">TIME</span><strong>10:00 AM WAT</strong></div><div><span className="home-event-fact-label">FORMAT</span><strong>VIRTUAL · 90 MINUTES</strong></div>{upcomingEvent.speaker && <div><span className="home-event-fact-label">WITH</span><strong>{upcomingEvent.speaker}</strong></div>}</div><div className="home-event-actions"><EventRegistrationTrigger session={upcomingEvent} className="btn-gold">REGISTER FOR THIS SESSION <span aria-hidden="true">→</span></EventRegistrationTrigger><a href="/events" className="text-link">VIEW ALL EVENTS <span aria-hidden="true">→</span></a></div></Reveal><div className="home-event-countdown" aria-label="Webinar countdown"><div className="home-event-countdown-label">NEXT LIVE SESSION</div><div className="home-event-countdown-title">STRATEGIC THINKING: YOU ARE SOLVING THE WRONG PROBLEMS</div><SessionTimer session={upcomingEvent}/></div></> : <><Reveal className="home-event-header"><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">COMING SOON</span></div><h2 id="event-title">The professional<br/><em>standard series.</em></h2><p className="home-event-description">Live conversations on capability, leadership, influence, relationships and enterprise. New sessions are announced as registration opens.</p></Reveal><Reveal className="home-event-footer"><div/><div className="home-event-actions"><a href="/events" className="btn-gold">VIEW EVENTS <span aria-hidden="true">→</span></a><a href="/insights" className="text-link">READ INSIGHTS <span aria-hidden="true">→</span></a></div></Reveal></>}</div></section>
      <section className="webinar-replay" id="webinar" aria-labelledby="replay-title"><div className="container"><Reveal className="wr-inner"><div className="eyebrow eyebrow--center"><div className="eyebrow-line"/><span className="eyebrow-text">SESSION 01 · WATCH THE REPLAY</span><div className="eyebrow-line"/></div><h2 id="replay-title" className="wr-title">Why being good at your job<br/>is no longer <em>enough.</em></h2><p className="wr-sub">Watch the full session on the VALU Index, the PRIME framework and Valoria’s belief that talent is not the problem — infrastructure is.</p><div className="wr-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute — Launch Webinar Replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><a href="/valu" className="btn-gold wr-cta">EXPLORE THE VALU INDEX <span aria-hidden="true">→</span></a></Reveal></div></section>
    </main>
    <Footer />
  </>
}