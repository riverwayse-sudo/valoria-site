import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'
import { BRAND } from '@/lib/brand'
import './contact.css'

export const metadata = {
  title: 'Contact Valoria Institute',
  description: 'Start a conversation with Valoria Institute about talent, speaking, learning, partnerships, or the VALU Index.',
}

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="contact-page">
        <section className="contact-layout" aria-labelledby="contact-title">
          <div className="contact-intro">
            <div className="contact-eyebrow"><span /> WE’D LOVE TO HEAR FROM YOU</div>
            <h1 id="contact-title">Let’s start a<br /><em>meaningful conversation.</em></h1>
            <div className="contact-title-rule" />
            <p className="contact-lede">Have a question, partnership proposal, or want to learn more about Valoria Institute? Tell us what you’re working towards. We’re here to help.</p>

            <div className="contact-details">
              <a className="contact-detail-card" href={`mailto:${BRAND.email}`}>
                <span className="contact-detail-icon" aria-hidden="true">✉</span>
                <span><small>EMAIL US</small><strong>{BRAND.email}</strong></span>
              </a>
              <div className="contact-detail-card">
                <span className="contact-detail-icon" aria-hidden="true">⌖</span>
                <span><small>OUR LOCATION</small><strong>{BRAND.location}</strong><span className="contact-detail-note">Working with changemakers and institutions across borders.</span></span>
              </div>
              <div className="contact-detail-card">
                <span className="contact-detail-icon" aria-hidden="true">◷</span>
                <span><small>RESPONSE TIME</small><strong>Within 1–2 business days</strong><span className="contact-detail-note">Our team will review your message and respond directly.</span></span>
              </div>
            </div>
            <blockquote className="contact-quote">“Valoria Institute exists to elevate human potential and build a better future—together.”</blockquote>
          </div>

          <section className="contact-form-panel" aria-labelledby="contact-form-title">
            <div className="contact-form-heading">
              <span className="contact-send-icon" aria-hidden="true">↗</span>
              <div><h2 id="contact-form-title">Send us a message</h2><p>Share a little about what you need and we’ll take it from there.</p></div>
            </div>
            <ContactForm />
            <p className="contact-privacy">Your information is used only to respond to your enquiry. By submitting, you agree to our <a href="/privacypolicy">Privacy Policy</a>.</p>
          </section>
        </section>

        <section className="contact-partnership" aria-label="Partnership enquiries">
          <div className="contact-partnership-mark" aria-hidden="true">✧</div>
          <div><h2>Partnerships that create impact</h2><p>We collaborate with organisations, institutions, and individuals who share our vision for a more purposeful world.</p></div>
          <a href={`mailto:${BRAND.email}?subject=Partnership%20Enquiry`}>EXPLORE PARTNERSHIPS <span aria-hidden="true">→</span></a>
        </section>
      </main>
      <Footer />
    </>
  )
}
