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
  const chapters = [
    {
      number: '01',
      label: 'THE INSTITUTE',
      title: 'Worth. Built.',
      copy: 'An institute advancing professional standards, insight and the infrastructure that turns capability into recognised value.',
    },
    {
      number: '02',
      label: 'VALU INDEX',
      title: 'See your professional value with greater clarity.',
      copy: 'A structured assessment that brings together evidence across five dimensions of professional capability.',
    },
    {
      number: '03',
      label: 'THE PRIME FRAMEWORK',
      title: 'A fuller picture of professional capability.',
      copy: 'Presence, Relationships, Intelligence, Mastery and Enterprise — five dimensions, considered together.',
    },
    {
      number: '04',
      label: 'THE PROFESSIONAL REGISTRY',
      title: 'Let the right people discover what you do.',
      copy: 'Build a considered professional profile, define your capabilities and progress towards marketplace visibility.',
    },
    {
      number: '05',
      label: 'EVENTS & CONVERSATIONS',
      title: nextEvent ? nextEvent.title : 'Ideas worth bringing people together for.',
      copy: nextEvent
        ? `${formatSessionDate(nextEvent)} · ${nextEvent.speaker || 'Valoria Institute'} · ${eventState === 'live' ? 'Live now' : 'Explore the event'}`
        : 'Valoria conversations bring professionals together around the ideas, standards and capabilities shaping the future of work.',
    },
  ]

  return (
    <section className={styles.experience} aria-label="An introduction to Valoria Institute">
      <div className={styles.intro}>
        <div className={styles.seal} aria-hidden="true">
          <span className={styles.sealOuter} />
          <span className={styles.sealInner} />
          <img src="/logo.png" alt="Valoria Institute" className={styles.sealLogo} />
        </div>
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>A CLOSER LOOK AT VALORIA</span>
          <h2>A place where professional <em>worth</em> is built.</h2>
          <p>Beyond the assessment is an institute, a framework and a professional community designed to make capability more visible and meaningful.</p>
          <div className={styles.signature}><span /> WORTH. BUILT.</div>
        </div>
      </div>

      <div className={styles.chapters} aria-label="Explore the Valoria experience">
        <div className={styles.chapterHeading}>
          <span>THE INSTITUTE, IN FIVE PARTS</span>
          <span>01 — 05</span>
        </div>
        <ol className={styles.timeline}>
          {chapters.map((chapter, index) => (
            <li key={chapter.number} className={styles.chapter} style={{ '--chapter-index': index }}>
              <span className={styles.chapterNumber}>{chapter.number}</span>
              <span className={styles.chapterRule} aria-hidden="true" />
              <div className={styles.chapterCopy}>
                <span className={styles.chapterLabel}>{chapter.label}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.copy}</p>
              </div>
              <span className={styles.chapterMark} aria-hidden="true">↗</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.footer}>
        <span>YOUR ACCOUNT</span><i /><span>YOUR INSIGHT</span><i /><span>YOUR NEXT CHAPTER</span>
      </div>
    </section>
  )
}
