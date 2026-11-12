-- Keep public avatar delivery for profile photos, but constrain uploads.
-- Existing production objects are JPEG/PNG and all are below the 5 MiB limit.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id = 'avatars' AND public = true;
