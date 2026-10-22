-- Defense-in-depth: keep reconciliation/progress internals service-role only.
-- These tables intentionally have no client-facing RLS policies; application server routes use the service role.
REVOKE ALL PRIVILEGES ON TABLE
  public.identity_reconciliation_reviews,
  public.taster_identity_candidates,
  public.taster_progress
FROM PUBLIC, anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE
  private.marketplace_showcase_approvals,
  private.valu_reconciliation_health_snapshots
FROM PUBLIC, anon, authenticated;

-- Client writes use validated server/RPC submission paths; there are no client-facing INSERT policies.
REVOKE INSERT ON TABLE public.assessment_sessions FROM PUBLIC, anon, authenticated;
REVOKE INSERT ON TABLE public.taster_sessions FROM PUBLIC, anon, authenticated;
