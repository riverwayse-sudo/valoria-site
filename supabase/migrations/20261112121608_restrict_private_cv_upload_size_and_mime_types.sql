-- Keep CVs private and enforce the client upload contract at Storage.
UPDATE storage.buckets SET file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
WHERE id = 'cvs' AND public = false;
