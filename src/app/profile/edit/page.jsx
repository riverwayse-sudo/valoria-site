'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  GOLD, DARK, MID, PARCH, DIM, GLINE,
  INDUSTRIES, SKILLS_POOL, TOPICS_POOL, PROGRAMME_TYPES, LANGUAGES,
  FORMAT_CAPS, AUDIENCE_SIZES, NOTICE_PERIODS,
  VALIDATORS, validatorError,
} from '@/lib/profileOptions'

// Real profile-edit page — added 1 Aug 2026 to replace the old behaviour
// where "Edit your profile" just sent you back through the same
// one-question-at-a-time wizard used for first-time onboarding. That was
// fine for a new signup (reduces overwhelm), but painful for someone who
// just wants to fix one field: they had to step through screens they
// didn't want to touch to get to the one they did.
//
// This page instead shows every section at once, each independently
// editable and independently saveable — jump straight to what you want to
// change, save just that section, done. /profile/setup remains the wizard,
// used for first-time onboarding and for anyone middleware still considers
// incomplete (this page redirects those people there instead).

const TEXT = { color: PARCH }

function Section({ title, children, dirty, saving, saved, onSave }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        <h2 style={S.sectionTitle}>{title}</h2>
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          style={{ ...S.saveBtn, ...(!dirty || saving ? S.saveBtnDisabled : {}) }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : dirty ? 'Save section' : 'Saved'}
        </button>
      </div>
      <div style={S.sectionBody}>{children}</div>
    </div>
  )
}

function Field({ label, children, error }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={S.fieldLabel}>{label}</div>
      {children}
      {error && <div style={S.fieldError}>{error}</div>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={S.input} />
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return <textarea value={value || ''} placeholder={placeholder} rows={rows} onChange={e => onChange(e.target.value)} style={{ ...S.input, resize: 'vertical' }} />
}

function ChipGroup({ options, selected, onToggle, multi = true }) {
  return (
    <div style={S.chipRow}>
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        const active = multi ? (selected || []).includes(val) : selected === val
        return (
          <button key={val} type="button" onClick={() => onToggle(val)}
            style={{ ...S.chip, ...(active ? S.chipActive : {}) }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

function ListEditor({ rows, onChange, fields, addLabel }) {
  function updateRow(i, key, val) {
    const next = [...rows]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }
  function removeRow(i) { onChange(rows.filter((_, idx) => idx !== i)) }
  function addRow() { onChange([...rows, Object.fromEntries(fields.map(f => [f.key, '']))]) }
  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} style={S.listRow}>
          {fields.map(f => (
            <input key={f.key} value={row[f.key] || ''} placeholder={f.placeholder}
              onChange={e => updateRow(i, f.key, e.target.value)}
              style={{ ...S.input, flex: 1, marginBottom: 0 }} />
          ))}
          <button type="button" onClick={() => removeRow(i)} style={S.removeBtn}>✕</button>
        </div>
      ))}
      <button type="button" onClick={addRow} style={S.addBtn}>+ {addLabel}</button>
    </div>
  )
}

