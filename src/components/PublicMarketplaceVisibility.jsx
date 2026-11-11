'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Public display is opt-in; the server and RLS policy remain the final publication gates.

const GOLD = '#C9A84C'
const DARK = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const MUTED = 'rgba(247,244,238,.62)'

export default function PublicMarketplaceVisibility() {
  const [selected, setSelected] = useState(false)
  const [saved, setSaved] = useState(false)
  const [listingStatus, setListingStatus] = useState('unlisted')
  const [eligible, setEligible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error('Please sign in again to manage your visibility preference.')
        const response = await fetch('/api/profile/public-visibility', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        const data = await response.json().catch(() => ({}))
        if (response.status === 403) { if (active) setHidden(true); return }
        if (!response.ok) throw new Error(data.error || 'Could not load your visibility preference.')
        if (!active) return
        setSelected(data.consented === true)
        setSaved(data.consented === true)
        setListingStatus(data.listing_status || 'unlisted')
        setEligible(data.eligible_for_listing === true)
      } catch (err) {
        if (active) setError(err.message || 'Could not load your visibility preference.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  async function savePreference() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.')
      const response = await fetch('/api/profile/public-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ consent: selected }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not save your visibility preference.')
      setSaved(data.consented === true)
      setListingStatus(data.listing_status || 'unlisted')
      setEligible(data.eligible_for_listing === true)
      setMessage(data.message || (selected ? 'Your preference has been saved.' : 'Your profile is now private.'))
    } catch (err) {
      setError(err.message || 'Could not save your visibility preference.')
    } finally {
      setSaving(false)
    }
  }

  if (hidden) return null

  const changed = selected !== saved
  const statusText = saved
    ? listingStatus === 'listed' && eligible
      ? 'Permission recorded. Your profile may appear publicly once all marketplace checks pass.'
      : 'Permission recorded. Your profile remains private until Valoria listing and eligibility checks are satisfied.'
    : 'Your profile is not approved for public marketplace display. Registered-only access remains in place.'

  return (
    <section id="marketplace-visibility" style={{ background:DARK, border:'1px solid rgba(201,168,76,.24)', padding:'22px 22px 20px', marginBottom:22 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
        <span aria-hidden="true" style={{ width:7, height:7, borderRadius:'50%', background:GOLD, boxShadow:'0 0 0 4px rgba(201,168,76,.12)' }}/>
        <span style={{ color:GOLD, fontSize:9, fontWeight:800, letterSpacing:'.17em' }}>MARKETPLACE VISIBILITY</span>
      </div>
      <h3 style={{ margin:'0 0 9px', color:PARCHMENT, fontSize:19, fontWeight:600, letterSpacing:'-.02em' }}>Choose how your professional profile can be discovered.</h3>
      <p style={{ margin:'0 0 17px', color:MUTED, fontSize:12, lineHeight:1.75 }}>
        Public visibility is optional. You can keep your profile restricted to registered users or give Valoria permission to display the selected professional information below.
      </p>

      <label style={{ display:'flex', alignItems:'flex-start', gap:11, cursor:loading || saving ? 'wait' : 'pointer', padding:'15px 14px', border:'1px solid rgba(201,168,76,.2)', background:selected?'rgba(201,168,76,.07)':'rgba(247,244,238,.025)' }}>
        <input type="checkbox" checked={selected} disabled={loading || saving} onChange={event => { setSelected(event.target.checked); setMessage('') }} style={{ width:17, height:17, marginTop:2, flexShrink:0, accentColor:GOLD }}/>
        <span style={{ color:PARCHMENT, fontSize:12, lineHeight:1.75 }}>
          {PUBLIC_PROFILE_CONSENT_TEXT}
        </span>
      </label>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', marginTop:15 }}>
        <p style={{ flex:'1 1 260px', margin:0, color:'rgba(247,244,238,.43)', fontSize:10, lineHeight:1.6 }}>{loading ? 'Checking your saved preference…' : statusText}</p>
        <button type="button" onClick={savePreference} disabled={loading || saving || !changed} style={{ minHeight:40, padding:'0 17px', border:'1px solid '+(changed?'#C9A84C':'rgba(201,168,76,.22)'), background:changed?GOLD:'transparent', color:changed?DARK:'rgba(247,244,238,.35)', fontSize:9, fontWeight:800, letterSpacing:'.12em', cursor:changed?'pointer':'not-allowed' }}>
          {saving ? 'SAVING…' : changed ? 'SAVE VISIBILITY PREFERENCE' : saved ? 'PREFERENCE SAVED' : 'NO CHANGES'}
        </button>
      </div>
      {message && <p role="status" style={{ margin:'12px 0 0', color:'#B8D7C0', fontSize:11, lineHeight:1.6 }}>{message}</p>}
      {error && <p role="alert" style={{ margin:'12px 0 0', color:'#F09595', fontSize:11, lineHeight:1.6 }}>{error}</p>}
    </section>
  )
}
