-- Migration: 008_add_profile_complete_and_gate.sql
-- Run this in the Supabase SQL editor
--
-- What this does:
--   1. Adds a `profile_complete` boolean column (default false)
--   2. Sets it true for all existing profiles that look complete
--   3. Tightens the marketplace RLS — only profile_complete=true rows are
--      visible in the marketplace. This is the simplest gate: if completeness
--      isn't true, the row is invisible to buyers regardless of listing_status.

BEGIN;

-- 1. Add column
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Backfill: mark existing profiles with a bio and headline as complete
--    (conservative — manually completed profiles tend to have at least these)
UPDATE professional_profiles
  SET profile_complete = TRUE
  WHERE bio IS NOT NULL
    AND bio <> ''
    AND headline IS NOT NULL
    AND headline <> '';

-- 3. Update existing marketplace RLS policies to also require profile_complete
--    Anonymous: only public + profile_complete
DROP POLICY IF EXISTS "anon_read_public_profiles" ON professional_profiles;
CREATE POLICY "anon_read_public_complete_profiles"
  ON professional_profiles FOR SELECT
  TO anon
  USING (
    listing_status = 'listed'
    AND visibility = 'public'
    AND profile_complete = TRUE
  );

-- Authenticated: only non-private + profile_complete
DROP POLICY IF EXISTS "authenticated_read_non_private_profiles" ON professional_profiles;
CREATE POLICY "authenticated_read_complete_profiles"
  ON professional_profiles FOR SELECT
  TO authenticated
  USING (
    listing_status = 'listed'
    AND visibility != 'private'
    AND profile_complete = TRUE
  );

COMMIT;
