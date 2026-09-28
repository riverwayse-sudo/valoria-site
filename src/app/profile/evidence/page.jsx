'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD='#C9A84C', DARK='#0F0F1A', MID='#1A1A2E', PARCH='#F7F4EE', DIM='rgba(247,244,238,.55)'

export default function EvidencePage() {
  const [documents,setDocuments]=useState([])
  const [file,setFile]=useState(null)
  const [type,setType]=useState('cv')
  const [loading,setLoading]=useState(true)
  const [uploading,setUploading]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')

  async function load() {
    const {data:{session}}=await supabase.auth.getSession()
    if(!session){window.location.href='/login';return}
    const res=await fetch('/api/profile/evidence',{headers:{Authorization:`Bearer ${session.access_token}`}})
    const json=await res.json().catch(()=>({}))
    if(!res.ok)setError(json.error||'Could not load evidence.')
    else setDocuments(json.documents||[])
    setLoading(false)
  }

  useEffect(()=>{load()},[])

  async function upload() {
    if(!file)return
    setUploading(true);setError('');setMessage('')
    const {data:{session}}=await supabase.auth.getSession()
    const form=new FormData()
    form.append('file',file)
    form.append('document_type',type)
    const res=await fetch('/api/profile/evidence',{method:'POST',headers:{Authorization:`Bearer ${session?.access_token||''}`},body:form})
    const json=await res.json().catch(()=>({}))
    if(!res.ok)setError(json.error||'Upload failed.')
    else {setMessage('Evidence submitted for review.');setFile(null);await load()}
    setUploading(false)
  }

  async function remove(id) {
    if(!confirm('Remove this evidence from your profile?'))return
    const {data:{session}}=await supabase.auth.getSession()
    const res=await fetch('/api/profile/evidence',{method:'DELETE',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session?.access_token||''}`},body:JSON.stringify({id})})
    const json=await res.json().catch(()=>({}))
    if(!res.ok)setError(json.error||'Could not remove document.')
    else await load()
  }

  if(loading)return <main style={styles.root}>Loading evidence…</main>

  return <main style={styles.root}>
    <header style={styles.header}><Link href="/dashboard" style={styles.back}>← Dashboard</Link><span>PROFESSIONAL EVIDENCE</span></header>
    <section style={styles.wrap}>
      <div style={styles.eyebrow}>BUILD CREDIBILITY</div>
      <h1 style={styles.h1}>Credentials &amp; evidence.</h1>
      <p style={styles.lede}>Submit the documents that support your professional capability. Evidence remains private until Valoria verifies it.</p>
      <div style={styles.panel}>
        <div style={styles.label}>DOCUMENT TYPE</div>
        <select value={type} onChange={e=>setType(e.target.value)} style={styles.input}>
          <option value="cv">CV / Resume</option>
          <option value="certificate">Certificate</option>
          <option value="reference">Reference</option>
          <option value="portfolio">Portfolio evidence</option>
          <option value="other">Other evidence</option>
        </select>
        <input type="file" accept=".pdf,.doc,.docx,application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={styles.file}/>
        <div style={styles.help}>PDF, DOC or DOCX · maximum 10 MB</div>
        {file&&<div style={styles.fileName}>{file.name}</div>}
        <button disabled={!file||uploading} onClick={upload} style={{...styles.button,opacity:(!file||uploading)?.45:1}}>{uploading?'UPLOADING…':'SUBMIT EVIDENCE →'}</button>
        {message&&<p style={styles.success}>{message}</p>}
        {error&&<p style={styles.error}>{error}</p>}
      </div>
      <h2 style={styles.h2}>Submitted evidence</h2>
      <div style={styles.list}>{documents.map(d=><article key={d.id} style={styles.row}>
        <div><strong>{d.original_filename}</strong><div style={styles.meta}>{d.document_type.replaceAll('_',' ')} · {Math.ceil((d.size_bytes||0)/1024)} KB</div></div>
        <div style={styles.actions}><span style={status(d.verification_status)}>{d.verification_status}</span>{d.verification_status!=='verified'&&<button onClick={()=>remove(d.id)} style={styles.remove}>REMOVE</button>}</div>
      </article>)}</div>
      {!documents.length&&<div style={styles.empty}>No evidence has been submitted yet.</div>}
    </section>
  </main>
}

function status(v){return {fontSize:10,textTransform:'uppercase',letterSpacing:'.1em',fontWeight:700,color:v==='verified'?'#7FD9B8':v==='rejected'?'#D85A30':GOLD}}

const styles={root:{minHeight:'100vh',background:DARK,color:PARCH,fontFamily:'Raleway,Arial'},header:{height:64,padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',background:MID,borderBottom:'1px solid rgba(201,168,76,.14)',fontSize:10,letterSpacing:'.14em'},back:{color:GOLD,textDecoration:'none'},wrap:{maxWidth:900,margin:'0 auto',padding:'50px 24px 90px'},eyebrow:{fontSize:10,letterSpacing:'.18em',color:GOLD,fontWeight:700},h1:{fontSize:'clamp(34px,5vw,56px)',fontWeight:700,margin:'10px 0 10px'},lede:{maxWidth:680,color:DIM,lineHeight:1.8,fontSize:14},panel:{marginTop:30,background:MID,border:'1px solid rgba(201,168,76,.14)',borderRadius:8,padding:22},label:{fontSize:10,letterSpacing:'.14em',color:DIM,marginBottom:8},input:{width:'100%',boxSizing:'border-box',background:DARK,color:PARCH,border:'1px solid rgba(201,168,76,.18)',padding:12,marginBottom:14},file:{display:'block',margin:'4px 0 6px',color:PARCH},help:{fontSize:11,color:DIM},fileName:{marginTop:12,fontSize:12,color:PARCH},button:{marginTop:18,padding:'13px 18px',background:GOLD,color:DARK,border:0,fontWeight:800,letterSpacing:'.1em',cursor:'pointer'},success:{color:'#7FD9B8',fontSize:12},error:{color:'#F0A48E',fontSize:12},h2:{fontSize:20,fontWeight:500,margin:'34px 0 14px'},list:{display:'grid',gap:9},row:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,background:MID,border:'1px solid rgba(201,168,76,.1)',padding:16,borderRadius:8},meta:{fontSize:11,color:DIM,marginTop:5},actions:{display:'flex',gap:12,alignItems:'center'},remove:{background:'transparent',border:'1px solid rgba(216,90,48,.35)',color:'#D85A30',padding:'6px 9px',fontSize:9,cursor:'pointer'},empty:{padding:30,border:'1px dashed rgba(247,244,238,.12)',color:DIM,textAlign:'center'}}
