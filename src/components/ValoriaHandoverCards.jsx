import Link from 'next/link'
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
      href: '/about-us',
      action: 'Discover Valoria',
      tone: 'institute',
    },
    {
      number: '02',
      label: 'VALU INDEX',
      title: 'Understand your professional value.',
      copy: 'A structured assessment that turns your responses into insight across five dimensions of professional capability.',
      href: '/valu',
      action: 'Explore VALU',
      tone: 'valu',
    },
    {
      number: '03',
      label: 'PRIME FRAMEWORK',
      title: 'Five dimensions. One fuller picture.',
      copy: 'Presence, Relationships, Intelligence, Mastery and Enterprise — the dimensions that shape how professional value is built.',
      href: '/prime',
      action: 'Explore PRIME',
      tone: 'prime',
    },
    {
      number: '04',
      label: 'PROFESSIONAL REGISTRY',
      title: 'Make your capability discoverable.',
      copy: 'Build a professional profile, define your capabilities and work towards visibility in the Valoria marketplace.',
      href: '/marketplace',
      action: 'Visit marketplace',
      tone: 'registry',
    },
    {
      number: '05',
      label: 'EVENTS & CONVERSATIONS',
      title: nextEvent ? nextEvent.title : 'The next conversation is coming.',
      copy: nextEvent
        ? `${formatSessionDate(nextEvent)} · ${nextEvent.speaker || 'Valoria Institute'} · ${eventState === 'live' ? 'Live now' : 'Registration details on the events page'}`
        : 'Valoria conversations bring professionals together around the ideas, standards and capabilities shaping the future of work. The next confirmed date will appear here.',
      href: '/events',
      action: nextEvent ? 'View event details' : 'Explore events',
      tone: 'events',
    },
  ]

  return (
    <section className={styles.section} aria-label="Discover Valoria Institute">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>WHILE YOUR ACCOUNT OPENS</span>
          <h2>There is more to <em>Valoria.</em></h2>
        </div>
        <p>Explore the institute, the VALU framework, professional opportunities and conversations ahead.</p>
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
            <Link href={card.href} className={styles.link}>{card.action}<span aria-hidden="true"> ↗</span></Link>
          </article>
        ))}
      </div>
      <div className={styles.footer}>YOUR ACCOUNT · YOUR INSIGHT · YOUR NEXT CHAPTER</div>
    </section>
  )
}
