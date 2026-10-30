'use client'
import {useCallback,useEffect,useState} from 'react'
import Link from 'next/link'
import {supabase} from '@/lib/supabase'

const BG='#0F0F1A',P='#F7F4EE',M='#1A1A2E',G='#C9A84C',DIM='rgba(247,244,238,.62)'
export default function CapabilityEvidenceAdmin(){
 const [items,setItems]=useState([]),[history,setHistory]=useState({}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(''),[notes,setNotes]=useState({})
 const load=useCallback(async()=>{
  const {data:{session}}=await supabase.auth.getSession()
  if(!session){location.href='/admin/login';return}
  const r=await fetch('/api/admin/capability-evidence',{headers:{Authorization:'Bearer '+session.access_token}})
  const j=await r.json()
  if(!r.ok)setError(j.error||'Could not load evidence queue.')
  else{setItems(j.documents||[]);setHistory((j.reviews||[]).reduce((acc,review)=>{(acc[review.document_id] ||= []).push(review);return acc},{}))}
  setLoading(false)
 },[])
 useEffect(()=>{load()},[load])
 async function decide(id,decision){
  const note=(notes[id]||'').trim()
  if(!note){setError('Add reviewer notes before recording a decision.');return}
  setBusy(id);setError('')
  const {data:{session}}=await supabase.auth.getSession()
  const r=await fetch('/api/admin/capability-evidence',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({document_id:id,decision,notes:note})})
  const j=await r.json()
  if(!r.ok)setError(j.error||'Review could not be saved.')
  else{setNotes(v=>({...v,[id]:''}));await load()}
  setBusy('')
 }
 if(loading)return <main style={styles.root}>Loading evidence review queue…</main>
 return <main style={styles.root}><header style={styles.header}><Link href="/admin" style={{color:G}}>← Administration</Link><b>CAPABILITY EVIDENCE REVIEW</b></header><section style={styles.wrap}>
 <h1 style={styles.title}>Evidence review</h1><p style={styles.muted}>Review capability-specific evidence. Every decision is recorded with the reviewer and notes; previous decisions remain in the audit history.</p>
 {error&&<p style={styles.error}>{error}</p>}
 <div style={styles.cards}><div><small>Evidence records</small><strong>{items.length}</strong></div><div><small>Awaiting review</small><strong>{items.filter(x=>x.verification_status==='pending'||x.verification_status==='unverified').length}</strong></div><div><small>Approved</small><strong>{items.filter(x=>x.verification_status==='verified').length}</strong></div><div><small>Changes / rejected</small><strong>{items.filter(x=>x.verification_status==='rejected').length}</strong></div></div>
 <div style={styles.list}>{items.map(d=>{const cap=d.professional_capabilities?.capability||'Profile-wide';const profile=d.professional_profiles||{};return <article key={d.id} style={styles.item}>
  <div style={styles.top}><div><b>{d.original_filename}</b><div style={styles.muted}>{profile.display_name||'Professional'} · {profile.atb_id||d.professional_id}</div><div style={styles.tags}><span>{cap}</span><span>{d.document_type.replaceAll('_',' ')}</span><span>{d.verification_status}</span></div></div>{d.preview_url?<a href={d.preview_url} target="_blank" rel="noreferrer" style={styles.link}>Open private file ↗</a>:<span style={styles.muted}>Preview unavailable</span>}</div>
  {(history[d.id]||[]).length>0&&<div style={styles.history}><b>Review history</b>{(history[d.id]||[]).map(entry=><div key={entry.id} style={{borderTop:'1px solid rgba(247,244,238,.12)',paddingTop:8,marginTop:8}}><b>{entry.decision.replaceAll('_',' ')}</b><p>{entry.notes}</p><small>{new Date(entry.reviewed_at).toLocaleString()} · {entry.reviewed_by}</small></div>)}</div>}
  <label style={styles.label}>Reviewer notes (required)</label><textarea value={notes[d.id]||''} onChange={e=>setNotes(v=>({...v,[d.id]:e.target.value}))} placeholder="State what was checked and what the participant must do next." style={styles.textarea}/>
  <div style={styles.actions}><button disabled={busy===d.id} onClick={()=>decide(d.id,'approved')} style={styles.approve}>{busy===d.id?'Saving…':'Approve evidence'}</button><button disabled={busy===d.id} onClick={()=>decide(d.id,'changes_requested')} style={styles.secondary}>Request changes</button><button disabled={busy===d.id} onClick={()=>decide(d.id,'rejected')} style={styles.secondary}>Reject</button></div>
 </article>})}{!items.length&&<p style={styles.empty}>No evidence has been submitted yet.</p>}</div>
 </section></main>
}
const styles={root:{minHeight:'100vh',background:BG,color:P,fontFamily:'Raleway,Arial'},header:{height:64,padding:'0 28px',display:'flex',justifyContent:'space-between',alignItems:'center',background:M,borderBottom:'1px solid rgba(201,168,76,.15)',fontSize:11,letterSpacing:'.12em'},wrap:{maxWidth:1080,margin:'0 auto',padding:'42px 22px 80px'},title:{fontSize:36,fontWeight:500,margin:'0 0 8px'},muted:{fontSize:12,color:DIM,lineHeight:1.7},cards:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,margin:'26px 0'},list:{display:'grid',gap:14},item:{background:M,border:'1px solid rgba(201,168,76,.16)',borderRadius:9,padding:18},top:{display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap'},tags:{display:'flex',gap:7,flexWrap:'wrap',marginTop:10},history:{background:'rgba(201,168,76,.08)',padding:12,borderRadius:6,marginTop:14,fontSize:12},label:{display:'block',fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',marginTop:16,color:DIM},textarea:{display:'block',width:'100%',minHeight:82,marginTop:7,background:BG,color:P,border:'1px solid rgba(247,244,238,.18)',borderRadius:6,padding:11,font:'inherit',fontSize:12},actions:{display:'flex',gap:8,flexWrap:'wrap',marginTop:12},approve:{background:G,color:BG,border:0,padding:'10px 14px',borderRadius:5,fontWeight:700,cursor:'pointer'},secondary:{background:'transparent',color:P,border:'1px solid rgba(247,244,238,.25)',padding:'9px 13px',borderRadius:5,cursor:'pointer'},link:{color:G,fontSize:12},empty:{padding:35,textAlign:'center',color:DIM},error:{color:'#F09595',background:'rgba(216,90,48,.12)',padding:12,borderRadius:6},cardsItem:{},cards:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,margin:'26px 0'}}
