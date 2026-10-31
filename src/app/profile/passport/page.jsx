import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

export const metadata = {
  title: 'Capability Passport — Valoria Institute',
  robots: { index: false, follow: false },
}

const CAPABILITY_LABELS = {
  talent: 'Talent',
  candidate: 'Talent',
  speaker: 'Speaker',
  facilitator: 'Facilitator',
}

const STATUS_LABELS = {
  listed: 'Listed',
  eligible: 'Eligible · awaiting listing',
  pending: 'Under review',
  reviewing: 'Under review',
  ineligible: 'Not yet eligible',
  not_eligible: 'Not yet eligible',
  rejected: 'Needs attention',
}

const EVIDENCE_LABELS = {
  cv: 'CV',
  portfolio: 'Portfolio / work sample',
  certification: 'Certification',
  speaking_sample: 'Speaking sample',
  facilitation_record: 'Facilitation record',
}

function capabilityStatus(capability) {
  if (capability.eligibility_status === 'listed' && capability.eligible_for_listing === true) return 'Listed'
  return STATUS_LABELS[capability.eligibility_status] || 'Requirements in progress'
}

function evidenceStatus(status) {
  return ({
    verified: 'Approved',
    pending: 'Under review',
    rejected: 'Needs attention',
    unverified: 'Submitted',
    not_submitted: 'Not submitted',
  })[status] || 'Status unavailable'
}

function nextSteps({ profile, capabilities, documents, activation }) {
  const steps = []
  if (!profile?.profile_complete) {
    steps.push({ title: 'Complete your professional profile', detail: 'Finish the required identity and experience details.', href: '/profile/setup', action: 'CONTINUE PROFILE' })
  }
  if (!capabilities.length) {
    steps.push({ title: 'Choose your capabilities', detail: 'Select Talent, Speaker, Facilitator, or the combination that describes your work.', href: '/profile/setup', action: 'CHOOSE CAPABILITIES' })
  }
  if (profile?.profile_complete && capabilities.length && !profile?.cv_url) {
    steps.push({ title: 'Add your CV', detail: 'Your CV is a required profile-wide evidence item.', href: '/profile/setup', action: 'ADD CV' })
  }
  const capabilityEvidenceGaps = capabilities.some(capability => {
    const hasEvidenceForCapability = documents.some(document => document.capability_id === capability.id)
    const hasOutstandingRequirements = Array.isArray(capability.missing_requirements) && capability.missing_requirements.length > 0
    const requiresCapabilityEvidence = !['talent', 'candidate'].includes(capability.capability)
    return hasOutstandingRequirements || (requiresCapabilityEvidence && !hasEvidenceForCapability)
  })
  if (capabilities.length && capabilityEvidenceGaps) {
    steps.push({ title: 'Submit capability evidence', detail: 'Attach relevant work samples, certifications or engagement records to each capability that requires them.', href: '/profile/evidence', action: 'ADD EVIDENCE' })
  }
  if (activation?.status !== 'activated') {
    steps.push({ title: 'Activate your VALU action plan', detail: 'Use your VALU report to turn your assessment insight into a practical development plan.', href: '/report', action: 'VIEW VALU REPORT' })
  }
  if (!steps.length) {
    steps.push({ title: 'Your profile is progressing', detail: 'Review capability decisions and keep your evidence current. Listing is controlled by Valoria’s eligibility and review process.', href: '/marketplace', action: 'VIEW MARKETPLACE' })
  }
  return steps
}

