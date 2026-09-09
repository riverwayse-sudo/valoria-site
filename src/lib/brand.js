// Single source of truth for brand constants across the Valoria Institute site.
// Governed by Valoria Institute Brand Guidelines VI-BG-2026-001.

export const BRAND = {
  name: 'Valoria Institute',
  tagline: 'Worth. Built.',
  belief: 'Talent is not the problem. Infrastructure is.',
  promise: ['Develop', 'Surface', 'Connect'],
  email: 'info@valoriainstitute.com',
  copyrightEntity: 'African Talent Bureau Ltd',
  location: 'Lagos, Nigeria',
  compliance: 'NDPA 2023 Compliant',
  assessmentUrl: 'https://assessment.valoriainstitute.com/',
  logo: '/logo.png',
}

export const COLORS = {
  gold: '#C9A84C',
  goldLight: '#D4C9A8',
  dark: '#1A1A2E',
  darkMid: '#2E2E4A',
  darkCard: '#F7F4EE',
  slateIndigo: '#2E2E4A',
  antiqueLinen: '#EDE8DC',
  subtleBrass: '#D4C9A8',
  parchment: '#F7F4EE',
  ivoryWhite: '#FAFAF7',
}

// PRIME Framework — approved five clusters and their manual definitions.
export const PRIME_CLUSTERS = [
  { letter: 'P', name: 'Presence', color: COLORS.gold, subtitle: 'How you show up', skills: ['Communication', 'Executive Presence', 'Composure Under Scrutiny'] },
  { letter: 'R', name: 'Relationships', color: COLORS.gold, subtitle: 'How you connect', skills: ['Trust-Building', 'Collaborative Intelligence', 'Network Quality'] },
  { letter: 'I', name: 'Intelligence', color: COLORS.gold, subtitle: 'How you think', skills: ['Critical Thinking', 'Analytical Depth', 'Decision-Making', 'Cognitive Agility'] },
  { letter: 'M', name: 'Mastery', color: COLORS.gold, subtitle: 'How you deliver', skills: ['Execution Discipline', 'Accountability', 'Resilience', 'Adaptability'] },
  { letter: 'E', name: 'Enterprise', color: COLORS.gold, subtitle: 'How you build', skills: ['Commercial Thinking', 'Systems Building', 'Venture Mindset'] },
]

// Score-based merit bands. These are credentials, never paid upgrades.
export const TIER_DESIGNATIONS = [
  { min: 90, name: 'Elite', stars: '✦✦✦' },
  { min: 75, name: 'Distinguished', stars: '✦✦' },
  { min: 55, name: 'Proficient', stars: '✦' },
  // Scores below 55 are not a manual-defined tier.
]

export const ENTRY_POINTS = [
  {
    id: 'atb-connect', num: '01', name: 'ATB Connect', buyer: 'FOR EMPLOYERS', color: COLORS.gold,
    modality: 'PRECISION TALENT SOURCING',
    desc: 'Search assessed professionals through structured capability data, experience and role fit. Make hiring decisions with more clarity and confidence.',
    href: '/marketplace?track=candidate', linkLabel: 'SEARCH TALENT',
  },
  {
    id: 'spotlight', num: '02', name: 'ATB Spotlight', buyer: 'FOR EVENT ORGANISERS', color: COLORS.gold,
    modality: 'MERIT-BASED VISIBILITY',
    desc: 'Discover voices by expertise, demonstrated capability and professional merit — not familiarity or network proximity.',
    href: '/marketplace?track=speaker', linkLabel: 'DISCOVER SPEAKERS',
  },
  {
    id: 'develop', num: '03', name: 'Valoria Develop', buyer: 'FOR PROFESSIONALS & ORGANISATIONS', color: COLORS.gold,
    modality: 'CAPABILITY DEVELOPMENT',
    desc: 'PRIME-mapped development designed around the capability gaps that matter most, with clear pathways for professional growth.',
    href: '/programmes', linkLabel: 'EXPLORE DEVELOPMENT',
  },
]
