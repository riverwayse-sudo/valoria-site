'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AssessmentStartPage() {
  const [message, setMessage] = useState('Preparing your secure assessment session…')

  useEffect(() => {
    let cancelled = false
    async function prepare() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!session?.access_token || !session.user) {
          window.location.replace('/login?returnTo=%2Fdashboard')
          return
        }
        // The assessment is served from this same origin. Keep the short-lived
        // bearer token in tab-scoped storage, never in a URL or query string.
        sessionStorage.setItem('valoria-assessment-auth', JSON.stringify({
          access_token: session.access_token,
          user: {
            id: session.user.id,
            email: session.user.email || '',
            display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '',
          },
          saved_at: Date.now(),
        }))
        if (!cancelled) window.location.replace('/valu/assessment/')
      } catch (error) {
        if (cancelled) return
        setMessage(error?.message || 'We could not prepare your secure assessment session. Please return to your dashboard and try again.')
      }
    }
    prepare()
    return () => { cancelled = true }
  }, [])

  return <main role="status" style={{ minHeight:'100vh', display:'grid', placeItems:'center', padding:24, background:'#0F0F1A', color:'#F7F4EE', fontFamily:'Raleway, sans-serif' }}>
    <section style={{ width:'100%', maxWidth:480, padding:32, background:'#1A1A2E', border:'1px solid rgba(201,168,76,.22)', borderRadius:14, textAlign:'center' }}>
      <div style={{ color:'#C9A84C', fontSize:11, fontWeight:800, letterSpacing:'.18em', marginBottom:16 }}>VALORIA INSTITUTE</div>
      <p style={{ color:'rgba(247,244,238,.72)', fontSize:14, lineHeight:1.7 }}>{message}</p>
      <a href="/dashboard" style={{ display:'inline-block', marginTop:18, color:'#C9A84C', fontSize:12 }}>Return to dashboard</a>
    </section>
  </main>
}
