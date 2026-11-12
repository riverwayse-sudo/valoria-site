import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

const replay = PROFESSIONAL_STANDARD_SERIES.find((session) => session.dateApproved && session.youtubeVideoId)

function labelForState(state) {
  if (state === 'ended') return 'REPLAY AVAILABLE'
  if (state === 'live') return 'LIVE NOW'
  if (state === 'registration-open') return 'SESSION STARTING SOON'
  return 'FEATURED CONVERSATION'
}

export default function HomepageEvents() {
  if (!replay) return null

  const state = getSessionState(replay)
  const status = labelForState(state)
  const youtubeUrl = 'https://www.youtube.com/watch?v=' + replay.youtubeVideoId

  return (
    <section className="home-events" id="events" aria-labelledby="home-events-title">
      <div className="container">
        <div className="home-section-heading home-events-heading">
          <div>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE VALORIA CONVERSATION · SESSION {replay.id}</span></div>
            <h2 id="home-events-title">You’re doing more.<br /><em>But are you creating impact?</em></h2>
          </div>
          <p>Practical conversations on professional worth, capability and the decisions that turn good work into meaningful results.</p>
        </div>

        <div className="home-events-feature">
          <a className="home-events-poster" href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${replay.title} on YouTube`}>
            <img className="home-events-poster-image" src={`https://img.youtube.com/vi/${replay.youtubeVideoId}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="home-events-poster-kicker">VALORIA INSTITUTE · SESSION {replay.id}</span>
            <strong>{replay.title}</strong>
            <span className="home-events-poster-action"><span className="home-events-play-icon" aria-hidden="true">▶</span> WATCH THE FULL REPLAY <span aria-hidden="true">→</span></span>
          </a>

          <div className="home-events-slider">
            <div className="home-events-status">
              <span>{status}</span>
              <span>SESSION {replay.id} · {replay.cluster}</span>
            </div>
            <div className="home-events-cluster">{replay.cluster}</div>
            <h3>{replay.title}</h3>
            <p>{replay.description}</p>
            <div className="home-events-meta">
              <span>{formatSessionDate(replay)}</span>
              {replay.speaker && replay.speakerApproved !== false && <span>{replay.speaker}</span>}
            </div>
            <div className="home-events-watch-actions">
              <a className="home-events-watch-link" href={youtubeUrl}>
                WATCH THE FULL REPLAY <span aria-hidden="true">→</span>
              </a>
              <a className="home-events-secondary-link" href="/events">
                EXPLORE VALORIA EVENTS <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
