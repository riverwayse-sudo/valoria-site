import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import EventPoster from '@/components/EventPoster'
import EventRegistrationTrigger from '@/components/EventRegistrationTrigger'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState } from '@/lib/professionalStandardSeries'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'Events — Valoria Institute',
  description: 'Conversations, sessions and professional standards from Valoria Institute.',
}

export default function EventsPage() {
  return (
    <>
      <Nav />
      <main className="events-page">
        <section className="page-hero events-hero">
          <div className="page-hero-inner">
            <div className="page-kicker">VALORIA INSTITUTE · EVENTS</div>
            <h1 className="page-title">Conversations that shape<br /><em>professional standard.</em></h1>
            <p className="page-sub">Live sessions, recorded conversations and practical ideas for professionals building capability, influence and opportunity.</p>
          </div>
        </section>

        <section className="page-section events-list">
          <div className="page-section-inner">
            <div className="events-list-head">
              <div>
                <div className="page-kicker events-list-kicker">UPCOMING</div>
                <h2 className="section-title">What is next.</h2>
              </div>
              <p>Focused conversations built around the capabilities that distinguish professional value.</p>
            </div>
            <div className="events-grid">
              {PROFESSIONAL_STANDARD_SERIES.filter(s => !s.replay).map(session => {
                const state = getSessionState(session)
                return (
                  <article className="event-card" id={`session-${session.id}`} key={session.id}>
                    <EventPoster session={session} />
                    <div className="event-card-copy">
                      <div className="event-card-top"><span>SESSION {session.id}</span><b>{session.dateApproved ? 'UPCOMING' : 'COMING SOON'}</b></div>
                      <h3>{session.title}</h3>
                      <p>{session.description}</p>
                      <div className="event-card-meta">
                        <strong>{session.dateApproved ? new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', month: 'long', day: '2-digit', year: 'numeric' }).format(new Date(session.start)) : 'DATE TO BE CONFIRMED'}</strong>
                        <span>VIRTUAL · 90 MINUTES{session.speaker ? ` · ${session.speaker}` : ''}</span>
                      </div>
                      {state === 'registration-open' && <EventRegistrationTrigger session={session} />}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="page-section events-replay" id="session-01">
          <div className="page-section-inner replay-grid">
            <div>
              <div className="page-kicker">SESSION 01 · REPLAY</div>
              <h2 className="section-title">Why being good at your job is no longer <em>enough.</em></h2>
              <p className="page-sub">The opening Valoria conversation on professional worth, visibility, influence and the infrastructure required to turn capability into recognised opportunity.</p>
              <a className="btn-gold" href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer">START YOUR VALU INDEX →</a>
            </div>
            <div className="replay-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute Session 01 replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
