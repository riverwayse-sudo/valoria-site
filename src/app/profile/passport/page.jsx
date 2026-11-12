import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {createServerClient} from '@supabase/ssr'
import {createClient} from '@supabase/supabase-js'
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL,ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY
export const metadata={title:'Capability Passport — Valoria Institute',robots:{index:false,follow:false}}
export default async function PassportPage(){
 if(!URL||!ANON||!SERVICE)redirect('/journey')
 const cs=await cookies();const sb=createServerClient(URL,ANON,{cookies:{getAll:()=>cs.getAll(),setAll:()=>{}}});const {data:{user}}=await sb.auth.getUser();if(!user)redirect('/login?returnTo=/profile/passport')
 const admin=createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
 const [{data:profile},{data:caps},{data:docs},{data:activation}]=await Promise.all([
  admin.from('professional_profiles').select('display_name,headline,current_job_title,valu_index,designation,cluster_scores,atb_id,visibility,listing_status').eq('id',user.id).maybeSingle(),
  admin.from('professional_capabilities').select('id,capability,eligibility_status,eligible_for_listing,listed_at,missing_requirements,is_active').eq('professional_id',user.id).eq('is_active',true),
  admin.from('professional_documents').select('id,document_type,verification_status,verified_at,original_filename').eq('professional_id',user.id).order('created_at',{ascending:false}),
  admin.from('professional_value_activation').select('status,priority_cluster,updated_at').eq('professional_id',user.id).maybeSingle()
 ])
 const verificationLabel=s=>({verified:'Verified',pending:'Under review',rejected:'Needs attention',unverified:'Submitted',not_submitted:'Not submitted'}[s]||s)
 return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',fontFamily:'Raleway,Arial,sans-serif',padding:'90px 20px'}}>
  <div style={{maxWidth:980,margin:'0 auto'}}>
   <div style={{fontSize:10,letterSpacing:'.18em',color:'#C9A84C',fontWeight:800}}>VALORIA · CAPABILITY PASSPORT</div>
   <h1 style={{fontSize:'clamp(40px,6vw,70px)',fontWeight:300,lineHeight:1,margin:'14px 0'}}>Your capability,<br/><em>made legible.</em></h1>
   <p style={{maxWidth:650,color:'rgba(247,244,238,.62)',lineHeight:1.8}}>One professional identity. Every active capability, assessment signal and verification state in one place.</p>
   <section style={{marginTop:35,padding:24,border:'1px solid rgba(201,168,76,.2)',background:'#1A1A2E'}}>
    <div style={{fontSize:10,color:'#C9A84C',letterSpacing:'.15em'}}>PROFESSIONAL IDENTITY</div><h2 style={{margin:'10px 0 4px',fontSize:28,fontWeight:400}}>{profile?.display_name||'Professional'}</h2><p style={{margin:0,opacity:.65}}>{profile?.current_job_title||profile?.headline||'Professional profile in progress'}</p>
    <div style={{display:'flex',gap:24,flexWrap:'wrap',marginTop:20}}><span>VALU <b>{profile?.valu_index??'—'}/100</b></span><span>{profile?.designation||'Assessment status pending'}</span>{profile?.atb_id&&<span>{profile.atb_id}</span>}</div>
   </section>
   <section style={{marginTop:18,display:'grid',gap:14}}>{(caps||[]).map(c=><article key={c.id} style={{padding:22,border:'1px solid rgba(201,168,76,.18)',background:'rgba(255,255,255,.025)'}}><div style={{display:'flex',justifyContent:'space-between',gap:20,flexWrap:'wrap'}}><div><div style={{fontSize:10,color:'#C9A84C',letterSpacing:'.15em'}}>CAPABILITY</div><h3 style={{fontSize:23,textTransform:'capitalize',margin:'8px 0'}}>{c.capability}</h3></div><strong style={{fontSize:12}}>{c.eligibility_status}</strong></div>{Array.isArray(c.missing_requirements)&&c.missing_requirements.length>0&&<div style={{marginTop:12,color:'rgba(247,244,238,.62)',fontSize:13}}>Still needed: {c.missing_requirements.join(' · ')}</div>}<div style={{marginTop:14,fontSize:11,color:'rgba(247,244,238,.48)'}}>{c.listed_at?'Listed':'Not listed yet'} · Eligibility is platform-governed</div></article>)}</section>
   <section style={{marginTop:28,padding:22,border:'1px solid rgba(201,168,76,.15)'}}><div style={{fontSize:10,color:'#C9A84C',letterSpacing:'.15em'}}>EVIDENCE & VERIFICATION</div>{(docs||[]).length===0?<p style={{opacity:.6}}>No professional documents have been submitted yet.</p>:<div style={{marginTop:12,display:'grid',gap:8}}>{docs.map(d=><div key={d.id} style={{display:'flex',justifyContent:'space-between',gap:15,fontSize:13}}><span>{d.original_filename||d.document_type}</span><b>{verificationLabel(d.verification_status)}</b></div>)}</div>}</section>
   <section style={{marginTop:18,padding:22,background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.16)'}}><div style={{fontSize:10,color:'#C9A84C',letterSpacing:'.15em'}}>VALUE ACTIVATION</div><p style={{marginBottom:0}}>{activation?.status==='activated'?'Activated — your VALU result has been translated into a development and positioning plan.':'Ready — activate your plan from your VALU report.'}</p></section>
  </div>
 </main>
}