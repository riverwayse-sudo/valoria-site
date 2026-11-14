'use client'

import EventPoster from '@/components/EventPoster'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

const replay = PROFESSIONAL_STANDARD_SERIES.find((session) => session.dateApproved && session.youtubeVideoId)
const currentSession = PROFESSIONAL_STANDARD_SERIES.find((session) => ['registration-open', 'live'].includes(getSessionState(session)))
const featured = currentSession || replay
const MEET_URL = 'https://meet.google.com/hde-owjd-mwc'

function labelForState(state) {
  if (state === 'ended') return 'REPLAY AVAILABLE'
  if (state === 'live') return 'LIVE NOW'
  if (state === 'registration-open') return 'SESSION STARTING SOON'
  return 'FEATURED CONVERSATION'
}

export default function HomepageEvents() {
  if (!featured) return null

  const state = getSessionState(featured)
  const status = labelForState(state)
  const isCurrent = featured === currentSession
  const youtubeUrl = featured.youtubeVideoId
    ? 'https://www.youtube.com/watch?v=' + featured.youtubeVideoId
    : null

  return (
    <section className="home-events" id="events" aria-labelledby="home-events-title">
      <div className="container">
        <div className="home-section-heading home-events-heading">
          <div>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">{isCurrent ? 'THE CURRENT VALORIA CONVERSATION · THE PROFESSIONAL STANDARD SERIES' : 'THE VALORIA CONVERSATION · SESSION ' + featured.id}</span></div>
            <h2 id="home-events-title">{isCurrent ? <>Influence is built.<br /><em>Join the conversation.</em></> : <>You’re doing more.<br /><em>But are you creating impact?</em></>}</h2>
          </div>
          <p>{isCurrent ? 'Join the current Valoria conversation directly. The session link takes you to the live event room.' : 'Watch “' + featured.title + '” with ' + (featured.speaker || 'Valoria Institute') + '. A practical conversation on the capabilities that turn professional performance into recognised opportunity.'}</p>
        </div>

        <div className="home-events-feature">
          <div className="home-events-video">
            {isCurrent ? (
              <div className="home-events-poster"><EventPoster session={featured} /></div>
            ) : (
              <a
                className="home-events-video-link"
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={'Watch ' + featured.title + ' on YouTube'}
                style={{ '--video-thumbnail': 'url(https://i.ytimg.com/vi/' + featured.youtubeVideoId + '/hqdefault.jpg)' }}
              >
                <span className="home-events-play" aria-hidden="true">▶</span>
                <span className="home-events-video-label">
                  <strong>WATCH THE CONVERSATION</strong>
                  <span>Opens on YouTube</span>
                </span>
              </a>
            )}
          </div>

          <div className="home-events-slider">
            <div className="home-events-status">
              <span>{status}</span>
              <span>SESSION {featured.id} · {featured.cluster}</span>
            </div>
            <div className="home-events-cluster">{featured.cluster}</div>
            <h3>{featured.title}</h3>
            <p>{featured.description}</p>
            <div className="home-events-meta">
              <span>{formatSessionDate(featured)}</span>
              <span>{featured.speaker || 'VALORIA INSTITUTE'}</span>
            </div>
            <div className="home-events-watch-actions">
              {isCurrent ? (
                <a className="home-events-watch-link" href={MEET_URL} target="_blank" rel="noopener noreferrer">
                  JOIN THE LIVE EVENT <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <a className="home-events-watch-link" href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                  WATCH THE FULL REPLAY <span aria-hidden="true">↗</span>
                </a>
              )}
              <a className="home-events-secondary-link" href="/events">
                EXPLORE VALORIA EVENTS <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="home-events-footer">
          <span>PROFESSIONAL THINKING · CAPABILITY · PRACTICAL ACTION</span>
          {isCurrent ? (
            <a href={MEET_URL} target="_blank" rel="noopener noreferrer">JOIN THE LIVE EVENT <span aria-hidden="true">↗</span></a>
          ) : (
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">WATCH ON YOUTUBE <span aria-hidden="true">↗</span></a>
          )}
          <a href="/events">VIEW ALL EVENTS <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  )
}
