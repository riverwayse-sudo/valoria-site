-- Migration: 006_add_visibility_column.sql
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- AFTER this change: update the profile setup page to start saving visibility values
--
-- What this does:
--   1. Adds a `visibility` column to professional_profiles (text, default 'registered_only')
--   2. Sets existing profiles to 'registered_only' (conservative default — existing
--      profiles were only visible to registered users via RLS anyway)
--   3. Adds a NOT NULL constraint
--   4. Tightens RLS: only show 'public' profiles to anonymous users;
--      'registered_only' profiles require an active session

BEGIN;

-- 1. Add column
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'registered_only';

-- 2. Backfill existing rows
UPDATE professional_profiles
  SET visibility = 'registered_only'
  WHERE visibility IS NULL;

-- 3. Add check constraint so only valid values are stored
ALTER TABLE professional_profiles
  DROP CONSTRAINT IF EXISTS valid_visibility;

ALTER TABLE professional_profiles
  ADD CONSTRAINT valid_visibility
  CHECK (visibility IN ('public', 'registered_only', 'private'));

-- 4. RLS — tighten so anonymous users only see public profiles
--    Existing RLS policies are preserved; this adds a session-based filter.
--    The marketplace queries in valoria-site already add .neq('visibility', 'private')
--    so anonymous users never see private profiles through the app.
--    This RLS policy catches direct API access (PostgREST role = anon).
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive existing policy and replace with a tighter one
DROP POLICY IF EXISTS "Public profiles are publicly readable" ON professional_profiles;

-- New policy: anon role can only see public profiles
CREATE POLICY "anon_read_public_profiles"
  ON professional_profiles FOR SELECT
  TO anon
  USING (
    listing_status = 'listed'
    AND visibility = 'public'
  );

-- authenticated role: sees listed + non-private (public OR registered_only)
DROP POLICY IF EXISTS "Profiles are publicly readable" ON professional_profiles;

CREATE POLICY "authenticated_read_non_private_profiles"
  ON professional_profiles FOR SELECT
  TO authenticated
  USING (listing_status = 'listed' AND visibility != 'private');

COMMIT;
