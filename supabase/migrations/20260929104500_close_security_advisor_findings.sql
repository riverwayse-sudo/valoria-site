-- Internal event-registration continuity trigger only.
-- It must not be callable through the Data API.
revoke execute on function public.valoria_event_registration_continuity() from public, anon, authenticated;

-- This table is service-role state only. Keep an explicit deny policy so
-- the security advisor records the intentional absence of client access.
drop policy if exists opportunity_submission_rate_limits_no_client_access on public.opportunity_submission_rate_limits;
create policy opportunity_submission_rate_limits_no_client_access
on public.opportunity_submission_rate_limits
for all
to public
using (false)
with check (false);