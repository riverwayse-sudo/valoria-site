'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import VALUJourneyProgress from '@/components/VALUJourneyProgress'

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'

function AuthCallbackFlow() {
  const router = useRouter()
  const params = useSearchParams()
  const [message, setMessage] = useState('Confirming your email and securely opening your Valoria account…')
  const [failed, setFailed] = useState(false)
  const [assessmentBridge, setAssessmentBridge] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function finishConfirmation() {
      try {
        const code = params.get('code')
        let { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          const result = await supabase.auth.getSession()
          session = result.data.session
        }
        if (!session?.access_token) {
          await new Promise(resolve => setTimeout(resolve, 700))
          const result = await supabase.auth.getSession()
          session = result.data.session
        }
        if (!session?.access_token) throw new Error('Your email link was accepted, but a secure session was not created. Please request a fresh confirmation email.')

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw userError || new Error('Your account session could not be verified.')

        const identityHash = params.get('identity_hash') || sessionStorage.getItem('pending_identity_hash')
        const pendingTasterId = params.get('pending_taster_id') || localStorage.getItem('pending_taster_id')

        if (identityHash) {
          setMessage('Email confirmed. Linking your VALU assessment to your account…')
          const linkRes = await fetch('/api/link-assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ identity_hash: identityHash }),
          })
          const data = await linkRes.json().catch(() => ({}))
          if (!linkRes.ok) throw new Error(data.error || 'Your assessment could not be linked yet.')
          sessionStorage.removeItem('pending_identity_hash')
          setMessage('Email confirmed. You’re signed in and your VALU assessment is connected.')
          await new Promise(resolve => setTimeout(resolve, 900))
          if (!cancelled) router.replace('/dashboard?welcome=profile')
          return
        }

        if (pendingTasterId) {
          setAssessmentBridge(true)
          setMessage('Email confirmed. Connecting your saved opening nine…')
          const linkRes = await fetch('/api/link-taster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ taster_id: pendingTasterId, name: localStorage.getItem('pending_taster_name') || undefined, role: localStorage.getItem('pending_taster_role') || undefined }),
          })
          const data = await linkRes.json().catch(() => ({}))
          if (!linkRes.ok) throw new Error(data.error || 'Your VALU result could not be linked yet.')
          // Preserve the exact linked taster until the user chooses to continue
          // from the dashboard. The dashboard is the stable, authenticated landing
          // page; assessment handoff happens only after an explicit user action.
          localStorage.removeItem('pending_taster_id')
          localStorage.removeItem('pending_taster_name')
          localStorage.removeItem('pending_taster_role')
          setMessage('Email confirmed. You’re signed in and your opening nine are connected. Your dashboard is ready; continue at Question 10.')
          await new Promise(resolve => setTimeout(resolve, 1400))
          if (!cancelled) router.replace('/dashboard?welcome=profile')
          return
        }

        const { data: buyerProfile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
        if (cancelled) return
        setMessage(buyerProfile ? 'Email confirmed. You’re signed in. Taking you to your dashboard…' : 'Email confirmed. You’re signed in. Taking you to your dashboard…')
        await new Promise(resolve => setTimeout(resolve, 900))
        if (!cancelled) router.replace('/dashboard?welcome=profile')
      } catch (error) {
        if (cancelled) return
        setFailed(true)
        setMessage(error?.message || 'We could not finish signing you in. Please request a new confirmation email.')
      }
    }
    finishConfirmation()
    return () => { cancelled = true }
  }, [params, router])

  return (
    <main style={{ minHeight: '100vh', background: DARK, color: PARCHMENT, display: 'grid', placeItems: 'center', padding: 24, fontFamily: "'Raleway', Arial, sans-serif" }}>
      <section style={{ width: '100%', maxWidth: 520, padding: 'clamp(28px, 5vw, 52px)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 16, background: '#1A1A2E', textAlign: 'center' }}>
        <div style={{ margin: '0 auto 30px', textAlign: 'center' }} aria-label="Valoria Institute">
          <div style={{ color: GOLD, fontSize: 12, letterSpacing: '.24em', fontWeight: 800 }}>VALORIA INSTITUTE</div>
          <div style={{ color: PARCHMENT, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, marginTop: 7 }}>Worth. Built.</div>
        </div>
        <VALUJourneyProgress stage="bridge" />
        <div aria-live="polite" role={failed ? 'alert' : 'status'}>
          <div style={{ color: GOLD, fontSize: 11, letterSpacing: '.18em', fontWeight: 700, marginBottom: 14 }}>{failed ? 'CONFIRMATION NEEDS ATTENTION' : 'VALORIA ACCOUNT'}</div>
          <h1 style={{ fontSize: 30, lineHeight: 1.2, fontWeight: 500, margin: '0 0 14px' }}>{failed ? 'We could not finish the handoff.' : 'You’re almost there.'}</h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#EDE8DC', margin: '0 0 26px' }}>{message}</p>
        </div>
        {assessmentBridge && !failed && <div aria-label="Your next steps" style={{display:'grid',gridTemplateColumns:'1fr',gap:9,textAlign:'left',marginTop:8}}>
          <div style={{display:'flex',gap:12,alignItems:'flex-start',padding:'12px 14px',border:'1px solid rgba(201,168,76,.22)',borderRadius:8}}>
            <span style={{color:GOLD,fontWeight:800,fontSize:11}}>✓</span><span><strong style={{display:'block',fontSize:12,color:PARCHMENT}}>Email confirmed and account connected</strong><small style={{display:'block',fontSize:11,color:'rgba(247,244,238,.55)',lineHeight:1.6,marginTop:3}}>Your saved opening nine are attached to your Valoria account.</small></span>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'flex-start',padding:'12px 14px',border:'1px solid rgba(201,168,76,.22)',borderRadius:8}}>
            <span style={{color:GOLD,fontWeight:800,fontSize:11}}>02</span><span><strong style={{display:'block',fontSize:12,color:PARCHMENT}}>Return to your dashboard</strong><small style={{display:'block',fontSize:11,color:'rgba(247,244,238,.55)',lineHeight:1.6,marginTop:3}}>You’ll already be signed in. No separate login is needed.</small></span>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'flex-start',padding:'12px 14px',border:'1px solid rgba(201,168,76,.22)',borderRadius:8}}>
            <span style={{color:GOLD,fontWeight:800,fontSize:11}}>03</span><span><strong style={{display:'block',fontSize:12,color:PARCHMENT}}>Continue at Question 10</strong><small style={{display:'block',fontSize:11,color:'rgba(247,244,238,.55)',lineHeight:1.6,marginTop:3}}>Complete the remaining 49 questions to receive your official VALU Index.</small></span>
          </div>
        </div>}
        {failed && <a href="/login" style={{ display: 'inline-block', padding: '14px 24px', background: GOLD, color: '#1A1A2E', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 12, letterSpacing: '.08em' }}>CONTINUE TO ACCOUNT SUPPORT →</a>}
      </section>
    </main>
  )
}

export default function AuthCallbackPage() {
  return <Suspense fallback={<main style={{ minHeight: '100vh', background: DARK, color: PARCHMENT, display: 'grid', placeItems: 'center' }}>Confirming your email…</main>}><AuthCallbackFlow /></Suspense>
}
