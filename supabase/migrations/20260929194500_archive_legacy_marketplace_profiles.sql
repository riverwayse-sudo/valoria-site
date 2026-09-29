-- Retire the obsolete marketplace_profiles table from the active schema.
-- The canonical public registry is marketplace_public_roster, projected from
-- professional_profiles + professional_capabilities + VALU continuity rules.
-- The old table contained 220 stale rows and had no active application references.
-- Data is preserved under an explicit archive name for audit/recovery.

alter table if exists public.marketplace_profiles
  rename to legacy_marketplace_profiles_archive;
