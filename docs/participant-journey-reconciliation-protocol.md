# Valoria participant identity and journey reconciliation protocol

## Canonical records and rules

- One authenticated account maps to one `professional_profiles` row.
- A professional may have multiple `professional_capabilities`; capabilities are not duplicate people.
- `taster_sessions` are historical 9-question snapshots. They grant **Basic** access only when existing listing rules allow it.
- `valu_assessments` are authoritative full VALU Index assessments. Preserve stored scores, answers, assessment/scoring/rubric versions, completion times and reports.
- `professional_journey` is derived state, not an identity source. Refresh it only after ownership is verified.
- `marketplace_public_roster` is a projection/cache, not the canonical source of identity.
- Each new taster must carry a server-stamped taster_version; legacy rows with no proven version remain legacy_unknown until immutable release evidence verifies them.
- A display name, role, score similarity or date proximity alone is not sufficient evidence to merge or link records.

## Linking protocol

1. Authenticate the account using Supabase Auth and verify its access token server-side.
2. Load the target record by its immutable UUID.
3. Reject the operation if the record is already owned by another account.
4. Compare saved identity with identity already attached to the authenticated account (Auth metadata or its existing profile). Never treat request-body fields as identity proof.
5. Claim only with a conditional update where `user_id IS NULL`; re-read and verify the resulting owner.
6. Record the event once where possible, upsert the identity-link record, refresh `professional_journey`, then refresh the roster projection.
7. Make retries safe: repeat requests by the same owner should return the linked state without duplicating events or changing scores.
8. If ownership evidence conflicts or is incomplete, leave the record unchanged and route it to manual review.

## Historical reconciliation

- Generate a read-only candidate report using immutable IDs, exact verified email, existing `user_id`, `taster_id`, `identity_hash`, and existing identity-link rows.
- Auto-link only where a stable identifier proves the relationship and no competing owner exists.
- Email-only matching is acceptable only where the email is verified on the account and the assessment ownership is null; conflicts are manual review.
- Names, role, date proximity, score similarity and marketplace appearance are candidate hints only—not authorization to link.
- Preserve ambiguous records, duplicate names, historical scores and all known tasters until individually resolved.
- Report separately: profiles, unique roster professionals, completed tasters, completed full assessments, verified links, unresolved candidates and duplicate candidates.

## Release gate

Before production release:
- Apply migrations in a controlled environment and verify migration history.
- Run unit/contract tests, design checks and a production build.
- Verify RLS and Supabase security/performance advisors.
- Re-run the reconciliation report and compare before/after counts.
- Test taster signup, email confirmation, claim retry, full-assessment handoff, report access, profile completion, capability listing and roster refresh.
- Confirm Basic does not display a full-assessment score or merit tier.
- Confirm a conflicting claim returns 409/403 and cannot transfer ownership.
- Keep score data immutable; record approved ownership corrections in the audit trail.
- Do not promote to production until the separate assessment application's submit/handoff contract is verified end-to-end.

## Operational checklist

- [ ] Confirm assessment application sends the originating `taster_id` on full-assessment submission.
- [ ] Confirm the database ownership trigger fills `user_id` from a verified linked taster when appropriate.
- [ ] Reconcile historical null `taster_id` rows only from reliable evidence.
- [ ] Verify every public roster row is eligible and has the correct Basic/Full access label.
- [ ] Review unowned sessions and conflicting identities manually.
- [ ] Enable Supabase leaked-password protection in Auth settings.
