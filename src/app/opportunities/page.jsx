'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
const GOLD='#C9A84C',DARK='#1A1A2E',PARCH='#F7F4EE'
export default function OpportunitiesPage(){
 const [items,setItems]=useState([]),[matches,setMatches]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{(async()=>{try{const [allRes,matchRes]=await Promise.all([fetch('/api/opportunities'),fetch('/api/opportunities/matches')]);const all=await allRes.json().catch(()=>({}));const personal=await matchRes.json().catch(()=>({}));if(!allRes.ok)throw new Error(all.error||'Opportunities could not be loaded.');setItems(all.opportunities||[]);if(matchRes.ok)setMatches(personal.matches||[]);else if(matchRes.status!==401)setError(personal.error||'Personalized matches could not be loaded.')}catch(e){setError(e.message||'Opportunities could not be loaded.')}finally{setLoading(false)}})()},[])
 return <main className="opportunities-page">
  <section className="opportunities-hero"><div className="opportunities-shell">
   <div className="opportunities-kicker">VALORIA OPPORTUNITIES</div>
   <h1 className="opportunities-title">Work that meets<br/>your capability.</h1>
   <p className="opportunities-lede">Jobs, projects and professional opportunities reviewed through the Valoria platform.</p>
   <Link href="/opportunities/submit" className="opportunities-submit">POST AN OPPORTUNITY</Link>
  </div></section>
  <section style={{maxWidth:1100,margin:'auto',padding:'60px 7vw 100px'}}>{error&&<div className="opportunities-error">{error}</div>}{matches.length>0&&<div className="opportunities-matches"><div className="opportunities-match-kicker">MATCHED FOR YOUR CAPABILITY</div><h2 style={{fontSize:32,margin:'10px 0 18px'}}>Opportunities with a relevant signal.</h2><div className="opportunities-grid opportunities-grid-match">{matches.map(o=><Link key={'m'+o.id} href={'/opportunities/'+o.slug} className="opportunity-card opportunity-card-match"><div className="opportunity-meta">{o.match_score}% MATCH SIGNAL</div><h3 style={{margin:'10px 0 6px'}}>{o.title}</h3><p className="opportunity-card-copy">{o.match_reasons.join(' · ')}</p></Link>)}</div></div>}
   {loading?<p>Loading opportunities…</p>:items.length===0?<div style={{padding:'50px 0'}}><h2>No public opportunities yet.</h2><p>New opportunities will appear here after Valoria review.</p></div>:<div className="opportunities-grid">
    {items.map(o=><Link key={o.id} href={'/opportunities/'+o.slug} className="opportunity-card">
      <div className="opportunity-meta">{(o.opportunity_type||'job').toUpperCase()} · {o.work_mode||'OPEN'}</div>
      <h2 style={{fontSize:23,margin:'14px 0 8px'}}>{o.title}</h2><p className="opportunity-card-org">{o.organisation_name}</p><p className="opportunity-card-copy">{o.summary||o.description.slice(0,150)}</p>
    </Link>)}</div>}
  </div></section>
 </main>
}