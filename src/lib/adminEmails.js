// DEPRECATED as of 11 Aug 2026 — no longer imported anywhere. Admin access
// is now controlled by the admin_users table (see
// pending-migrations/010_add_admin_users.sql), checked server-side in
// middleware.js before any /admin request is allowed through. This file is
// left in place only as a historical record of who was on the original
// hardcoded list, in case that's useful context; it has no effect on
// anything. To grant or revoke admin access now, use /admin/signup (grant)
// or delete the relevant row from admin_users directly in Supabase (revoke
// — there's no UI for revocation yet).
export const ADMIN_EMAILS = [
  'admin@valoriainstitute.com',
  'info@valoriainstitute.com',
  'oluwafemi@valoriainstitute.com',
  'oluwafemi@riverwayse.com',
]
