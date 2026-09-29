import {NextResponse} from 'next/server'
import {createServerClient} from '@supabase/ssr'
import {createClient} from '@supabase/supabase-js'
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL,ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY
export async function GET(request){
 if(!URL||!ANON||!SERVICE)return NextResponse.json({error:'Service unavailable'},{status:503})
 const sb=createServerClient(URL,ANON,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}});const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({authenticated:false,matches:[]},{status:401})
 const admin=createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
 const results=await Promise.all([
  admin.from('professional_profiles').select('id,industry,preferred_industries,skills,active_tracks,listing_status,eligible_for_listing').eq('id',user.id).maybeSingle(),
  admin.from('professional_capabilities').select('capability').eq('professional_id',user.id).eq('is_active',true),
  admin.from('opportunities').select('id,slug,title,summary,description,organisation_name,location,work_mode,opportunity_type,industry,capabilities,skills,closing_at,status,access_level').eq('status','published').order('published_at',{ascending:false}).limit(50)
 ])
 const [profileRes,capsRes,opsRes]=results
 const queryErrors=results.filter(r=>r.error)
 if(queryErrors.length)return NextResponse.json({error:'Opportunity matching could not read all required data.',query_errors:queryErrors.map(r=>r.error.message)},{status:502})
 const p=profileRes.data,caps=capsRes.data,ops=opsRes.data
 const capsSet=new Set((caps||[]).map(x=>x.capability));const skills=new Set((p?.skills||[]).map(x=>String(x).toLowerCase()));const industries=new Set([p?.industry,...(p?.preferred_industries||[])].filter(Boolean).map(x=>String(x).toLowerCase()))
 const matches=(ops||[]).map(o=>{let score=0;const reasons=[];if((o.capabilities||[]).some(x=>capsSet.has(String(x).toLowerCase()))){score+=50;reasons.push('Capability match')}if(o.industry&&industries.has(String(o.industry).toLowerCase())){score+=25;reasons.push('Industry match')}if((o.skills||[]).some(x=>skills.has(String(x).toLowerCase()))){score+=15;reasons.push('Skill match')}if(o.work_mode&&p?.active_tracks?.includes(o.work_mode))score+=5;return {...o,match_score:score,match_reasons:reasons}}).filter(o=>o.match_score>0).sort((a,b)=>b.match_score-a.match_score).slice(0,10)
 return NextResponse.json({authenticated:true,matches})
}