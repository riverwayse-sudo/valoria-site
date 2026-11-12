import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import ValueActivationCard from '@/components/ValueActivationCard'
import { getValuTier } from '@/lib/brand'

export const metadata={title:'Your VALU Report',robots:{index:false,follow:false}}

export default async function ReportPage(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!anon||!service) redirect('/dashboard')
  const cookieStore=await cookies()
  const supabase=createServerClient(url,anon,{cookies:{getAll(){return cookieStore.getAll()},setAll(){}}})
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login?returnTo=/report')
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})
  let {data:assessment,error:assessmentError}=await admin.from('valu_assessments').select('total_score,designation,ai_report,completed_at,report_status,cluster_scores').eq('user_id',user.id).order('completed_at',{ascending:false}).limit(1).maybeSingle()
  if(assessmentError) return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',padding:'80px 20px',fontFamily:'Raleway,sans-serif'}}><article style={{maxWidth:820,margin:'0 auto'}}><h1>We could not load your VALU report.</h1><p style={{opacity:.7}}>Your assessment has not been changed. Please return to your journey and retry.</p><a href="/journey" style={{color:'#C9A84C'}}>RETURN TO JOURNEY →</a></article></main>
  if(!assessment&&user.email){
    const {data:legacy,error:legacyError}=await admin.from('valu_assessments').select('total_score,designation,ai_report,completed_at,report_status').eq('email',user.email.toLowerCase()).order('completed_at',{ascending:false}).limit(1).maybeSingle()
    if(legacyError) return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',padding:'80px 20px',fontFamily:'Raleway,sans-serif'}}><article style={{maxWidth:820,margin:'0 auto'}}><h1>We could not restore your VALU report.</h1><p style={{opacity:.7}}>Your historical assessment remains intact. Please retry from your journey.</p><a href="/journey" style={{color:'#C9A84C'}}>RETURN TO JOURNEY →</a></article></main>
    assessment=legacy||assessment
  }
  if(!assessment?.completed_at) redirect('/journey')
  if(!assessment?.ai_report){
    return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',padding:'80px 20px',fontFamily:'Raleway,Arial,sans-serif'}}><article style={{maxWidth:820,margin:'0 auto'}}><div style={{color:'#C9A84C',fontSize:10,fontWeight:800,letterSpacing:'.18em',marginBottom:14}}>VALORIA INSTITUTE · VALU REPORT</div><h1 style={{fontSize:'clamp(36px,6vw,64px)',fontWeight:400,lineHeight:1.02,margin:0}}>Your report is being prepared.</h1><p style={{fontSize:16,lineHeight:1.8,color:'rgba(247,244,238,.68)',maxWidth:650,margin:'24px 0'}}>Your official VALU Index is saved. The report will appear here automatically once preparation is complete. You do not need to repeat the assessment.</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><a href="/journey" style={{padding:'13px 18px',background:'#C9A84C',color:'#1A1A2E',textDecoration:'none',fontWeight:800,fontSize:11,letterSpacing:'.1em'}}>CONTINUE YOUR JOURNEY →</a></div></article></main>
  }
  const reportText=typeof assessment.ai_report==='string'?assessment.ai_report:JSON.stringify(assessment.ai_report,null,2)
  const clusterScores=assessment.cluster_scores || {}
  const radarPoints=['P','R','I','M','E'].map((letter,i)=>{const angle=(-90+i*72)*Math.PI/180;const score=Number(clusterScores[letter] ?? 0);const r=92*(Math.max(0,Math.min(100,score))/100);return {letter,score,x:130+r*Math.cos(angle),y:130+r*Math.sin(angle),ax:130+112*Math.cos(angle),ay:130+112*Math.sin(angle)}})
  const radarShape=radarPoints.map(p=>p.x+','+p.y).join(' ')
  const ring=(fraction)=>['P','R','I','M','E'].map((_,i)=>{const a=(-90+i*72)*Math.PI/180;const r=92*fraction;return (130+r*Math.cos(a))+','+(130+r*Math.sin(a))}).join(' ')
  return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',padding:'80px 20px',fontFamily:'Raleway,Arial,sans-serif'}}><article style={{maxWidth:820,margin:'0 auto'}}><div style={{color:'#C9A84C',fontSize:10,fontWeight:800,letterSpacing:'.18em',marginBottom:14}}>VALORIA INSTITUTE · VALU REPORT</div><h1 style={{fontSize:'clamp(36px,6vw,64px)',fontWeight:400,lineHeight:1.02,margin:0}}>Here is what we learned about you.</h1><p style={{fontSize:15,lineHeight:1.7,color:'rgba(247,244,238,.6)',maxWidth:600,margin:'18px 0 0'}}>Your VALU result gives you a simple picture of where your professional value is showing up today.</p><div style={{display:'grid',gridTemplateColumns:'minmax(260px,420px) 1fr',gap:'clamp(28px,6vw,70px)',alignItems:'center',margin:'38px 0 46px'}}><div style={{padding:'12px'}}><svg viewBox="0 0 260 260" width="100%" aria-label="Your five PRIME dimension results" role="img">{[.25,.5,.75,1].map(level=><polygon key={level} points={ring(level)} fill="none" stroke="rgba(201,168,76,.15)" strokeWidth="1"/>)}{radarPoints.map(p=><line key={p.letter} x1="130" y1="130" x2={p.ax} y2={p.ay} stroke="rgba(201,168,76,.14)"/>)}<polygon points={radarShape} fill="rgba(201,168,76,.2)" stroke="#C9A84C" strokeWidth="2"/>{radarPoints.map(p=><g key={p.letter}><circle cx={p.x} cy={p.y} r="4" fill="#C9A84C"/><text x={p.ax} y={p.ay-5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#C9A84C">{p.letter}</text><text x={p.ax} y={p.ay+10} textAnchor="middle" fontSize="9" fill="rgba(247,244,238,.55)">{p.score || '—'}</text></g>)}</svg></div><div><div style={{fontSize:9,fontWeight:800,letterSpacing:'.18em',color:'#C9A84C'}}>YOUR VALU INDEX</div><div style={{fontSize:64,color:'#C9A84C',fontWeight:300,lineHeight:1,margin:'10px 0 5px'}}>{assessment.total_score ?? '—'}<span style={{fontSize:18,color:'rgba(247,244,238,.45)'}}> points</span></div><div style={{fontSize:12,color:'rgba(247,244,238,.55)'}}>{getValuTier(assessment.total_score,'full')?.name || assessment.designation || 'VALU Index'}{getValuTier(assessment.total_score,'full') ? ` · ${getValuTier(assessment.total_score,'full').stars}` : ''}</div><p style={{fontSize:13,lineHeight:1.7,color:'rgba(247,244,238,.6)',marginTop:22}}>The web shows how your five dimensions connect. Your report explains what that means and what you can do next.</p></div></div><section style={{whiteSpace:'pre-wrap',fontSize:15,lineHeight:1.85,color:'rgba(247,244,238,.82)'}}><h2 style={{fontSize:25,fontWeight:400,color:'#F7F4EE',marginBottom:14}}>What your result means</h2>{reportText}</section><ValueActivationCard/>
  <section aria-label="Your next step after your VALU report" style={{marginTop:48,padding:'clamp(22px,4vw,34px)',border:'1px solid rgba(201,168,76,.32)',borderRadius:12,background:'linear-gradient(125deg,rgba(26,26,46,.98),rgba(26,26,46,.72))'}}>
    <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:14}}>
      <span aria-hidden="true" style={{width:7,height:7,borderRadius:99,background:'#C9A84C',boxShadow:'0 0 0 5px rgba(201,168,76,.10)'}}/>
      <span style={{fontSize:9,fontWeight:800,letterSpacing:'.18em',color:'#C9A84C'}}>VALU COMPLETE · YOUR NEXT CHAPTER</span>
    </div>
    <h2 style={{fontSize:'clamp(23px,3.5vw,34px)',fontWeight:400,lineHeight:1.2,margin:'0 0 12px',color:'#F7F4EE'}}>Turn your insight into a professional presence.</h2>
    <p style={{fontSize:14,lineHeight:1.8,color:'rgba(247,244,238,.68)',maxWidth:650,margin:'0 0 20px'}}>Your VALU Index gives you a clearer picture of your professional strengths. The next step is to build your Valoria profile: add your experience, define the capabilities you want to be known for, and prepare your presence for the Registry’s readiness checks.</p>
    <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <a href="/profile/setup" style={{display:'inline-flex',alignItems:'center',gap:12,padding:'14px 22px',background:'#C9A84C',color:'#1A1A2E',textDecoration:'none',fontWeight:800,fontSize:10,letterSpacing:'.12em',borderRadius:999}}>BUILD MY PROFESSIONAL PROFILE <span aria-hidden="true">→</span></a>
      <span style={{fontSize:11,color:'rgba(247,244,238,.45)'}}>Next: capability selection and marketplace readiness.</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginTop:26}}>
      {[
        ['01','Build your profile','Present your experience and professional story.'],
        ['02','Choose capabilities','Show whether you are here as Talent, Speaker or Facilitator.'],
        ['03','Prepare for the Registry','Complete the relevant checks before becoming discoverable.'],
      ].map(([n,title,detail])=><div key={n} style={{borderTop:'2px solid rgba(201,168,76,.45)',paddingTop:11}}>
        <div style={{fontSize:9,fontWeight:800,color:'#C9A84C',letterSpacing:'.12em'}}>{n}</div>
        <div style={{fontSize:13,fontWeight:700,color:'#F7F4EE',marginTop:6}}>{title}</div>
        <div style={{fontSize:11,lineHeight:1.6,color:'rgba(247,244,238,.5)',marginTop:5}}>{detail}</div>
      </div>)}
    </div>
  </section></article></main>
}
