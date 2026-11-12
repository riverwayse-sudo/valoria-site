-- Opportunity submissions enter through the server API, which validates fields,
-- rate-limits the request, and creates the opportunity + submission atomically.
-- No client repository writes directly to this table.
DROP POLICY IF EXISTS opportunity_submission_insert ON public.opportunity_submissions;
REVOKE INSERT ON TABLE public.opportunity_submissions FROM anon, authenticated;
GRANT INSERT ON TABLE public.opportunity_submissions TO service_role;
