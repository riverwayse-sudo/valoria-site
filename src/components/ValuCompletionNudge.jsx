'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AssessmentStartLink } from '@/components/Nav'

const GOLD='#C9A84C', DARK='#0F0F1A', PARCH='#F7F4EE'
export default function ValuCompletionNudge(){
  const [show,setShow]=useState(false)
  const [assessed,setAssessed]=useState(false)
  const closeButtonRef=useRef(null)

  useEffect(()=>{
    if(process.env.NEXT_PUBLIC_VALU_PREVIEW === '1') return
    let active=true
    async function load(){
      try{
        if(sessionStorage.getItem('valu_nudge_dismissed_today')===new Date().toISOString().slice(0,10))return
      }catch{}

      const {data:{user}}=await supabase.auth.getUser()
      if(!user||!active)return

      const [{data:profile},{data:assessment}]=await Promise.all([
        supabase.from('professional_profiles').select('profile_complete').eq('id',user.id).maybeSingle(),
        supabase.from('valu_assessments').select('id,total_score,completed_at').eq('user_id',user.id).not('completed_at','is',null).order('completed_at',{ascending:false}).limit(1).maybeSingle(),
      ])

      if(!profile||profile.profile_complete)return
      const fullAssessmentComplete = !!assessment?.completed_at
      if(active){
        setAssessed(fullAssessmentComplete)
        setShow(true)
      }
    }
    load()
    return()=>{active=false}
  },[])

  useEffect(()=>{
    if(!show)return undefined
    closeButtonRef.current?.focus()
    const onKeyDown=(event)=>{if(event.key==='Escape')dismiss()}
    window.addEventListener('keydown',onKeyDown)
    return()=>window.removeEventListener('keydown',onKeyDown)
  },[show])

  if(!show)return null

  function dismiss(){
    try{sessionStorage.setItem('valu_nudge_dismissed_today',new Date().toISOString().slice(0,10))}catch{}
    setShow(false)
  }

  return <div style={S.overlay} role="dialog" aria-modal="true" aria-labelledby="valu-nudge-title">
    <div style={S.card}>
      <button ref={closeButtonRef} onClick={dismiss} aria-label="Close" style={S.close}>×</button>
      <div style={S.eyebrow}>{assessed?'VALU INDEX COMPLETE':'YOUR NEXT STEP'}</div>
      <h2 id="valu-nudge-title" style={S.title}>
        {assessed?'Your VALU Index assessment is complete.':'Make your professional capability visible.'}
      </h2>
      <p style={S.copy}>
        {assessed
          ? 'Your professional profile is ready to complete. Finish your details to establish your marketplace presence. Eligibility and public listing are determined separately by Valoria’s requirements.'
          : 'Start with the VALU taster. If you have already completed it, continue to your full assessment. Your official VALU Index is available after the full assessment.'}
      </p>
      {assessed
        ? <a href="/profile/setup" style={S.button}>COMPLETE MY PROFILE →</a>
        : <AssessmentStartLink href="/valu/assessment/" style={S.button}>START / CONTINUE VALU JOURNEY →</AssessmentStartLink>}
      <button onClick={dismiss} style={S.later}>Remind me later</button>
    </div>
  </div>
}

const S={
  overlay:{position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'20px',background:'rgba(15,15,26,.28)',pointerEvents:'none'},
  card:{position:'relative',width:'100%',maxWidth:520,padding:'24px 24px 20px',background:'#1A1A2E',border:'1px solid rgba(201,168,76,.3)',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,.35)',pointerEvents:'auto'},
  close:{position:'absolute',top:8,right:10,border:0,background:'none',color:'rgba(247,244,238,.4)',fontSize:22,cursor:'pointer'},
  eyebrow:{fontSize:9,fontWeight:700,letterSpacing:'.16em',color:GOLD},
  title:{fontSize:24,fontWeight:300,color:PARCH,margin:'8px 0'},
  copy:{fontSize:13,lineHeight:1.65,color:'rgba(247,244,238,.55)',margin:'0 0 18px'},
  button:{display:'block',padding:'13px 18px',background:GOLD,color:DARK,borderRadius:999,textDecoration:'none',textAlign:'center',fontSize:10,fontWeight:700,letterSpacing:'.12em'},
  later:{display:'block',width:'100%',marginTop:9,padding:8,border:0,background:'transparent',color:'rgba(247,244,238,.35)',cursor:'pointer',fontSize:11}
}