export default async function PassportPage() {
  if (!URL || !ANON || !SERVICE) redirect('/journey')

  const cookieStore = await cookies()
  const supabase = createServerClient(URL, ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnTo=/profile/passport')

  const admin = createClient(URL, SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [profileResult, capabilitiesResult, documentsResult, activationResult] = await Promise.all([
    admin.from('professional_profiles')
      .select('display_name,headline,current_job_title,valu_index,designation,cluster_scores,atb_id,visibility,listing_status,profile_complete,cv_url')
      .eq('id', user.id)
      .maybeSingle(),
    admin.from('professional_capabilities')
      .select('id,capability,eligibility_status,eligible_for_listing,listed_at,missing_requirements,is_active')
      .eq('professional_id', user.id)
      .eq('is_active', true)
      .order('capability'),
    admin.from('professional_documents')
      .select('id,capability_id,document_type,verification_status,verified_at,original_filename,created_at')
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false }),
    admin.from('professional_value_activation')
      .select('status,priority_cluster,updated_at')
      .eq('professional_id', user.id)
      .maybeSingle(),
  ])

  const profile = profileResult.data
  const capabilities = capabilitiesResult.data || []
  const documents = documentsResult.data || []
  const activation = activationResult.data
  const listedCount = capabilities.filter(c => c.eligibility_status === 'listed' && c.eligible_for_listing === true).length
  const steps = nextSteps({ profile, capabilities, documents, activation })
  const profileReady = profile?.profile_complete === true
  const score = profile?.valu_index

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link href="/dashboard" style={styles.back}>← Dashboard</Link>
        <span>VALORIA INSTITUTE</span>
        <Link href="/profile/edit" style={styles.edit}>EDIT PROFILE</Link>
      </header>

      <div style={styles.shell}>
        <div style={styles.eyebrow}>YOUR PROFESSIONAL RECORD</div>
        <h1 style={styles.title}>Capability<br /><em>Passport.</em></h1>
        <p style={styles.lead}>One professional identity. Every active capability, evidence record and verification state in one place. Your passport shows what is complete, what is being reviewed and what comes next.</p>

        <section style={styles.identity}>
          <div style={styles.sectionLabel}>PROFESSIONAL IDENTITY</div>
          <h2 style={styles.name}>{profile?.display_name || user.user_metadata?.full_name || 'Your professional profile'}</h2>
          <p style={styles.role}>{profile?.current_job_title || profile?.headline || 'Add your professional role and headline.'}</p>
          <div style={styles.metrics}>
            <div><span style={styles.metricLabel}>PROFILE</span><strong>{profileReady ? 'Complete' : 'In progress'}</strong></div>
            <div><span style={styles.metricLabel}>VALU INDEX</span><strong>{score != null ? `${score} points` : 'Full assessment pending'}</strong></div>
            <div><span style={styles.metricLabel}>MARKETPLACE</span><strong>{listedCount ? `Listed in ${listedCount} ${listedCount === 1 ? 'capability' : 'capabilities'}` : 'Not yet listed'}</strong></div>
          </div>
          {profile?.atb_id && <div style={styles.id}>PROFESSIONAL ID · {profile.atb_id}</div>}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHead}>
            <div><div style={styles.sectionLabel}>CAPABILITY RECORD</div><h2 style={styles.heading}>Your capabilities</h2></div>
            <Link href="/profile/setup" style={styles.textLink}>MANAGE CAPABILITIES →</Link>
          </div>
          {capabilities.length ? (
            <div style={styles.cards}>
              {capabilities.map(capability => {
                const label = CAPABILITY_LABELS[capability.capability] || capability.capability
                const status = capabilityStatus(capability)
                const evidence = documents.filter(document => document.capability_id === capability.id)
                const missing = Array.isArray(capability.missing_requirements) ? capability.missing_requirements : []
                return (
                  <article key={capability.id} style={styles.capability}>
                    <div style={styles.capabilityTop}>
                      <div><div style={styles.sectionLabel}>CAPABILITY</div><h3 style={styles.capabilityName}>{label}</h3></div>
                      <span style={status === 'Listed' ? styles.statusListed : styles.status}>{status}</span>
                    </div>
                    <div style={styles.capabilityMeta}>{evidence.length} evidence {evidence.length === 1 ? 'record' : 'records'} submitted</div>
                    {missing.length > 0 ? (
                      <div style={styles.missing}><b>Still needed</b><ul>{missing.map(item => <li key={item}>{item}</li>)}</ul></div>
                    ) : (
                      <p style={styles.noMissing}>No outstanding capability requirements are currently reported.</p>
                    )}
                    <div style={styles.cardActions}>
                      <Link href="/profile/evidence" style={styles.smallAction}>SUBMIT EVIDENCE</Link>
                      <span style={styles.governance}>Eligibility and listing decisions are managed by Valoria.</span>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div style={styles.empty}>
              <p>You have not selected a capability yet. Choose the professional pathways you want Valoria to assess and present.</p>
              <Link href="/profile/setup" style={styles.button}>CHOOSE CAPABILITIES →</Link>
            </div>
          )}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHead}>
            <div><div style={styles.sectionLabel}>DOCUMENT CONTROL</div><h2 style={styles.heading}>Evidence & verification</h2></div>
            <Link href="/profile/evidence" style={styles.textLink}>MANAGE EVIDENCE →</Link>
          </div>
          {documents.length ? (
            <div style={styles.documentList}>
              {documents.map(document => {
                const capability = capabilities.find(c => c.id === document.capability_id)
                const label = document.capability_id ? (CAPABILITY_LABELS[capability?.capability] || capability?.capability || 'Capability') : 'Profile-wide'
                return (
                  <div key={document.id} style={styles.document}>
                    <div><strong>{document.original_filename || EVIDENCE_LABELS[document.document_type] || document.document_type}</strong><span>{label} · {EVIDENCE_LABELS[document.document_type] || document.document_type}</span></div>
                    <b>{evidenceStatus(document.verification_status)}</b>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={styles.empty}>
              <p>No evidence has been submitted yet. Your CV is profile-wide; portfolio samples, certifications and engagement records should be attached to the capability they support.</p>
              <Link href={capabilities.length ? '/profile/evidence' : '/profile/setup'} style={styles.button}>{capabilities.length ? 'SUBMIT CAPABILITY EVIDENCE' : 'SET UP YOUR PROFILE'} →</Link>
            </div>
          )}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionLabel}>YOUR NEXT STEPS</div>
          <h2 style={styles.heading}>Keep moving forward.</h2>
          <div style={styles.nextList}>
            {steps.map((step, index) => (
              <article key={step.title} style={styles.nextItem}>
                <span style={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div style={{ flex: 1 }}><h3>{step.title}</h3><p>{step.detail}</p></div>
                <Link href={step.href} style={styles.smallAction}>{step.action} →</Link>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.activation}>
          <div style={styles.sectionLabel}>VALU VALUE ACTIVATION</div>
          <h2 style={styles.heading}>{activation?.status === 'activated' ? 'Your action plan is active.' : 'Turn insight into action.'}</h2>
          <p>{activation?.status === 'activated' ? 'Your VALU result has been translated into a development and positioning plan.' : 'Your VALU report contains the insight. Activate your plan to connect it to your professional profile and next steps.'}</p>
          <Link href="/report" style={styles.textLink}>OPEN VALU REPORT →</Link>
        </section>

        <footer style={styles.footer}>
          <Link href="/dashboard">Return to dashboard</Link>
          <span>Profile completion, capability eligibility and marketplace listing are separate decisions.</span>
        </footer>
      </div>
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0F0F1A', color: '#F7F4EE', fontFamily: 'Raleway,Arial,sans-serif', paddingBottom: 70 },
  header: { minHeight: 64, padding: '12px clamp(18px,4vw,40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap', background: '#1A1A2E', borderBottom: '1px solid rgba(201,168,76,.18)', fontSize: 10, letterSpacing: '.12em' },
  back: { color: 'rgba(247,244,238,.68)', textDecoration: 'none' },
  edit: { color: '#C9A84C', textDecoration: 'none', fontWeight: 800 },
  shell: { maxWidth: 1040, margin: '0 auto', padding: '54px 22px 0' },
  eyebrow: { fontSize: 10, letterSpacing: '.2em', color: '#C9A84C', fontWeight: 800, marginBottom: 18 },
  title: { fontSize: 'clamp(42px,7vw,76px)', fontWeight: 300, lineHeight: .98, letterSpacing: '-.04em', margin: '0 0 18px' },
  lead: { maxWidth: 720, fontSize: 14, lineHeight: 1.85, color: 'rgba(247,244,238,.62)', margin: '0 0 32px' },
  identity: { padding: '26px clamp(18px,4vw,34px)', background: '#1A1A2E', border: '1px solid rgba(201,168,76,.22)' },
  sectionLabel: { fontSize: 9, letterSpacing: '.17em', color: '#C9A84C', fontWeight: 800 },
  name: { fontSize: 'clamp(24px,4vw,34px)', fontWeight: 500, margin: '12px 0 4px' },
  role: { margin: 0, fontSize: 13, color: 'rgba(247,244,238,.58)' },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 18, marginTop: 26, paddingTop: 20, borderTop: '1px solid rgba(201,168,76,.16)' },
  metricLabel: { display: 'block', fontSize: 9, letterSpacing: '.14em', color: 'rgba(247,244,238,.42)', marginBottom: 7 },
  id: { marginTop: 18, color: '#C9A84C', fontSize: 10, letterSpacing: '.12em', fontFamily: 'monospace' },
  section: { marginTop: 42 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, flexWrap: 'wrap', marginBottom: 16 },
  heading: { fontSize: 24, fontWeight: 400, margin: '9px 0 0' },
  textLink: { color: '#C9A84C', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textDecoration: 'none' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 },
  capability: { padding: 22, border: '1px solid rgba(201,168,76,.18)', background: 'rgba(255,255,255,.025)' },
  capabilityTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 },
  capabilityName: { fontSize: 23, textTransform: 'capitalize', fontWeight: 500, margin: '8px 0 0' },
  status: { display: 'inline-flex', padding: '7px 10px', border: '1px solid rgba(201,168,76,.3)', color: '#E8D39B', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase' },
  statusListed: { display: 'inline-flex', padding: '7px 10px', border: '1px solid rgba(112,190,145,.35)', color: '#A8D5B5', fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase' },
  capabilityMeta: { marginTop: 13, fontSize: 11, color: 'rgba(247,244,238,.5)' },
  missing: { marginTop: 16, padding: 13, background: 'rgba(201,168,76,.06)', color: 'rgba(247,244,238,.75)', fontSize: 12, lineHeight: 1.7 },
  noMissing: { marginTop: 16, fontSize: 12, lineHeight: 1.7, color: 'rgba(247,244,238,.55)' },
  cardActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(201,168,76,.12)' },
  smallAction: { color: '#C9A84C', fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textDecoration: 'none' },
  governance: { fontSize: 10, color: 'rgba(247,244,238,.4)' },
  empty: { padding: 22, border: '1px solid rgba(201,168,76,.15)', background: 'rgba(255,255,255,.02)' },
  button: { display: 'inline-block', marginTop: 8, padding: '12px 17px', background: '#C9A84C', color: '#1A1A2E', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textDecoration: 'none' },
  documentList: { display: 'grid', gap: 8 },
  document: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap', padding: 15, background: '#1A1A2E', border: '1px solid rgba(201,168,76,.12)', fontSize: 12 },
  nextList: { display: 'grid', gap: 9, marginTop: 16 },
  nextItem: { display: 'flex', alignItems: 'center', gap: 16, padding: 17, border: '1px solid rgba(201,168,76,.14)', background: 'rgba(255,255,255,.02)' },
  stepNumber: { color: '#C9A84C', fontSize: 11, fontFamily: 'monospace' },
  activation: { marginTop: 44, padding: 24, background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.18)' },
  footer: { display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(201,168,76,.15)', color: 'rgba(247,244,238,.42)', fontSize: 11 },
}
