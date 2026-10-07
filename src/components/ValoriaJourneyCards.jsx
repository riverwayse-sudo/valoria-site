'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './ValoriaJourneyCards.module.css'

const MILESTONES = [
  { key:'connect', title:'Join Valoria', short:'START', description:'Your Valoria account is ready.', href:'/profile/onboarding', icon:'01' },
  { key:'assess', title:'Complete VALU', short:'VALU', description:'See your professional signal.', href:'/journey/continue?stage=assess', icon:'02' },
  { key:'report', title:'Understand your result', short:'RESULT', description:'Read what your VALU result means.', href:'/report', icon:'03' },
  { key:'profile', title:'Build your profile', short:'PROFILE', description:'Tell people about your work.', href:'/profile/setup', icon:'04' },
  { key:'capability', title:'Show what you can do', short:'CAPABILITY', description:'Choose the capability you want Valoria to show.', href:'/profile/setup', icon:'05' },
  { key:'eligibility', title:'Get ready to be listed', short:'READY', description:'Complete the checks for your capability.', href:'/profile/setup', icon:'06' },
  { key:'listed', title:'Become discoverable', short:'REGISTRY', description:'Your eligible capability can appear in the Registry.', href:'/marketplace', icon:'07' },
  { key:'opportunity', title:'Find opportunities', short:'OPPORTUNITY', description:'See opportunities that fit what you do.', href:'/opportunities', icon:'08' },
]

const STAGE_ORDER = [
  'signed_up',
  'taster_started',
  'taster_completed',
  'full_valu_started',
  'full_valu_completed',
  'marketplace_profile_created',
  'profile_incomplete',
  'profile_complete',
  'capability_eligibility',
  'marketplace_enhanced',
]

function stageAtLeast(stage, target) {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(target)
}

function buildCards(state) {
  const stage = state?.journey?.stage || 'signed_up'
  const completed = {
    connect: true,
    assess: stageAtLeast(stage, 'full_valu_completed'),
    report: !!state?.report?.ready,
    profile: !!state?.profile?.complete,
    capability: !!state?.capability?.complete,
    eligibility: !!state?.eligibility?.complete,
    listed: stage === 'marketplace_enhanced',
    opportunity: false,
  }

  const nextKey = state?.next || 'assess'

  return MILESTONES.map((m, index) => {
    const complete = completed[m.key]
    const current = m.key === nextKey && !complete
    const locked = !complete && !current
    let href = m.href
    let action = complete ? 'VIEW' : current ? 'CONTINUE' : 'LOCKED'

    if (m.key === 'assess' && complete) href='/dashboard'
    if (m.key === 'report' && complete) href='/report'
    if (m.key === 'profile' && complete) href='/profile/edit'
    if (m.key === 'capability' && complete) href='/profile/passport'
    if (m.key === 'eligibility' && complete) href='/profile/passport'
    if (m.key === 'listed' && complete) href='/marketplace'
    if (m.key === 'opportunity' && complete) href='/opportunities'

    return { ...m, index, complete, current, locked, href, action }
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
  const progress = Number(state?.journey?.progressPercent ?? Math.round(completedCount / cards.length * 100))

  if (loading || !user) return null

  return (
    <section aria-label="Your Valoria Journey" className={styles.journey + (compact ? ' '+styles.compact : '')}>
      <div className={styles.head}>
        <div>
          <div className={styles.eyebrow}>YOUR JOURNEY</div>
          <h2>{current?.title || 'You are on your way'}</h2>
          <p>{state?.journey?.nextAction || current?.description || 'Your next step is ready.'}</p>
        </div>
        <div className={styles.progress}>
          <strong>{progress}<span>%</span></strong>
          <span>JOURNEY PROGRESS</span>
        </div>
      </div>

      <div className={styles.web} role="list" aria-label="Your Valoria journey steps">
        {cards.map((card, index) => (
          <div key={card.key} className={styles.webNodeWrap} role="listitem">
            {index > 0 && <span className={styles.webLine} aria-hidden="true" />}
            <Link
              href={card.locked ? '/journey' : card.href}
              className={[styles.webNode, card.complete ? styles.webComplete : '', card.current ? styles.webCurrent : '', card.locked ? styles.webLocked : ''].join(' ')}
              aria-current={card.current ? 'step' : undefined}
              aria-label={`${card.title}: ${card.complete ? 'done' : card.current ? 'your next step' : 'not ready yet'}`}
            >
              <span>{card.complete ? '✓' : card.icon}</span>
            </Link>
            <div className={[styles.webLabel, card.current ? styles.webLabelCurrent : ''].join(' ')}>
              {card.current ? 'YOU ARE HERE' : card.complete ? 'DONE' : card.short}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.next}>
        <span><b>YOUR NEXT STEP</b> {state?.journey?.nextAction || current?.title}</span>
        {current && !current.locked && <Link href={current.href} className={styles.primaryAction}>CONTINUE →</Link>}
      </div>
    </section>
  )
}
