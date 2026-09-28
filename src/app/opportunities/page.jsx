'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
const GOLD='#C9A84C',DARK='#1A1A2E',PARCH='#F7F4EE'
export default function OpportunitiesPage(){
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true)
 useEffect(()=>{fetch('/api/opportunities').then(r=>r.json()).then(x=>setItems(x.opportunities||[])).finally(()=>setLoading(false))},[])
 return <main style={{minHeight:'100vh',background:PARCH,color:DARK,fontFamily:'Raleway,Arial,sans-serif'}}>
  <section style={{background:DARK,color:PARCH,padding:'110px 7vw 70px'}}><div style={{maxWidth:1100,margin:'auto'}}>
   <div style={{fontSize:11,letterSpacing:'.18em',color:GOLD,fontWeight:800}}>VALORIA OPPORTUNITIES</div>
   <h1 style={{fontSize:'clamp(42px,6vw,78px)',lineHeight:.98,margin:'18px 0'}}>Work that meets<br/>your capability.</h1>
   <p style={{maxWidth:650,fontSize:18,lineHeight:1.7,opacity:.72}}>Jobs, projects and professional opportunities reviewed through the Valoria platform.</p>
   <Link href="/opportunities/submit" style={{display:'inline-block',marginTop:28,padding:'14px 22px',background:GOLD,color:DARK,textDecoration:'none',fontWeight:800,fontSize:12,letterSpacing:'.08em'}}>POST AN OPPORTUNITY</Link>
  </div></section>
  <section style={{maxWidth:1100,margin:'auto',padding:'60px 7vw 100px'}}>
   {loading?<p>Loading opportunities…</p>:items.length===0?<div style={{padding:'50px 0'}}><h2>No public opportunities yet.</h2><p>New opportunities will appear here after Valoria review.</p></div>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18}}>
    {items.map(o=><Link key={o.id} href={'/opportunities/'+o.slug} style={{textDecoration:'none',color:DARK,border:'1px solid #D4C9A8',padding:26,borderRadius:8,background:'#FAFAF7'}}>
      <div style={{fontSize:10,letterSpacing:'.12em',color:'#777',fontWeight:800}}>{(o.opportunity_type||'job').toUpperCase()} · {o.work_mode||'OPEN'}</div>
      <h2 style={{fontSize:23,margin:'14px 0 8px'}}>{o.title}</h2><p style={{margin:0,fontWeight:700}}>{o.organisation_name}</p><p style={{opacity:.65,lineHeight:1.5}}>{o.summary||o.description.slice(0,150)}</p>
    </Link>)}</div>}
  </section>
 </main>
}