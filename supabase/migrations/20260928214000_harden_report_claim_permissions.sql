-- Report generation claims are an internal service operation.
-- The SECURITY DEFINER function must not be callable through the public REST API.
revoke execute on function public.claim_report_generation(text, text) from public, anon, authenticated;
grant execute on function public.claim_report_generation(text, text) to service_role;