function EditPageInner() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState({})
  const [saving, setSaving] = useState({})
  const [dirty, setDirty] = useState({})
  const [errorMsg, setErrorMsg] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [cvUploading, setCvUploading] = useState(false)
  const fileRef = useRef(null)
  const cvFileRef = useRef(null)

  // form holds the full editable snapshot; original tracks last-saved
  // values per section so we know what's actually dirty and what to send.
  const [form, setForm] = useState(null)
  const [original, setOriginal] = useState(null)

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login?redirect=/profile/edit'); return }
      setUser(u)
      const { data: existing, error } = await supabase.from('professional_profiles').select('*').eq('id', u.id).maybeSingle()
      if (error) console.error('Edit page profile load failed:', error)
      if (!existing || !existing.profile_complete) {
        // Not done with first-time onboarding yet — the wizard is the
        // right place for that, not this page.
        router.push('/profile/setup')
        return
      }
      setForm(existing)
      setOriginal(existing)
      setLoading(false)
    })()
  }, [router])

  if (loading || !form) {
    return <div style={S.page}><div style={S.loadingState}>Loading your profile…</div></div>
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }
  function markDirty(section) {
    setDirty(d => ({ ...d, [section]: true }))
    setSaved(s => ({ ...s, [section]: false }))
  }
  function setField(section, key, val) {
    set(key, val)
    markDirty(section)
  }

  async function saveSection(section, keys) {
    setSaving(s => ({ ...s, [section]: true }))
    setErrorMsg('')
    const payload = {}
    keys.forEach(k => { payload[k] = form[k] })
    const { error } = await supabase.from('professional_profiles').update(payload).eq('id', user.id)
    setSaving(s => ({ ...s, [section]: false }))
    if (error) {
      console.error(`Save failed for ${section}:`, error)
      setErrorMsg(
        error.code === '23505' && /username/i.test(error.message || '')
          ? 'That username is already taken — please choose another.'
          : 'That didn\u2019t save — check your connection and try again.'
      )
      return
    }
    setDirty(d => ({ ...d, [section]: false }))
    setSaved(s => ({ ...s, [section]: true }))
    setOriginal(o => ({ ...o, ...payload }))
  }

  async function uploadPhoto(file) {
    if (!file || !user) return
    setPhotoUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `profiles/${user.id}/avatar.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setField('media', 'photo_url', data.publicUrl)
    } catch (err) {
      console.error('Photo upload failed:', err)
      setErrorMsg(err?.message || 'Photo upload failed.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function uploadCV(file) {
    if (!file || !user) return
    setCvUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `profiles/${user.id}/cv.${ext}`
      const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: true })
      if (error) throw error
      setField('media', 'cv_url', path)
    } catch (err) {
      console.error('CV upload failed:', err)
      setErrorMsg(err?.message || 'CV upload failed.')
    } finally {
      setCvUploading(false)
    }
  }

  const tracks = form.active_tracks || []
  const isCandidate = tracks.includes('candidate')
  const isSpeaker = tracks.includes('speaker')
  const isFacilitator = tracks.includes('facilitator')

  return (
    <div style={S.page}>
      <header style={S.header}>
        <Link href={`/profile/${user.id}`} style={S.backLink}>← Back to your profile</Link>
        <div style={S.headerTitle}>Edit Profile</div>
        <div style={{ width: '140px' }} />
      </header>

      <div style={S.container}>
        {errorMsg && <div style={S.errorBanner}>{errorMsg}</div>}

        <Section title="Basics" dirty={dirty.basics} saving={saving.basics} saved={saved.basics}
          onSave={() => saveSection('basics', ['display_name','username','phone','headline','industry','preferred_industry','location','years_experience'])}>
          <div style={S.grid2}>
            <Field label="Name"><TextInput value={form.display_name} onChange={v => setField('basics','display_name',v)} /></Field>
            <Field label="Username" error={form.username && !VALIDATORS.username(form.username) ? validatorError('username') : null}>
              <TextInput value={form.username} onChange={v => setField('basics','username',v)} />
            </Field>
            <Field label="Phone" error={form.phone && !VALIDATORS.phone(form.phone) ? validatorError('phone') : null}>
              <TextInput value={form.phone} onChange={v => setField('basics','phone',v)} />
            </Field>
            <Field label="Headline"><TextInput value={form.headline} onChange={v => setField('basics','headline',v)} /></Field>
            <Field label="Location" error={form.location && !VALIDATORS.place(form.location) ? validatorError('place') : null}>
              <TextInput value={form.location} onChange={v => setField('basics','location',v)} placeholder="City, country" />
            </Field>
            <Field label="Years of experience" error={form.years_experience && !VALIDATORS.number(form.years_experience) ? validatorError('number') : null}>
              <TextInput type="number" value={form.years_experience} onChange={v => setField('basics','years_experience',v)} />
            </Field>
          </div>
          <Field label="Current industry"><ChipGroup options={INDUSTRIES} selected={form.industry} multi={false} onToggle={v => setField('basics','industry',v)} /></Field>
          <Field label="Industry you'd like to move into (optional)">
            <ChipGroup options={INDUSTRIES} selected={form.preferred_industry} multi={false}
              onToggle={v => setField('basics','preferred_industry', form.preferred_industry === v ? '' : v)} />
          </Field>
        </Section>

        <Section title="About & Languages" dirty={dirty.about} saving={saving.about} saved={saved.about}
          onSave={() => saveSection('about', ['bio','languages'])}>
          <Field label="Bio"><TextArea value={form.bio} onChange={v => setField('about','bio',v)} /></Field>
          <Field label="Languages"><ChipGroup options={LANGUAGES} selected={form.languages} onToggle={v => {
            const cur = form.languages || []
            setField('about','languages', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
          }} /></Field>
        </Section>

        <Section title="Your Paths" dirty={dirty.tracks} saving={saving.tracks} saved={saved.tracks}
          onSave={() => saveSection('tracks', ['active_tracks'])}>
          <ChipGroup options={[{value:'candidate',label:'Talent'},{value:'speaker',label:'Speaker'},{value:'facilitator',label:'Facilitator'}]}
            selected={tracks} onToggle={v => {
              const next = tracks.includes(v) ? tracks.filter(x => x !== v) : [...tracks, v]
              setField('tracks','active_tracks', next)
            }} />
        </Section>

        <Section title="Media" dirty={dirty.media} saving={saving.media} saved={saved.media}
          onSave={() => saveSection('media', ['photo_url','cv_url','linkedin_url','website_url'])}>
          <div style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={photoUploading} style={S.ghostBtn}>
              {photoUploading ? 'Uploading…' : form.photo_url ? 'Replace photo' : 'Upload photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={e => e.target.files[0] && uploadPhoto(e.target.files[0])} />
            <button type="button" onClick={() => cvFileRef.current?.click()} disabled={cvUploading} style={S.ghostBtn}>
              {cvUploading ? 'Uploading…' : form.cv_url ? 'Replace CV' : 'Upload CV'}
            </button>
            <input ref={cvFileRef} type="file" accept="application/pdf,.doc,.docx" style={{ display:'none' }} onChange={e => e.target.files[0] && uploadCV(e.target.files[0])} />
          </div>
          <Field label="LinkedIn" error={form.linkedin_url && !VALIDATORS.linkedin(form.linkedin_url) ? validatorError('linkedin') : null}>
            <TextInput value={form.linkedin_url} onChange={v => setField('media','linkedin_url',v)} placeholder="https://linkedin.com/in/yourname" />
          </Field>
          <Field label="Website / portfolio" error={form.website_url && !VALIDATORS.url(form.website_url) ? validatorError('url') : null}>
            <TextInput value={form.website_url} onChange={v => setField('media','website_url',v)} placeholder="https://yourwebsite.com" />
          </Field>
        </Section>

        {isCandidate && (
          <Section title="Talent Details" dirty={dirty.candidate} saving={saving.candidate} saved={saved.candidate}
            onSave={() => saveSection('candidate', ['skills','work_history','notice_period','salary_expectation'])}>
            <Field label="Skills"><ChipGroup options={SKILLS_POOL} selected={form.skills} onToggle={v => {
              const cur = form.skills || []
              setField('candidate','skills', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
            }} /></Field>
            <Field label="Work history">
              <ListEditor rows={form.work_history || []} addLabel="Add role"
                fields={[{key:'title',placeholder:'Title'},{key:'org',placeholder:'Organisation'},{key:'duration',placeholder:'Duration'}]}
                onChange={v => setField('candidate','work_history', v)} />
            </Field>
            <div style={S.grid2}>
              <Field label="Notice period"><ChipGroup options={NOTICE_PERIODS} selected={form.notice_period} multi={false} onToggle={v => setField('candidate','notice_period',v)} /></Field>
              <Field label="Salary expectation (monthly net)"><TextInput value={form.salary_expectation} onChange={v => setField('candidate','salary_expectation',v)} /></Field>
            </div>
          </Section>
        )}

        {isSpeaker && (
          <Section title="Speaker Details" dirty={dirty.speaker} saving={saving.speaker} saved={saved.speaker}
            onSave={() => saveSection('speaker', ['topics','format_capabilities','audience_sizes','fee_range','youtube_links'])}>
            <Field label="Topics"><ChipGroup options={TOPICS_POOL} selected={form.topics} onToggle={v => {
              const cur = form.topics || []
              setField('speaker','topics', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
            }} /></Field>
            <Field label="Formats"><ChipGroup options={FORMAT_CAPS} selected={form.format_capabilities} onToggle={v => {
              const cur = form.format_capabilities || []
              setField('speaker','format_capabilities', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
            }} /></Field>
            <Field label="Audience sizes"><ChipGroup options={AUDIENCE_SIZES} selected={form.audience_sizes} onToggle={v => {
              const cur = form.audience_sizes || []
              setField('speaker','audience_sizes', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
            }} /></Field>
            <Field label="Fee range"><TextInput value={form.fee_range} onChange={v => setField('speaker','fee_range',v)} /></Field>
            <Field label="YouTube links">
              <ListEditor rows={(form.youtube_links || ['']).map(u => ({ url: u }))} addLabel="Add video"
                fields={[{key:'url',placeholder:'https://youtube.com/watch?v=…'}]}
                onChange={v => setField('speaker','youtube_links', v.map(r => r.url))} />
            </Field>
          </Section>
        )}

        {isFacilitator && (
          <Section title="Facilitator Details" dirty={dirty.facilitator} saving={saving.facilitator} saved={saved.facilitator}
            onSave={() => saveSection('facilitator', ['programme_types','past_clients','fee_range','certifications'])}>
            <Field label="Programme types"><ChipGroup options={PROGRAMME_TYPES} selected={form.programme_types} onToggle={v => {
              const cur = form.programme_types || []
              setField('facilitator','programme_types', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
            }} /></Field>
            <Field label="Past clients">
              <ListEditor rows={form.past_clients || []} addLabel="Add client"
                fields={[{key:'name',placeholder:'Client / organisation'},{key:'programme',placeholder:'Programme delivered'}]}
                onChange={v => setField('facilitator','past_clients', v)} />
            </Field>
            <Field label="Fee range"><TextInput value={form.fee_range} onChange={v => setField('facilitator','fee_range',v)} /></Field>
            <Field label="Certifications"><TextInput value={form.certifications} onChange={v => setField('facilitator','certifications',v)} /></Field>
          </Section>
        )}
      </div>
    </div>
  )
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={<div style={S.page}><div style={S.loadingState}>Loading…</div></div>}>
      <EditPageInner />
    </Suspense>
  )
}

const S = {
  page: { minHeight:'100vh', background:DARK, fontFamily:"'Raleway','Helvetica Neue',Arial,sans-serif", color:PARCH, paddingBottom:'80px' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:'64px', background:MID, borderBottom:'1px solid rgba(201,168,76,.2)', position:'sticky', top:0, zIndex:100 },
  backLink: { fontSize:'12px', color:'rgba(247,244,238,.5)', textDecoration:'none', width:'140px' },
  headerTitle: { fontSize:'14px', fontWeight:700, letterSpacing:'.08em', color:GOLD },
  container: { maxWidth:'760px', margin:'0 auto', padding:'32px 24px' },
  loadingState: { textAlign:'center', color:'rgba(247,244,238,.3)', padding:'120px 20px', fontSize:'14px' },
  errorBanner: { background:'rgba(216,90,48,.12)', border:'1px solid rgba(216,90,48,.4)', color:'#F09595', padding:'12px 16px', borderRadius:'6px', fontSize:'13px', marginBottom:'20px' },
  section: { background:'rgba(255,255,255,.02)', border:`1px solid ${GLINE}`, borderRadius:'8px', padding:'24px', marginBottom:'20px' },
  sectionHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' },
  sectionTitle: { fontSize:'15px', fontWeight:600, color:GOLD, margin:0 },
  sectionBody: {},
  saveBtn: { padding:'7px 16px', background:GOLD, color:DARK, border:'none', borderRadius:'999px', fontSize:'11px', fontWeight:700, letterSpacing:'.06em', cursor:'pointer', fontFamily:"'Raleway',sans-serif" },
  saveBtnDisabled: { background:'transparent', border:'1px solid rgba(201,168,76,.2)', color:'rgba(247,244,238,.3)', cursor:'default' },
  fieldLabel: { fontSize:'11px', fontWeight:600, letterSpacing:'.04em', color:'rgba(247,244,238,.5)', marginBottom:'6px' },
  fieldError: { fontSize:'11px', color:'#F09595', marginTop:'4px' },
  input: { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(201,168,76,.15)', borderRadius:'6px', color:PARCH, fontSize:'13px', fontFamily:"'Raleway',sans-serif", outline:'none', boxSizing:'border-box', marginBottom:'8px' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' },
  chipRow: { display:'flex', flexWrap:'wrap', gap:'8px' },
  chip: { padding:'7px 14px', borderRadius:'999px', border:'1px solid rgba(201,168,76,.2)', background:'transparent', color:'rgba(247,244,238,.55)', fontSize:'12px', cursor:'pointer', fontFamily:"'Raleway',sans-serif" },
  chipActive: { background:GOLD, borderColor:GOLD, color:DARK, fontWeight:600 },
  ghostBtn: { padding:'9px 18px', border:'1px solid rgba(201,168,76,.3)', background:'transparent', color:GOLD, borderRadius:'6px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:"'Raleway',sans-serif" },
  listRow: { display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' },
  removeBtn: { background:'transparent', border:'none', color:'rgba(247,244,238,.35)', cursor:'pointer', fontSize:'14px', padding:'0 4px' },
  addBtn: { background:'transparent', border:'1px dashed rgba(201,168,76,.3)', color:GOLD, padding:'8px 14px', borderRadius:'6px', fontSize:'12px', cursor:'pointer', fontFamily:"'Raleway',sans-serif" },
}
