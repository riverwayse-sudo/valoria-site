'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {supabase} from '@/lib/supabase'
const GOLD='#C9A84C',DARK='#1A1A2E',PARCH='#F7F4EE'
export default function OpportunityDetail({params}){
 const [o,setO]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[session,setSession]=useState(null),[coverNote,setCoverNote]=useState(''),[applied,setApplied]=useState(false),[applying,setApplying]=useState(false),[applyError,setApplyError]=useState('')
 useEffect(()=>{
  let active=true
  async function load(){
   try{
    const [opportunitiesResponse,sessionResult]=await Promise.all([fetch('/api/opportunities'),supabase.auth.getSession()])
    const payload=await opportunitiesResponse.json().catch(()=>({}))
    if(!opportunitiesResponse.ok) throw new Error(payload.error||'Opportunities could not be loaded.')
    if(active){setO((payload.opportunities||[]).find(v=>v.slug===params.slug)||null);setSession(sessionResult.data?.session||null)}
   }catch(e){if(active)setError(e.message||'Opportunity could not be loaded.')}
   finally{if(active)setLoading(false)}
  }
  load()
  return ()=>{active=false}
 },[params.slug])
 if(loading)return <main style={{minHeight:'100vh',background:PARCH,padding:80}}>Loading…</main>
 if(error)return <main style={{minHeight:'100vh',background:PARCH,color:DARK,padding:80,fontFamily:'Raleway,sans-serif'}}><h1>We could not load this opportunity.</h1><p>{error}</p><Link href="/opportunities">Back to opportunities</Link></main>
 if(!o)return <main style={{minHeight:'100vh',background:PARCH,padding:80}}><h1>Opportunity not found.</h1><Link href="/opportunities">Back to opportunities</Link></main>
 async function apply(){setApplyError('');if(!session){window.location.href='/login?returnTo='+encodeURIComponent(window.location.pathname);return}setApplying(true);try{const r=await fetch('/api/opportunities/applications',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({opportunity_id:o.id,cover_note:coverNote})});const x=await r.json().catch(()=>({}));if(!r.ok)throw new Error(x.error||'Application could not be submitted.');setApplied(true)}catch(e){setApplyError(e.message||'Application could not be submitted.')}finally{setApplying(false)}}
 return <main style={{minHeight:'100vh',background:PARCH,color:DARK,fontFamily:'Raleway,sans-serif'}}><section style={{background:DARK,color:PARCH,padding:'90px 7vw'}}><div style={{maxWidth:900,margin:'auto'}}><div style={{color:GOLD,fontSize:11,fontWeight:800,letterSpacing:'.15em'}}>{(o.opportunity_type||'job').toUpperCase()}</div><h1 style={{fontSize:'clamp(40px,6vw,72px)',lineHeight:1}}>{o.title}</h1><p style={{fontSize:20,opacity:.75}}>{o.organisation_name} · {o.location||'Location flexible'} · {o.work_mode||'Flexible'}</p></div></section><article style={{maxWidth:900,margin:'auto',padding:'60px 7vw 100px'}}><div style={{whiteSpace:'pre-wrap',lineHeight:1.8,fontSize:17}}>{o.description}</div>{o.application_url&&<a href={o.application_url} target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:30,padding:'15px 24px',background:GOLD,color:DARK,textDecoration:'none',fontWeight:800,borderRadius:22}}>APPLY EXTERNALLY →</a>}<section style={{marginTop:30,padding:24,border:'1px solid #D4C9A8',borderRadius:22,background:'#FAFAF7'}}><div style={{fontSize:10,letterSpacing:'.15em',fontWeight:800,color:'#8B7335'}}>VALORIA APPLICATION</div>{applied?<><h2 style={{margin:'10px 0 6px'}}>Application received.</h2><p style={{opacity:.7}}>Your application is saved. You can follow its status from your applications area.</p><Link href="/profile/applications" style={{color:DARK,fontWeight:800}}>OPEN MY APPLICATIONS →</Link></>:<><p style={{opacity:.7,lineHeight:1.6}}>Apply through your Valoria professional record. You must be listed to apply.</p><textarea value={coverNote} onChange={e=>setCoverNote(e.target.value)} maxLength={5000} placeholder="Optional cover note" style={{width:'100%',boxSizing:'border-box',minHeight:130,padding:14,border:'1px solid #D4C9A8',borderRadius:22,fontFamily:'Raleway,sans-serif',marginBottom:12}} />{applyError&&<p style={{color:'#9B3B24'}}>{applyError}</p>}<button onClick={apply} disabled={applying} style={{padding:'14px 22px',background:GOLD,color:DARK,border:0,borderRadius:22,fontWeight:800,cursor:'pointer'}}>{applying?'SUBMITTING…':'APPLY THROUGH VALORIA →'}</button></>}</section><div style={{marginTop:45}}><Link href="/opportunities">← ALL OPPORTUNITIES</Link></div></article></main>
}