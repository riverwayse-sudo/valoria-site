// Single source of truth for brand constants across the Valoria Institute site.
// Governed by Valoria Institute Brand Guidelines VI-BG-2026-001.

export const BRAND = {
  name: 'Valoria Institute',
  tagline: 'Worth. Built.',
  belief: 'Talent is not the problem. Infrastructure is.',
  promise: ['Develop', 'Surface', 'Connect'],
  email: 'info@valoriainstitute.com',
  location: 'Lagos, Nigeria',
  assessmentUrl: '/valu/assessment/',
  logo: '/logo.png',
}

export const COLORS = {
  gold: '#C9A84C', goldLight: '#D4C9A8', dark: '#1A1A2E', darkMid: '#2E2E4A', darkCard: '#F7F4EE',
  slateIndigo: '#2E2E4A', antiqueLinen: '#EDE8DC', subtleBrass: '#D4C9A8', parchment: '#F7F4EE', ivoryWhite: '#FAFAF7',
}

export const PRIME_CLUSTERS = [
  { letter: 'P', name: 'Presence', color: COLORS.gold, subtitle: 'How you show up', description: 'Presence covers how you communicate, negotiate and establish a clear professional identity.', skills: ['Communication', 'Negotiation', 'Personal Brand & Executive Presence'] },
  { letter: 'R', name: 'Relationships', color: COLORS.gold, subtitle: 'How you connect', description: 'Relationships covers how you understand people, resolve conflict, develop others and manage stakeholders.', skills: ['Emotional Intelligence', 'Conflict Resolution', 'People Development', 'Stakeholder Management'] },
  { letter: 'I', name: 'Intelligence', color: COLORS.gold, subtitle: 'How you think', description: 'Intelligence covers how you reason, think strategically, apply business judgement and work fluently with AI.', skills: ['Critical Thinking', 'Strategic Thinking', 'Business Acumen', 'AI Fluency'] },
  { letter: 'M', name: 'Mastery', color: COLORS.gold, subtitle: 'How you deliver', description: 'Mastery covers accountable execution, resilient self-leadership and the ability to adapt as conditions change.', skills: ['Execution & Accountability', 'Resilience & Self-Leadership', 'Adaptability'] },
  { letter: 'E', name: 'Enterprise', color: COLORS.gold, subtitle: 'How you create', description: 'Enterprise covers how you create commercial value, influence beyond formal authority and combine human judgement with AI.', skills: ['Commercial Creativity', 'Influence Without Authority', 'Human-AI Collaboration'] },
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

// Merit tiers are credentials earned through the full VALU Index assessment.
// Do not assign a merit tier to a taster-only/basic listing.
export const TIER_DESIGNATIONS = [
  // Canonical five-designation system from the 9 October 2026 founder-approved content brief.
  // Scores below 35 are not marketplace-listable and therefore receive no public card designation.
  { level: 4, min: 80, max: 100, name: 'Force to Align With', stars: '✦✦', badgeClass: 'forceToAlignWith' },
  { level: 3, min: 65, max: 79, name: 'Emerging Force', stars: '', badgeClass: 'emergingForce' },
  { level: 2, min: 50, max: 64, name: 'Developing Professional', stars: '', badgeClass: 'developingProfessional' },
  { level: 1, min: 35, max: 49, name: 'Building Foundations', stars: '', badgeClass: 'buildingFoundations', listable: true },
  // Explanatory designation only; scores below 35 do not receive a public marketplace card.
  { level: 0, min: 0, max: 34, name: 'At the Starting Point', stars: '', badgeClass: 'atTheStartingPoint', listable: false },
]

export function getValuTier(points, assessmentLevel = 'full') {
  if (assessmentLevel !== 'full' || points == null || !Number.isFinite(Number(points))) return null
  const score = Number(points)
  if (score < 35 || score > VALU_SCORE.maximum) return null
  return TIER_DESIGNATIONS.find(tier => score >= tier.min && score <= tier.max) || null
}

export const ENTRY_POINTS = [
  {
    id: 'atb-connect', num: '01', name: 'ATB Connect', buyer: 'FOR EMPLOYERS', color: COLORS.gold,
    modality: 'PRECISION TALENT SOURCING',
    desc: 'Search assessed professionals through structured capability data, experience and role fit. Make hiring decisions with more clarity and confidence.',
    href: '/marketplace/talent', linkLabel: 'SEARCH TALENT',
  },
  {
    id: 'spotlight', num: '02', name: 'ATB Spotlight', buyer: 'FOR EVENT ORGANISERS', color: COLORS.gold,
    modality: 'MERIT-BASED VISIBILITY',
    desc: 'Discover voices by expertise, demonstrated capability and professional merit — not familiarity or network proximity.',
    href: '/marketplace/speakers', linkLabel: 'DISCOVER SPEAKERS',
  },
  {
    id: 'develop', num: '03', name: 'Valoria Develop', buyer: 'FOR PROFESSIONALS & ORGANISATIONS', color: COLORS.gold,
    modality: 'CAPABILITY DEVELOPMENT',
    desc: 'PRIME-mapped development designed around the capability gaps that matter most, with clear pathways for professional growth.',
    href: '/programmes', linkLabel: 'EXPLORE DEVELOPMENT',
  },
]
