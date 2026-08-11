import { redirect } from 'next/navigation'

// ATB Develop is Valoria Institute's own training programmes (PRIME-mapped
// programmes delivered by certified facilitators), not a marketplace for
// commissioning individual facilitators — that distinction was clarified
// 2 Aug 2026. This previously redirected into /marketplace?track=facilitator,
// which was the wrong destination; /programmes already has the real content
// for this (built earlier, just never linked from here).
export default function DevelopRedirect() {
  redirect('/programmes')
}
