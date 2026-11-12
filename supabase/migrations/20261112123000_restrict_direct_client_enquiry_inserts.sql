-- Guest enquiries must enter through the server API, which validates input,
-- verifies current profile consent/capability, rate-limits by trusted edge IP,
-- and sends controlled notifications. Direct PostgREST inserts bypass those
-- protections and are not used by either application repository.
DROP POLICY IF EXISTS buyer_or_guest_insert_enquiry ON public.enquiries;
REVOKE INSERT ON TABLE public.enquiries FROM anon, authenticated;
