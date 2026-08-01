import { redirect } from 'next/navigation'

// ATB Connect is now the "Talent" tab of the unified /marketplace page —
// previously this was its own siloed listing querying only candidate-track
// profiles, so someone who was also a Speaker or Facilitator showed up here
// as if they were a different, unrelated person. Redirects here (from old
// links, bookmarks, nav, etc.) still land on the right filtered view.
export default function ATBConnectRedirect() {
  redirect('/marketplace?track=candidate')
}
