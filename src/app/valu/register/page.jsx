'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PASSWORD_POLICY, passwordPolicyMessage, validatePassword } from '@/lib/password-policy'

const GOLD = '#C9A84C'
const DARK = '#0F0F1A'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DIM = 'rgba(247,244,238,.62)'
const EXPERIENCE = [
  ['0-3', '0 – 3 years'],
  ['4-8', '4 – 8 years'],
  ['9-15', '9 – 15 years'],
  ['15+', '15+ years'],
]

function emailRedirect() {
  return `${window.location.origin}/auth/callback?valu_taster=1`
}

export default function ValuRegisterPage() {
  const [mode, setMode] = useState('signup')
  const [form, setForm] = useState({
    name: '', email: '', role: '', experience: '', organisation: '', interest: '',
    password: '', confirm: '', privacy: false, marketing: false,
  })
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    let active = true
    async function resumeConfirmedAccount() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!active || !user || !user.email_confirmed_at) return
        const metadata = user.user_metadata || {}
        const name = metadata.full_name || metadata.display_name || ''
        const role = metadata.role || ''
        const experience = metadata.experience || ''
        if (metadata.valu_taster_signup === true && name && role && experience && metadata.privacy_acknowledged === true) {
          window.location.replace('/valu/assessment/')
          return
        }
        setForm(current => ({
          ...current,
          name,
          email: user.email || current.email,
          role,
          experience,
          organisation: metadata.organisation || '',
          interest: metadata.interest || '',
          privacy: metadata.privacy_acknowledged === true,
          marketing: metadata.marketing_consent === true,
        }))
        setMode('complete')
      } catch {
        // A public visitor or an expired browser session remains on the signup form.
      }
    }
    resumeConfirmedAccount()
    return () => { active = false }
  }, [])

  const valid = useMemo(() => Boolean(
    form.name.trim() && form.email.trim() && form.role.trim() && form.experience &&
    (mode === 'complete' || (mode === 'signin' ? form.password.length > 0 : form.password.length >= PASSWORD_POLICY.minLength)) &&
    (mode === 'signin' || form.password === form.confirm) &&
    form.privacy
  ), [form, mode])

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (loading || !valid) return
    setLoading(true)
    setError('')
    setResendMessage('')
    try {
      if (mode === 'signup') {
        const passwordCheck = validatePassword(form.password)
        if (!passwordCheck.valid) throw new Error(passwordCheck.errors.join(' '))
        const { data, error: signupError } = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          options: {
            emailRedirectTo: emailRedirect(),
            data: {
              display_name: form.name.trim(),
              full_name: form.name.trim(),
              user_type: 'professional',
              role: form.role.trim(),
              experience: form.experience,
              organisation: form.organisation.trim(),
              interest: form.interest,
              privacy_acknowledged: true,
              marketing_consent: form.marketing,
              valu_taster_signup: true,
            },
          },
        })
        if (signupError) throw signupError
        if (!data?.user?.id) throw new Error('Your account could not be created. Please try again.')
        if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setMode('signin')
          throw new Error('An account already exists for this email. Sign in to continue with your Taster registration.')
        }
        if (data.session?.access_token) {
          window.location.replace('/auth/callback?valu_taster=1')
          return
        }
        setConfirmation(true)
        return
      }

      if (mode === 'signin') {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        })
        if (loginError) throw loginError
      }
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: form.name.trim(),
          full_name: form.name.trim(),
          user_type: 'professional',
          role: form.role.trim(),
          experience: form.experience,
          organisation: form.organisation.trim(),
          interest: form.interest,
          privacy_acknowledged: true,
          marketing_consent: form.marketing,
          valu_taster_signup: true,
        },
      })
      if (updateError) throw updateError
      window.location.replace('/auth/callback?valu_taster=1')
    } catch (err) {
      if (mode === 'signin' && /email not confirmed|confirm your email/i.test(err?.message || '')) {
        setConfirmation(true)
        setError('Your account exists, but your email still needs confirmation. Request a fresh link below.')
      } else {
        setError(err?.message || 'We could not complete your account setup. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function resendConfirmation() {
    setLoading(true)
    setResendMessage('')
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: form.email.trim().toLowerCase(),
        options: { emailRedirectTo: emailRedirect() },
      })
      if (resendError) throw resendError
      setResendMessage('A fresh confirmation email has been requested. Check your inbox and spam folder.')
    } catch (err) {
      setResendMessage(err?.message || 'We could not resend the confirmation email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={S.page}>
      <section style={S.card}>
        <Link href="/" style={S.brand}>VALORIA INSTITUTE <span>·</span> Worth. Built.</Link>
        {confirmation ? (
          <>
            <div style={S.eyebrow}>EMAIL CONFIRMATION REQUIRED</div>
            <h1 style={S.title}>One confirmation before you <em>begin.</em></h1>
            <p style={S.copy}>{error || <>We sent a confirmation link to <strong>{form.email.trim().toLowerCase()}</strong>. Confirm your email to activate your Valoria account. You will then return directly to the VALU Index Taster.</>}</p>
            <div style={S.steps}>
              <p><b>01</b> Confirm your email address</p>
              <p><b>02</b> Complete your VALU Index Taster</p>
              <p><b>03</b> Continue to your dashboard and the separate full VALU Index</p>
            </div>
            <button type="button" onClick={resendConfirmation} disabled={loading} style={S.button}>{loading ? 'REQUESTING…' : 'RESEND CONFIRMATION EMAIL'}</button>
            {resendMessage && <p role="status" style={S.note}>{resendMessage}</p>}
          </>
        ) : (
          <>
            <div style={S.eyebrow}>{mode === 'signup' ? 'PROFESSIONAL ACCOUNT' : mode === 'signin' ? 'WELCOME BACK' : 'COMPLETE YOUR PROFESSIONAL DETAILS'}</div>
            <h1 style={S.title}>{mode === 'signup' ? <>Create your account.<br/><em>Then begin.</em></> : mode === 'signin' ? <>Sign in to begin your<br/><em>VALU journey.</em></> : <>Your account is active.<br/><em>Complete your details.</em></>}</h1>
            <p style={S.copy}>Create and confirm your Valoria account before starting the VALU Index Taster. Your Taster remains separate from the full VALU Index, which you can continue from your dashboard.</p>
            <form onSubmit={submit} style={S.form}>
              <label style={S.label}>FULL NAME<input required maxLength={200} autoComplete="name" value={form.name} onChange={e=>update('name',e.target.value)} style={S.input} placeholder="Your full professional name"/></label>
              <label style={S.label}>EMAIL ADDRESS<input required type="email" maxLength={254} autoComplete="email" value={form.email} disabled={mode==='complete'} onChange={e=>update('email',e.target.value)} style={S.input} placeholder="you@example.com"/></label>
              <label style={S.label}>CURRENT ROLE<input required maxLength={160} autoComplete="organization-title" value={form.role} onChange={e=>update('role',e.target.value)} style={S.input} placeholder="e.g. Managing Director"/></label>
              <label style={S.label}>PROFESSIONAL EXPERIENCE<select required value={form.experience} onChange={e=>update('experience',e.target.value)} style={S.input}><option value="">Select your experience</option>{EXPERIENCE.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
              <details style={S.optional}><summary>Optional professional details</summary>
                <label style={S.label}>ORGANISATION<input maxLength={180} value={form.organisation} onChange={e=>update('organisation',e.target.value)} style={S.input} placeholder="Your organisation"/></label>
                <label style={S.label}>AREA OF INTEREST<select value={form.interest} onChange={e=>update('interest',e.target.value)} style={S.input}><option value="">Select an interest</option><option>Professional visibility</option><option>Career and leadership opportunities</option><option>Speaking and facilitation</option><option>Learning and development</option><option>Other</option></select></label>
              </details>
              {mode !== 'complete' && <label style={S.label}>PASSWORD<input required type="password" minLength={mode==='signup'?PASSWORD_POLICY.minLength:1} autoComplete={mode==='signup'?'new-password':'current-password'} value={form.password} onChange={e=>update('password',e.target.value)} style={S.input} placeholder={mode==='signup'?`Minimum ${PASSWORD_POLICY.minLength} characters`:'Your password'}/></label>}
              {mode==='signup' && <><p style={S.note}>{passwordPolicyMessage()}</p><label style={S.label}>CONFIRM PASSWORD<input required type="password" minLength={PASSWORD_POLICY.minLength} autoComplete="new-password" value={form.confirm} onChange={e=>update('confirm',e.target.value)} style={S.input} placeholder="Enter your password again"/></label></>}
              {mode==='signup' && <label style={S.check}><input type="checkbox" checked={form.privacy} onChange={e=>update('privacy',e.target.checked)} required/> <span>I acknowledge that Valoria will process my details to administer my assessment and manage my journey. Read the <Link href="/privacypolicy" style={S.link}>Privacy Notice</Link>.</span></label>}
              {mode==='signin' && <label style={S.check}><input type="checkbox" checked={form.privacy} onChange={e=>update('privacy',e.target.checked)} required/> <span>I acknowledge the <Link href="/privacypolicy" style={S.link}>Privacy Notice</Link> for this assessment journey.</span></label>}
              <label style={S.check}><input type="checkbox" checked={form.marketing} onChange={e=>update('marketing',e.target.checked)}/> <span>Send me relevant Valoria updates and opportunities by email. Optional.</span></label>
              {error && <div role="alert" style={S.error}>{error}</div>}
              <button type="submit" disabled={loading||!valid} style={{...S.button,opacity:(loading || !valid) ? 0.55 : 1}}>{loading ? 'PLEASE WAIT…' : mode==='signup' ? 'CREATE ACCOUNT & CONTINUE →' : mode==='signin' ? 'SIGN IN & CONTINUE →' : 'SAVE DETAILS & BEGIN →'}</button>
            </form>
            {mode !== 'complete' && <p style={S.switch}>{mode==='signup'?'Already have a Valoria account?':'New to Valoria?'} <button type="button" onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('')}}>{mode==='signup'?'Sign in':'Create an account'}</button></p>}
          </>
        )}
      </section>
    </main>
  )
}

