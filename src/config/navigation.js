import { BRAND } from '@/lib/brand'

export const NAVIGATION = {
  assessmentUrl: BRAND.assessmentUrl,
  primary: [
    {
      label: 'For Organisations',
      groups: [
        {
          label: 'TALENT & EXPERTISE',
          items: [
            { label: 'Find Talent', href: '/atb-connect', description: 'Capability-led talent discovery for employers.' },
            { label: 'Find Speakers & Facilitators', href: '/atb-spotlight', description: 'Find expertise for events and programmes.' },
            { label: 'African Talent Bureau', href: '/marketplace', description: 'Explore the professional capability marketplace.' },
          ],
        },
        {
          label: 'DEVELOPMENT & PARTNERSHIPS',
          items: [
            { label: 'Valoria Develop', href: '/develop', description: 'Build professional and organisational capability.' },
            { label: 'Institutional Partnerships', href: '/contact-us', description: 'Discuss a programme or strategic collaboration.' },
          ],
        },
      ],
    },
    { label: 'African Talent Bureau', href: '/marketplace' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'VALU Index', href: '/valu' },
    { label: 'About Valoria', href: '/about-us' },
  ],
  mobile: {
    explore: [
      { label: 'Find Talent', href: '/atb-connect' },
      { label: 'Find Speakers & Facilitators', href: '/atb-spotlight' },
      { label: 'African Talent Bureau', href: '/marketplace' },
      { label: 'Browse Jobs', href: '/jobs' },
      { label: 'Valoria Develop', href: '/develop' },
      { label: 'Institutional Partnerships', href: '/contact-us' },
    ],
    valu: [
      { label: 'Explore the VALU Index', href: '/valu' },
      { label: 'PRIME Framework', href: '/prime' },
    ],
    about: [
      { label: 'About Valoria', href: '/about-us' },
      { label: 'Events', href: '/events' },
      { label: 'Insights', href: '/insights' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact-us' },
    ],
  },
}

export function isPathActive(pathname, href) {
  if (!pathname || !href || href.startsWith('http')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
