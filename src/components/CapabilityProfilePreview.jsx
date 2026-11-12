import Reveal from '@/components/Reveal'
import { AssessmentStartLink } from '@/components/Nav'

const PRIME = [
  ['P', 'Presence'],
  ['R', 'Relationships'],
  ['I', 'Intelligence'],
  ['M', 'Mastery'],
  ['E', 'Enterprise'],
]

export default function CapabilityProfilePreview() {
  return (
    <section className="capability-preview" aria-labelledby="capability-preview-title">
      <div className="capability-preview-shell">
        <Reveal className="capability-preview-copy">
          <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE VALORIA PROFILE</span></div>
          <h2 id="capability-preview-title">One professional identity. <em>More of your capability.</em></h2>
          <p>Bring the different ways you contribute into one considered profile. Your work, experience and capabilities belong in the same picture.</p>
          <AssessmentStartLink href="/valu/register/" className="capability-preview-link">
            CREATE YOUR VALORIA ACCOUNT <span aria-hidden="true">→</span>
          </AssessmentStartLink>
        </Reveal>

        <Reveal className="capability-profile-card" aria-label="Illustrative Valoria professional profile structure">
          <div className="cpc-top">
            <span>VALORIA PROFILE</span>
            <span>PRIME FRAMEWORK</span>
          </div>
          <div className="cpc-person">
            <div className="cpc-avatar" aria-hidden="true">V</div>
            <div className="cpc-person-copy">
              <small>PROFESSIONAL IDENTITY</small>
              <strong>Your work, in context.</strong>
              <span>Role · Experience · Organisation</span>
            </div>
            <div className="cpc-mark" aria-hidden="true">✳</div>
          </div>
          <div className="cpc-capabilities">
            <small>CAPABILITIES</small>
            <div className="cpc-chips">
              <span>Talent</span>
              <span>Speaker</span>
              <span>Facilitator</span>
            </div>
          </div>
          <div className="cpc-prime">
            <div className="cpc-prime-heading">
              <small>CAPABILITY DIMENSIONS</small>
              <span>THE PRIME FRAMEWORK</span>
            </div>
            <div className="cpc-prime-grid">
              {PRIME.map(([letter, label]) => (
                <div className="cpc-prime-item" key={letter}>
                  <b>{letter}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cpc-footer">
            <span>VALU INDEX</span>
            <strong>Official points follow the full assessment.</strong>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
