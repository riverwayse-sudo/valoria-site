-- Cover the reviewed_by foreign key to avoid scans when referenced reviewer rows are updated/deleted.
CREATE INDEX IF NOT EXISTS career_applications_reviewed_by_idx
  ON public.career_applications (reviewed_by);
