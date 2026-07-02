import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../pages.css'

export const metadata = {
  title: 'Terms of Use | Valoria Institute',
  description: 'Terms governing your use of the Valoria Institute platform — for professionals, employers, event organisers, and training buyers.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://valoriainstitute.com/terms-of-use' },
}

const GOLD = '#C9A84C'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.55)'

const sections = [
  {
    title: '1. About these terms',
    body: `These Terms of Use govern your access to and use of the Valoria Institute platform, including the marketplace at valoriainstitute.com and the VALU Index assessment at assessment.valoriainstitute.com, operated by African Talent Bureau Ltd ("Valoria Institute", "we", "us").\n\nBy creating an account or joining the waitlist, you agree to these terms. If you do not agree, do not use the platform.`,
  },
  {
    title: '2. Who can use the platform',
    body: `You must be 18 years or older to use Valoria Institute. By registering, you confirm that the information you provide is accurate and complete.\n\nThe platform serves four types of users:\n\n• Professionals — candidates, speakers, and facilitators who complete the VALU Index and may list on the marketplace.\n• Employers — organisations searching for assessed candidates through ATB Connect.\n• Event Organisers — individuals or organisations booking speakers through ATB Spotlight.\n• Training Buyers — L&D and HR professionals commissioning facilitators through Valoria Develop.`,
  },
  {
    title: '3. The VALU Index assessment',
    body: `The VALU Index is a self-assessment tool designed to measure professional capability across five clusters. By taking the assessment, you agree that:\n\n• You will complete it independently and honestly. Attempts to game or manipulate results — including rushing through questions, selecting uniform responses, or using assistance — may trigger integrity flags and may result in a score penalty or assessment invalidation.\n• Your score is valid for 12 months from the date of assessment. After expiry, your listing is automatically suspended until you reassess.\n• Valoria Institute reserves the right to review flagged assessments and may override, adjust, or invalidate scores where integrity concerns are substantiated.\n• Your score is not a guarantee of employment, booking, or commission. It is one input into a buyer's decision.`,
  },
  {
    title: '4. Marketplace listing',
    body: `Professionals who score 35 or above and have no unresolved integrity flags are eligible for marketplace listing. Listing is not automatic — it requires:\n\n• A completed profile with at minimum: display name, headline, bio, and photo.\n• Explicit consent to be visible in marketplace search results.\n\nValoria Institute reserves the right to suspend or remove any listing that violates these terms, contains false information, or is associated with integrity concerns.\n\nYour contact details are never shown to buyers. All introductions are facilitated by Valoria Institute. You may receive communication from buyers only via the platform's managed introduction process.`,
  },
  {
    title: '5. Buyer obligations',
    body: `If you are an employer, event organiser, or training buyer using the platform to find professionals, you agree that:\n\n• Enquiries are submitted in good faith and represent genuine intent to hire, book, or commission.\n• You will not attempt to contact professionals outside the platform's facilitated introduction process.\n• You will not use professional profiles, contact information, or assessment data for purposes other than the enquiry submitted.\n• Introduction requests are not offers of employment, contracts, or guaranteed bookings. They are requests for a facilitated introduction.`,
  },
  {
    title: '6. Content you provide',
    body: `By submitting content to Valoria Institute — including your profile information, bio, photos, video links, and assessment responses — you grant Valoria Institute a non-exclusive, royalty-free licence to display that content on the platform for the purposes described in these terms.\n\nYou warrant that you own or have the right to use all content you submit, and that it does not infringe any third party's rights.\n\nValoria Institute does not take ownership of your content. You may request deletion of your data at any time under the rights described in our Privacy Policy.`,
  },
  {
    title: '7. Prohibited conduct',
    body: `You may not:\n\n• Create false or misleading profiles, credentials, or assessment responses.\n• Attempt to reverse-engineer, scrape, or extract data from the platform.\n• Use the platform to send unsolicited communications to other users.\n• Impersonate another person or organisation.\n• Use automated tools, bots, or scripts to interact with the platform.\n• Circumvent any security, access control, or integrity measures.\n\nViolation of these prohibitions may result in immediate account suspension without notice.`,
  },
  {
    title: '8. AI-generated reports',
    body: `Your VALU Index AI report is generated by an AI system (powered by Anthropic's Claude) based on your anonymised score profile. By completing the assessment, you consent to this processing.\n\nAI reports are provided for informational purposes only. They do not constitute professional advice, coaching, or psychological assessment. Valoria Institute makes no warranties about the accuracy or completeness of AI-generated content.`,
  },
  {
    title: '9. Limitation of liability',
    body: `Valoria Institute provides the platform on an "as is" basis. We do not warrant uninterrupted availability, error-free operation, or guaranteed outcomes from marketplace participation.\n\nTo the extent permitted by Nigerian law, Valoria Institute's liability for any claim arising from use of the platform is limited to the amount you paid to us in the 12 months preceding the claim, or ₦50,000, whichever is greater.`,
  },
  {
    title: '10. Termination',
    body: `You may close your account at any time by contacting us at info@valoriainstitute.com. We may suspend or terminate your account if you violate these terms, without obligation to refund any fees paid.\n\nOn termination, your profile will be removed from the marketplace. Your assessment data is retained as described in our Privacy Policy unless you request deletion.`,
  },
  {
    title: '11. Governing law',
    body: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from your use of Valoria Institute will be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.`,
  },
  {
    title: '12. Changes to these terms',
    body: `We may update these terms from time to time. We will notify registered users of material changes by email at least 14 days before they take effect. Continued use of the platform after that date constitutes acceptance of the updated terms.`,
  },
  {
    title: '13. Contact',
    body: `African Talent Bureau Ltd\nValoria Institute\nLagos, Nigeria\n\nEmail: info@valoriainstitute.com\nPrivacy enquiries: privacy@valoriainstitute.com`,
  },
]

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main-content" style={{ minHeight: '100vh', background: DARK, fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif", color: PARCHMENT }}>

        {/* Hero */}
        <section style={{ padding: 'clamp(64px,8vw,120px) clamp(24px,5vw,80px) 48px', borderBottom: '1px solid rgba(201,168,76,.1)', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ height: '1px', width: '40px', background: 'rgba(201,168,76,.4)' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.2em', color: GOLD }}>TERMS OF USE</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 200, lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: '20px' }}>
            The rules of<br /><em style={{ fontStyle: 'italic', color: GOLD }}>the platform.</em>
          </h1>
          <p style={{ fontSize: '15px', fontWeight: 300, color: DIM, lineHeight: 1.8, maxWidth: '560px' }}>
            These terms govern your use of Valoria Institute — the marketplace, the VALU Index, and all associated services. They apply to all user types: professionals, employers, event organisers, and training buyers.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(247,244,238,.3)', marginTop: '16px' }}>
            Last updated: 1 July 2026 · Governing law: Federal Republic of Nigeria
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
              Questions about these terms? Email <a href="mailto:info@valoriainstitute.com" style={{ color: GOLD }}>info@valoriainstitute.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
