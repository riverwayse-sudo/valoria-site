-- Public feedback is submitted through /api/feedback, which validates fields,
-- rate-limits by trusted edge IP and writes with the server-only service role.
DROP POLICY IF EXISTS "public can insert feedback" ON public.webinar_feedback;
REVOKE INSERT ON TABLE public.webinar_feedback FROM anon, authenticated;
GRANT INSERT ON TABLE public.webinar_feedback TO service_role;
ALTER TABLE public.webinar_feedback ALTER COLUMN overall_rating SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.webinar_feedback'::regclass AND conname = 'webinar_feedback_rating_range') THEN
    ALTER TABLE public.webinar_feedback ADD CONSTRAINT webinar_feedback_rating_range CHECK (overall_rating BETWEEN 1 AND 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.webinar_feedback'::regclass AND conname = 'webinar_feedback_attendance_allowed') THEN
    ALTER TABLE public.webinar_feedback ADD CONSTRAINT webinar_feedback_attendance_allowed CHECK (attended IS NULL OR attended IN ('live', 'replay', 'no'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.webinar_feedback'::regclass AND conname = 'webinar_feedback_text_lengths') THEN
    ALTER TABLE public.webinar_feedback ADD CONSTRAINT webinar_feedback_text_lengths CHECK (
      char_length(COALESCE(most_valuable, '')) <= 2000
      AND char_length(COALESCE(improvements, '')) <= 2000
      AND char_length(COALESCE(name, '')) <= 200
      AND char_length(COALESCE(email, '')) <= 320
    );
  END IF;
END $$;
