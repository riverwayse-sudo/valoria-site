'use client'
import {useCallback,useEffect,useRef,useState} from 'react'
import Link from 'next/link'
import {supabase} from '@/lib/supabase'

const BG='#0F0F1A',P='#F7F4EE',M='#1A1A2E',G='#C9A84C',DIM='rgba(247,244,238,.62)'
const TYPES=[['portfolio','Portfolio / work sample'],['certification','Certification'],['speaking_sample','Speaking sample'],['facilitation_record','Facilitation record']]
export default function ProfessionalEvidence(){
 const [caps,setCaps]=useState([]),[docs,setDocs]=useState([]),[latest,setLatest]=useState({}),[capabilityId,setCapabilityId]=useState(''),[type,setType]=useState('portfolio'),[file,setFile]=useState(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[success,setSuccess]=useState('')
 const fileRef=useRef(null)
 const load=useCallback(async()=>{
  const {data:{session}}=await supabase.auth.getSession()
  if(!session){location.href='/login';return}
  const [c,d]=await Promise.all([
   supabase.from('professional_capabilities').select('id,capability,is_active').eq('professional_id',session.user.id).eq('is_active',true),
   fetch('/api/profile/evidence',{headers:{Authorization:'Bearer '+session.access_token}})
  ])
  if(c.error)setError('Could not load your active capabilities.')
  else{setCaps(c.data||[]);if(!capabilityId&&c.data?.[0])setCapabilityId(c.data[0].id)}
  const j=await d.json()
  if(!d.ok)setError(j.error||'Could not load your evidence.')
  else{setDocs(j.documents||[]);setLatest(j.latestByDocument||{})}
  setLoading(false)
 },[capabilityId])
 useEffect(()=>{load()},[load])
 async function submit(e){
  e.preventDefault();setError('');setSuccess('')
  if(!file){setError('Choose a file to submit.');return}
  if(!capabilityId){setError('Choose an active capability.');return}
  setBusy(true)
  const {data:{session}}=await supabase.auth.getSession()
  const body=new FormData();body.append('file',file);body.append('document_type',type);body.append('capability_id',capabilityId)
  const r=await fetch('/api/profile/evidence',{method:'POST',headers:{Authorization:'Bearer '+session.access_token},body})
  const j=await r.json()
  if(!r.ok)setError(j.error||'Evidence could not be submitted.')
  else{setSuccess('Evidence submitted. It is private and marked as pending review.');setFile(null);if(fileRef.current)fileRef.current.value='';await load()}
  setBusy(false)
 }
 if(loading)return <main style={s.root}>Loading your evidence…</main>
 return <main style={s.root}><header style={s.header}><Link href="/dashboard" style={{color:G}}>← Dashboard</Link><b>PROFESSIONAL EVIDENCE</b></header><section style={s.wrap}>
 <h1 style={s.title}>Capability evidence</h1><p style={s.muted}>Submit evidence against the capability it supports. Files remain private and are visible only to you and authorised Valoria reviewers.</p>
 {error&&<p style={s.error}>{error}</p>}{success&&<p style={s.success}>{success}</p>}
 <form onSubmit={submit} style={s.panel}><label style={s.label}>Capability</label><select required value={capabilityId} onChange={e=>setCapabilityId(e.target.value)} style={s.input}><option value="">Select capability</option>{caps.map(c=><option key={c.id} value={c.id}>{c.capability}</option>)}</select>
 <label style={s.label}>Evidence type</label><select value={type} onChange={e=>setType(e.target.value)} style={s.input}>{TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
 <label style={s.label}>File (maximum 10MB)</label><input ref={fileRef} type="file" onChange={e=>setFile(e.target.files?.[0]||null)} style={s.input}/>
 <button disabled={busy||!caps.length} style={s.button}>{busy?'Submitting…':'Submit evidence'}</button>
 {!caps.length&&<p style={s.muted}>Select and save at least one capability in your profile before submitting capability-specific evidence.</p>}
 </form>
 <h2 style={s.h2}>Your submissions</h2><div style={s.list}>{docs.map(d=>{const r=latest[d.id];return <article key={d.id} style={s.item}><b>{d.original_filename}</b><div style={s.muted}>{d.professional_capabilities?.capability||'Profile-wide'} · {d.document_type.replaceAll('_',' ')} · {new Date(d.created_at).toLocaleDateString()}</div><span style={s.status}>{d.verification_status==='verified'?'Approved':r?.decision==='changes_requested'?'Changes requested':d.verification_status==='rejected'?'Not approved':'Under review'}</span>{r&&<div style={s.review}><b>Reviewer update</b><p>{r.notes}</p><small>{new Date(r.reviewed_at).toLocaleString()}</small></div>}</article>})}{!docs.length&&<p style={s.muted}>No evidence submitted yet.</p>}</div>
 </section></main>
}
const s={root:{minHeight:'100vh',background:BG,color:P,fontFamily:'Raleway,Arial'},header:{height:64,padding:'0 26px',display:'flex',justifyContent:'space-between',alignItems:'center',background:M,borderBottom:'1px solid rgba(201,168,76,.15)',fontSize:11,letterSpacing:'.12em'},wrap:{maxWidth:850,margin:'0 auto',padding:'42px 22px 80px'},title:{fontSize:36,fontWeight:500,margin:'0 0 8px'},h2:{fontSize:21,fontWeight:500,margin:'34px 0 14px'},muted:{fontSize:12,color:DIM,lineHeight:1.7},panel:{background:M,border:'1px solid rgba(201,168,76,.16)',padding:20,borderRadius:9,marginTop:22},label:{display:'block',fontSize:10,textTransform:'uppercase',letterSpacing:'.1em',margin:'12px 0 6px',color:DIM},input:{display:'block',width:'100%',padding:11,background:BG,color:P,border:'1px solid rgba(247,244,238,.2)',borderRadius:5},button:{marginTop:18,background:G,color:BG,border:0,borderRadius:5,padding:'11px 16px',fontWeight:700,cursor:'pointer'},list:{display:'grid',gap:10},item:{background:M,border:'1px solid rgba(201,168,76,.14)',padding:16,borderRadius:8},status:{display:'inline-block',marginTop:9,fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:G},review:{marginTop:12,padding:12,background:'rgba(201,168,76,.08)',borderRadius:5,fontSize:12},error:{color:'#F09595',background:'rgba(216,90,48,.12)',padding:12,borderRadius:6},success:{color:'#A8D5B5',background:'rgba(29,158,117,.12)',padding:12,borderRadius:6}}
