import { redirect } from 'next/navigation'

// /register was the original account-creation page when accounts lived on the
// separate assessment platform. Accounts are now created in this app directly
// via /signup. This redirect exists only to honor old links/bookmarks.
export default function RegisterRedirect() {
  redirect('/signup')
}
