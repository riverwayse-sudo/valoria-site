import { redirect } from 'next/navigation'\nimport { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const metadata={title:'Your VALU Report',robots:{index:false,follow:false}}

export default async function ReportPage(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!anon||!service) redirect('/dashboard')
  const cookieStore=await cookies()\n  const supabase=createServerClient(url,anon,{cookies:{getAll(){return cookieStore.getAll()},setAll(){}}})
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login?returnTo=/report')
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})
  let {data:assessment}=await admin.from('valu_assessments').select('total_score,designation,ai_report,completed_at,report_status').eq('user_id',user.id).order('completed_at',{ascending:false}).limit(1).maybeSingle()\n  if(!assessment?.ai_report&&user.email){const {data:legacy}=await admin.from('valu_assessments').select('total_score,designation,ai_report,completed_at,report_status').eq('email',user.email.toLowerCase()).order('completed_at',{ascending:false}).limit(1).maybeSingle();assessment=legacy||assessment}
  if(!assessment?.ai_report) redirect('/dashboard')
  return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',padding:'80px 20px',fontFamily:'Raleway,Arial,sans-serif'}}><article style={{maxWidth:820,margin:'0 auto'}}><div style={{color:'#C9A84C',fontSize:10,fontWeight:800,letterSpacing:'.18em',marginBottom:14}}>VALORIA INSTITUTE · VALU REPORT</div><h1 style={{fontSize:'clamp(36px,6vw,64px)',fontWeight:400,lineHeight:1.02,margin:0}}>Your VALU report.</h1><div style={{display:'flex',alignItems:'baseline',gap:10,margin:'28px 0',padding:'24px',border:'1px solid rgba(201,168,76,.22)',background:'rgba(201,168,76,.06)',borderRadius:10}}><strong style={{fontSize:64,color:'#C9A84C',fontWeight:300}}>{assessment.total_score ?? '—'}</strong><span style={{color:'rgba(247,244,238,.55)'}}>/100 · {assessment.designation || 'VALU Index'}</span></div><section style={{whiteSpace:'pre-wrap',fontSize:15,lineHeight:1.85,color:'rgba(247,244,238,.82)'}}>{assessment.ai_report}</section><div style={{marginTop:44,display:'flex',gap:10,flexWrap:'wrap'}}><a href="/journey" style={{padding:'13px 18px',background:'#C9A84C',color:'#1A1A2E',textDecoration:'none',fontWeight:800,fontSize:11,letterSpacing:'.1em'}}>CONTINUE YOUR JOURNEY →</a><a href="/profile/setup" style={{padding:'13px 18px',border:'1px solid rgba(201,168,76,.3)',color:'#C9A84C',textDecoration:'none',fontWeight:800,fontSize:11,letterSpacing:'.1em'}}>BUILD MY PROFILE →</a></div></article></main>
}
