-- Public enquiries must enter through the validated, rate-limited server API.
DROP POLICY IF EXISTS buyer_or_guest_insert_enquiry ON public.enquiries;
REVOKE INSERT ON TABLE public.enquiries FROM anon, authenticated;
