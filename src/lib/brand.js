// Single source of truth for brand constants across the Valoria Institute site.
// Governed by Valoria Institute Brand Guidelines VI-BG-2026-001.

export const BRAND = {
  name: 'Valoria Institute',
  tagline: 'Worth, Built.',
  belief: 'Talent is not the problem. Infrastructure is.',
  promise: ['Develop', 'Surface', 'Connect'],
  email: 'info@valoriainstitute.com',
  copyrightEntity: 'African Talent Bureau Ltd',
  location: 'Lagos, Nigeria',
  compliance: 'NDPA 2023 Compliant',
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

// VALU Index results are points out of 100, not percentages.
// Taster completion grants Basic marketplace access; only the full assessment
// earns an official Index score and a merit tier.
export const VALU_SCORE = {
  unit: 'points',
  maximum: 100,
  displaySuffix: '/100',
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

// Merit tiers are earned only through the full VALU Index assessment.
export const TIER_DESIGNATIONS = [
  { min: 90, max: 100, name: 'Elite', stars: '✦✦✦' },
  { min: 75, max: 89, name: 'Distinguished', stars: '✦✦' },
  { min: 55, max: 74, name: 'Proficient', stars: '✦' },
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
