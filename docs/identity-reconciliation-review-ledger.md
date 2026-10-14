# Identity reconciliation review ledger

## Purpose
The admin reconciliation screen records evidence-backed decisions about historical taster, full VALU assessment, and professional-profile relationships. The ledger is an append-only audit trail; writing a review never changes ownership, creates a profile, or attaches a taster to an assessment.

## Decision meanings
- `verified_match`: evidence establishes the relationship; candidate ID and evidence reference are mandatory.
- `candidate_match`: plausible candidate, not yet proven.
- `conflict`: records or evidence disagree; hold for investigation.
- `unmatched`: no defensible relationship found at review time.
- `resolved_no_link`: investigation is closed and the record intentionally remains unlinked.

## Evidence standard
Prefer stable record IDs and authenticated account ownership, then verified email and original submission/release logs. Names, roles, dates, scores, and proximity in time are corroboration only; they are not sufficient by themselves to link records. If evidence is absent, use `unmatched` or `candidate_match`, and leave identity fields unchanged.

## Access and audit
The `identity_reconciliation_reviews` table has RLS enabled, and direct access is revoked from `anon` and `authenticated`. The API uses the service role only after validating the bearer session and confirming the user exists in `admin_users`. Every review stores the reviewer, timestamp, source/candidate IDs, decision, evidence category/reference, and notes. Reviews are append-only through the application API.

## Closure workflow
1. Review all completed full VALU assessments missing `taster_id`.
2. Review all completed taster sessions without account ownership.
3. Resolve stable-ID/account-owner evidence first; investigate email and historic submission/deployment records second.
4. Keep conflicts and unsupported matches unresolved; do not auto-link by name.
5. Apply identity corrections only through the separately protected reconciliation action after evidence review, then verify journey, profile, capability and roster projections.
6. Keep historical taster version `legacy_unknown` unless release/deployment evidence supports an admin-verified version.
