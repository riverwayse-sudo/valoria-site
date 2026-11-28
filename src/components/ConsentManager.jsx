'use client'

import { useEffect, useRef, useState } from 'react'

const COOKIE_NAME = 'vi_optional_tracking_consent'
const EMPTY = { analytics: false, marketing: false }

function readConsent() {
  const entry = document.cookie.split('; ').find(value => value.startsWith(`${COOKIE_NAME}=`))
  if (!entry) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)))
    if (typeof parsed.analytics !== 'boolean' || typeof parsed.marketing !== 'boolean') return null
    return { analytics: parsed.analytics, marketing: parsed.marketing }
  } catch {
    return null
  }
}

function saveConsent(value) {
  const encoded = encodeURIComponent(JSON.stringify(value))
  document.cookie = `${COOKIE_NAME}=${encoded}; Path=/; Max-Age=15552000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`
  window.dispatchEvent(new CustomEvent('valoria:tracking-consent-updated', { detail: value }))
}

function loadAnalytics(measurementId) {
  if (!measurementId || window.__valoriaAnalyticsLoaded) return
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  window.gtag('config', measurementId, { anonymize_ip: true })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  script.dataset.valoriaAnalytics = 'true'
  document.head.appendChild(script)
  window.__valoriaAnalyticsLoaded = true
}

function loadMarketing(pixelId) {
  if (!pixelId || window.__valoriaMarketingLoaded) return
  !(function(f,b,e,v,n,t,s){
    if(f.fbq)return
    n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}
    if(!f._fbq)f._fbq=n
    n.push=n;n.loaded=true;n.version='2.0';n.queue=[]
    t=b.createElement(e);t.async=true;t.src=v
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
  })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')
  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
  window.__valoriaMarketingLoaded = true
}

export default function ConsentManager({ gaMeasurementId = null, metaPixelId = null }) {
  const [consent, setConsent] = useState(null)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [draft, setDraft] = useState(EMPTY)
  const dialogRef = useRef(null)

  useEffect(() => {
    const stored = readConsent()
    setConsent(stored)
    setDraft(stored || EMPTY)
    const openPreferences = () => {
      setDraft(readConsent() || EMPTY)
      setPreferencesOpen(true)
    }
    window.addEventListener('valoria:open-cookie-preferences', openPreferences)
    return () => window.removeEventListener('valoria:open-cookie-preferences', openPreferences)
  }, [])

  useEffect(() => {
    if (!consent) return
    if (consent.analytics) loadAnalytics(gaMeasurementId)
    else if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' })
    if (consent.marketing) loadMarketing(metaPixelId)
    else if (typeof window.fbq === 'function') window.fbq('consent', 'revoke')
  }, [consent, gaMeasurementId, metaPixelId])

  useEffect(() => {
    if (!preferencesOpen) return
    const previousFocus = document.activeElement
    const dialog = dialogRef.current
    dialog?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setPreferencesOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus?.()
    }
  }, [preferencesOpen])

  function choose(value) {
    saveConsent(value)
    setConsent(value)
    setDraft(value)
    setPreferencesOpen(false)
  }

  if (consent === null && !preferencesOpen) {
    return (
      <aside aria-label="Cookie preferences" style={styles.banner}>
        <div style={styles.copy}>
          <strong style={styles.heading}>Your privacy matters.</strong>
          <p style={styles.description}>Essential cookies keep the site working. With your permission, we also use analytics and marketing technologies to understand site use and measure campaigns. Optional tracking stays off until you choose.</p>
        </div>
        <div style={styles.actions}>
          <button type="button" onClick={() => choose({ analytics: true, marketing: true })} style={styles.primary}>ACCEPT ALL</button>
          <button type="button" onClick={() => choose(EMPTY)} style={styles.secondary}>REJECT OPTIONAL</button>
          <button type="button" onClick={() => setPreferencesOpen(true)} style={styles.textButton}>PREFERENCES</button>
        </div>
      </aside>
    )
  }

  return preferencesOpen ? (
    <div style={styles.backdrop} role="presentation">
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="cookie-title" style={styles.dialog}>
        <p style={styles.kicker}>VALORIA INSTITUTE · PRIVACY</p>
        <h2 id="cookie-title" style={styles.dialogTitle}>Cookie preferences</h2>
        <p style={styles.description}>Choose whether Valoria may use optional analytics and marketing technologies. Essential cookies are always active because they support core site functions.</p>
        <div style={styles.preferenceRow}>
          <div><strong>Essential</strong><p style={styles.preferenceDescription}>Required for security and core site operation.</p></div>
          <span style={styles.alwaysOn}>ALWAYS ON</span>
        </div>
        <label style={styles.preferenceRow}>
          <span><strong>Analytics</strong><p style={styles.preferenceDescription}>Allows Google Analytics to measure visits and site interactions.</p></span>
          <input type="checkbox" checked={draft.analytics} onChange={event => setDraft(value => ({ ...value, analytics: event.target.checked }))} />
        </label>
        <label style={styles.preferenceRow}>
          <span><strong>Marketing</strong><p style={styles.preferenceDescription}>Allows Meta Pixel to measure campaign activity.</p></span>
          <input type="checkbox" checked={draft.marketing} onChange={event => setDraft(value => ({ ...value, marketing: event.target.checked }))} />
        </label>
        <div style={styles.actions}>
          <button type="button" onClick={() => choose(draft)} style={styles.primary}>SAVE MY CHOICES</button>
          <button type="button" onClick={() => choose(EMPTY)} style={styles.secondary}>REJECT OPTIONAL</button>
          <button type="button" onClick={() => setPreferencesOpen(false)} style={styles.textButton}>CANCEL</button>
        </div>
      </section>
    </div>
  ) : null
}

