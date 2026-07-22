-- Migration: 009_add_preferred_industry.sql
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
--
-- What this does:
--   Adds a `preferred_industry` column to professional_profiles, distinct
--   from the existing `industry` column (which represents the person's
--   CURRENT industry). Both are single-select values from the same
--   INDUSTRIES list used in src/app/profile/setup/page.jsx.
--   Nullable — preferred_industry is optional in the wizard.

BEGIN;

ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS preferred_industry TEXT;

COMMIT;
