// Single source of truth for brand constants across the Valoria Institute site.
// Governed by Valoria Institute Brand Guidelines VI-BG-2026-001.

export const BRAND = {
  name: 'Valoria Institute',
  tagline: 'Worth. Built.',
  belief: 'Talent is not the problem. Infrastructure is.',
  promise: ['Develop', 'Surface', 'Connect'],
  email: 'info@valoriainstitute.com',
  copyrightEntity: 'Valoria Institute',
  location: 'Lagos, Nigeria',
  assessmentUrl: '/valu/assessment/',
  logo: '/logo.png',
}

export const COLORS = {
  gold: '#C9A84C', goldLight: '#D4C9A8', dark: '#1A1A2E', darkMid: '#2E2E4A', darkCard: '#F7F4EE',
  slateIndigo: '#2E2E4A', antiqueLinen: '#EDE8DC', subtleBrass: '#D4C9A8', parchment: '#F7F4EE', ivoryWhite: '#FAFAF7',
}

export const PRIME_CLUSTERS = [
  { letter: 'P', name: 'Presence', color: COLORS.gold, subtitle: 'How you show up', skills: ['Communication', 'Negotiation', 'Personal Brand & Executive Presence'] },
  { letter: 'R', name: 'Relationships', color: COLORS.gold, subtitle: 'How you connect', skills: ['Emotional Intelligence', 'Conflict Resolution', 'People Development', 'Stakeholder Management'] },
  { letter: 'I', name: 'Intelligence', color: COLORS.gold, subtitle: 'How you think', skills: ['Critical Thinking', 'Strategic Thinking', 'Business Acumen', 'AI Fluency'] },
  { letter: 'M', name: 'Mastery', color: COLORS.gold, subtitle: 'How you deliver', skills: ['Execution & Accountability', 'Resilience & Self-Leadership', 'Adaptability'] },
  { letter: 'E', name: 'Enterprise', color: COLORS.gold, subtitle: 'How you create', skills: ['Commercial Creativity', 'Influence Without Authority', 'Human-AI Collaboration'] },
]

// VALU Index values are points out of 100, not percentages.
// A taster completion grants Basic marketplace access only; it does not create an
// official VALU Index score or merit tier. Full assessment completion unlocks
// the official points score and score-earned designation.
export const VALU_SCORE = {
  unit: 'points',
  maximum: 100,
  displaySuffix: 'points',
}

export const MARKETPLACE_ACCESS_LEVELS = {
  BASIC: {
    id: 'basic',
    label: 'Basic',
    source: 'taster',
    officialIndex: false,
    meritTier: false,
    access: 'limited',
  },
  FULL: {
    id: 'full',
    label: 'Full VALU Index',
    source: 'full_assessment',
    officialIndex: true,
    meritTier: true,
    access: 'full',
  },
}

// VALU designations are assigned from full-assessment points.
// A designation is an assessment result, not a certification or guarantee of performance.
export const TIER_DESIGNATIONS = [
  { level: 5, min: 80, max: 100, name: 'Force to Align With', badgeClass: 'force-to-align', description: 'The highest expression of professional capability.' },
  { level: 4, min: 65, max: 79, name: 'Emerging Force', badgeClass: 'emerging-force', description: 'Strong capability with clear cluster strengths.' },
  { level: 3, min: 50, max: 64, name: 'Developing Professional', badgeClass: 'developing-professional', description: 'A solid baseline with clear development opportunities.' },
  { level: 2, min: 35, max: 49, name: 'Building Foundations', badgeClass: 'building-foundations', description: 'An early-stage capability profile with development as the priority.' },
  { level: 1, min: 0, max: 34, name: 'At the Starting Point', badgeClass: 'starting-point', description: 'A starting point for focused professional development.' },
]

export function getValuTier(points, assessmentLevel = 'full') {
  if (assessmentLevel !== 'full' || points == null || !Number.isFinite(Number(points))) return null
  const score = Number(points)
  if (score < 0 || score > VALU_SCORE.maximum) return null
  return TIER_DESIGNATIONS.find(tier => score >= tier.min && score <= tier.max) || null
}

export const ENTRY_POINTS = [
  {
    id: 'atb-connect', num: '01', name: 'ATB Connect', buyer: 'FOR EMPLOYERS', color: COLORS.gold,
    modality: 'PRECISION TALENT SOURCING',
    desc: 'Discover professionals through capability-led profiles, experience and role fit. VALU points and assessment insight appear where the full assessment is complete.',
    href: '/atb-connect', linkLabel: 'EXPLORE ATB CONNECT',
  },
  {
    id: 'spotlight', num: '02', name: 'ATB Spotlight', buyer: 'FOR EVENT ORGANISERS & TRAINING BUYERS', color: COLORS.gold,
    modality: 'MERIT-BASED VISIBILITY',
    desc: 'Discover speakers and facilitators through capability-led profiles, demonstrated experience and selected expertise. Availability depends on the public Marketplace inventory.',
    href: '/atb-spotlight', linkLabel: 'EXPLORE ATB SPOTLIGHT',
  },
  {
    id: 'develop', num: '03', name: 'Valoria Develop', buyer: 'FOR PROFESSIONALS & ORGANISATIONS', color: COLORS.gold,
    modality: 'CAPABILITY DEVELOPMENT',
    desc: 'PRIME-mapped development designed around the capability gaps that matter most, with clear pathways for professional growth.',
    href: '/develop', linkLabel: 'EXPLORE DEVELOPMENT',
  },
]
