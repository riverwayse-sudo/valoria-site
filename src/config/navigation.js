import { BRAND } from '@/lib/brand'

export const NAVIGATION = {
  assessmentUrl: BRAND.assessmentUrl,
  primary: [
    {
      label: 'For Professionals',
      groups: [
        { label: 'UNDERSTAND & DEVELOP', items: [
          { label: 'Start with VALU', href: '/valu', description: 'Understand the PRIME framework and your capability.' },
          { label: 'PRIME Framework', href: '/prime', description: 'Explore the five dimensions and seventeen skills.' },
          { label: 'Valoria Develop', href: '/develop', description: 'Explore professional development pathways.' },
          { label: 'Your Dashboard', href: '/dashboard', description: 'Continue your assessment and manage your profile.' },
        ]},
        { label: 'DISCOVER & CONNECT', items: [
          { label: 'Professional Registry', href: '/marketplace/talent', description: 'Explore capability-led professional profiles.' },
          { label: 'Opportunities', href: '/opportunities', description: 'Explore reviewed professional opportunities.' },
        ]},
      ],
    },
    {
      label: 'For Organisations',
      groups: [
        {
          label: 'TALENT & EXPERTISE',
          items: [
            { label: 'Find Talent', href: '/atb-connect', description: 'Capability-led talent discovery for employers.' },
            { label: 'Find Speakers & Facilitators', href: '/atb-spotlight', description: 'Find expertise for events and programmes.' },
            { label: 'Explore the Registry', href: '/marketplace', description: 'Discover professionals, speakers and facilitators.' },
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
    { label: 'Registry', href: '/marketplace' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Opportunities', href: '/opportunities' },
    { label: 'Capability Intelligence', href: '/intelligence' },
    { label: 'VALU Index', href: '/valu' },
    { label: 'About Valoria', href: '/about-us' },
  ],
  mobile: {
    explore: [
      { label: 'Find Talent', href: '/atb-connect' },
      { label: 'Find Speakers & Facilitators', href: '/atb-spotlight' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Browse Jobs', href: '/jobs' },
      { label: 'Browse Opportunities', href: '/opportunities' },
      { label: 'Capability Intelligence', href: '/intelligence' },
      { label: 'Valoria Develop', href: '/develop' },
      { label: 'Institutional Partnerships', href: '/contact-us' },
      { label: 'Knowledge Hub', href: '/knowledge' },
    ],
    valu: [
      { label: 'Explore the VALU Index', href: '/valu' },
      { label: 'PRIME Framework', href: '/prime' },
    ],
    about: [
      { label: 'About Valoria', href: '/about-us' },
      { label: 'Events', href: '/events' },
      { label: 'Insights', href: '/insights' },
      { label: 'Capability Intelligence', href: '/intelligence' },
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