const styles = {
  banner: { position:'fixed', zIndex:30000, left:20, right:20, bottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap', padding:'20px 22px', background:'#FAFAF7', color:'#1A1A2E', border:'1px solid #D4C9A8', boxShadow:'0 12px 40px rgba(0,0,0,.22)', fontFamily:"'Raleway',sans-serif" },
  copy: { flex:'1 1 340px', maxWidth:720 },
  heading: { fontSize:15, fontWeight:800, letterSpacing:'.02em' },
  description: { margin:'7px 0 0', color:'#55535D', fontSize:12, lineHeight:1.65 },
  actions: { display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' },
  primary: { minHeight:40, padding:'0 16px', border:0, borderRadius:999, background:'#C9A84C', color:'#1A1A2E', fontSize:10, fontWeight:900, letterSpacing:'.1em', cursor:'pointer' },
  secondary: { minHeight:40, padding:'0 16px', border:'1px solid #B8B2A4', borderRadius:999, background:'transparent', color:'#2E2E4A', fontSize:10, fontWeight:800, letterSpacing:'.08em', cursor:'pointer' },
  textButton: { minHeight:40, padding:'0 10px', border:0, background:'transparent', color:'#2E2E4A', fontSize:10, fontWeight:800, letterSpacing:'.08em', textDecoration:'underline', cursor:'pointer' },
  backdrop: { position:'fixed', zIndex:30001, inset:0, display:'grid', placeItems:'center', padding:20, background:'rgba(10,10,20,.72)', fontFamily:"'Raleway',sans-serif" },
  dialog: { width:'min(100%,560px)', padding:28, background:'#FAFAF7', color:'#1A1A2E', border:'1px solid #D4C9A8', boxShadow:'0 20px 60px rgba(0,0,0,.3)' },
  kicker: { margin:0, color:'#806020', fontSize:9, fontWeight:900, letterSpacing:'.16em' },
  dialogTitle: { margin:'10px 0', fontSize:25, fontWeight:800 },
  preferenceRow: { display:'flex', justifyContent:'space-between', alignItems:'center', gap:18, padding:'15px 0', borderTop:'1px solid #E5E0D5', fontSize:13 },
  preferenceDescription: { margin:'4px 0 0', color:'#66636D', fontSize:11, lineHeight:1.55 },
  alwaysOn: { color:'#5D5A64', fontSize:9, fontWeight:900, letterSpacing:'.08em', whiteSpace:'nowrap' },
}
