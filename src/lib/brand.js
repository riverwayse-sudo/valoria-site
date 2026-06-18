// Single source of truth for brand constants across the Valoria Institute site.
// Update here, not in individual pages.

export const BRAND = {
  name: 'Valoria Institute',
  tagline: 'Worth. Built.',
  email: 'info@valoriainstitute.com',
  copyrightEntity: 'African Talent Bureau Ltd',
  location: 'Lagos, Nigeria',
  compliance: 'NDPA 2023 Compliant',
  assessmentUrl: 'https://assessment.valoriainstitute.com/',
  logo: 'https://valoriainstitute.com/logo.png',
}

export const COLORS = {
  gold: '#C9A84C',
  goldLight: '#E2C97E',
  dark: '#0F0F1A',
  darkMid: '#1A1A2E',
  darkCard: '#161624',
  parchment: '#F7F4EE',
  teal: '#1D9E75',
  blue: '#378ADD',
  purple: '#7F77DD',
  amber: '#BA7517',
  coral: '#D85A30',
}

// PRIME Framework — five clusters, in order, with the radar chart color mapping
// used consistently across the homepage and assessment platform.
export const PRIME_CLUSTERS = [
  { letter: 'P', name: 'Presence', color: COLORS.teal },
  { letter: 'R', name: 'Relationships', color: COLORS.blue },
  { letter: 'I', name: 'Influence', color: COLORS.purple },
  { letter: 'M', name: 'Mastery', color: COLORS.amber },
  { letter: 'E', name: 'Enterprise', color: COLORS.coral },
]

// VALU Index tier designations, in descending order
export const TIER_DESIGNATIONS = [
  'Force to Align With',
  'At the Starting Point',
  // additional tiers TBD — confirm full list before launch
]

export const ENTRY_POINTS = [
  {
    id: 'atb-connect',
    num: '01',
    name: 'ATB Connect',
    buyer: 'FOR EMPLOYERS',
    color: COLORS.blue,
    modality: 'CANDIDATE MODALITY',
    desc: "Search pre-assessed candidates by VALU Index score, cluster strength, sector, and designation. Every professional in the pool has been independently assessed. Hire with intelligence, not with hope.",
    href: '/atb-connect',
    linkLabel: 'SEARCH TALENT',
  },
  {
    id: 'spotlight',
    num: '02',
    name: 'ATB Spotlight',
    buyer: 'FOR EVENT ORGANISERS',
    color: COLORS.gold,
    modality: 'SPEAKER MODALITY',
    desc: 'Discover and book speakers by expertise, tier designation, and VALU Index. The same faces appear at every conference because there has been no better way to find the others. Until now.',
    href: '/spotlight',
    linkLabel: 'FIND A SPEAKER',
  },
  {
    id: 'develop',
    num: '03',
    name: 'Valoria Develop',
    buyer: 'FOR TRAINING BUYERS',
    color: COLORS.teal,
    modality: 'FACILITATOR MODALITY',
    desc: 'Commission PRIME-certified facilitators to run development programmes for your teams. PRIME is the capability architecture — Valoria-certified facilitators are its delivery engine.',
    href: '/facilitators',
    linkLabel: 'COMMISSION FACILITATORS',
  },
]
