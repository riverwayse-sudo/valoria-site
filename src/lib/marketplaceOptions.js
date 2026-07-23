// Single source of truth for the three marketplace entry points.
// Used by MarketplaceModal (popup) and the /marketplace page (direct-visit
// fallback) so the copy, colors, and links never drift apart.

export const MARKETPLACE_OPTIONS = [
  {
    key: 'connect',
    label: 'ATB Connect',
    tag: 'FOR EMPLOYERS & RECRUITERS',
    desc: 'Search pre-assessed candidates by score, strength, and sector.',
    cta: 'Find Talent',
    color: '#378ADD',
    href: '/atb-connect',
  },
  {
    key: 'spotlight',
    label: 'ATB Spotlight',
    tag: 'FOR EVENT PLANNERS',
    desc: 'Discover and book speakers whose capability you can actually verify.',
    cta: 'Book a Speaker',
    color: '#C9A84C',
    href: '/atb-spotlight',
  },
  {
    key: 'develop',
    label: 'ATB Develop',
    tag: 'FOR L&D LEADERS',
    desc: 'Commission PRIME-certified facilitators with an assessed track record.',
    cta: 'Commission a Facilitator',
    color: '#1D9E75',
    href: '/develop',
  },
]
