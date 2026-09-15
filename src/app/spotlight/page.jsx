import { redirect } from 'next/navigation'

// Renamed to /marketplace/speakers for naming consistency with /marketplace/talent and
// /develop. This redirect exists so any links, bookmarks, or search results
// still pointing at the old /spotlight path don't just 404.
export default function SpotlightRedirect() {
  redirect('/marketplace/speakers')
}
