-- Fix public marketplace access without exposing the governance table directly.
-- marketplace_professionals was using security_invoker=true, which caused
-- anon/authenticated requests to inherit the private privileges of
-- professional_capabilities and fail at runtime.
ALTER VIEW public.marketplace_professionals SET (security_invoker = false);
GRANT SELECT ON public.marketplace_professionals TO anon, authenticated;
