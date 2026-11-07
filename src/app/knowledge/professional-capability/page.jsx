import Link from 'next/link'
import KnowledgeArticle from '@/components/KnowledgeArticle'

export const metadata = {
  title: 'Professional Capability: Beyond a Job Title | Valoria Institute',
  description: 'Understand professional capability as a structured view of skills, judgement, relationships, execution and enterprise contribution.',
  alternates: { canonical: 'https://valoriainstitute.com/knowledge/professional-capability' },
}

export default function ProfessionalCapabilityKnowledgePage() {
  return (
    <KnowledgeArticle
      title="Professional Capability"
      eyebrow="THE CORE CONCEPT"
      description="Professional capability is more than a job title, résumé or list of skills. It is the combination of strengths and behaviours a person brings to professional work."
      path="/knowledge/professional-capability"
    >
      <h2 className="section-title">Beyond the CV</h2>
      <p className="page-copy">A CV records experience and a professional profile communicates identity. Neither, on its own, provides a complete picture of how a person thinks, works with others, delivers outcomes or creates value.</p>
      <p className="page-copy">Valoria uses the PRIME Framework to organise professional capability across Presence, Relationships, Intelligence, Mastery and Enterprise. The VALU Index provides an assessment-led view of those capabilities in points.</p>

      <h2 className="section-title">Why structured capability matters</h2>
      <div className="facilitator-diff-list">
        <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">For professionals</div><p className="facilitator-diff-copy">Understand strengths, identify development priorities and present capability in a more structured professional record.</p></div></div>
        <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">For employers and buyers</div><p className="facilitator-diff-copy">Explore professional capability alongside experience, sector context and the requirements of a role, event or programme.</p></div></div>
        <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">For development</div><p className="facilitator-diff-copy">Use a shared framework to make learning priorities clearer and connect development to professional goals.</p></div></div>
      </div>

      <h2 className="section-title">Capability and opportunity</h2>
      <p className="page-copy">The Valoria Marketplace connects one professional profile to the capabilities a person chooses to present: Talent, Speaker and Facilitator. Each capability follows its own eligibility and visibility requirements. A capability is not a separate professional identity.</p>
      <p className="page-copy">Public visibility depends on the applicable assessment, profile, eligibility and privacy requirements. Assessment results support a more structured view; they do not guarantee suitability for a particular opportunity.</p>
      <p className="page-copy"><Link className="text-link" href="/marketplace">Explore the Valoria Marketplace →</Link></p>
    </KnowledgeArticle>
  )
}
