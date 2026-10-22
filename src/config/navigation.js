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
            { label: 'Marketplace', href: '/marketplace', description: 'Discover professionals and their capabilities.' },
            { label: 'Facilitators', href: '/facilitators', description: 'Find people who can lead the room.' },
            { label: 'Programmes', href: '/programmes', description: 'Develop capability with structured learning.' },
            { label: 'Events', href: '/events', description: 'Join Valoria conversations and events.' },
            { label: 'Insights', href: '/insights', description: 'Ideas and perspectives for the modern professional.' },
          ],
        },
      ],
    },
    {
      label: 'VALU Index',
      groups: [
        {
          label: 'Understand',
          items: [
            { label: 'About the VALU Index', href: '/valu', description: 'Understand the VALU Index and its assessment journey.' },
            { label: 'Start the VALU Index', href: BRAND.assessmentUrl, external: true, description: 'Begin your VALU Index assessment.' },
          ],
        },
      ],
    },
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
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Facilitators', href: '/facilitators' },
      { label: 'Programmes', href: '/programmes' },
      { label: 'Events', href: '/events' },
      { label: 'Insights', href: '/insights' },
    ],
    valu: [
      { label: 'About the VALU Index', href: '/valu' },
      { label: 'Start the VALU Index', href: BRAND.assessmentUrl, external: true },
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
