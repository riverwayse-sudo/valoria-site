import Link from 'next/link'
import KnowledgeArticle from '@/components/KnowledgeArticle'
import { TIER_DESIGNATIONS, VALU_SCORE } from '@/lib/brand'

export const metadata = {
  title: 'The VALU Index: Assessment and Points | Valoria Institute',
  description: 'Learn what the VALU Index represents, how Valoria expresses results in points and how earned designations are interpreted.',
  alternates: { canonical: 'https://valoriainstitute.com/knowledge/valu-index' },
}

export default function ValuKnowledgePage() {
  return (
    <KnowledgeArticle
      title="The VALU Index"
      eyebrow="ASSESSMENT & PROFESSIONAL INSIGHT"
      description="The VALU Index provides a structured, points-based view of professional capability across the five clusters of the PRIME Framework."
      path="/knowledge/valu-index"
    >
      <h2 className="section-title">What the VALU Index represents</h2>
      <p className="page-copy">The VALU Index is Valoria’s assessment-led view of professional capability. It helps a professional understand current strengths and development priorities, and gives organisations a more structured context for professional discovery.</p>
      <p className="page-copy">The guided VALU taster introduces the framework. The official VALU Index and earned designation are established when the full assessment is completed.</p>

      <h2 className="section-title">How results are expressed</h2>
      <p className="page-copy">VALU results are expressed in <strong>{VALU_SCORE.unit}</strong>, not percentages. The official score is presented on a 0–{VALU_SCORE.maximum} point scale and remains valid for 12 months.</p>

      <h2 className="section-title">Earned designations</h2>
      <div className="programmes-grid">
        {TIER_DESIGNATIONS.map(tier => (
          <article className="card-gold programme-card" key={tier.name}>
            <h3 className="cluster-name">{tier.name}</h3>
            <p className="programme-label">{tier.min === 0 ? 'Below 35 points' : tier.min + '–' + tier.max + ' points'}</p>
            <p className="cluster-desc">{tier.description}</p>
          </article>
        ))}
      </div>
      <p className="page-copy">Designations are earned through assessment. They are not subscription tiers and cannot be purchased, upgraded by subscription or transferred.</p>

      <h2 className="section-title">What the result does — and does not — mean</h2>
      <p className="page-copy">A VALU result is a structured assessment signal. It can support reflection, development planning and professional discovery. It does not guarantee job performance, employment, promotion or professional success. Buyers should consider the wider professional profile, experience and requirements of the opportunity.</p>
      <p className="page-copy"><Link className="text-link" href="/valu">Explore the VALU Index →</Link></p>
    </KnowledgeArticle>
  )
}
