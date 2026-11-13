'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import {supabase} from '@/lib/supabase'
export default function OpportunitiesPage(){
 const [items,setItems]=useState([]),[matches,setMatches]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{
  let active=true
  ;(async()=>{
   try{
    const allRes=await fetch('/api/opportunities')
    const all=await allRes.json().catch(()=>({}))
    if(!allRes.ok)throw new Error(all.error||'Opportunities could not be loaded.')
    const {data:{session}}=await supabase.auth.getSession()
    let personal={matches:[]}
    if(session){
     const matchRes=await fetch('/api/opportunities/matches')
     personal=await matchRes.json().catch(()=>({}))
     if(!matchRes.ok&&matchRes.status!==401)throw new Error(personal.error||'Personalized matches could not be loaded.')
    }
    if(!active)return
    setItems(all.opportunities||[])
    setMatches(personal.matches||[])
   }catch(e){
    if(active)setError(e.message||'Opportunities could not be loaded.')
   }finally{
    if(active)setLoading(false)
   }
  })()
  return()=>{active=false}
 },[])
 return <><Nav/><main className="opportunities-page">
  <section className="opportunities-hero"><div className="opportunities-shell">
   <div className="opportunities-kicker">VALORIA OPPORTUNITIES</div>
   <h1 className="opportunities-title">Work that meets<br/>your capability.</h1>
   <p className="opportunities-lede">Jobs, projects and professional opportunities reviewed through the Valoria platform.</p>
   <Link href="/opportunities/submit" className="opportunities-submit">POST AN OPPORTUNITY</Link>
  </div></section>
  <section className="opportunities-content">
   {error&&<div className="opportunities-error">{error}</div>}
   {matches.length>0&&<div className="opportunities-matches"><div className="opportunities-match-kicker">MATCHED FOR YOUR CAPABILITY</div><h2 className="opportunities-match-title">Opportunities with a relevant signal.</h2><div className="opportunities-grid opportunities-grid-match">{matches.map(o=><Link key={'m'+o.id} href={'/opportunities/'+o.slug} className="opportunity-card opportunity-card-match"><div className="opportunity-meta">{o.match_score}% MATCH SIGNAL</div><h3 className="opportunity-card-title">{o.title}</h3><p className="opportunity-card-copy">{o.match_reasons.join(' · ')}</p></Link>)}</div></div>}
   {loading?<p>Loading opportunities…</p>:items.length===0?<div className="opportunities-empty"><h2>No public opportunities yet.</h2><p>New opportunities will appear here after Valoria review.</p></div>:<div className="opportunities-grid">{items.map(o=><Link key={o.id} href={'/opportunities/'+o.slug} className="opportunity-card"><div className="opportunity-meta">{(o.opportunity_type||'job').toUpperCase()} · {o.work_mode||'OPEN'}</div><h2 className="opportunity-card-title">{o.title}</h2><p className="opportunity-card-org">{o.organisation_name}</p><p className="opportunity-card-copy">{o.summary||o.description?.slice(0,150)}</p></Link>)}</div>}
  </section>
 </main><Footer/></>
}