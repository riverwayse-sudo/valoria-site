import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

function clusterName(key) {
  return ({p:'Presence',r:'Relationships',i:'Intelligence',m:'Mastery',e:'Enterprise'})[key] || key
}

function buildPlan(assessment) {
  const scores = { p:Number(assessment?.p_score||0), r:Number(assessment?.r_score||0), i:Number(assessment?.i_score||0), m:Number(assessment?.m_score||0), e:Number(assessment?.e_score||0) }
  const ordered = Object.entries(scores).sort((a,b)=>b[1]-a[1])
  const strongest = ordered.slice(0,2)
  const priority = ordered.filter(([,score])=>score>0).slice(-2).reverse()
  const strengths = strongest.map(([key,score])=>({cluster:clusterName(key),score,message:'Use this strength deliberately in your professional positioning.'}))
  const development = priority.map(([key,score])=>({cluster:clusterName(key),score,message:'Turn this lower-scoring area into a concrete development objective.'}))
  const actions = [
    {title:'Complete your professional identity',href:'/profile/setup'},
    {title:'Activate at least one capability',href:'/profile/setup'},
    {title:'Add evidence where the platform requests it',href:'/profile/setup'},
    {title:'Reach eligibility and enter the marketplace',href:'/journey'}
  ]
  const unlocks = [
    'A structured professional identity',
    'A capability-specific professional passport',
    'Eligibility and verification signals',
    'Discoverability and opportunity access'
  ]
  return {priority_cluster: priority[0] ? clusterName(priority[0][0]) : null, strengths, development_priorities:development, next_actions:actions, value_unlocks:unlocks}
}

async function userFromRequest(request) {
  if (!URL || !ANON) return null
  const sb=createServerClient(URL,ANON,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}})
  const {data:{user}}=await sb.auth.getUser()
  return user||null
}

export async function GET(request) {
  if (!URL || !ANON || !SERVICE) return NextResponse.json({error:'Service unavailable.'},{status:503})
  const user=await userFromRequest(request)
  if (!user) return NextResponse.json({authenticated:false},{status:401})
  const admin=createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
  let {data:assessment}=await admin.from('valu_assessments').select('id,total_score,p_score,r_score,i_score,m_score,e_score,completed_at').eq('user_id',user.id).order('completed_at',{ascending:false}).limit(1).maybeSingle()
  if(!assessment&&user.email) assessment=(await admin.from('valu_assessments').select('id,total_score,p_score,r_score,i_score,m_score,e_score,completed_at').eq('email',user.email.toLowerCase()).order('completed_at',{ascending:false}).limit(1).maybeSingle()).data
  if(!assessment?.completed_at) return NextResponse.json({ready:false,plan:null})
  const plan=buildPlan(assessment)
  const {data:existing}=await admin.from('professional_value_activation').select('*').eq('professional_id',user.id).maybeSingle()
  if(existing?.assessment_id===assessment.id) return NextResponse.json({ready:true,plan:existing})
  const payload={professional_id:user.id,assessment_id:assessment.id,status:'ready',...plan,updated_at:new Date().toISOString()}
  const {data:saved,error}=await admin.from('professional_value_activation').upsert(payload,{onConflict:'professional_id'}).select('*').single()
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ready:true,plan:saved})
}

export async function POST(request) {
  if (!URL || !ANON || !SERVICE) return NextResponse.json({error:'Service unavailable.'},{status:503})
  const user=await userFromRequest(request)
  if (!user) return NextResponse.json({error:'Authentication required.'},{status:401})
  const admin=createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data,error}=await admin.from('professional_value_activation').update({status:'activated',activated_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('professional_id',user.id).select('*').maybeSingle()
  if(error) return NextResponse.json({error:error.message},{status:500})
  await admin.from('valoria_journey_events').insert({user_id:user.id,event_key:'value_activation_activated',source:'journey',source_id:user.id,metadata:{status:'activated'}})
  return NextResponse.json({ok:true,plan:data})
}
