import { redirect } from 'next/navigation'

// Renamed to /atb-spotlight for naming consistency with /atb-connect and
// /develop. This redirect exists so any links, bookmarks, or search results
// still pointing at the old /spotlight path don't just 404.
export default function SpotlightRedirect() {
  redirect('/atb-spotlight')
}
