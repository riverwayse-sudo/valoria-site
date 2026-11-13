-- CVs are private evidence documents. Enforce the same size/type contract
-- as uploadProfessionalCv at the Storage service boundary, not only in the UI.
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
WHERE id = 'cvs' AND public = false;
