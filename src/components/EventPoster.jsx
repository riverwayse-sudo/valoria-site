import { formatSessionDate } from '@/lib/professionalStandardSeries'

const OUTCOMES = {
  '02': ['Problem selection', 'Strategic trade-offs', 'Three-question diagnostic'],
  '03': ['Output → impact', 'The indispensability trap', 'A sustainable operating model'],
}

export default function EventPoster({ session }) {
  const outcomes = OUTCOMES[session.id] || []
  const date = formatSessionDate(session)
  const time = session.start ? new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit' }).format(new Date(session.start)) : '10:00 AM'
  const titleParts = session.title.split(': ')
  const lead = titleParts[0]
  const rest = titleParts.slice(1).join(': ')

  return (
    <div className="event-poster" aria-label={`${session.title} — ${date}`}>
      <div className="poster-noise" aria-hidden="true" />
      <div className="poster-top">
        <span>THE PROFESSIONAL<br />STANDARD SERIES</span>
        <span className="poster-brand">VALORIA<br /><small>INSTITUTE</small></span>
      </div>
      <div className="poster-rule" />
      <div className="poster-session">SESSION {session.id} <span>·</span> {session.cluster}</div>
      <div className="poster-main">
        <div className="poster-title">
          <h3>{lead}{titleParts.length > 1 && ':'}</h3>
          {rest && <p>{rest}</p>}
        </div>
        <div className="poster-mark" aria-hidden="true"><span>{session.id}</span><i /></div>
      </div>
      <div className="poster-bottom">
        <div className="poster-outcomes">
          <span>THE CONVERSATION</span>
          {outcomes.map((item, index) => <div key={item}><b>0{index + 1}</b>{item}</div>)}
        </div>
        <div className="poster-details">
          <div><b>{date.replace(', 2026', '')}</b><span>{time} WAT · VIRTUAL</span></div>
          <div><b>{session.speaker || 'VALORIA INSTITUTE'}</b><span>90 MINUTES</span></div>
        </div>
      </div>
    </div>
  )
}
