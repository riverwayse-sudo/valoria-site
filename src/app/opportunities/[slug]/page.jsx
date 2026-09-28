'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
const GOLD='#C9A84C',DARK='#1A1A2E',PARCH='#F7F4EE'
export default function OpportunityDetail({params}){
 const [o,setO]=useState(null),[loading,setLoading]=useState(true)
 useEffect(()=>{fetch('/api/opportunities').then(r=>r.json()).then(x=>setO((x.opportunities||[]).find(v=>v.slug===params.slug))).finally(()=>setLoading(false))},[params.slug])
 if(loading)return <main style={{minHeight:'100vh',background:PARCH,padding:80}}>Loading…</main>
 if(!o)return <main style={{minHeight:'100vh',background:PARCH,padding:80}}><h1>Opportunity not found.</h1><Link href="/opportunities">Back to opportunities</Link></main>
 return <main style={{minHeight:'100vh',background:PARCH,color:DARK,fontFamily:'Raleway,Arial'}}><section style={{background:DARK,color:PARCH,padding:'90px 7vw'}}><div style={{maxWidth:900,margin:'auto'}}><div style={{color:GOLD,fontSize:11,fontWeight:800,letterSpacing:'.15em'}}>{o.opportunity_type.toUpperCase()}</div><h1 style={{fontSize:'clamp(40px,6vw,72px)',lineHeight:1}}>{o.title}</h1><p style={{fontSize:20,opacity:.75}}>{o.organisation_name} · {o.location||'Location flexible'} · {o.work_mode||'Flexible'}</p></div></section><article style={{maxWidth:900,margin:'auto',padding:'60px 7vw 100px'}}><div style={{whiteSpace:'pre-wrap',lineHeight:1.8,fontSize:17}}>{o.description}</div>{o.application_url&&<a href={o.application_url} target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:30,padding:'15px 24px',background:GOLD,color:DARK,textDecoration:'none',fontWeight:800}}>APPLY FOR THIS OPPORTUNITY →</a>}<div style={{marginTop:45}}><Link href="/opportunities">← ALL OPPORTUNITIES</Link></div></article></main>
}