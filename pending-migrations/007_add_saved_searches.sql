-- Migration: 007_add_saved_searches.sql
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
--
-- What this does:
--   1. Creates a saved_searches table for employers to save marketplace filter sets
--   2. RLS: only the saving user can read/write their own saved searches

BEGIN;

CREATE TABLE IF NOT EXISTS saved_searches (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT   NOT NULL,
  track       TEXT   NOT NULL CHECK (track IN ('candidate', 'speaker', 'facilitator')),
  filters     JSONB  NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

-- RLS: users only see their own saved searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_saved_searches"
  ON saved_searches FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

COMMIT;
