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

-- Anonymous inserts have no matching RLS INSERT policy and must not be advertised by table grants.
-- Assessment and snapshot creation should go through the existing validated server/RPC submission paths.
REVOKE INSERT ON TABLE public.assessment_sessions FROM anon;
REVOKE INSERT ON TABLE public.taster_sessions FROM anon;