const S = {
  page:{minHeight:'100vh',background:DARK,color:PARCHMENT,display:'grid',placeItems:'center',padding:'36px 16px',fontFamily:"'Raleway',sans-serif"},
  card:{width:'100%',maxWidth:560,padding:'clamp(24px,4vw,42px)',border:'1px solid rgba(201,168,76,.2)',borderRadius:16,background:MIDNIGHT,boxShadow:'0 24px 80px rgba(0,0,0,.28)'},
  brand:{display:'inline-block',marginBottom:30,color:GOLD,textDecoration:'none',fontSize:11,fontWeight:800,letterSpacing:'.16em'},
  eyebrow:{fontSize:10,fontWeight:800,letterSpacing:'.16em',color:GOLD,marginBottom:14},
  title:{fontSize:'clamp(32px,5vw,48px)',fontWeight:500,lineHeight:1.08,letterSpacing:'-.035em',margin:'0 0 14px'},
  copy:{fontSize:13,lineHeight:1.75,color:DIM,margin:'0 0 22px'},
  form:{display:'grid',gap:13},
  label:{display:'grid',gap:7,fontSize:10,fontWeight:800,letterSpacing:'.1em',color:'rgba(247,244,238,.7)'},
  input:{width:'100%',boxSizing:'border-box',padding:'13px 14px',border:'1px solid rgba(201,168,76,.2)',borderRadius:7,background:'rgba(255,255,255,.04)',color:PARCHMENT,fontFamily:'inherit',fontSize:14,outline:'none'},
  optional:{padding:'12px 14px',border:'1px solid rgba(201,168,76,.16)',borderRadius:8,color:DIM,fontSize:12},
  check:{display:'flex',alignItems:'flex-start',gap:10,fontSize:11,lineHeight:1.6,color:DIM},
  link:{color:GOLD,textDecoration:'underline'},
  button:{width:'100%',padding:'15px 18px',border:0,borderRadius:999,background:GOLD,color:MIDNIGHT,fontSize:11,fontWeight:900,letterSpacing:'.12em',cursor:'pointer'},
  note:{fontSize:11,lineHeight:1.6,color:DIM,margin:'-4px 0 0'},
  switch:{fontSize:12,color:DIM,textAlign:'center',margin:'20px 0 0'},
  steps:{padding:'14px 16px',border:'1px solid rgba(201,168,76,.2)',borderRadius:9,margin:'18px 0 22px',color:DIM,fontSize:12},
  error:{padding:12,border:'1px solid rgba(216,90,48,.35)',borderRadius:8,color:'#F3A0A0',fontSize:12,lineHeight:1.5},
}
