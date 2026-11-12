-- Public avatar retrieval remains enabled; constrain upload MIME and size at Storage.
UPDATE storage.buckets SET file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id = 'avatars' AND public = true;
