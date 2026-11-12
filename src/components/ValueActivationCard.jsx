'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'

export default function ValueActivationCard(){
 const [plan,setPlan]=useState(null),[loading,setLoading]=useState(true),[activating,setActivating]=useState(false)
 useEffect(()=>{fetch('/api/journey/value-activation',{cache:'no-store'}).then(r=>r.json()).then(x=>setPlan(x.plan||null)).finally(()=>setLoading(false))},[])
 async function activate(){
  setActivating(true)
  try{const r=await fetch('/api/journey/value-activation',{method:'POST'});const x=await r.json();if(x.plan)setPlan(x.plan)}finally{setActivating(false)}
 }
 if(loading||!plan)return null
 return <section style={{marginTop:38,padding:26,border:'1px solid rgba(201,168,76,.24)',background:'rgba(201,168,76,.055)',borderRadius:10}}>
  <div style={{fontSize:10,letterSpacing:'.16em',fontWeight:800,color:'#C9A84C'}}>VALUE ACTIVATION</div>
  <h2 style={{fontSize:'clamp(25px,4vw,38px)',fontWeight:400,lineHeight:1.05,margin:'12px 0'}}>Turn your VALU result into professional movement.</h2>
  <p style={{color:'rgba(247,244,238,.65)',lineHeight:1.7,maxWidth:680}}>Your score is not the endpoint. This plan translates the assessment into strengths to use, gaps to develop and the next assets to build.</p>
  {plan.priority_cluster&&<div style={{margin:'20px 0',fontSize:12,color:'#C9A84C',fontWeight:800,letterSpacing:'.08em'}}>DEVELOPMENT PRIORITY · {plan.priority_cluster.toUpperCase()}</div>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>
   {(plan.strengths||[]).map(x=><div key={'s'+x.cluster} style={{padding:16,background:'rgba(255,255,255,.035)',borderRadius:8}}><b>Strength · {x.cluster}</b><div style={{fontSize:13,opacity:.65,marginTop:6}}>VALU {x.score}/100</div></div>)}
   {(plan.development_priorities||[]).map(x=><div key={'d'+x.cluster} style={{padding:16,background:'rgba(255,255,255,.035)',borderRadius:8}}><b>Develop · {x.cluster}</b><div style={{fontSize:13,opacity:.65,marginTop:6}}>Current signal {x.score}/100</div></div>)}
  </div>
  <div style={{marginTop:20,display:'flex',gap:10,flexWrap:'wrap'}}>
   {(plan.next_actions||[]).slice(0,3).map(x=><Link key={x.title} href={x.href} style={{padding:'11px 14px',border:'1px solid rgba(201,168,76,.25)',color:'#C9A84C',textDecoration:'none',fontSize:11,fontWeight:800}}>{x.title} →</Link>)}
   {plan.status!=='activated'&&<button onClick={activate} disabled={activating} style={{padding:'11px 16px',border:0,background:'#C9A84C',color:'#1A1A2E',fontSize:11,fontWeight:800,cursor:'pointer'}}>{activating?'ACTIVATING…':'ACTIVATE MY PLAN'}</button>}
  </div>
  {plan.status==='activated'&&<div style={{marginTop:14,fontSize:11,color:'rgba(247,244,238,.55)'}}>Activated. Your next steps remain connected to your Valoria journey.</div>}
 </section>
}