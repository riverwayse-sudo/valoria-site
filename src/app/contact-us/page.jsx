import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import ContactForm from './ContactForm'
import { BRAND } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Valoria Institute — hiring, speaker booking, training enquiries, or general questions.',
}

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">GET IN TOUCH</span></div>
            <h1 className="page-title">Let&apos;s talk<br /><em>capability.</em></h1>
            <p className="page-sub">
              Hiring, booking a speaker, commissioning a training programme, or just have a question about the VALU Index — reach us directly.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="info-card">
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">SEND A MESSAGE</span></div>
                <ContactForm />
              </div>
            </Reveal>
            <Reveal>
              <div className="info-card" className="info-card contact-direct-card">
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">EMAIL DIRECTLY</span></div>
                <a href={`mailto:${BRAND.email}`} className="contact-email">{BRAND.email}</a>
                <p className="contact-note">We respond within two business days.</p>
              </div>
              <div className="info-card">
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">LOCATION</span></div>
                <p className="contact-location">{BRAND.location}</p>
                <p className="contact-note">A {BRAND.copyrightEntity} initiative. {BRAND.compliance}.</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="page-section alt cta-banner">
          <Reveal>
            <h2 className="section-title">Specific entry point<br /><em>in mind?</em></h2>
            <p className="page-sub">Prefer email? Go straight to the team that handles it.</p>
            <div className="page-hero-actions" className="page-hero-actions page-hero-actions-centered">
              <a href={`mailto:${BRAND.email}?subject=Hiring%20Enquiry%20-%20ATB%20Connect`} className="btn-outline">HIRING ENQUIRY</a>
              <a href={`mailto:${BRAND.email}?subject=Speaker%20Booking%20-%20ATB%20Spotlight`} className="btn-outline">SPEAKER BOOKING</a>
              <a href={`mailto:${BRAND.email}?subject=Training%20Enquiry%20-%20Valoria%20Develop`} className="btn-outline">TRAINING ENQUIRY</a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
