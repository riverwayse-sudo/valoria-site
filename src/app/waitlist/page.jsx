import { redirect } from 'next/navigation'
import { BRAND } from '@/lib/brand'

export default function WaitlistPage() {
  // Site-relative so this resolves through the same /valu/assessment/* rewrite
  // (next.config.js) on whatever host the visitor is on. It used to send every
  // environment to the production domain, which broke staging and previews.
  redirect(BRAND.assessmentUrl)
}
