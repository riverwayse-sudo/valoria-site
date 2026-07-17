// Single source of truth for who can see /admin and /admin/waitlist.
// Previously duplicated (and inconsistent) across admin/page.jsx and
// admin/waitlist/page.jsx — one file had 3 emails, the other had 4, and
// they didn't match. Update this list only, in this one place.
//
// IMPORTANT: this check happens in the browser. It is a UI convenience,
// not a security boundary — the actual access control has to live in
// Supabase RLS policies on the `messages`, `profiles`, and `waitlist`
// tables. If RLS allows any authenticated (or anonymous) user to read
// those tables directly, this allowlist does nothing to stop it. Verify
// RLS before launch.
export const ADMIN_EMAILS = [
  'admin@valoriainstitute.com',
  'info@valoriainstitute.com',
  'oluwafemi@valoriainstitute.com',
  'oluwafemi@riverwayse.com',
]
