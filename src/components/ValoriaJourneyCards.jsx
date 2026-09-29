'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './ValoriaJourneyCards.module.css'

const MILESTONES = [
  { key:'connect', title:'Join Valoria', short:'IDENTITY', description:'Your account anchors your Valoria identity.', href:'/profile/onboarding', icon:'01' },
  { key:'assess', title:'Complete VALU', short:'ASSESSMENT', description:'Complete the full VALU assessment and establish your canonical VALU Index.', href:'/journey/continue?stage=assess', icon:'02' },
  { key:'report', title:'Receive your VALU report', short:'INTELLIGENCE', description:'Your assessment becomes useful when you can read and act on your report.', href:'/report', icon:'03' },
  { key:'profile', title:'Complete your Professional Profile', short:'PROFILE', description:'Build the professional identity that carries your Valoria record across capabilities and opportunities.', href:'/profile/setup', icon:'04' },
  { key:'capability', title:'Define your Capability', short:'CAPABILITY', description:'Activate Talent, Speaker, Facilitator, or another supported capability on the same professional profile.', href:'/profile/setup', icon:'05' },
  { key:'eligibility', title:'Reach Eligibility', short:'GOVERNANCE', description:'Complete the requirements attached to the capability or capabilities you selected.', href:'/profile/setup', icon:'06' },
  { key:'listed', title:'Become Listed', short:'VISIBILITY', description:'Once the authoritative eligibility gate is satisfied, your eligible capability can enter the Valoria marketplace.', href:'/marketplace', icon:'07' },
  { key:'opportunity', title:'Access Opportunities', short:'OPPORTUNITY', description:'Use your listed professional profile for discovery, matching, enquiries and opportunities.', href:'/opportunities', icon:'08' },
]

function buildCards(state) {
  const completed = {
    connect: !!state?.connect?.complete,
    assess: !!state?.assessment?.complete,
    report: !!state?.report?.complete,
    profile: !!state?.profile?.complete,
    capability: !!state?.capability?.complete,
    eligibility: !!state?.eligibility?.complete,
    listed: !!state?.marketplace?.complete,
    opportunity: !!state?.opportunity?.complete,
  }
  const firstOpen = MILESTONES.find(m => !completed[m.key])?.key || 'opportunity'

  return MILESTONES.map((m, index) => {
    const complete = completed[m.key]
    const current = !complete && m.key === firstOpen
    const locked = !complete && !current
    let href = m.href
    let action = complete ? 'VIEW' : current ? 'CONTINUE' : 'LOCKED'

    if (m.key === 'assess' && complete) { href='/dashboard'; action='VIEW ASSESSMENT' }
    if (m.key === 'report' && complete) { href='/report'; action='VIEW REPORT' }
    if (m.key === 'profile' && complete) { href='/profile/edit'; action='VIEW PROFILE' }
    if (m.key === 'capability' && complete) { href='/profile/passport'; action='VIEW PASSPORT' }
    if (m.key === 'eligibility' && complete) { href='/profile/passport'; action='VIEW ELIGIBILITY' }
    if (m.key === 'listed' && complete) { href='/marketplace'; action='VIEW MARKETPLACE' }
    if (m.key === 'opportunity' && complete) { href='/opportunities'; action='VIEW OPPORTUNITIES' }

    return {
      ...m,
      index,
      complete,
      current,
      locked,
      href,
      action,
      fill: complete ? 100 : current ? 38 : 0,
    }
  })
}

export default function ValoriaJourneyCards({ compact=false }) {
  const [user, setUser] = useState(null)
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/journey/state', { cache:'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!alive) return
        if (data?.authenticated) {
          setUser({ authenticated:true })
          setState(data.state)
        }
        setLoading(false)
      })
      .catch(() => alive && setLoading(false))
    return () => { alive=false }
  }, [])

  const cards = useMemo(() => buildCards(state), [state])
  const current = cards.find(c => c.current) || cards[cards.length - 1]
  const completedCount = cards.filter(c => c.complete).length
  const progress = Math.round(completedCount / cards.length * 100)

  if (loading || !user) return null

  return (
    <section aria-label="Your Valoria Journey" className={styles.journey + (compact ? ' '+styles.compact : '')}>
      <div className={styles.head}>
        <div>
          <div className={styles.eyebrow}>YOUR VALORIA JOURNEY · FIELD PROGRESSION</div>
          <h2>{current?.title || 'Continue your journey'}</h2>
          <p>{current?.description || 'Your next step is ready.'}</p>
        </div>
        <div className={styles.progress}>
          <strong>{completedCount}<span>/{cards.length}</span></strong>
          <span>OBJECTIVES CLEARED</span>
        </div>
      </div>

      <div className={styles.progressRail} aria-label={`${completedCount} of ${cards.length} objectives completed`}>
        <span className={styles.progressRailFill} style={{ width: progress+'%' }} />
      </div>

      <div className={styles.cardsViewport}>
        <div className={styles.cards}>
          {cards.map(card => <JourneyCard key={card.key} card={card} />)}
        </div>
      </div>

      <div className={styles.next}>
        <span><b>NEXT OBJECTIVE</b> {current?.title}</span>
        {current && !current.locked && <JourneyLink card={current} primary />}
      </div>
    </section>
  )
}

function JourneyCard({ card }) {
  const className = [
    styles.card,
    card.complete ? styles.complete : '',
    card.current ? styles.current : '',
    card.locked ? styles.locked : '',
  ].join(' ')

  return (
    <article className={className} aria-current={card.current ? 'step' : undefined}>
      <div className={styles.scanLine} />
      <div>
        <div className={styles.cardTop}>
          <span className={styles.cardIndex}>{card.icon}</span>
          <span className={styles.cardState}>
            {card.complete ? 'CLEARED' : card.current ? 'ACTIVE' : 'LOCKED'}
          </span>
        </div>

        <div className={styles.cardCode}>VALORIA // {card.short}</div>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </div>

      <div className={styles.cardBottom}>
        <div className={styles.fillMeta}>
          <span>PROGRESSION</span>
          <strong>{card.fill}%</strong>
        </div>
        <div className={styles.fillTrack} aria-hidden="true">
          <span className={styles.fill} style={{ width: card.fill+'%' }} />
        </div>
        {!card.locked && <JourneyLink card={card} />}
      </div>
    </article>
  )
}

function JourneyLink({ card, primary=false }) {
  return (
    <Link href={card.href} className={primary ? styles.primaryAction : styles.action}>
      {primary ? 'CONTINUE OBJECTIVE →' : card.action+' →'}
    </Link>
  )
}
