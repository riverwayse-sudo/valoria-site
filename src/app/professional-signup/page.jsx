'use client'

import VALUJourneyProgress from '@/components/VALUJourneyProgress'
import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PASSWORD_POLICY, passwordPolicyMessage, validatePassword } from '@/lib/password-policy'

const GOLD='#C9A84C', DARK='#0F0F1A', PARCH='#F7F4EE', DIM='rgba(247,244,238,.48)'
function ProfessionalSignupForm(){
  const params=useSearchParams(); const tasterId=params.get('taster_id')||''; const name=params.get('name')||''; const role=params.get('role')||''; const experience=params.get('experience')||''; const capturedEmail=(params.get('email')||'').trim().toLowerCase()
  const [form,setForm]=useState({email:capturedEmail,password:'',confirm:''}); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [done,setDone]=useState(false); const [linked,setLinked]=useState(false); const [confirmationRequired,setConfirmationRequired]=useState(false); const [resending,setResending]=useState(false); const [resendMessage,setResendMessage]=useState(''); const [redirecting,setRedirecting]=useState(false)
  const valid=useMemo(()=>tasterId&&name&&role&&form.email&&form.password.length>=PASSWORD_POLICY.minLength&&form.password===form.confirm,[tasterId,name,role,form])
  useEffect(()=>{
    let cancelled=false
    async function continueSignedInUser(){
      if(!tasterId||!name||!role)return
      const {data:{session}}=await supabase.auth.getSession()
      if(cancelled||!session?.access_token||!session.user?.email_confirmed_at)return
      setRedirecting(true)
      try{
        const linkRes=await fetch('/api/link-taster',{
          method:'POST',
          headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},
          body:JSON.stringify({taster_id:tasterId,name,role})
        })
        const linkData=await linkRes.json().catch(()=>({}))
        if(!linkRes.ok)throw new Error(linkData.error||'Your saved VALU taster could not be linked to this account.')
        // A signed-in user may arrive here from the taster, but must still
        // choose to continue from the dashboard. Do not launch the full assessment
        // automatically from this route.
        localStorage.removeItem('pending_taster_id')
        if(!cancelled)window.location.replace('/dashboard?welcome=profile')
      }catch(err){
        if(!cancelled){setError(err?.message||'We could not open your full VALU assessment. Please try again.');setRedirecting(false)}
      }
    }
    continueSignedInUser().catch(err=>{if(!cancelled)setError(err?.message||'We could not verify your Valoria session.')})
    return ()=>{cancelled=true}
  },[tasterId,name,role])
  async function resendConfirmation(){
    setResending(true)
    setResendMessage('')
    try{
      const { error } = await supabase.auth.resend({
        type:'signup',
        email:form.email.trim().toLowerCase(),
        options:{emailRedirectTo:`${window.location.origin}/auth/callback?pending_taster_id=${encodeURIComponent(tasterId)}`}
      })
      if(error)throw error
      setResendMessage('A fresh confirmation email has been requested. Check your inbox and spam folder.')
    }catch(err){
      setResendMessage(err?.message||'We could not resend the confirmation email. Please wait a moment and try again.')
    }finally{
      setResending(false)
    }
  }
  async function submit(e){
    e.preventDefault()
    if(!valid)return
    const passwordCheck=validatePassword(form.password)
    if(!passwordCheck.valid){setError(passwordCheck.errors.join(' '));return}
    setLoading(true)
    setError('')
    try{
      const {data,error:signupError}=await supabase.auth.signUp({
        email:form.email.trim().toLowerCase(),
        password:form.password,
        options:{emailRedirectTo:`${window.location.origin}/auth/callback?pending_taster_id=${encodeURIComponent(tasterId)}`,data:{display_name:name,full_name:name,user_type:'professional',role,pending_taster_id:tasterId}}
      })
      if(signupError)throw signupError
      if(!data?.user?.id)throw new Error('Account could not be created.')

      // Supabase intentionally returns an empty identities array when this
      // email already belongs to an account. Do not show a false confirmation
      // message; preserve the taster and route the participant to sign-in.
      if(Array.isArray(data.user.identities) && data.user.identities.length === 0){
        localStorage.setItem('pending_taster_id',tasterId)
        localStorage.setItem('pending_taster_name',name)
        localStorage.setItem('pending_taster_role',role)
        window.location.replace(`/login?pending_taster_id=${encodeURIComponent(tasterId)}&returnTo=%2Fdashboard`)
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      if(sessionData?.session?.access_token){
        const linkRes=await fetch('/api/link-taster',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            Authorization:`Bearer ${sessionData.session.access_token}`,
          },
          body:JSON.stringify({taster_id:tasterId,name,role})
        })
        const linkData=await linkRes.json().catch(()=>({}))
        if(!linkRes.ok)throw new Error(linkData.error||'Your VALU result could not be linked to the account.')
        setLinked(true)
        setDone(true)
      } else {
        localStorage.setItem('pending_taster_id',tasterId)
        localStorage.setItem('pending_taster_name',name)
        localStorage.setItem('pending_taster_role',role)
        setConfirmationRequired(true)
      }
    }catch(err){
      setError(err?.message||'Something went wrong. Please try again.')
    }finally{
      setLoading(false)
    }
  }

  if(redirecting)return <Shell><div style={S.eyebrow}>VALU ASSESSMENT</div><h1 style={S.title}>Returning to your <em>dashboard.</em></h1><p style={S.sub}>Your saved taster is being verified and connected to your account…</p></Shell>
  if(!tasterId||!name||!role)return <Shell><h1 style={S.title}>Your VALU journey needs a starting point.</h1><p style={S.sub}>Begin with the VALU taster. After it is saved, create or connect your account; your full assessment is available from your dashboard.</p><a href="/valu/assessment/" style={S.button}>START THE VALU TASTER →</a></Shell>
  if(confirmationRequired)return <Shell><VALUJourneyProgress stage="account" /><div style={S.eyebrow}>ACCOUNT BRIDGE · EMAIL CONFIRMATION</div><h1 style={S.title}>Check your inbox.</h1><p style={S.sub}>We sent a confirmation link to <strong>{form.email.trim().toLowerCase()}</strong>. Confirm your email to return to your dashboard.</p><div style={S.bridgeSteps}><div><b>✓</b><span><strong>VALU taster saved</strong><small>Your directional responses are saved to your Valoria journey.</small></span></div><div><b>02</b><span><strong>Confirm your email</strong><small>Open the secure link sent to your inbox.</small></span></div><div><b>03</b><span><strong>Begin your full assessment</strong><small>Return to your dashboard to continue your assessment.</small></span></div></div><button type="button" onClick={resendConfirmation} disabled={resending} style={{...S.button,opacity:resending?0.55:1}}>{resending?'REQUESTING A NEW LINK…':'RESEND CONFIRMATION EMAIL'}</button>{resendMessage&&<p role="status" style={S.note}>{resendMessage}</p>}<p style={S.note}>Can’t find the email? Check your spam or promotions folder. Your saved answers remain intact while you confirm your address.</p></Shell>

  if(done){return <Shell><VALUJourneyProgress stage="full" /><div style={S.eyebrow}>TASTER SAVED</div><h1 style={S.title}>Your dashboard is <em>ready.</em></h1><p style={S.sub}>Your taster is connected. Continue from your dashboard.</p>{!linked&&<p style={S.error}>Your account was created, but the taster link still needs to be completed before continuing.</p>}<Link href="/dashboard" style={S.button}>GO TO MY DASHBOARD →</Link><p style={S.note}>Your saved answers and progress are preserved.</p></Shell>}
  return <Shell><VALUJourneyProgress stage="account" /><div style={S.eyebrow}>ACCOUNT CREATION</div><h1 style={S.title}>Create your account.</h1><p style={S.sub}>Your taster is saved. Confirm your email to continue.</p><p style={S.summary}>{name} <span aria-hidden="true">·</span> {role} <span aria-hidden="true">·</span> Taster saved</p><form onSubmit={submit} style={S.form}><label>Email<input type="email" required value={form.email} readOnly aria-readonly="true" placeholder="you@example.com" style={{...S.input,opacity:0.82,cursor:"not-allowed"}}/><small style={S.fieldHint}>Use the email linked to your taster.</small></label><label>Password<input type="password" required minLength={8} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={`Minimum ${PASSWORD_POLICY.minLength} characters`} style={S.input}/></label><p style={S.fieldHint}>{passwordPolicyMessage()}</p><label>Confirm password<input type="password" required minLength={8} value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="Repeat your password" style={S.input}/></label>{error&&<div style={S.error}>{error}</div>}<button type="submit" disabled={loading||!valid} style={{...S.button,opacity:(loading||!valid)?0.45:1}}>{loading?'CREATING ACCOUNT…':'CREATE ACCOUNT →'}</button></form><p style={S.note}>Already have an account? <Link href={`/login?pending_taster_id=${encodeURIComponent(tasterId)}&returnTo=%2Fdashboard`} style={{color:GOLD,textDecoration:'underline'}}>Sign in to connect your taster.</Link></p></Shell>
}
function Shell({children}){return <main style={S.page}><div style={S.card}><div style={{marginBottom:12}}><Link href="/" style={{color:GOLD,textDecoration:'none',fontSize:11,letterSpacing:'.12em'}}>VALORIA INSTITUTE</Link></div>{children}</div></main>}
export default function ProfessionalSignupPage(){return <Suspense fallback={null}><ProfessionalSignupForm/></Suspense>}
const S={page:{minHeight:'100vh',background:DARK,color:PARCH,display:'flex',justifyContent:'center',alignItems:'center',padding:'24px 18px',fontFamily:"'Raleway',sans-serif"},card:{width:'100%',maxWidth:760,background:'rgba(26,26,46,.7)',border:'1px solid rgba(201,168,76,.18)',borderRadius:12,padding:'clamp(22px,3vw,34px)'},bridgeSteps:{display:'grid',gap:12,padding:18,background:'rgba(201,168,76,.045)',border:'1px solid rgba(201,168,76,.16)',borderRadius:9,margin:'0 0 22px'},eyebrow:{color:GOLD,fontSize:9,fontWeight:700,letterSpacing:'.15em',marginBottom:9},title:{fontSize:'clamp(30px,3.4vw,42px)',fontWeight:400,lineHeight:1.08,letterSpacing:'-.03em',margin:'0 0 10px'},sub:{color:DIM,fontSize:13,lineHeight:1.55,margin:'0 0 16px',maxWidth:620},summary:{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',padding:0,background:'transparent',border:0,borderRadius:0,margin:'0 0 16px',color:'rgba(247,244,238,.68)',fontSize:12},form:{display:'grid',gap:11},input:{display:'block',width:'100%',boxSizing:'border-box',marginTop:5,padding:'11px 13px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(247,244,238,.12)',borderRadius:6,color:PARCH,outline:'none'},button:{display:'block',width:'100%',padding:'13px 18px',background:GOLD,color:DARK,border:0,borderRadius:999,fontWeight:700,letterSpacing:'.12em',fontSize:11,textAlign:'center',textDecoration:'none',cursor:'pointer'},secondary:{display:'block',marginTop:12,padding:'14px 18px',border:'1px solid rgba(201,168,76,.25)',color:GOLD,borderRadius:999,textAlign:'center',textDecoration:'none',fontSize:11,letterSpacing:'.1em'},note:{color:'rgba(247,244,238,.42)',fontSize:10,lineHeight:1.45,marginTop:12},fieldHint:{color:'rgba(247,244,238,.38)',fontSize:10,lineHeight:1.4,marginTop:4},error:{color:'#F09595',background:'rgba(216,90,48,.1)',border:'1px solid rgba(216,90,48,.25)',padding:12,borderRadius:6,fontSize:12}}
