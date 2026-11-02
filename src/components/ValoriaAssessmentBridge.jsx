'use client'

import { useCallback, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const MIDNIGHT = '#1A1A2E'
const MUTED = 'rgba(247,244,238,.66)'

function getFailureMessage(status, message) {
  if (status === 401) return 'Your sign-in session could not be verified. Sign in again to continue your saved assessment.'
  if (status === 403) return message || 'Your account needs attention before this assessment can continue.'
  if (status === 404) return 'We could not find a completed VALU snapshot linked to this account. Return to your dashboard or contact Valoria support if you believe this is incorrect.'
  if (status === 409) return message || 'This assessment cannot be continued from the current account state.'
  if (status === 503) return message || 'Secure assessment access is temporarily unavailable. Your account and saved responses have not been changed.'
  if (status >= 500) return 'Valoria could not securely connect to the assessment service. Your saved responses have not been changed.'
  return message || 'We could not open your saved assessment. Please try again.'
}

function getNextConversation() {
  const now = Date.now()
  return PROFESSIONAL_STANDARD_SERIES.find(session => {
    const state = getSessionState(session, now)
    return state === 'registration-open' || state === 'live' || state === 'coming-soon'
  }) || null
}

export default function ValoriaAssessmentBridge() {
  const handoffInFlightRef = useRef(false)
  const [status, setStatus] = useState('intro')
  const [error, setError] = useState('')
  const nextConversation = getNextConversation()
  const conversationState = nextConversation ? getSessionState(nextConversation) : null
  const conversationDate = nextConversation?.dateApproved
    ? formatSessionDate(nextConversation)
    : 'DATE TO BE ANNOUNCED'

  const beginHandoff = useCallback(async () => {
    if (handoffInFlightRef.current) return
    handoffInFlightRef.current = true
    setStatus('connecting')
    setError('')

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error('Your sign-in session could not be read. Please sign in again.')
      if (!session?.access_token) {
        const authError = new Error('Your session has ended. Sign in to continue your saved assessment.')
        authError.status = 401
        throw authError
      }

      const response = await fetch('/api/valu-handoff', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))

      if (response.status === 409 && data.already_completed) {
        window.location.replace('/dashboard')
        return
      }
      if (!response.ok || !data.url) {
        const failure = new Error(getFailureMessage(response.status, data.error))
        failure.status = response.status
        throw failure
      }

      let destination
      try {
        destination = new URL(data.url)
      } catch {
        throw new Error('The assessment service returned an invalid destination. Please return to your dashboard.')
      }
      const isLocalDevelopment = destination.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(destination.hostname)
      const isAssessmentHost = destination.hostname === 'assessment.valoriainstitute.com'
      if (!isLocalDevelopment && (destination.protocol !== 'https:' || !isAssessmentHost)) {
        throw new Error('The assessment destination is not an approved secure Valoria address. Please return to your dashboard.')
      }

      setStatus('redirecting')
      window.location.replace(destination.toString())
    } catch (cause) {
      handoffInFlightRef.current = false
      setStatus('error')
      setError(cause?.message || 'We could not open your saved assessment. Please try again.')
      if (cause?.status === 401) {
        window.location.replace('/login?returnTo=%2Fdashboard')
      }
    }
  }, [])

  return (
    <main className="valu-bridge" style={{ minHeight:'100vh', background:DARK, color:PARCHMENT, display:'grid', placeItems:'center', padding:'clamp(18px,4vw,40px)', fontFamily:"'Raleway',Arial,sans-serif" }}>
      <section aria-labelledby="handover-title" style={{ width:'100%', maxWidth:1040, padding:'clamp(22px,4vw,42px)', border:'1px solid rgba(201,168,76,.24)', borderRadius:16, background:MIDNIGHT, boxShadow:'0 24px 80px rgba(0,0,0,.24)' }}>
        <header style={{ maxWidth:760, marginBottom:28 }}>
          <div style={{ color:GOLD, fontSize:10, letterSpacing:'.22em', fontWeight:800 }}>VALORIA INSTITUTE</div>
          <div style={{ color:'rgba(247,244,238,.7)', fontFamily:"Georgia,'Times New Roman',serif", fontSize:14, marginTop:7 }}>Worth. Built.</div>
          <h1 id="handover-title" style={{ fontSize:'clamp(28px,5vw,43px)', fontWeight:500, lineHeight:1.12, margin:'22px 0 12px' }}>
            {status === 'error' ? 'We could not open your assessment.' : 'Your Valoria journey continues.'}
          </h1>
          <p role="status" aria-live="polite" style={{ color:MUTED, fontSize:14, lineHeight:1.8, margin:0 }}>
            {status === 'intro' && 'Your opening nine responses are saved to your account. Take a moment to see what comes next, then continue when you are ready.'}
            {status === 'connecting' && 'We are verifying your account and preparing a secure link to your saved assessment.'}
            {status === 'redirecting' && 'Your account is verified. Opening your saved assessment at Question 10.'}
            {status === 'error' && error}
          </p>
        </header>

        <div className="bridge-grid" aria-label="Your Valoria introduction">
          <article className="bridge-card" style={{ border:'1px solid rgba(201,168,76,.2)', background:'linear-gradient(145deg,rgba(201,168,76,.09),rgba(15,15,26,.2))', borderRadius:12, padding:'21px 20px', minHeight:190 }}>
            <div style={{ color:GOLD, fontSize:9, fontWeight:800, letterSpacing:'.18em', marginBottom:18 }}>01 · THE INSTITUTE</div>
            <div style={{ color:PARCHMENT, fontFamily:"Georgia,'Times New Roman',serif", fontSize:25, lineHeight:1.16, marginBottom:10 }}>Worth. Built.</div>
            <p style={{ color:MUTED, fontSize:12, lineHeight:1.75, margin:0 }}>A professional institute connecting capability, credibility and opportunity — with your VALU journey at its centre.</p>
          </article>

          <article className="bridge-card" style={{ border:'1px solid rgba(201,168,76,.2)', background:'rgba(15,15,26,.28)', borderRadius:12, padding:'21px 20px', minHeight:190 }}>
            <div style={{ color:GOLD, fontSize:9, fontWeight:800, letterSpacing:'.18em', marginBottom:18 }}>02 · YOUR VALU JOURNEY</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
              <strong style={{ color:PARCHMENT, fontSize:29, lineHeight:1 }}>09</strong>
              <span style={{ color:MUTED, fontSize:11 }}>/ 58 questions saved</span>
            </div>
            <div style={{ height:4, borderRadius:99, background:'rgba(247,244,238,.12)', overflow:'hidden', marginBottom:12 }}>
              <div style={{ width:'15.52%', height:'100%', background:GOLD, borderRadius:99 }} />
            </div>
            <p style={{ color:MUTED, fontSize:12, lineHeight:1.75, margin:0 }}>Continue from Question 10. Your first nine responses stay connected to your account — no need to repeat them.</p>
          </article>

          <article className="bridge-card" style={{ border:'1px solid rgba(201,168,76,.2)', background:'rgba(15,15,26,.28)', borderRadius:12, padding:'21px 20px', minHeight:190 }}>
            <div style={{ color:GOLD, fontSize:9, fontWeight:800, letterSpacing:'.18em', marginBottom:15 }}>{conversationState === 'live' ? '03 · LIVE NOW' : conversationState === 'registration-open' ? '03 · NEXT CONVERSATION' : '03 · COMING SOON'}</div>
            <div style={{ color:PARCHMENT, fontSize:16, lineHeight:1.35, fontWeight:700, marginBottom:9 }}>{nextConversation?.title || 'Conversations that shape professional standard.'}</div>
            <p style={{ color:MUTED, fontSize:10, lineHeight:1.6, margin:'0 0 13px' }}>{conversationDate} · Professional Standard Series</p>
            <a href="/events" style={{ color:GOLD, fontSize:9, fontWeight:800, letterSpacing:'.12em', textDecoration:'none' }}>EXPLORE VALORIA EVENTS →</a>
          </article>
        </div>

        {status === 'error' ? (
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:25 }}>
            <button type="button" onClick={beginHandoff} style={{ background:GOLD, color:DARK, border:0, borderRadius:999, padding:'13px 21px', fontSize:11, fontWeight:800, letterSpacing:'.08em', cursor:'pointer' }}>TRY AGAIN</button>
            <button type="button" onClick={() => window.location.assign('/dashboard')} style={{ background:'transparent', color:PARCHMENT, border:'1px solid rgba(201,168,76,.35)', borderRadius:999, padding:'13px 21px', fontSize:11, fontWeight:700, cursor:'pointer' }}>RETURN TO DASHBOARD</button>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:15, marginTop:26 }}>
            <button type="button" onClick={beginHandoff} disabled={status === 'connecting' || status === 'redirecting'} style={{ background:GOLD, color:DARK, border:0, borderRadius:999, padding:'15px 24px', fontSize:10, fontWeight:900, letterSpacing:'.12em', cursor:status === 'connecting' || status === 'redirecting' ? 'wait' : 'pointer', opacity:status === 'connecting' || status === 'redirecting' ? .72 : 1 }}>
              {status === 'connecting' ? 'VERIFYING YOUR ACCOUNT…' : status === 'redirecting' ? 'OPENING QUESTION 10…' : 'CONTINUE TO QUESTION 10 →'}
            </button>
            <span style={{ color:'rgba(247,244,238,.45)', fontSize:10, lineHeight:1.6 }}>Your saved responses remain unchanged.</span>
          </div>
        )}

        <div style={{ borderTop:'1px solid rgba(247,244,238,.09)', marginTop:28, paddingTop:15, color:'rgba(247,244,238,.36)', fontSize:9, letterSpacing:'.12em' }}>
          SECURE ACCOUNT HANDOVER · VALORIA INSTITUTE
        </div>
      </section>
      <style jsx>{`
        .bridge-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .bridge-card{animation:bridgeCardReveal .6s cubic-bezier(.2,.7,.2,1) both}
        .bridge-card:nth-child(2){animation-delay:.12s}
        .bridge-card:nth-child(3){animation-delay:.24s}
        @keyframes bridgeCardReveal{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:760px){.bridge-grid{grid-template-columns:1fr}.bridge-card{min-height:0!important}}
        @media(prefers-reduced-motion:reduce){.bridge-card{animation:none}}
      `}</style>
    </main>
  )
}
