'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.58)'

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState([])
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }, [])

  const loadAdmins = useCallback(async () => {
    setError('')
    try {
      const token = await getToken()
      if (!token) {
        window.location.href = '/admin/login'
        return
      }
      const response = await fetch('/api/admin/create-admin', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/admin/login?error=unauthorized'
        return
      }
      if (!response.ok) throw new Error(data.error || 'Could not load administrators.')
      setAdmins(data.admins || [])
    } catch (err) {
      setError(err.message || 'Could not load administrators.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => { loadAdmins() }, [loadAdmins])

  async function inviteAdmin(event) {
    event.preventDefault()
    setSending(true)
    setError('')
    setNotice('')
    try {
      const token = await getToken()
      if (!token) throw new Error('Your admin session has expired. Sign in again.')
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), fullName: fullName.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'The administrator invitation could not be sent.')
      setNotice(data.promoted
        ? 'This email already had a Valoria account. Admin access has been granted to that account.'
        : 'Invitation sent. The recipient must use the invitation email to set a password before signing in.')
      setEmail('')
      setFullName('')
      await loadAdmins()
    } catch (err) {
      setError(err.message || 'The administrator invitation could not be sent.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main style={S.page}>
      <header style={S.header}>
        <Link href="/admin" style={S.back}>← ADMIN CONTROL CENTRE</Link>
        <span style={S.kicker}>ACCESS MANAGEMENT</span>
      </header>
      <section style={S.wrap}>
        <div style={S.eyebrow}>VALORIA INSTITUTE · SECURITY</div>
        <h1 style={S.title}>Administrators</h1>
        <p style={S.intro}>Invite trusted team members to manage Valoria. Only an authenticated administrator can send an invitation.</p>

        <section style={S.panel}>
          <h2 style={S.panelTitle}>Invite an administrator</h2>
          <p style={S.helper}>An invitation is sent to the recipient’s email address. They set their own password; no password is created or shared by the inviter.</p>
          <form onSubmit={inviteAdmin} style={S.form}>
            <label style={S.label}>Full name <span style={S.optional}>OPTIONAL</span>
              <input value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" placeholder="Recipient’s name" style={S.input}/>
            </label>
            <label style={S.label}>Email address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="name@example.com" style={S.input}/>
            </label>
            {error && <div role="alert" style={S.error}>{error}</div>}
            {notice && <div role="status" style={S.notice}>{notice}</div>}
            <button type="submit" disabled={sending || !email.trim()} style={{...S.button, opacity: sending || !email.trim() ? .6 : 1}}>
              {sending ? 'SENDING INVITATION…' : 'SEND ADMIN INVITATION'}
            </button>
          </form>
        </section>

        <section style={S.panel}>
          <div style={S.listHeader}>
            <div><h2 style={S.panelTitle}>Current administrators</h2><p style={S.helper}>These accounts currently have access to the Valoria admin area.</p></div>
            <button type="button" onClick={loadAdmins} style={S.refresh}>Refresh</button>
          </div>
          {loading ? <p style={S.helper}>Loading administrator records…</p> : admins.length ? (
            <div>{admins.map(admin => <div key={admin.id} style={S.adminRow}>
              <div><strong style={S.name}>{admin.full_name || 'Administrator'}</strong><div style={S.email}>{admin.email}</div></div>
              <span style={S.date}>{admin.created_at ? new Date(admin.created_at).toLocaleDateString() : ''}</span>
            </div>)}</div>
          ) : <p style={S.helper}>No administrator records were returned.</p>}
        </section>

        <aside style={S.note}><strong>Security note</strong><br/>Admin access is enforced server-side against the `admin_users` table. The invitation endpoint requires a valid admin session; it is not a public signup route.</aside>
        <p style={S.docs}><Link href="/admin">Return to administration</Link> · <a href="https://github.com/riverwayse-sudo/valoria-site/blob/main/docs/admin-invitations.md" target="_blank" rel="noreferrer">Read the administrator invitation guide</a></p>
      </section>
    </main>
  )
}

const S = {
  page:{minHeight:'100vh',background:DARK,color:PARCHMENT,fontFamily:"Raleway,'Helvetica Neue',Arial,sans-serif"},
  header:{height:64,padding:'0 clamp(18px,4vw,48px)',display:'flex',alignItems:'center',justifyContent:'space-between',background:MIDNIGHT,borderBottom:'1px solid rgba(201,168,76,.14)'},
  back:{fontSize:11,letterSpacing:'.1em',fontWeight:700,color:PARCHMENT,textDecoration:'none'},
  kicker:{fontSize:10,letterSpacing:'.16em',color:GOLD,fontWeight:700},
  wrap:{width:'min(760px,calc(100% - 36px))',margin:'0 auto',padding:'52px 0 80px'},
  eyebrow:{fontSize:10,letterSpacing:'.18em',fontWeight:700,color:GOLD},
  title:{fontFamily:'Georgia,serif',fontWeight:400,fontSize:'clamp(34px,5vw,48px)',margin:'10px 0 8px'},
  intro:{fontSize:14,lineHeight:1.75,color:DIM,maxWidth:620,margin:'0 0 28px'},
  panel:{background:'rgba(26,26,46,.62)',border:'1px solid rgba(201,168,76,.16)',borderRadius:10,padding:'clamp(18px,3vw,26px)',marginBottom:16},
  panelTitle:{fontFamily:'Georgia,serif',fontSize:21,fontWeight:400,margin:'0 0 8px'},
  helper:{fontSize:12,lineHeight:1.7,color:DIM,margin:'0 0 18px'},
  form:{display:'grid',gap:16},
  label:{display:'grid',gap:7,fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:700,color:'rgba(247,244,238,.72)'},
  optional:{fontSize:9,color:DIM,marginLeft:6},
  input:{width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,.04)',border:'1px solid rgba(201,168,76,.22)',borderRadius:6,padding:'13px 14px',color:PARCHMENT,fontSize:14,fontFamily:'inherit',textTransform:'none',letterSpacing:0},
  button:{border:0,borderRadius:6,background:GOLD,color:DARK,padding:'14px 18px',fontSize:11,fontWeight:800,letterSpacing:'.12em',cursor:'pointer'},
  error:{padding:12,borderRadius:6,background:'rgba(216,90,48,.12)',border:'1px solid rgba(216,90,48,.3)',color:'#F0A48E',fontSize:12},
  notice:{padding:12,borderRadius:6,background:'rgba(29,158,117,.12)',border:'1px solid rgba(29,158,117,.3)',color:'#9DDEC5',fontSize:12,lineHeight:1.6},
  listHeader:{display:'flex',justifyContent:'space-between',alignItems:'start',gap:12},
  refresh:{border:'1px solid rgba(201,168,76,.28)',borderRadius:5,padding:'7px 10px',background:'transparent',color:GOLD,fontSize:11,cursor:'pointer'},
  adminRow:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,padding:'14px 0',borderTop:'1px solid rgba(247,244,238,.08)'},
  name:{fontSize:13,fontWeight:700},email:{fontSize:12,color:DIM,marginTop:4},date:{fontSize:11,color:DIM,whiteSpace:'nowrap'},
  note:{fontSize:12,lineHeight:1.7,color:DIM,padding:'14px 16px',borderLeft:`2px solid ${GOLD}`,background:'rgba(26,26,46,.35)'},
  docs:{fontSize:11,color:DIM,marginTop:20}, 
}
