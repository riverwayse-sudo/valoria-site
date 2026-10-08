import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import EventPoster from '@/components/EventPoster'
import EventRegistrationTrigger from '@/components/EventRegistrationTrigger'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'
import { BRAND } from '@/lib/brand'

export const metadata = {
  title: 'Events — Valoria Institute',
  description: 'Conversations and professional standards from Valoria Institute.',
}

function SessionCard({ session, state }) {
  const isEnded = state === 'ended'
  const isComingSoon = state === 'coming-soon'
  const isNext = state === 'registration-open' || state === 'live'

  return (
    <article className={`event-card event-card--editorial ${isEnded ? 'is-ended' : ''} ${isNext ? 'is-next' : ''}`} id={`event-${session.id}`}>
      <EventPoster session={session} />
      <div className="event-editorial-footer">
        <div className="event-editorial-copy">
          <span>{isEnded ? 'COMPLETED' : isComingSoon ? 'COMING SOON' : state === 'live' ? 'LIVE NOW' : 'REGISTRATION OPEN'}</span>
          <p>{session.description}</p>
        </div>
        {!isEnded && !isComingSoon && <EventRegistrationTrigger session={session} />}
      </div>
    </article>
  )
}

export default function EventsPage() {
  const upcoming = PROFESSIONAL_STANDARD_SERIES.filter(session => {
    if (session.replay) return false
    const state = getSessionState(session)
    return state === 'registration-open' || state === 'live'
  })

  const completed = PROFESSIONAL_STANDARD_SERIES.filter(session => {
    if (session.replay) return false
    return getSessionState(session) === 'ended'
  })

  const comingSoon = PROFESSIONAL_STANDARD_SERIES.filter(session => {
    if (session.replay) return false
    return getSessionState(session) === 'coming-soon'
  })

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
                <div className="page-kicker events-list-kicker">NEXT SESSION</div>
                <h2 className="section-title">{upcoming.length ? 'What is next.' : 'The next conversation is coming.'}</h2>
              </div>
              <p>Focused conversations built around the capabilities that distinguish professional value.</p>
            </div>

            {upcoming.length > 0 ? (
              <div className="events-grid">
                {upcoming.map(session => <SessionCard key={session.id} session={session} state={getSessionState(session)} />)}
              </div>
            ) : (
              <div className="events-empty-state">
                <span className="page-kicker">STAY WITH THE SERIES</span>
                <h3>The next session will be announced here.</h3>
                <p>Valoria conversations move through the Professional Standard Series. Return here for the next confirmed conversation.</p>
              </div>
            )}

            {comingSoon.length > 0 && (
              <div className="events-secondary">
                <div className="events-list-head events-secondary-head">
                  <div>
                    <div className="page-kicker events-list-kicker">LATER IN THE SERIES</div>
                    <h2 className="section-title">Coming soon.</h2>
                  </div>
                  <p>Future sessions appear here only after their dates are confirmed.</p>
                </div>
                <div className="events-grid">
                  {comingSoon.map(session => <SessionCard key={session.id} session={session} state="coming-soon" />)}
                </div>
              </div>
            )}
          </div>
        </section>

        {completed.length > 0 && (
          <section className="page-section events-history" id="past-conversations">
            <div className="page-section-inner">
              <div className="events-list-head">
                <div>
                  <div className="page-kicker events-list-kicker">PAST CONVERSATIONS</div>
                  <h2 className="section-title">What came before.</h2>
                </div>
                <p>Completed conversations remain part of the Valoria professional standard record.</p>
              </div>
              <div className="events-grid">
                {completed.map(session => <SessionCard key={session.id} session={session} state="ended" />)}
              </div>
            </div>
          </section>
        )}

        <section className="page-section events-replay" id="replay">
          <div className="page-section-inner replay-grid">
            <div>
              <div className="page-kicker">REPLAY</div>
              <h2 className="section-title">Why being good at your job is no longer <em>enough.</em></h2>
              <p className="page-sub">The opening Valoria conversation on professional worth, visibility, influence and the infrastructure required to turn capability into recognised opportunity.</p>
              <a className="btn-gold" href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer">START YOUR VALU INDEX →</a>
            </div>
            <div className="replay-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
