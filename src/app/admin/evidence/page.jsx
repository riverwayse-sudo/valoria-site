'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {supabase} from '@/lib/supabase'
const G='#C9A84C',D='#0F0F1A',P='#F7F4EE',M='#1A1A2E',DIM='rgba(247,244,238,.55)'

export default function AdminEvidence(){
 const [docs,setDocs]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState('')
 async function load(){
  const {data:{session}}=await supabase.auth.getSession();if(!session){location.href='/admin/login';return}
  const r=await fetch('/api/admin/evidence',{headers:{Authorization:'Bearer '+session.access_token}});const j=await r.json().catch(()=>({}))
  if(!r.ok)setError(j.error||'Could not load evidence.');else setDocs(j.documents||[]);setLoading(false)
 }
 useEffect(()=>{load()},[])
 async function review(id,status){
  setBusy(id);setError('')
  const {data:{session}}=await supabase.auth.getSession()
  const r=await fetch('/api/admin/evidence',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({id,status})})
  const j=await r.json().catch(()=>({}))
  if(!r.ok)setError(j.error||'Could not update evidence.');else setDocs(xs=>xs.map(d=>d.id===id?{...d,...j.document}:d))
  setBusy('')
 }
 if(loading)return <main style={s.root}>Loading evidence review…</main>
 return <main style={s.root}><header style={s.header}><Link href="/admin" style={s.back}>← Administration</Link><b>EVIDENCE GOVERNANCE</b></header><section style={s.wrap}><h1 style={s.h1}>Credentials &amp; evidence</h1><p style={s.dim}>Verify the evidence that supports capability eligibility. Verification changes are audited.</p>{error&&<p style={s.error}>{error}</p>}<div style={s.list}>{docs.map(d=><article key={d.id} style={s.row}><div><b>{d.profile?.display_name||d.professional_id}</b><div style={s.dim}>{d.profile?.headline||'—'} · {d.document_type} · {d.original_filename}</div><div style={s.tags}><span style={s.tag}>{d.verification_status}</span>{d.profile?.atb_id&&<span style={s.tag}>{d.profile.atb_id}</span>}</div></div><div style={s.actions}>{d.review_url&&<a href={d.review_url} target="_blank" rel="noreferrer" style={s.link}>VIEW</a>}<button disabled={busy===d.id} onClick={()=>review(d.id,'verified')} style={s.gold}>VERIFY</button><button disabled={busy===d.id} onClick={()=>review(d.id,'rejected')} style={s.reject}>REJECT</button></div></article>)}</div>{!docs.length&&<div style={s.empty}>No evidence submissions yet.</div>}</section></main>
}
const s={root:{minHeight:'100vh',background:D,color:P,fontFamily:'Raleway,Arial'},header:{height:64,padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',background:M,borderBottom:'1px solid rgba(201,168,76,.14)',fontSize:10,letterSpacing:'.14em'},back:{color:G,textDecoration:'none'},wrap:{maxWidth:1100,margin:'0 auto',padding:'44px 24px 80px'},h1:{fontSize:'clamp(32px,4vw,48px)',margin:'0 0 8px'},dim:{color:DIM,fontSize:13,lineHeight:1.7},list:{display:'grid',gap:10,marginTop:24},row:{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',background:M,border:'1px solid rgba(201,168,76,.1)',padding:17,borderRadius:8},actions:{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'},link:{color:G,textDecoration:'none',fontSize:10,fontWeight:700},gold:{background:G,color:D,border:0,padding:'8px 12px',fontSize:10,fontWeight:800,cursor:'pointer'},reject:{background:'transparent',color:'#D85A30',border:'1px solid rgba(216,90,48,.35)',padding:'7px 11px',fontSize:10,fontWeight:700,cursor:'pointer'},tag:{fontSize:9,textTransform:'uppercase',letterSpacing:'.08em',border:'1px solid rgba(201,168,76,.2)',padding:'4px 7px',color:DIM},tags:{display:'flex',gap:6,marginTop:9},error:{color:'#F0A48E'},empty:{padding:40,textAlign:'center',color:DIM,border:'1px dashed rgba(247,244,238,.12)'}}
