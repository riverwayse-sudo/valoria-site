'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './ValoriaJourneyCards.module.css'

const MILESTONES = [
  { key: 'connect', title: 'Join Valoria', description: 'Your Valoria account anchors everything you do here.', href: '/signup', icon: '01' },
  { key: 'assess', title: 'Understand your value', description: 'Complete VALU to establish your canonical VALU Index.', href: 'https://assessment.valoriainstitute.com/', icon: '02', external: true },
  { key: 'profile', title: 'Build your professional profile', description: 'Turn your assessment into a professional identity.', href: '/profile/setup', icon: '03' },
  { key: 'capability', title: 'Define your capability', description: 'Choose the professional capabilities you want Valoria to recognize.', href: '/profile/setup', icon: '04' },
  { key: 'eligibility', title: 'Reach eligibility', description: 'Complete the requirements for professional discovery.', href: '/dashboard', icon: '05' },
  { key: 'marketplace', title: 'Enter the Marketplace', description: 'Make your eligible capabilities discoverable.', href: '/marketplace', icon: '06' },
  { key: 'opportunity', title: 'Explore opportunities', description: 'Turn your Valoria presence into meaningful opportunities.', href: '/marketplace', icon: '07' },
]

function deriveState(journey, profile, capabilities) {
  return {
    hasAssessment: !!journey?.current_assessment_id || profile?.valu_index != null,
    hasProfile: !!journey?.profile_ready || !!(profile?.display_name && (profile?.current_job_title || profile?.headline)),
    hasCapability: !!journey?.capability_selected || (profile?.active_tracks || []).length > 0 || capabilities.length > 0,
    hasEligibility: journey?.eligibility_state === 'eligible' || journey?.eligibility_state === 'listed' || journey?.marketplace_ready,
    isListed: !!journey?.marketplace_ready || journey?.lifecycle_state === 'listed' ||
      capabilities.some(c => c?.is_active && (c?.eligibility_status === 'listed' || c?.eligible_for_listing === true)),
  }
}

function buildCards(state) {
  const completed = {
    connect: true,
    assess: state.hasAssessment,
    profile: state.hasProfile,
    capability: state.hasCapability,
    eligibility: state.hasEligibility,
    marketplace: state.isListed,
    opportunity: false,
  }
  const firstOpen = MILESTONES.find(m => !completed[m.key])?.key || 'opportunity'

  return MILESTONES.map((m) => {
    const isComplete = completed[m.key]
    const isCurrent = !isComplete && m.key === firstOpen
    const isLocked = !isComplete && !isCurrent
    let href = m.href
    let action = isComplete ? 'VIEW' : isCurrent ? 'CONTINUE' : 'LOCKED'
    if (m.key === 'assess' && isComplete) { href = '/dashboard'; action = 'VIEW JOURNEY' }
    if (m.key === 'profile' && isComplete) { href = '/profile/edit'; action = 'VIEW PROFILE' }
    if (m.key === 'capability' && isComplete) { href = '/dashboard'; action = 'VIEW CAPABILITIES' }
    if (m.key === 'eligibility' && isComplete) { href = '/dashboard'; action = 'VIEW STATUS' }
    return { ...m, complete: isComplete, current: isCurrent, locked: isLocked, href, action }
  })
}

export default function ValoriaJourneyCards({ compact = false }) {
  const [user, setUser] = useState(null)
  const [journey, setJourney] = useState(null)
  const [profile, setProfile] = useState(null)
  const [capabilities, setCapabilities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) { setLoading(false); return }
      setUser(user)

      const [journeyResult, profileResult, capabilityResult] = await Promise.all([
        supabase.from('professional_journey').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('professional_profiles').select('id,display_name,headline,current_job_title,active_tracks,valu_index').eq('id', user.id).maybeSingle(),
        supabase.from('professional_capabilities').select('id,is_active,eligibility_status,eligible_for_listing').eq('professional_id', user.id),
      ])

      if (!alive) return
      setJourney(journeyResult.data || null)
      setProfile(profileResult.data || null)
      setCapabilities(capabilityResult.data || [])
      setLoading(false)
    }
    load()
    return () => { alive = false }
  }, [])

  const state = useMemo(() => deriveState(journey, profile, capabilities), [journey, profile, capabilities])
  const cards = useMemo(() => buildCards(state), [state])
  const current = cards.find(c => c.current) || cards[cards.length - 1]
  const completedCount = cards.filter(c => c.complete).length
  const progress = Math.round((completedCount / cards.length) * 100)

  if (loading || !user) return null

  return (
    <section aria-label="Your Valoria Journey" className={styles.journey + (compact ? ' ' + styles.compact : '')}>
      <div className={styles.head}>
        <div>
          <div className={styles.eyebrow}>YOUR VALORIA JOURNEY</div>
          <h2>{current?.title || 'Continue your journey'}</h2>
          <p>{current?.description || 'Your next step is ready.'}</p>
        </div>
        <div className={styles.progress}>
          <strong>{completedCount}/{cards.length}</strong>
          <span>MILESTONES</span>
        </div>
      </div>
      <div className={styles.track} aria-hidden="true"><span style={{ width: progress + '%' }} /></div>
      <div className={styles.cards}>
        {cards.map(card => <JourneyCard key={card.key} card={card} />)}
      </div>
      <div className={styles.next}>
        <span><b>NEXT OBJECTIVE</b> {current?.title}</span>
        {current && !current.locked && <JourneyLink card={current} primary />}
      </div>
    </section>
  )
}

function JourneyCard({ card }) {
  return (
    <article className={styles.card + (card.complete ? ' ' + styles.complete : '') + (card.current ? ' ' + styles.current : '') + (card.locked ? ' ' + styles.locked : '')}>
      <div>
        <div className={styles.cardTop}>
          <span className={styles.cardIndex}>{card.icon}</span>
          <span className={styles.cardState}>{card.complete ? '✓ COMPLETE' : card.current ? 'CURRENT' : 'LOCKED'}</span>
        </div>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </div>
      {!card.locked && <JourneyLink card={card} />}
    </article>
  )
}

function JourneyLink({ card, primary = false }) {
  return (
    <Link
      href={card.href}
      className={styles.action}
      {...(card.external ? { target:'_blank', rel:'noopener noreferrer' } : {})}
    >
      {primary ? 'CONTINUE →' : card.action + ' →'}
    </Link>
  )
}
