import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../pages.css'

export const metadata = {
  title: 'Privacy Policy | Valoria Institute',
  description: 'Draft privacy information for Valoria Institute. Legal operator, retention and cross-border processing details require confirmation before production publication.',
  robots: process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' ? { index: false, follow: false } : { index: true, follow: true },
  alternates: { canonical: 'https://valoriainstitute.com/privacy' },
}

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.55)'
const IS_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1'

const sections = [
  {
    title: '1. Who we are',
    body: `Valoria Institute is the public-facing name of the institution and platform described in this policy. Nigeria is the current operating jurisdiction. The registered legal entity responsible for the service, its registered address and the formal data-controller details are pending confirmation and must be completed before this policy is approved for production.\n\nWe operate the Valoria Institute website, professional Marketplace and VALU Index assessment experience. For privacy questions, contact info@valoriainstitute.com.`,
  },
  {
    title: '2. Data we collect',
    body: `We collect the following categories of personal data:\n\n• Waitlist sign-ups: full name, email address, professional role.\n• Account registration: full name, email address, password (hashed — never stored in plaintext), account type (professional or organization contact), and company name where applicable.\n• VALU taster: your directional responses and related session data. These are handled separately from the formal assessment record and do not determine your official VALU Index.
• VALU Index formal assessment: your 58 responses, time taken per question, and scoring metadata used to calculate your official VALU Index and PRIME points. We do not collect biometric data.\n• Professional profile: any information you choose to add — headline, bio, photo, location, industry, skills, speaking topics, video links, LinkedIn URL, and availability. This is voluntary.\n• Enquiries: messages sent through the platform between organizations and professionals, including subject and message text.\n• Event registration: name, email address, session selected, consent, and optional role, organisation and WhatsApp details.\n• Technical data: IP address, browser type, and session data collected automatically for security and platform integrity purposes.`,
  },
  {
    title: '3. Why we collect it',
    body: `We process personal data to operate user accounts, administer the separate VALU taster and full assessment journeys, calculate and maintain VALU results, generate assessment reports, manage professional profiles and capability listings, respond to enquiries, facilitate approved introductions, send transactional communications, protect platform security and prevent abuse.\n\nA profile is not made public merely because a person completes an assessment. Marketplace visibility depends on the applicable eligibility, profile-completion, governance and consent requirements.`,
  },
  {
    title: '4. Legal basis for processing',
    body: `The intended processing bases include steps necessary to provide services requested by you, legitimate interests such as platform security and fraud prevention, and consent where required — including public profile visibility. The final lawful-basis mapping, consent wording and controller responsibilities must be reviewed and approved against the Nigeria Data Protection Act 2023 before production publication. You may contact info@valoriainstitute.com with questions about consent or data use.`,
  },
  {
    title: '5. Who we share data with',
    body: `We do not sell personal data. The current service uses the following providers:\n\n• Supabase — database and authentication infrastructure. The production database is hosted in an EU region.\n• Anthropic — AI report generation. The report-generation request includes your name, professional role, overall VALU score, designation, PRIME cluster scores and skill scores. Raw assessment answers are not included in that request.\n• Resend — transactional email and report delivery. Messages may include your name, email address, assessment score, designation and report content.\n• Brevo — event registration records and event communications. Depending on the form and configuration, this may include your name, email address, session details, role, organisation and WhatsApp number.\n• Cloudflare — website and application hosting, edge delivery and security. Network requests may involve technical data such as IP address, browser and request metadata.\n\nIf you explicitly consent to public marketplace visibility, your public profile may display your ATB ID, professional headline, selected capabilities and approved profile summary. Personal names are not displayed on public profile cards or pages. For Full assessment profiles, VALU Index points and the applicable merit tier may also be displayed. Your email address, phone number, CV file and individual assessment answers are not displayed as public profile fields. Any information shared during an introduction must follow the applicable request and consent process.\n\nThe exact provider locations, international-transfer arrangements and contractual safeguards for each provider must be confirmed before this policy is approved for production.`,
  },
  {
    title: '6. How long we keep your data',
    body: `We intend to retain personal data only for as long as necessary to provide the service, maintain assessment integrity, manage accounts and enquiries, resolve disputes and meet applicable legal obligations.\n\nThe specific retention periods and deletion procedures for assessment records, professional profiles, enquiries, event registrations, waitlist records, backups and provider logs have not yet been approved. They must be confirmed and documented before production publication. You may direct a data request to info@valoriainstitute.com.`,
  },
  {
    title: '7. Your rights',
    body: `Depending on the applicable law and circumstances, you may have rights to request access to personal data, correction of inaccurate data, deletion, restriction or objection to certain processing, data portability, and withdrawal of consent where processing relies on consent. These rights may be subject to legal exceptions.\n\nTo make a request, contact info@valoriainstitute.com. The identity-verification process and response timelines must be confirmed in the final approved policy.`,
  },
  {
    title: '8. Cookies and tracking',
    body: `The website and platform may use cookies or similar browser storage to support essential functionality, authentication, session continuity, preferences and security. The complete cookie and local-storage inventory, including any analytics or third-party tags, must be verified against the deployed site before this section is finalised.`,
  },
  {
    title: '9. Data security',
    body: `The service uses HTTPS, authenticated access, server-side controls and database Row Level Security. Public profile information may be visible where a professional has chosen the relevant visibility and met the applicable listing requirements. Private account data and raw assessment responses are intended to remain restricted to authorised processing. A complete security and access-control review is required before this statement is treated as a final assurance.`,
  },
  {
    title: '10. Changes to this policy',
    body: `We may update this policy periodically. Material changes will be communicated by email to registered users. The date of the most recent revision is shown at the bottom of this page.`,
  },
  {
    title: '11. Contact',
    body: `Valoria Institute (public-facing service name)\nNigeria (current operating jurisdiction)\n\nRegistered legal entity, registered address and formal data-controller identity: pending confirmation.\n\nEmail: info@valoriainstitute.com\nGeneral enquiries: info@valoriainstitute.com`,
  },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <Nav />
      <main id="main-content" style={{ minHeight: '100vh', background: DARK, fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif", color: PARCHMENT }}>

        {IS_PREVIEW && <div role="status" style={{maxWidth:'860px',margin:'24px auto 0',padding:'14px 20px',border:'1px solid rgba(201,168,76,.35)',background:'rgba(201,168,76,.07)',color:PARCHMENT,fontSize:'12px',lineHeight:1.7}}>LEGAL REVIEW REQUIRED — This staging draft must not be treated as a final privacy notice. Confirm the legal controller, provider locations, retention schedule, consent wording and international-transfer safeguards before production.</div>}
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
            This draft explains how Valoria Institute handles personal data. It is not a final legal notice; controller identity, processor arrangements, retention periods and international-transfer safeguards require approval before production.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(247,244,238,.3)', marginTop: '16px' }}>
            Draft for legal review · 7 November 2026
          </p>
        </section>

        {/* Plain-language privacy summary for professionals and organizations. */}
        <section aria-labelledby="privacy-quick-answers" style={{ maxWidth: '860px', margin: '0 auto', padding: '40px clamp(24px,5vw,80px) 12px' }}>
          <h2 id="privacy-quick-answers" style={{ fontSize: '22px', fontWeight: 600, color: PARCHMENT, marginBottom: '22px' }}>Your privacy, in plain language.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
            <article style={{ padding: '20px', border: '1px solid rgba(201,168,76,.22)', borderRadius: '14px', background: 'rgba(201,168,76,.045)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: PARCHMENT, margin: '0 0 10px' }}>Does Valoria sell my personal information?</h3>
              <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.75, margin: 0 }}>No. Valoria does not sell personal data.</p>
            </article>
            <article style={{ padding: '20px', border: '1px solid rgba(201,168,76,.22)', borderRadius: '14px', background: 'rgba(201,168,76,.045)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: PARCHMENT, margin: '0 0 10px' }}>Who can see my professional profile?</h3>
              <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.75, margin: 0 }}>Your profile is public only if you choose public visibility and meet the applicable listing requirements. Completing an assessment does not, by itself, make your profile public.</p>
            </article>
            <article style={{ padding: '20px', border: '1px solid rgba(201,168,76,.22)', borderRadius: '14px', background: 'rgba(201,168,76,.045)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: PARCHMENT, margin: '0 0 10px' }}>What is not shown on my public profile?</h3>
              <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.75, margin: 0 }}>Your email address, phone number, CV file and individual assessment answers are not displayed as public profile fields.</p>
            </article>
          </div>
          <p style={{ fontSize: '12px', color: DIM, lineHeight: 1.7, marginTop: '18px' }}>Valoria facilitates introductions through a request and review process. Personal details shared for an introduction must follow the applicable request and consent process. <a href="#privacy-details" style={{ color: GOLD, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Read the full privacy details below.</a></p>
        </section>

        {/* Sections */}
        <div id="privacy-details" style={{ maxWidth: '860px', margin: '0 auto', padding: '48px clamp(24px,5vw,80px) 100px' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: i < sections.length - 1 ? '1px solid rgba(201,168,76,.06)' : 'none' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: PARCHMENT, marginBottom: '16px' }}>{s.title}</h2>
              <div style={{ fontSize: '14px', fontWeight: 300, color: DIM, lineHeight: 1.9, whiteSpace: 'pre-line' }}>{s.body}</div>
            </div>
          ))}

          <div style={{ padding: '24px', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.12)', borderRadius: '10px', marginTop: '16px' }}>
            <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.7, margin: 0 }}>
              Questions about this draft? Email <a href="mailto:info@valoriainstitute.com" style={{ color: GOLD }}>info@valoriainstitute.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
