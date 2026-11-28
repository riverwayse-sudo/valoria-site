import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../pages.css'

export const metadata = {
  title: 'Privacy Policy | Valoria Institute',
  description: 'How Valoria Institute collects, uses, and protects your personal data. NDPA 2023 compliant.',
  alternates: { canonical: '/privacypolicy' },
}

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.55)'

const sections = [
  {
    title: '1. Who we are',
    body: `Valoria Institute is an initiative of African Talent Bureau Ltd, registered in Nigeria. We operate the Valoria Institute professional marketplace at valoriainstitute.com and the VALU Index platform at valoriainstitute.com/valu/assessment.\n\nFor questions about this policy, contact us at: privacy@valoriainstitute.com`,
  },
  {
    title: '2. Data we collect',
    body: `We collect the following categories of personal data:\n\n• Waitlist sign-ups: full name, email address, professional role.\n• Account registration: full name, email address, password (hashed — never stored in plaintext), user type (professional, employer, event organiser, or training buyer), and company name where applicable.\n• VALU Index data: your responses to the VALU Index Taster and full VALU Index. We do not publish assessment answers in public profiles. We do not collect biometric data.\n• Professional profile: any information you choose to add — headline, bio, photo, location, industry, skills, speaking topics, video links, LinkedIn URL, and availability. This is voluntary.\n• Enquiries: messages sent through the platform between buyers and professionals, including subject and body text.\n• Technical data: IP address, browser type, and session data collected automatically for security and platform integrity purposes.`,
  },
  {
    title: '3. Why we collect it',
    body: `We process your personal data for the following purposes:\n\n• To operate the Valoria Institute marketplace — matching assessed professionals with employers, event organisers, and training buyers.\n• To administer the VALU Index — computing your score, generating your AI report, and maintaining your assessment history.\n• To operate public professional listings. A Basic listing may follow a completed, account-linked VALU Index Taster once the professional profile, minimum public identity requirements, explicit public-display consent and integrity checks are complete. A Full listing additionally requires a current Full VALU Index score of at least 35 points and the applicable profile and listing checks.\n• To facilitate introductions between buyers and professionals — all contact is mediated by Valoria; contact details are never shared directly.\n• To send transactional communications — account verification, assessment results, and enquiry notifications.\n• To maintain platform security — detecting unusual activity, integrity flags on assessments, and preventing abuse.`,
  },
  {
    title: '4. Legal basis for processing',
    body: `Under the Nigeria Data Protection Act 2023 (NDPA), we process your data on the following bases:\n\n• Contract: processing necessary to provide the services you have requested.\n• Legitimate interest: platform security, fraud prevention, and service improvement.\n• Consent: for processing that requires your permission — including public marketplace display, AI report generation where applicable, and optional analytics or marketing technologies. You may change optional cookie choices through Cookie Preferences or withdraw other consent by contacting us.`,
  },
  {
    title: '5. Who we share data with',
    body: `We do not sell your personal data. We share data only with:\n\n• Supabase (database and authentication infrastructure) — your data is stored on their servers under data processing agreements.\n• Anthropic (AI report generation) — a de-identified VALU Index score profile containing aggregate score, canonical designation, cluster scores and skill scores is sent to generate your AI report. Your name, email, account/user ID, identity hash, raw answers and profile text are not included in the AI request. Valoria continues to treat the score profile as personal data and applies the safeguards in this policy.\n• Resend (transactional email) — your email address is used to send verification and notification emails.\n• Google Analytics 4 (Google LLC) — site usage, device/browser and interaction data are processed only if you enable analytics cookies.\n• Meta Pixel (Meta Platforms, Inc.) — campaign and site-interaction events are processed only if you enable marketing cookies.\n\nGoogle Analytics and Meta Pixel are not loaded before the corresponding optional consent is given. We do not share your contact details or assessment answers with employers, organisers, or other platform users. All introductions are facilitated by Valoria Institute staff.`,
  },
  {
    title: '6. How long we keep your data',
    body: `• Assessment data: retained indefinitely to support the 12-month retake policy and to maintain your score history. You may request deletion at any time.\n• Profile data: retained until you delete your account.\n• Enquiry data: retained for 36 months after the enquiry is closed, then deleted.\n• Waitlist data: retained until you register or request removal.\n\nYou may request deletion of your data at any time by emailing privacy@valoriainstitute.com. We will action deletion requests within 30 days.`,
  },
  {
    title: '7. Your rights',
    body: `Under NDPA 2023, you have the right to:\n\n• Access: request a copy of the personal data we hold about you.\n• Correction: request correction of inaccurate data.\n• Deletion: request deletion of your data, subject to our retention obligations.\n• Objection: object to processing based on legitimate interest.\n• Portability: receive your data in a machine-readable format.\n• Withdraw consent: where processing is based on consent, you may withdraw at any time.\n\nTo exercise any of these rights, contact: privacy@valoriainstitute.com`,
  },
  {
    title: '8. Cookies and tracking',
    body: `We use essential first-party cookies where required for account access, security and core site functions. These are necessary for the service to operate.\n\nOptional analytics and marketing technologies are disabled by default. Google Analytics 4 is loaded only after you enable Analytics, and Meta Pixel is loaded only after you enable Marketing. Your choices are stored in a first-party consent cookie for six months. If you reject optional technologies, neither service is loaded.\n\nYou can change or withdraw your optional cookie choices at any time using Cookie Preferences in the site footer.`,
  },
  {
    title: '9. Data security',
    body: `All data is transmitted over HTTPS. Passwords are hashed using bcrypt and are never stored in plaintext. Database access is protected by Row Level Security — each user can only access their own records. Assessment answers are stored server-side only and are never accessible to other users or third parties.`,
  },
  {
    title: '10. Changes to this policy',
    body: `We may update this policy periodically. Material changes will be communicated by email to registered users. The date of the most recent revision is shown at the bottom of this page.`,
  },
  {
    title: '11. Contact',
    body: `African Talent Bureau Ltd\nValoria Institute\nLagos, Nigeria\n\nEmail: privacy@valoriainstitute.com\nGeneral enquiries: info@valoriainstitute.com`,
  },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <Nav />
      <main id="main-content" style={{ minHeight: '100vh', background: DARK, fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif", color: PARCHMENT }}>

        {/* Hero */}
        <section style={{ padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,80px) 48px', borderBottom: '1px solid rgba(201,168,76,.1)', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ height: '1px', width: '40px', background: 'rgba(201,168,76,.4)' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.2em', color: GOLD }}>PRIVACY POLICY</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 200, lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: '20px' }}>
            How we handle<br /><em style={{ fontStyle: 'italic', color: GOLD }}>your data.</em>
          </h1>
          <p style={{ fontSize: '15px', fontWeight: 300, color: DIM, lineHeight: 1.8, maxWidth: '560px' }}>
            African Talent Bureau Ltd is committed to protecting your personal data. This policy explains what we collect, why, and how — in plain language, compliant with the Nigeria Data Protection Act 2023.
          </p>
          <p style={{ fontSize: '12px', color: '#B8B6BF', marginTop: '16px' }}>
            Last updated: 28 November 2026 · NDPA 2023
          </p>
        </section>

        {/* Sections */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px clamp(24px,5vw,80px) 100px' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: i < sections.length - 1 ? '1px solid rgba(201,168,76,.06)' : 'none' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: PARCHMENT, marginBottom: '16px' }}>{s.title}</h2>
              <div style={{ fontSize: '14px', fontWeight: 300, color: DIM, lineHeight: 1.9, whiteSpace: 'pre-line' }}>{s.body}</div>
            </div>
          ))}

          <div style={{ padding: '24px', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.12)', borderRadius: '10px', marginTop: '16px' }}>
            <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.7, margin: 0 }}>
              Questions about this policy? Email <a href="mailto:privacy@valoriainstitute.com" style={{ color: GOLD }}>privacy@valoriainstitute.com</a> and we will respond within 5 business days.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
