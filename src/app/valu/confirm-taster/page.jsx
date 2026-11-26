'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function ConfirmationRequest() {
  const params = useSearchParams()
  const tasterId = params.get('taster_id') || ''
  const [status, setStatus] = useState('sending')
  const [message, setMessage] = useState('Your Taster is complete. We are securely requesting your email confirmation link…')

  useEffect(() => {
    let cancelled = false
    async function requestConfirmation() {
      try {
        const response = await fetch('/api/valu-taster/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ taster_id: tasterId }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'We could not request your confirmation email.')
        if (cancelled) return
        if (data.already_confirmed) {
          setStatus('confirmed')
          setMessage('This account is already confirmed. Sign in to connect your completed Taster to your dashboard.')
        } else {
          setStatus('sent')
          setMessage('Your Taster is complete. We sent a confirmation link to the email address you registered with. Open it on this device to activate your account and connect your result.')
        }
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setMessage(error?.message || 'We could not request your confirmation email. Your completed Taster remains saved.')
      }
    }
    if (!tasterId) {
      setStatus('error')
      setMessage('The completed Taster reference is missing. Your responses may still be saved; contact Valoria support for assistance.')
    } else {
      requestConfirmation()
    }
    return () => { cancelled = true }
  }, [tasterId])

  return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',display:'grid',placeItems:'center',padding:24,fontFamily:'Raleway,Arial,sans-serif'}}>
    <section style={{width:'100%',maxWidth:560,padding:'clamp(24px,5vw,44px)',border:'1px solid rgba(201,168,76,.25)',borderRadius:14,background:'#1A1A2E'}}>
      <div style={{color:'#C9A84C',fontSize:10,fontWeight:800,letterSpacing:'.18em',marginBottom:14}}>VALORIA INSTITUTE</div>
      <h1 style={{fontSize:'clamp(32px,6vw,48px)',fontWeight:600,lineHeight:1.1,margin:'0 0 18px'}}>Your Taster is <em>complete.</em></h1>
      <p role="status" aria-live="polite" style={{color:'rgba(247,244,238,.72)',fontSize:14,lineHeight:1.8}}>{message}</p>
      {status === 'sending' && <p style={{color:'#C9A84C',fontSize:11}}>SECURING YOUR NEXT STEP…</p>}
      {status === 'error' && <button onClick={() => window.location.reload()} style={{marginTop:12,padding:'13px 22px',border:0,borderRadius:99,background:'#C9A84C',fontWeight:800}}>RETRY</button>}
      {status === 'sent' && <p style={{color:'rgba(247,244,238,.48)',fontSize:11,lineHeight:1.7}}>Check your inbox and spam folder. Your full VALU Index remains a separate next step after account confirmation.</p>}
      {status === 'confirmed' && <Link href="/login?returnTo=%2Fdashboard" style={{display:'inline-block',marginTop:12,color:'#C9A84C'}}>SIGN IN TO CONTINUE</Link>}
    </section>
  </main>
}

export default function ValuTasterCompletePage() {
  return <Suspense fallback={<main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',display:'grid',placeItems:'center'}}>Preparing confirmation…</main>}><ConfirmationRequest /></Suspense>
}
