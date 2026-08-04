// Single source of truth for the three marketplace entry points.
// Used by MarketplaceModal (popup) so the copy, colors, and links never
// drift apart. (/marketplace itself is now a real unified listing with its
// own tabs, not a fallback that reads this file.)

export const MARKETPLACE_OPTIONS = [
  {
    key: 'connect',
    label: 'ATB Connect',
    tag: 'FOR EMPLOYERS & RECRUITERS',
    desc: 'Search pre-assessed candidates by score, strength, and sector.',
    cta: 'Find Talent',
    color: '#378ADD',
    href: '/marketplace?track=candidate',
  },
  {
    key: 'spotlight',
    label: 'ATB Spotlight',
    tag: 'FOR EVENT PLANNERS',
    desc: 'Discover and book speakers whose capability you can actually verify.',
    cta: 'Book a Speaker',
    color: '#C9A84C',
    href: '/marketplace?track=speaker',
  },
  {
    key: 'develop',
    label: 'ATB Develop',
    tag: 'FOR L&D LEADERS',
    desc: 'Commission PRIME-certified facilitators with an assessed track record.',
    cta: 'Commission a Facilitator',
    color: '#1D9E75',
    href: '/marketplace?track=facilitator',
  },
]
