alter table public.enquiries
  drop constraint if exists enquiries_enquiry_type_check;

alter table public.enquiries
  add constraint enquiries_enquiry_type_check
  check (enquiry_type = any (array[
    'candidate'::text,
    'speaker_booking'::text,
    'facilitator_commission'::text,
    'training'::text,
    'general'::text
  ]));
