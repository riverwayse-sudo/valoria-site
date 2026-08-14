-- 011_add_profile_reminder_tracking.sql
--
-- Per Femi's request (11 Aug): once someone finishes the VALU Index but
-- hasn't completed their profile, send a reminder email nudging them to
-- finish it so they become eligible for marketplace listing.
--
-- This column tracks whether that reminder has already gone out, the same
-- way report_email_sent_at already tracks the score-report email — without
-- it, the daily sweep would re-send the same reminder every day forever.
--
-- Run this once in the Supabase SQL editor.

alter table valu_assessments
  add column if not exists profile_reminder_sent_at timestamptz;

-- Nothing to backfill — existing rows correctly start as null (no reminder
-- sent yet), and the sweep in api/sweep-unsent-reports.js only picks up
-- rows completed more than 24 hours ago, so this won't immediately fire a
-- backlog of reminders the moment it's deployed.
