'use client'

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
          <p>Watch “{replay.title}” with Temi Adetokunbo. A practical conversation on the gap between being busy and creating meaningful, sustainable results.</p>
        </div>

        <div className="home-events-feature">
          <div className="home-events-video">
            <iframe
              src={'https://www.youtube-nocookie.com/embed/' + replay.youtubeVideoId + '?rel=0'}
              title={replay.title + ' — Valoria Institute with Temi Adetokunbo'}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="home-events-slider">
            <div className="home-events-status">
              <span>{status}</span>
              <span>SESSION {replay.id} · MASTERY</span>
            </div>
            <div className="home-events-cluster">{replay.cluster}</div>
            <h3>{replay.title}</h3>
            <p>{replay.description}</p>
            <div className="home-events-meta">
              <span>{formatSessionDate(replay)}</span>
              <span>{replay.speaker || 'VALORIA INSTITUTE'}</span>
            </div>
            <div className="home-events-watch-actions">
              <a className="home-events-watch-link" href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                WATCH THE FULL REPLAY <span aria-hidden="true">↗</span>
              </a>
              <a className="home-events-secondary-link" href="/events#webinar">
                EXPLORE VALORIA EVENTS <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="home-events-footer">
          <span>PROFESSIONAL THINKING · CAPABILITY · PRACTICAL ACTION</span>
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">WATCH ON YOUTUBE <span aria-hidden="true">↗</span></a>
          <a href="/events">VIEW ALL EVENTS <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  )
}
