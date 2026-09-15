import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import ValuMotion from '@/components/ValuMotion'
import HeroSlider from '@/components/HeroSlider'
import EntryPointsGrid from '@/components/EntryPointsGrid'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import EventRegistrationTrigger from '@/components/EventRegistrationTrigger'
import WaitlistModal from '@/components/WaitlistModal'
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
  { label: 'FOR EVENT ORGANISERS', title: 'Find speakers and facilitators.', body: 'Access professionals with relevant expertise for conversations, programmes and organisational moments.', href: '/marketplace?track=speaker', cta: 'FIND PROFESSIONALS' }
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
      {/* Homepage content intentionally unchanged; event sections use the shared catalogue. */}
      <HeroSlider upcomingEvent={upcomingEvent} />
      <EntryPointsGrid cards={pathwayCards} />
      <LiveProfilesScroll />
      <section className="home-events" aria-labelledby="event-title">
        <div className="container">
          {upcomingEvent ? <>
            <Reveal className="home-event-header"><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">UPCOMING · {upcomingEvent.cluster}</span></div><h2 id="event-title">{upcomingEvent.title}</h2><p className="home-event-description">{upcomingEvent.description}</p><p className="home-event-description">{formatSessionDate(upcomingEvent)} · 10:00 AM WAT · {upcomingEvent.speaker}</p><div className="home-event-actions"><a href="/events" className="btn-gold">REGISTER <span aria-hidden="true">→</span></a><a href="/insights" className="text-link">READ INSIGHTS <span aria-hidden="true">→</span></a></div></Reveal>
          </> : <>
            <Reveal className="home-event-header"><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">COMING SOON</span></div><h2 id="event-title">The professional<br/><em>standard series.</em></h2><p className="home-event-description">Live conversations on capability, leadership, influence, relationships and enterprise. New sessions are announced as registration opens.</p></Reveal>
            <Reveal className="home-event-footer"><div/><div className="home-event-actions"><a href="/events" className="btn-gold">VIEW EVENTS <span aria-hidden="true">→</span></a><a href="/insights" className="text-link">READ INSIGHTS <span aria-hidden="true">→</span></a></div></Reveal>
          </>}
        </div>
      </section>
      <section className="home-insights" aria-labelledby="insights-title"><div className="container home-insights-grid"><Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">INSIGHTS</span></div><h2 id="insights-title">Ideas for the<br/><em>professional room.</em></h2></Reveal><Reveal className="home-insights-copy"><p>Perspectives on capability, leadership, influence and professional opportunity — built to help professionals think beyond the job title.</p><a className="text-link" href="/insights">EXPLORE INSIGHTS <span aria-hidden="true">→</span></a></Reveal></div></section>
      <section className="webinar-replay" id="webinar" aria-labelledby="replay-title"><div className="container"><Reveal className="wr-inner"><div className="eyebrow" style={{justifyContent:'center'}}><div className="eyebrow-line"/><span className="eyebrow-text">SESSION 01 · WATCH THE REPLAY</span><div className="eyebrow-line"/></div><h2 id="replay-title" className="wr-title">Why being good at your job<br/>is no longer <em>enough.</em></h2><p className="wr-sub">Watch the full session on the VALU Index, the PRIME framework and Valoria’s belief that talent is not the problem — infrastructure is.</p><div className="wr-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute — Launch Webinar Replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><a href="/valu" className="btn-gold" style={{marginTop:'clamp(28px,4vw,40px)'}}>EXPLORE THE VALU INDEX <span aria-hidden="true">→</span></a></Reveal></div></section>
    </main>
    <Footer />
    <WaitlistModal open={true} source="event_session_02" eventMode />
  </>
}
