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
            { label: 'Insights', href: '/insights', description: 'Perspectives on professional capability, leadership and work.' },
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
            { label: 'About the VALU Index', href: '/valu', description: 'Understand the index and the assessment journey.' },
            { label: 'Start Assessment', href: BRAND.assessmentUrl, external: true, description: 'Begin your VALU Index assessment.' },
          ],
        },
      ],
    },
    { label: 'Events', href: '/events' },
    {
      label: 'About',
      groups: [
        {
          label: 'The Institute',
          items: [
            { label: 'About Valoria', href: '/about-us', description: 'The institution behind the infrastructure.' },
            { label: 'PRIME Framework', href: '/prime', description: 'The framework behind professional capability.' },
            { label: 'Contact', href: '/contact-us', description: 'Get in touch with Valoria.' },
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
      { label: 'Insights', href: '/insights' },
    ],
    valu: [
      { label: 'About the VALU Index', href: '/valu' },
      { label: 'Start Assessment', href: BRAND.assessmentUrl, external: true },
    ],
    about: [
      { label: 'About Valoria', href: '/about-us' },
      { label: 'PRIME Framework', href: '/prime' },
      { label: 'Contact', href: '/contact-us' },
    ],
  },
}

export function isPathActive(pathname, href) {
  if (!pathname || !href || href.startsWith('http')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
