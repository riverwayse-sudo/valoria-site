import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { createValuHandoffToken } from '@/lib/valu-handoff-token'

const SB_URL=process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY
// Path of the full VALU assessment SPA. It is rewritten to the platform upstream
// by next.config.js, so it must be reached through the *current* host rather than
// a pinned production domain — otherwise a staging or preview deployment hands
// the user off to production. Callers resolve this against request.url.
const ASSESSMENT_PATH='/valu/assessment/'
const norm=value=>String(value||'').trim().toLowerCase().replace(/\s+/g,' ')

async function getUser(request){
 if(!SB_URL||!SB_ANON)return null
 const supabase=createServerClient(SB_URL,SB_ANON,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}})
 const {data:{user}}=await supabase.auth.getUser()
 return user||null
}

async function stageTarget(request,stage,user){
 const routes={
  connect:'/dashboard',
  report:'/report',
  profile:'/profile/setup',
  capability:'/profile/setup',
  eligibility:'/profile/setup',
  listed:'/marketplace',
  marketplace:'/marketplace',
  opportunity:'/opportunities'
 }
 if(stage!=='assess')return routes[stage]||'/journey'
 if(!user||!SERVICE||!SB_URL)return '/login'
 if(!user.email_confirmed_at)return '/login'
 const admin=createClient(SB_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
 const requestedTasterId=request.nextUrl.searchParams.get('taster_id')?.trim()
 let query=admin.from('taster_sessions').select('id,name,role,experience,completed_at').eq('user_id',user.id).not('completed_at','is',null)
 if(requestedTasterId) query=query.eq('id',requestedTasterId)
 else query=query.order('completed_at',{ascending:false}).limit(1)
 const {data:taster,error}=await query.maybeSingle()
 if(error)return '/journey'
 if(!taster)return '/profile/claim-assessment'
 const {data:candidate,error:candidateError}=await admin.from('taster_identity_candidates')
  .select('candidate_email,candidate_role,linked_user_id').eq('taster_id',taster.id).maybeSingle()
 if(candidateError)return '/profile/claim-assessment'
 if(candidate?.linked_user_id&&candidate.linked_user_id!==user.id)return '/profile/claim-assessment'
 if(candidate?.candidate_email&&norm(candidate.candidate_email)!==norm(user.email))return '/profile/claim-assessment'
 if(candidate?.candidate_role&&norm(candidate.candidate_role)!==norm(taster.role))return '/profile/claim-assessment'
 let handoffToken
 try { handoffToken=createValuHandoffToken(user.id,taster.id) } catch { return '/journey' }
  const destination=new URL(ASSESSMENT_PATH,request.url)
 const destinationParams=new URLSearchParams({full:'1',taster_id:taster.id,name:taster.name||'',role:taster.role||'',experience:taster.experience||''})
 const resumeToken=request.nextUrl.searchParams.get('resume')?.trim()
 if(resumeToken)destinationParams.set('resume',resumeToken)
 destination.search=destinationParams.toString()
 destination.hash=new URLSearchParams({handoff_token:handoffToken}).toString()
 return destination.toString()
}

export async function GET(request){
 const token=request.nextUrl.searchParams.get('token')?.trim()
 const stage=request.nextUrl.searchParams.get('stage')?.trim()

 if(stage&&!token){
  const user=await getUser(request)
  if(!user){
   if(stage==='assess'){
    const login=new URL('/login',request.url)
    const continuationParams=new URLSearchParams({stage:'assess'})
    const requestedTasterId=request.nextUrl.searchParams.get('taster_id')?.trim()
    const resumeToken=request.nextUrl.searchParams.get('resume')?.trim()
    if(requestedTasterId)continuationParams.set('taster_id',requestedTasterId)
    if(resumeToken)continuationParams.set('resume',resumeToken)
    login.searchParams.set('returnTo','/journey/continue?'+continuationParams.toString())
    return NextResponse.redirect(login)
   }
   const signup=new URL('/signup',request.url)
   signup.searchParams.set('returnTo','/journey/continue?stage='+encodeURIComponent(stage))
   return NextResponse.redirect(signup)
  }
  return NextResponse.redirect(new URL(await stageTarget(request,stage,user),request.url))
 }

 if(!token||!SERVICE||!SB_URL||!SB_ANON)return NextResponse.redirect(new URL('/journey',request.url))

 const admin=createClient(SB_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:link,error}=await admin.from('valoria_reentry_links').select('id,user_id,target_stage,expires_at,used_at').eq('token',token).maybeSingle()
 if(error||!link||link.used_at||(link.expires_at&&new Date(link.expires_at)<=new Date()))return NextResponse.redirect(new URL('/journey',request.url))

 const user=await getUser(request)
 if(!user){
  const login=new URL('/login',request.url)
  login.searchParams.set('returnTo','/journey/continue?token='+encodeURIComponent(token))
  return NextResponse.redirect(login)
 }
 if(link.user_id&&link.user_id!==user.id)return NextResponse.redirect(new URL('/journey',request.url))

 await admin.from('valoria_reentry_links').update({user_id:user.id,used_at:new Date().toISOString()}).eq('id',link.id).is('used_at',null)
 await admin.from('valoria_journey_events').insert({user_id:user.id,event_key:'journey_reentered',source:'reentry_link',source_id:link.id,metadata:{target_stage:link.target_stage}})
 return NextResponse.redirect(new URL(await stageTarget(request,link.target_stage,user),request.url))
}
