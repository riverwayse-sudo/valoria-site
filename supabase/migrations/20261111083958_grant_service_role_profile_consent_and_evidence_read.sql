-- The site server uses the service role to read consent evidence and record
-- explicit profile visibility preferences. Keep these ledgers unavailable to
-- browser roles; service_role bypasses RLS and receives only the required grants.
GRANT SELECT, INSERT ON TABLE public.professional_profile_acknowledgements TO service_role;
GRANT SELECT ON TABLE public.professional_document_reviews TO service_role;
