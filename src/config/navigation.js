import { BRAND } from '@/lib/brand'

export const NAVIGATION = {
  assessmentUrl: BRAND.assessmentUrl,
  primary: [
    {
      label: 'Professionals',
      groups: [{
        label: 'BUILD YOUR PROFESSIONAL EDGE',
        items: [
          { label: 'Take the VALU Taster', href: '/valu', description: 'Start with a clearer view of your capability.' },
          { label: 'PRIME Framework', href: '/prime', description: 'Explore the five dimensions of professional capability.' },
          { label: 'Valoria Develop', href: '/develop', description: 'Explore professional development pathways.' },
          { label: 'Browse Jobs', href: '/jobs', description: 'Explore listed professional opportunities.' },
        ],
      }],
    },
    {
      label: 'Organisations',
      groups: [{
        label: 'ACCESS CAPABILITY',
        items: [
          { label: 'Find Talent', href: '/atb-connect', description: 'Discover professionals by capability.' },
          { label: 'Find Speakers & Facilitators', href: '/atb-spotlight', description: 'Find expertise for events and programmes.' },
          { label: 'Work with Valoria', href: '/contact-us', description: 'Discuss partnerships and organisational needs.' },
        ],
      }],
    },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Insights', href: '/insights' },
    { label: 'About', href: '/about-us' },
  ],
  mobile: {
    explore: [
      { label: 'Take the VALU Taster', href: '/valu' },
      { label: 'PRIME Framework', href: '/prime' },
      { label: 'Valoria Develop', href: '/develop' },
      { label: 'Browse Jobs', href: '/jobs' },
    ],
    valu: [
      { label: 'Find Talent', href: '/atb-connect' },
      { label: 'Find Speakers & Facilitators', href: '/atb-spotlight' },
      { label: 'Open Marketplace', href: '/marketplace' },
    ],
    about: [
      { label: 'About Valoria', href: '/about-us' },
      { label: 'Insights', href: '/insights' },
      { label: 'Events', href: '/events' },
      { label: 'Contact', href: '/contact-us' },
    ],
  },
}

export function isPathActive(pathname, href) {
  if (!pathname || !href || href.startsWith('http')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
