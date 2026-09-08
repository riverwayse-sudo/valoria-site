'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const DARK = '#0F0F1A'
const PARCH = '#F7F4EE'

export default function ValuCompletionNudge() {
  const [show, setShow] = useState(false)
  const [url, setUrl] = useState('https://assessment.valoriainstitute.com/')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (sessionStorage.getItem('valu_nudge_dismissed_today') === new Date().toISOString().slice(0,10)) return
      } catch {}
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return
      const { data: profile } = await supabase.from('professional_profiles').select('profile_complete,assessment_completed_at').eq('id', user.id).maybeSingle()
      if (!profile || profile.profile_complete || profile.assessment_completed_at) return
      const { data: taster } = await supabase.from('taster_sessions').select('id,name,role,experience').eq('user_id', user.id).order('linked_at', { ascending:false }).limit(1).maybeSingle()
      if (taster) setUrl(`https://assessment.valoriainstitute.com/?full=1&taster_id=${encodeURIComponent(taster.id)}&name=${encodeURIComponent(taster.name||'')}&role=${encodeURIComponent(taster.role||'')}&experience=${encodeURIComponent(taster.experience||'')}`)
      if (active) setShow(true)
    }
    load()
    return () => { active = false }
  }, [])

  if (!show) return null
  function dismiss() {
    try { sessionStorage.setItem('valu_nudge_dismissed_today', new Date().toISOString().slice(0,10)) } catch {}
    setShow(false)
  }
  return <div style={S.overlay} role="dialog" aria-modal="true" aria-label="Complete your VALU Index">
    <div style={S.card}>
      <button onClick={dismiss} aria-label="Close" style={S.close}>×</button>
      <div style={S.eyebrow}>YOUR PROFILE IS INCOMPLETE</div>
      <h2 style={S.title}>Your Basic listing is live.</h2>
      <p style={S.copy}>Complete the full VALU assessment to establish your official VALU Index and move your professional profile forward.</p>
      <a href={url} style={S.button}>COMPLETE FULL ASSESSMENT →</a>
      <button onClick={dismiss} style={S.later}>Remind me later</button>
    </div>
  </div>
}

const S={overlay:{position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'20px',background:'rgba(15,15,26,.28)',pointerEvents:'none'},card:{position:'relative',width:'100%',maxWidth:520,padding:'24px 24px 20px',background:'#1A1A2E',border:'1px solid rgba(201,168,76,.3)',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,.35)',pointerEvents:'auto'},close:{position:'absolute',top:8,right:10,border:0,background:'none',color:'rgba(247,244,238,.4)',fontSize:22,cursor:'pointer'},eyebrow:{fontSize:9,fontWeight:700,letterSpacing:'.16em',color:GOLD},title:{fontSize:24,fontWeight:300,color:PARCH,margin:'8px 0'},copy:{fontSize:13,lineHeight:1.65,color:'rgba(247,244,238,.55)',margin:'0 0 18px'},button:{display:'block',padding:'13px 18px',background:GOLD,color:DARK,borderRadius:999,textDecoration:'none',textAlign:'center',fontSize:10,fontWeight:700,letterSpacing:'.12em'},later:{display:'block',width:'100%',marginTop:9,padding:8,border:0,background:'transparent',color:'rgba(247,244,238,.35)',cursor:'pointer',fontSize:11}}
