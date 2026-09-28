'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const GOLD = '#C9A84C'
const DARK = '#0F0F1A'
const MID = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM = 'rgba(247,244,238,.55)'
const LINE = 'rgba(201,168,76,.18)'

function reportExcerpt(report) {
  if (!report) return ''
  let value = report
  if (typeof report === 'string') {
    try { value = JSON.parse(report) } catch {}
  }
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim().slice(0, 420)
  const candidates = [
    value?.executive_summary,
    value?.professional_summary,
    value?.summary,
    value?.overview,
    value?.profile_summary,
    value?.narrative,
  ]
  const hit = candidates.find(v => typeof v === 'string' && v.trim())
  return hit ? hit.replace(/\s+/g, ' ').trim().slice(0, 420) : ''
}

export default function ProgressiveOnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ display_name:'', current_job_title:'', location:'', industry:'' })
  const [valu, setValu] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('display_name,current_job_title,location,industry,bio,valu_index')
        .eq('id', user.id)
        .maybeSingle()

      const { data: assessment } = await supabase
        .from('valu_assessments')
        .select('total_score,designation,ai_report,role,completed_at')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order('completed_at', { ascending:false })
        .limit(1)
        .maybeSingle()

      const metadata = user.user_metadata || {}
      const role = assessment?.role || metadata.role || ''
      setValu(assessment || (profile?.valu_index != null ? { total_score: profile.valu_index } : null))
      setForm({
        display_name: profile?.display_name || metadata.full_name || '',
        current_job_title: profile?.current_job_title || role,
        location: profile?.location || '',
        industry: profile?.industry || '',
      })
      setReady(true)
    }
    load()
  }, [router])

  async function enterValoria(e) {
    e.preventDefault()
    if (!form.display_name.trim() || !form.current_job_title.trim()) return
    setSaving(true); setError('')
    try {
      const excerpt = reportExcerpt(valu?.ai_report)
      const bio = excerpt || `Professional profile created from the Valoria VALU Index journey. ${form.current_job_title.trim()}.`
      const { error } = await supabase.from('professional_profiles').upsert({
        id: user.id,
        display_name: form.display_name.trim(),
        current_job_title: form.current_job_title.trim(),
        headline: form.current_job_title.trim(),
        location: form.location.trim() || null,
        industry: form.industry.trim() || null,
        bio,
        active_tracks: [],
        languages: [],
        skills: [],
        topics: [],
        facilitation_topics: [],
        programme_types: [],
        format_capabilities: [],
        audience_sizes: [],
        work_history: [],
        past_events: [],
        past_clients: [],
        youtube_links: [],
        visibility: 'registered_only',
        profile_complete: false,
        updated_at: new Date().toISOString(),
      }, { onConflict:'id' })
      if (error) throw error
      router.replace('/dashboard')
    } catch (err) {
      console.error('Progressive onboarding save failed:', err)
      setError('We could not save your starter profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!ready) return <main style={styles.page}><div style={styles.loading}>Preparing your Valoria profile…</div></main>

  return (
    <main style={styles.page}>
      <div style={styles.topline}><span>VALORIA INSTITUTE</span><span>YOUR PROFESSIONAL JOURNEY</span></div>
      <div style={styles.shell}>
        <div style={styles.eyebrow}>YOU'RE IN</div>
        <h1 style={styles.title}>Start with the essentials.<br/><em>Build the rest when you're ready.</em></h1>
        <p style={styles.lead}>
          Your account and VALU journey are already captured. We only need a few details to create your professional home on Valoria. Everything else can be completed later.
        </p>

        {valu?.total_score != null && (
          <div style={styles.valuCard}>
            <div><div style={styles.label}>OFFICIAL VALU INDEX</div><div style={styles.score}>{valu.total_score}<span>/100</span></div></div>
            <div style={styles.designation}>{valu.designation || 'ASSESSED PROFESSIONAL'}</div>
          </div>
        )}

        <form onSubmit={enterValoria} style={styles.form}>
          <Field label="YOUR NAME">
            <input style={styles.input} value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})} autoComplete="name" />
          </Field>
          <Field label="CURRENT PROFESSIONAL ROLE">
            <input style={styles.input} value={form.current_job_title} onChange={e=>setForm({...form,current_job_title:e.target.value})} placeholder="e.g. Senior Product Manager" />
          </Field>
          <div style={styles.grid}>
            <Field label="WHERE ARE YOU BASED? · OPTIONAL">
              <input style={styles.input} value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="City, country" />
            </Field>
            <Field label="INDUSTRY · OPTIONAL">
              <input style={styles.input} value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} placeholder="e.g. Financial Services" />
            </Field>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          <button disabled={saving || !form.display_name.trim() || !form.current_job_title.trim()} style={{...styles.button,opacity:(saving || !form.display_name.trim() || !form.current_job_title.trim())?.5:1}}>
            {saving ? 'SAVING YOUR PROFILE…' : 'ENTER VALORIA →'}
          </button>
        </form>

        <div style={styles.promise}>
          <div style={styles.promiseTitle}>NOT REQUIRED TODAY</div>
          <div style={styles.items}>
            {['Capability / pathway selection','Professional experience','Credentials & evidence','Profile photo','Marketplace eligibility','Marketplace listing'].map((x,i)=><div key={x} style={styles.item}><span>{i < 2 ? '○' : '○'}</span>{x}</div>)}
          </div>
          <p>We'll bring these back at the right moment instead of asking for everything at once.</p>
        </div>

        <div style={styles.footer}><Link href="/dashboard">Skip for now</Link><span>Nothing here determines marketplace listing.</span></div>
      </div>
    </main>
  )
}

