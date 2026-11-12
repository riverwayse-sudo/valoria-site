import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'
import styles from './ValoriaHandoverCards.module.css'

function getNextEvent() {
  const now = Date.now()
  return PROFESSIONAL_STANDARD_SERIES
    .filter(session => !session.replay && session.dateApproved && new Date(session.end).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] || null
}

export default function ValoriaHandoverCards() {
  const nextEvent = getNextEvent()
  const eventState = nextEvent ? getSessionState(nextEvent) : null
  const cards = [
    {
      number: '01',
      label: 'THE INSTITUTE',
      title: 'Worth. Built.',
      copy: 'A professional institute building the standards, insight and infrastructure that help capability become recognised value.',
      tone: 'institute',
    },
    {
      number: '02',
      label: 'VALU INDEX',
      title: 'Understand your professional value.',
      copy: 'A structured assessment that turns your responses into insight across five dimensions of professional capability.',
      tone: 'valu',
    },
    {
      number: '03',
      label: 'PRIME FRAMEWORK',
      title: 'Five dimensions. One fuller picture.',
      copy: 'Presence, Relationships, Intelligence, Mastery and Enterprise — the dimensions that shape how professional value is built.',
      tone: 'prime',
    },
    {
      number: '04',
      label: 'PROFESSIONAL REGISTRY',
      title: 'Make your capability discoverable.',
      copy: 'Build a professional profile, define your capabilities and work towards visibility in the Valoria marketplace.',
      tone: 'registry',
    },
    {
      number: '05',
      label: 'EVENTS & CONVERSATIONS',
      title: nextEvent ? nextEvent.title : 'The next conversation is coming.',
      copy: nextEvent
        ? `${formatSessionDate(nextEvent)} · ${nextEvent.speaker || 'Valoria Institute'} · ${eventState === 'live' ? 'Live now' : 'Registration details on the events page'}`
        : 'Valoria conversations bring professionals together around the ideas, standards and capabilities shaping the future of work. The next confirmed date will appear here.',
      tone: 'events',
    },
  ]

  return (
    <section className={styles.section} aria-label="Discover Valoria Institute">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>YOUR NEXT VALORIA EXPERIENCE</span>
          <h2>There is more to <em>Valoria.</em></h2>
        </div>
        <p>A quick introduction to the institute, your professional framework, the marketplace and upcoming conversations.</p>
      </div>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <article key={card.number} className={`${styles.card} ${styles[card.tone]}`} style={{ '--card-index': index }}>
            <div className={styles.cardTop}>
              <span className={styles.number}>{card.number}</span>
              <span className={styles.label}>{card.label}</span>
            </div>
            <div className={styles.cardBody}>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </div>
            <span className={styles.link}>VALORIA INSTITUTE</span>
          </article>
        ))}
      </div>
      <div className={styles.footer}>YOUR ACCOUNT · YOUR INSIGHT · YOUR NEXT CHAPTER</div>
    </section>
  )
}
