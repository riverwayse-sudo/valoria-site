'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
export default function OpportunitiesPage(){
 const [items,setItems]=useState([]),[matches,setMatches]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
 const readOnlyPreview = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' && process.env.NEXT_PUBLIC_VALU_STAGING_API_ENABLED !== '1'
 useEffect(()=>{if(readOnlyPreview){setLoading(false);return} (async()=>{try{const [allRes,matchRes]=await Promise.all([fetch('/api/opportunities'),fetch('/api/opportunities/matches')]);const all=await allRes.json().catch(()=>({}));const personal=await matchRes.json().catch(()=>({}));if(!allRes.ok)throw new Error(all.error||'Opportunities could not be loaded.');setItems(all.opportunities||[]);if(matchRes.ok)setMatches(personal.matches||[]);else if(matchRes.status!==401)setError(personal.error||'Personalized matches could not be loaded.')}catch(e){setError(e.message||'Opportunities could not be loaded.')}finally{setLoading(false)}})()},[readOnlyPreview])
 return <><Nav/><main className="opportunities-page">
  <section className="opportunities-hero"><div className="opportunities-shell">
   <div className="opportunities-kicker">VALORIA OPPORTUNITIES</div>
   <h1 className="opportunities-title">Work that meets<br/>your capability.</h1>
   <p className="opportunities-lede">Explore professional opportunities as they are reviewed and published. Each listing includes the expertise sought and a clear route to apply or enquire.</p>
   <Link href="/opportunities/submit" className="opportunities-submit">POST AN OPPORTUNITY</Link>
  </div></section>
  <section className="opportunities-content">
   {readOnlyPreview&&<div className="opportunities-error" role="status">STAGING PREVIEW — Live opportunities and personalised matches are disabled until the isolated staging database is connected. No production data is used.</div>}
   {error&&<div className="opportunities-error">{error}</div>}
   {matches.length>0&&<div className="opportunities-matches"><div className="opportunities-match-kicker">SUGGESTED FOR YOUR PROFILE</div><h2 className="opportunities-match-title">Opportunities with a relevant signal.</h2><div className="opportunities-grid opportunities-grid-match">{matches.map(o=><Link key={'m'+o.id} href={'/opportunities/'+o.slug} className="opportunity-card opportunity-card-match"><div className="opportunity-meta">CAPABILITY RELEVANCE</div><h3 className="opportunity-card-title">{o.title}</h3><p className="opportunity-card-copy">{Array.isArray(o.match_reasons)?o.match_reasons.join(' · '):''}</p></Link>)}</div></div>}
   {loading?<p>Loading opportunities…</p>:items.length===0?<div className="opportunities-empty"><h2>No public opportunities yet.</h2><p>Valoria publishes opportunities when the listing has been reviewed and a clear application or enquiry route is available. Check back for new listings, or explore the Marketplace to understand the professional capabilities represented.</p><Link href="/marketplace" className="opportunities-submit">EXPLORE THE MARKETPLACE</Link></div>:<div className="opportunities-grid">{items.map(o=><Link key={o.id} href={'/opportunities/'+o.slug} className="opportunity-card"><div className="opportunity-meta">{(o.opportunity_type||'professional opportunity').toUpperCase()} · {o.work_mode||'ARRANGEMENT TO BE CONFIRMED'}</div><h2 className="opportunity-card-title">{o.title}</h2><p className="opportunity-card-org">{o.organisation_name}</p><p className="opportunity-card-copy">{o.summary||'Open the listing for the full opportunity details.'}</p><p className="opportunity-card-org">{[o.location,o.industry,o.experience_level,o.employment_type].filter(Boolean).join(' · ')}</p>{(o.compensation||o.closing_at)&&<p className="opportunity-meta">{[o.compensation,o.closing_at?`Closes ${new Date(o.closing_at).toLocaleDateString()}`:null].filter(Boolean).join(' · ')}</p>}</Link>)}</div>}
  </section>
 </main><Footer/></>
}