function Field({label,children}) { return <label style={styles.field}><span style={styles.label}>{label}</span>{children}</label> }

const styles = {
  page:{minHeight:'100vh',background:DARK,color:PARCH,fontFamily:"'Raleway',sans-serif",padding:'26px 20px 70px'},
  loading:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:DIM,fontSize:13},
  topline:{maxWidth:980,margin:'0 auto 50px',display:'flex',justifyContent:'space-between',gap:20,fontSize:9,fontWeight:700,letterSpacing:'.16em',color:'rgba(201,168,76,.55)'},
  shell:{maxWidth:760,margin:'0 auto'},
  eyebrow:{fontSize:10,fontWeight:700,letterSpacing:'.2em',color:GOLD,marginBottom:16},
  title:{fontSize:'clamp(38px,6vw,68px)',fontWeight:300,lineHeight:1.03,letterSpacing:'-.035em',margin:'0 0 18px'},
  lead:{maxWidth:650,fontSize:14,lineHeight:1.8,color:DIM,margin:'0 0 30px'},
  valuCard:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,padding:'20px 22px',background:'rgba(201,168,76,.06)',border:`1px solid ${LINE}`,marginBottom:24},
  label:{fontSize:9,fontWeight:700,letterSpacing:'.17em',color:'rgba(201,168,76,.6)',display:'block',marginBottom:8},
  score:{fontSize:38,fontWeight:300,color:GOLD},
  scoreSpan:{fontSize:12,color:DIM},
  designation:{fontSize:10,fontWeight:700,letterSpacing:'.12em',color:PARCH,textAlign:'right'},
  form:{display:'grid',gap:15},
  field:{display:'grid',gap:7},
  input:{width:'100%',boxSizing:'border-box',padding:'14px 15px',background:'rgba(255,255,255,.04)',border:`1px solid ${LINE}`,borderRadius:7,color:PARCH,fontSize:14,fontFamily:'inherit',outline:'none'},
  grid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14},
  button:{border:0,borderRadius:999,padding:'16px 22px',background:GOLD,color:DARK,fontSize:11,fontWeight:700,letterSpacing:'.14em',cursor:'pointer',fontFamily:'inherit',marginTop:4},
  error:{padding:13,border:'1px solid rgba(216,90,48,.3)',background:'rgba(216,90,48,.08)',color:'#F09595',fontSize:12},
  promise:{marginTop:34,padding:22,background:MID,border:`1px solid ${LINE}`},
  promiseTitle:{fontSize:9,fontWeight:700,letterSpacing:'.17em',color:'rgba(201,168,76,.55)',marginBottom:14},
  items:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 18px'},
  item:{fontSize:12,color:DIM},
  footer:{display:'flex',justifyContent:'space-between',gap:20,marginTop:20,fontSize:11,color:'rgba(247,244,238,.3)'},
}
