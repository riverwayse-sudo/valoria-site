'use client'
import { useEffect,useMemo,useState } from 'react'
import Link from 'next/link'
import styles from './ValoriaJourneyCards.module.css'

const MILESTONES=[
 {key:'connect',title:'Join Valoria',description:'Your account anchors your Valoria identity.',href:'/profile/onboarding',icon:'01'},
 {key:'assess',title:'Complete VALU',description:'Complete the full VALU assessment and establish your canonical VALU Index.',href:'/journey/continue?stage=assess',icon:'02'},
 {key:'report',title:'Receive your VALU report',description:'Your assessment becomes useful when you can read and act on your report.',href:'/report',icon:'03'},
 {key:'profile',title:'Complete your Professional Profile',description:'Build the professional identity that carries your Valoria record across capabilities and opportunities.',href:'/profile/setup',icon:'04'},
 {key:'capability',title:'Define your Capability',description:'Activate Talent, Speaker, Facilitator, or another supported capability on the same professional profile.',href:'/profile/setup',icon:'05'},
 {key:'eligibility',title:'Reach Eligibility',description:'Complete the requirements attached to the capability or capabilities you selected.',href:'/profile/setup',icon:'06'},
 {key:'listed',title:'Become Listed',description:'Once the authoritative eligibility gate is satisfied, your eligible capability can enter the Valoria marketplace.',href:'/marketplace',icon:'07'},
 {key:'opportunity',title:'Access Opportunities',description:'Use your listed professional profile for discovery, matching, enquiries and opportunities.',href:'/opportunities',icon:'08'},
]

function buildCards(state){
 const completed={
  connect:!!state?.connect?.complete,
  assess:!!state?.assessment?.complete,
  report:!!state?.report?.complete,
  profile:!!state?.profile?.complete,
  capability:!!state?.capability?.complete,
  eligibility:!!state?.eligibility?.complete,
  listed:!!state?.marketplace?.complete,
  opportunity:!!state?.opportunity?.complete
 }
 const firstOpen=['assess','report','profile','capability','eligibility','listed','opportunity'].find(k=>!completed[k])||'opportunity'
 return MILESTONES.map(m=>{
  const complete=completed[m.key],current=!complete&&m.key===firstOpen,locked=!complete&&!current
  let href=m.href,action=complete?'VIEW':current?'CONTINUE':'LOCKED'
  if(m.key==='assess'&&complete){href='/dashboard';action='VIEW ASSESSMENT'}
  if(m.key==='report'&&complete){href='/report';action='VIEW REPORT'}
  if(m.key==='profile'&&complete){href='/profile/edit';action='VIEW PROFILE'}
  if(m.key==='capability'&&complete){href='/profile/setup';action='VIEW CAPABILITIES'}
  if(m.key==='eligibility'&&complete){href='/profile/setup';action='VIEW ELIGIBILITY'}
  if(m.key==='listed'&&complete){href='/marketplace';action='VIEW MARKETPLACE'}
  if(m.key==='opportunity'&&complete){href='/opportunities';action='VIEW OPPORTUNITIES'}
  return {...m,complete,current,locked,href,action}
 })
}

export default function ValoriaJourneyCards({compact=false}){
 const [user,setUser]=useState(null),[state,setState]=useState(null),[loading,setLoading]=useState(true)
 useEffect(()=>{let alive=true;fetch('/api/journey/state',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(!alive)return;if(data?.authenticated){setUser({authenticated:true});setState(data.state)}setLoading(false)}).catch(()=>alive&&setLoading(false));return()=>{alive=false}},[])
 const cards=useMemo(()=>buildCards(state),[state]),current=cards.find(c=>c.current)||cards[cards.length-1],completedCount=cards.filter(c=>c.complete).length,progress=Math.round(completedCount/cards.length*100)
 if(loading||!user)return null
 return <section aria-label="Your Valoria Journey" className={styles.journey+(compact?' '+styles.compact:'')}><div className={styles.head}><div><div className={styles.eyebrow}>YOUR VALORIA JOURNEY</div><h2>{current?.title||'Continue your journey'}</h2><p>{current?.description||'Your next step is ready.'}</p></div><div className={styles.progress}><strong>{completedCount}/{cards.length}</strong><span>MILESTONES</span></div></div><div className={styles.track} aria-hidden="true"><span style={{width:progress+'%'}}/></div><div className={styles.cards}>{cards.map(card=><JourneyCard key={card.key} card={card}/>)}</div><div className={styles.next}><span><b>NEXT OBJECTIVE</b> {current?.title}</span>{current&&!current.locked&&<JourneyLink card={current} primary/>}</div></section>
}

function JourneyCard({card}){return <article className={styles.card+(card.complete?' '+styles.complete:'')+(card.current?' '+styles.current:'')+(card.locked?' '+styles.locked:'')}><div><div className={styles.cardTop}><span className={styles.cardIndex}>{card.icon}</span><span className={styles.cardState}>{card.complete?'✓ COMPLETE':card.current?'CURRENT':'LOCKED'}</span></div><h3>{card.title}</h3><p>{card.description}</p></div>{!card.locked&&<JourneyLink card={card}/>}</article>}
function JourneyLink({card,primary=false}){return <Link href={card.href} className={styles.action}>{primary?'CONTINUE →':card.action+' →'}</Link>}
