import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../pages.css'

export const metadata = {
  title: 'Privacy Policy | Valoria Institute',
  description: 'How Valoria Institute collects, uses, and protects personal data.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://valoriainstitute.com/privacypolicy' },
}

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.55)'

const sections = [
  {
    title: '1. Who we are',
    body: `Valoria Institute is an initiative of African Talent Bureau Ltd, registered in Nigeria. We operate the Valoria Institute professional marketplace at valoriainstitute.com and the VALU Index assessment platform at valoriainstitute.com/valu.\n\nFor questions about this policy, contact us at: privacy@valoriainstitute.com`,
  },
  {
    title: '2. Data we collect',
    body: `We collect the following categories of personal data:\n\n• Waitlist sign-ups: full name, email address, professional role.\n• Account registration: full name, email address, password (hashed — never stored in plaintext), user type (professional, employer, event organiser, or training buyer), and company name where applicable.\n• VALU Index assessment: responses and assessment results, where applicable, together with completion and assessment-integrity records. We do not collect biometric data.\n• Professional profile: any information you choose to add — headline, bio, photo, location, industry, skills, speaking topics, video links, LinkedIn URL, and availability. This is voluntary.\n• Enquiries: buyer and professional enquiry details, including contact details, organisation information, the selected enquiry type, and message content submitted through the platform.\n• Technical data: IP address, browser type, and session data collected automatically for security and platform integrity purposes.`,
  },
  {
    title: '3. Why we collect it',
    body: `We process your personal data for the following purposes:\n\n• To operate the Valoria Institute marketplace — matching assessed professionals with employers, event organisers, and training buyers.\n• To administer the VALU Index assessment — computing your score, generating your AI report, and maintaining your assessment history.\n• To maintain the correct marketplace tier — including Basic for a completed, linked taster and Full for a current completed Full VALU Index assessment. Tier assignment does not automatically make a profile public. Public listing requires the relevant identity, profile, capability, evidence, review and consent requirements.\n• To facilitate introductions between buyers and professionals — all contact is mediated by Valoria; contact details are never shared directly.\n• To send transactional communications — account verification, assessment results, and enquiry notifications.\n• To maintain platform security — detecting unusual activity, integrity flags on assessments, and preventing abuse.`,
  },
  {
    title: '4. Legal basis for processing',
    body: `Under the Nigeria Data Protection Act 2023 (NDPA), we process your data on the following bases:\n\n• Contract: processing necessary to provide the services you have requested.\n• Legitimate interest: platform security, fraud prevention, and service improvement.\n• Consent: for public marketplace visibility and other processing that requires consent. You may withdraw public-visibility consent through the available profile controls or by contacting us.`,
  },
  {
    title: '5. Who we share data with',
    body: `We do not sell your personal data. We use service providers to operate the platform and deliver requested services. These may include:\n\n• Supabase — database, authentication and related platform infrastructure.\n• Cloudflare — website hosting, content delivery, network security and request handling.\n• Anthropic — AI-assisted VALU report generation. The report-generation request includes your professional name, role, aggregate VALU score, cluster scores and skill scores. Your email address is not included in that request.\n• Brevo — transactional email, including account, enquiry and notification messages.\n• Google Analytics — website usage and conversion measurement.\n• Meta — measurement tools where the Meta Pixel is enabled for the site.\n\nThese providers process data according to their applicable terms and our configuration of their services. We do not display professional contact details on public profile cards. Buyer enquiries are routed through Valoria's managed enquiry process; assessment answers and private profile information are not made available to buyers through public profile pages.`,
  },
  {
    title: '6. How long we keep your data',
    body: `We retain personal data for as long as it is reasonably necessary for the purposes described in this policy, including account operation, assessment integrity, enquiry handling, security, dispute resolution and applicable legal obligations. Retention periods may differ by data category and may be affected by a pending deletion request or legal requirement. We do not promise that all assessment or enquiry records are automatically deleted at a fixed interval.\n\nYou may request access, correction or deletion by emailing privacy@valoriainstitute.com. We will assess and respond to requests in accordance with the Nigeria Data Protection Act 2023 and any applicable retention obligations.`,
  },
  {
    title: '7. Your rights',
    body: `Under NDPA 2023, you have the right to:\n\n• Access: request a copy of the personal data we hold about you.\n• Correction: request correction of inaccurate data.\n• Deletion: request deletion of your data, subject to our retention obligations.\n• Objection: object to processing based on legitimate interest.\n• Portability: receive your data in a machine-readable format.\n• Withdraw consent: where processing is based on consent, you may withdraw at any time.\n\nTo exercise any of these rights, contact: privacy@valoriainstitute.com`,
  },
  {
    title: '8. Cookies and tracking',
    body: `The site uses authentication/session technologies, including cookies and browser storage, to maintain sign-in and support platform functionality. The marketing site also loads Google Analytics for usage and conversion measurement. A Meta Pixel may load when its site configuration is enabled. These measurement tools may use cookies or similar technologies and may receive information such as page views, device/browser details, referring pages and interactions with site features.`,
  },
  {
    title: '9. Data security',
    body: `Data is transmitted over HTTPS. Authentication and database access use Supabase security controls, including Row Level Security, server-side authorization and role-based access for restricted operations. Access rules differ by data type: some information is available to authorised administrators, and public profile information is returned only through the approved visibility and consent checks. Assessment responses and private profile information are not intended to be exposed through public profile pages.`,
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
            African Talent Bureau Ltd is committed to protecting your personal data. This policy explains what we collect, why, and how, with reference to the Nigeria Data Protection Act 2023.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(247,244,238,.3)', marginTop: '16px' }}>
            Last updated: 7 November 2026
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
