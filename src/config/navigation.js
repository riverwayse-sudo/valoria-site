import { BRAND } from '@/lib/brand'

export const NAVIGATION = {
  assessmentUrl: BRAND.assessmentUrl,
  primary: [
    {
      label: 'For Professionals',
      groups: [
        { label: 'UNDERSTAND & DEVELOP', items: [
          { label: 'Start with VALU', href: '/valu', description: 'Understand your capability through the PRIME framework.' },
          { label: 'PRIME Framework', href: '/prime', description: 'Explore the five dimensions of capability.' },
          { label: 'Valoria Develop', href: '/develop', description: 'Build your professional capabilities.' },
          { label: 'Your Dashboard', href: '/dashboard', description: 'Continue your Valoria journey.' },
        ]},
        { label: 'DISCOVER & CONNECT', items: [
          { label: 'Professional Registry', href: '/marketplace/talent', description: 'Discover capability-led professional profiles.' },
          { label: 'Jobs & Opportunities', href: '/opportunities', description: 'Explore relevant professional opportunities.' },
        ]},
      ],
    },
    {
      label: 'For Organisations',
      groups: [
        { label: 'SOURCE EXPERTISE', items: [
          { label: 'Find Talent', href: '/atb-connect', description: 'Discover professionals for your organisation.' },
          { label: 'Find Speakers & Facilitators', href: '/atb-spotlight', description: 'Source expertise for events and programmes.' },
          { label: 'Explore the Registry', href: '/marketplace', description: 'Discover professionals across capabilities.' },
        ]},
        { label: 'BUILD CAPABILITY', items: [
          { label: 'Valoria Develop', href: '/develop', description: 'Explore professional and organisational development.' },
          { label: 'Work with Valoria', href: '/contact-us', description: 'Discuss your organisation’s needs.' },
        ]},
      ],
    },
    { label: 'About Valoria', href: '/about-us' },
  ],
  mobile: {
    explore: [
      { label: 'Find Talent', href: '/atb-connect' },
      { label: 'Find Speakers & Facilitators', href: '/atb-spotlight' },
      { label: 'Professional Registry', href: '/marketplace/talent' },
      { label: 'Jobs & Opportunities', href: '/opportunities' },
      { label: 'Valoria Develop', href: '/develop' },
    ],
    valu: [
      { label: 'Start with VALU', href: '/valu' },
      { label: 'PRIME Framework', href: '/prime' },
    ],
    about: [
      { label: 'About Valoria', href: '/about-us' },
      { label: 'Insights & Knowledge', href: '/insights' },
      { label: 'Contact', href: '/contact-us' },
    ],
  },
}

export function isPathActive(pathname, href) {
  if (!pathname || !href || href.startsWith('http')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
