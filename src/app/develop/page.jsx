import { redirect } from 'next/navigation'

// Legacy route alias. Valoria Develop is the institute's development pathway,
// distinct from ATB Spotlight's facilitator discovery. Canonical content lives
// at /programmes; this route redirects there without asserting that a specific
// programme or facilitator is currently available.
export default function DevelopRedirect() {
  redirect('/programmes')
}
