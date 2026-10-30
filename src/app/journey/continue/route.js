import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { createValuHandoffToken } from '@/lib/valu-handoff-token'

const SB_URL=process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY
const ASSESSMENT_ORIGIN='https://assessment.valoriainstitute.com/'
const norm=value=>String(value||'').trim().toLowerCase().replace(/\s+/g,' ')

async function getUser(request){
 if(!SB_URL||!SB_ANON)return null
 const supabase=createServerClient(SB_URL,SB_ANON,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}})
 const {data:{user}}=await supabase.auth.getUser()
 return user||null
}

async function adminLookupTaster(tasterId){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return {data:null}
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await admin.from('taster_sessions').select('id,user_id,completed_at').eq('id',tasterId).not('completed_at','is',null).maybeSingle()
 return {data:error?null:data}
}

async function stageTarget(request,stage,user,linkedTasterId=null){
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
 const requestedTasterId=linkedTasterId||request.nextUrl.searchParams.get('taster_id')?.trim()
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
 const destination=new URL(ASSESSMENT_ORIGIN)
 const destinationParams=new URLSearchParams({full:'1'})
  destination.search=destinationParams.toString()
  const fragmentParams=new URLSearchParams({handoff_token:handoffToken})
  const resumeToken=request.nextUrl.searchParams.get('resume')?.trim()
  if(resumeToken)fragmentParams.set('resume_token',resumeToken)
  destination.hash=fragmentParams.toString()
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
    const requestedTasterId=request.nextUrl.searchParams.get('taster_id')?.trim()
    const resumeToken=request.nextUrl.searchParams.get('resume')?.trim()
    if(requestedTasterId){
     // Backwards-compatible path for old emails/bookmarks: exchange the
     // exposed snapshot ID for a short-lived opaque token before login.
     const {data:taster}=await adminLookupTaster(requestedTasterId)
     if(taster?.user_id){
      const reentryToken=randomBytes(32).toString('hex')
      const expiresAt=new Date(Date.now()+24*60*60*1000).toISOString()
      const {data:reentry,error:reentryError}=await createClient(SB_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
       .from('valoria_reentry_links').insert({
        user_id:taster.user_id,token:reentryToken,entry_point:'legacy_valu_link',
        target_stage:'assess',source:'legacy_assessment_url',source_id:taster.id,expires_at:expiresAt
       }).select('token').single()
      if(!reentryError&&reentry?.token){
       const continuationParams=new URLSearchParams({token:reentry.token})
       if(resumeToken)continuationParams.set('resume',resumeToken)
       login.searchParams.set('returnTo','/journey/continue?'+continuationParams.toString())
       return NextResponse.redirect(login)
      }
     }
     login.searchParams.set('returnTo','/dashboard')
     return NextResponse.redirect(login)
    }
    const continuationParams=new URLSearchParams({stage:'assess'})
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
 const {data:link,error}=await admin.from('valoria_reentry_links').select('id,user_id,entry_point,target_stage,source_id,expires_at,used_at').eq('token',token).maybeSingle()
 if(error||!link||link.used_at||(link.expires_at&&new Date(link.expires_at)<=new Date()))return NextResponse.redirect(new URL('/journey',request.url))

 const user=await getUser(request)
 if(!user){
  const login=new URL('/login',request.url)
  login.searchParams.set('returnTo','/journey/continue?token='+encodeURIComponent(token))
  return NextResponse.redirect(login)
 }
 if(link.user_id&&link.user_id!==user.id)return NextResponse.redirect(new URL('/journey',request.url))

 const {data:consumed,error:consumeError}=await admin.from('valoria_reentry_links').update({user_id:user.id,used_at:new Date().toISOString()})
  .eq('id',link.id).is('used_at',null).select('id').maybeSingle()
 if(consumeError||!consumed)return NextResponse.redirect(new URL('/journey',request.url))
 await admin.from('valoria_journey_events').insert({user_id:user.id,event_key:'journey_reentered',source:'reentry_link',source_id:link.id,metadata:{target_stage:link.target_stage}})
 const linkedTasterId=['valu_reminder','legacy_valu_link'].includes(link.entry_point)?link.source_id:null
 return NextResponse.redirect(new URL(await stageTarget(request,link.target_stage,user,linkedTasterId),request.url))
}
