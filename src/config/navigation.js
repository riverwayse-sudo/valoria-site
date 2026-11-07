import { BRAND } from '@/lib/brand'

export const NAVIGATION = {
  assessmentUrl: BRAND.assessmentUrl,
  primary: [
    {
      label: 'Explore',
      groups: [
        {
          label: '',
          items: [
            { label: 'Opportunities', href: '/opportunities', description: 'Explore published professional opportunities.' },
            { label: 'Marketplace', href: '/marketplace', description: 'Discover professionals and their capabilities.' },
            { label: 'ATB Connect', href: '/atb-connect', description: 'Explore capability-led talent discovery.' },
            { label: 'ATB Spotlight', href: '/atb-spotlight', description: 'Find speakers and facilitators for your brief.' },
            { label: 'Valoria Develop', href: '/develop', description: 'Explore PRIME-based development pathways.' },
            { label: 'Events', href: '/events', description: 'Join Valoria conversations and events.' },
            { label: 'Insights', href: '/insights', description: 'Ideas and perspectives for the modern professional.' },
          ],
        },
      ],
    },
    { label: 'VALU Index', href: '/valu' },
    {
      label: 'About',
      groups: [
        {
          label: 'The Institute',
          items: [
            { label: 'About Valoria', href: '/about-us', description: 'The institution behind the infrastructure.' },
            { label: 'PRIME Framework', href: '/prime', description: 'The framework behind professional capability.' },
            { label: 'Contact', href: '/contact-us', description: 'Get in touch with Valoria.' },
            { label: 'Careers', href: '/careers', description: 'Explore opportunities to join Valoria.' },
          ],
        },
      ],
    },
  ],
  mobile: {
    explore: [
      { label: 'Opportunities', href: '/opportunities' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'ATB Connect', href: '/atb-connect' },
      { label: 'ATB Spotlight', href: '/atb-spotlight' },
      { label: 'Valoria Develop', href: '/develop' },
      { label: 'Events', href: '/events' },
      { label: 'Insights', href: '/insights' },
    ],
    valu: [
      { label: 'Explore the VALU Index', href: '/valu' },
    ],
    about: [
      { label: 'About Valoria', href: '/about-us' },
      { label: 'PRIME Framework', href: '/prime' },
      { label: 'Contact', href: '/contact-us' },
      { label: 'Careers', href: '/careers' },
    ],
  },
}

export function isPathActive(pathname, href) {
  if (!pathname || !href || href.startsWith('http')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
