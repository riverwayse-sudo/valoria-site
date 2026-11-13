-- Opportunity submissions enter through the validated and rate-limited server API.
DROP POLICY IF EXISTS opportunity_submission_insert ON public.opportunity_submissions;
REVOKE INSERT ON TABLE public.opportunity_submissions FROM anon, authenticated;
GRANT INSERT ON TABLE public.opportunity_submissions TO service_role;
