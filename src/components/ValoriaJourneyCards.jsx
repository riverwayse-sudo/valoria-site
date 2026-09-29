'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './ValoriaJourneyCards.module.css'

const MILESTONES = [
  { key:'connect', title:'Join Valoria', description:'Your Valoria account anchors everything you do here.', href:'/signup', icon:'01' },
  { key:'assess', title:'Understand your value', description:'Complete VALU and establish your canonical VALU Index.', href:'/journey/continue?stage=assess', icon:'02' },
  { key:'report', title:'Receive your VALU report', description:'Your assessment becomes useful when your report is ready and connected to your next step.', href:'/dashboard', icon:'03' },
  { key:'profile', title:'Build your professional profile', description:'Turn your assessment into a complete professional identity.', href:'/profile/setup', icon:'04' },
  { key:'capability', title:'Define your capability', description:'Choose the professional capabilities you want Valoria to recognize.', href:'/profile/setup', icon:'05' },
  { key:'eligibility', title:'Reach eligibility', description:'Complete the requirements for professional discovery.', href:'/dashboard', icon:'06' },
  { key:'marketplace', title:'Enter the Marketplace', description:'Make your eligible capabilities discoverable.', href:'/marketplace', icon:'07' },
  { key:'opportunity', title:'Explore opportunities', description:'Turn your Valoria presence into meaningful opportunities.', href:'/opportunities', icon:'08' },
]

function buildCards(state) {
  const completed = {
    connect:!!state?.connect?.complete,
    assess:!!state?.assessment?.complete,
    report:!!state?.assessment?.reportReady,
    profile:!!state?.profile?.complete,
    capability:!!state?.capability?.complete,
    eligibility:!!state?.eligibility?.complete,
    marketplace:!!state?.marketplace?.complete,
    opportunity:!!state?.opportunity?.complete,
  }
  const firstOpen = ['assess','report','profile','capability','eligibility','marketplace','opportunity'].find(k => !completed[k]) || 'opportunity'
  return MILESTONES.map(m => {
    const complete=completed[m.key]
    const current=!complete && m.key===firstOpen
    const locked=!complete && !current
    let href=m.href
    let action=complete?'VIEW':current?'CONTINUE':'LOCKED'
    if(m.key==='assess' && complete){ href='/dashboard'; action='VIEW ASSESSMENT' }
    if(m.key==='report'){
      href='/dashboard'
      if(state?.assessment?.reportStatus==='EMAIL_PENDING') action='REPORT READY — EMAIL PENDING'
      else if(state?.assessment?.reportStatus==='FAILED') action='RETRY REPORT'
      else if(complete) action='VIEW REPORT'
    }
    if(m.key==='profile' && complete){ href='/profile/edit'; action='VIEW PROFILE' }
    if(m.key==='capability' && complete){ href='/profile/setup'; action='VIEW CAPABILITIES' }
    if(m.key==='eligibility' && complete){ href='/dashboard'; action='VIEW STATUS' }
    if(m.key==='marketplace' && complete){ href='/marketplace'; action='VIEW MARKETPLACE' }
    return {...m,complete,current,locked,href,action}
  })
}

export default function ValoriaJourneyCards({ compact=false }) {
  const [user,setUser]=useState(null)
  const [state,setState]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    let alive=true
    fetch('/api/journey/state',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
      if(!alive)return
      if(data?.authenticated){setUser({authenticated:true});setState(data.state)}
      setLoading(false)
    }).catch(()=>alive&&setLoading(false))
    return()=>{alive=false}
  },[])
  const cards=useMemo(()=>buildCards(state),[state])
  const current=cards.find(c=>c.current)||cards[cards.length-1]
  const completedCount=cards.filter(c=>c.complete).length
  const progress=Math.round((completedCount/cards.length)*100)
  if(loading||!user)return null
  return <section aria-label="Your Valoria Journey" className={styles.journey+(compact?' '+styles.compact:'')}>
    <div className={styles.head}><div><div className={styles.eyebrow}>YOUR VALORIA JOURNEY</div><h2>{current?.title||'Continue your journey'}</h2><p>{current?.description||'Your next step is ready.'}</p></div><div className={styles.progress}><strong>{completedCount}/{cards.length}</strong><span>MILESTONES</span></div></div>
    <div className={styles.track} aria-hidden="true"><span style={{width:progress+'%'}} /></div>
    <div className={styles.cards}>{cards.map(card=><JourneyCard key={card.key} card={card}/>)}</div>
    <div className={styles.next}><span><b>NEXT OBJECTIVE</b> {current?.title}</span>{current&&!current.locked&&<JourneyLink card={current} primary/>}</div>
  </section>
}

function JourneyCard({card}){return <article className={styles.card+(card.complete?' '+styles.complete:'')+(card.current?' '+styles.current:'')+(card.locked?' '+styles.locked:'')}><div><div className={styles.cardTop}><span className={styles.cardIndex}>{card.icon}</span><span className={styles.cardState}>{card.complete?'✓ COMPLETE':card.current?'CURRENT':'LOCKED'}</span></div><h3>{card.title}</h3><p>{card.description}</p></div>{!card.locked&&<JourneyLink card={card}/>}</article>}
function JourneyLink({card,primary=false}){return <Link href={card.href} className={styles.action}>{primary?'CONTINUE →':card.action+' →'}</Link>}
