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

## Queue-state rules
The admin queue uses the latest review per source record:
- No review: not reviewed.
- `candidate_match`, `conflict`, or `unmatched`: open; more evidence or follow-up is still required.
- `verified_match`: open until the separately protected identity correction has been applied and verified. A verified relationship is not proof that the database link has already been written.
- `resolved_no_link`: closed for investigation only; the underlying record remains unlinked by design.

The queue defaults to open work and supports all-record and closed-without-link views. Summary counts are based on the latest review per source, not the number of audit entries, so repeated reviews do not inflate the source count.

## Contact-candidate evidence
The admin report may surface candidate contact records from `taster_identity_candidates`, including lead capture, event registration, and waitlist sources. These records are leads for investigation, not canonical identity links. The queue compares candidate email, linked account ownership, and name/role consistency against the assessment and taster session. A mismatch must remain open for human review; exact email or account-owner alignment alone does not override contradictory name/role evidence.


## Authenticated recovery retry contract

The confirmed-email taster claim endpoint must be safe to retry after any partial write:
- It may process both unclaimed candidates and candidates already linked to the same authenticated user, so a prior failure after ownership persistence does not strand the remaining steps.
- It must never take over a taster or candidate already owned by another account, and must stop when the latest review verifies a different account.
- It appends a new `verified_match` decision when the confirmed-email claim completes or repairs a prior decision. It does not overwrite an earlier `unmatched` or `conflict` review.
- It reruns journey refresh and marketplace readiness for already-linked records as well as newly linked records, allowing retries to repair stale projections.
- Claim eligibility still requires a confirmed account email that matches the corroborated candidate email and a normalized name/role match with the original taster record. This route never uses assessment score or date proximity as identity proof.


## Signed full-assessment handoff

A full assessment can only be launched by an explicit action inside the authenticated Valoria dashboard. The site issues a random, one-time handoff code with a 60-second expiry, stores only its SHA-256 hash against the authenticated user and exact completed taster, and sends the code in the URL fragment (never the HTTP query). The assessment platform verifies the account and snapshot, atomically consumes the code, then issues a four-hour assessment-session token. That session token is stored in session storage and is accepted only when it carries the platform-issued `assessment_session` type. The platform verifies the signature, audience, expiry, taster ID, owner and confirmed account email before restoring progress or accepting a score.

Public continuation URLs, legacy identity parameters and old signed-token fragments do not open the assessment. They return the participant to login/dashboard. Assessment and profile reminder emails also return to login/dashboard; they never carry participant IDs, resume tokens or assessment handoff credentials. The dashboard is the sole issuer. Re-submitting the same completed assessment for the same owner and snapshot returns the canonical stored result without creating a duplicate score.


## Claim eligibility and legacy assessment rule

A new taster ownership claim requires a confirmed account email that exactly matches the stored contact candidate, plus a match to the account's stored name and the candidate's role when present. Missing contact-email evidence, a role discrepancy, or a different linked account stops the claim and leaves it for manual review. Existing ownership by the same account can be retried to repair projection state.

A completed full assessment with an exact matching `taster_id` can be attached after ownership verification. A legacy full assessment with `taster_id IS NULL` is never attached merely because account ID, name, and role appear to match. The account may be linked to the taster, but the legacy assessment stays in the reconciliation queue with `legacy_assessment_requires_review` until a separate evidence-backed review confirms the relationship.


## Applying a verified assessment-to-snapshot link

A verified_match review is an approval decision, not a write operation. The admin apply endpoint requires the latest review to name the exact assessment and taster, include a traceable evidence reference, and use an allowed evidence type. It verifies that both records are completed, already belong to the same authenticated account, and have no conflicting snapshot owner. It never transfers ownership or changes a score.

Name, role, or contact discrepancies require a traceable submission log, release log, or admin documentation that explicitly explains the discrepancy. Contact-email alignment alone is insufficient. The endpoint writes an audit event, refreshes the canonical professional journey, and verifies the persisted link. The review queue marks a link as applied only after the stored assessment-to-taster reference, account owner, name, and role agree. If audit or journey refresh fails, the operation reports the partial state and remains retryable.

Admin assessment-owner reconciliation also requires a latest verified_match review naming the exact account, traceable evidence, and a confirmed target account email. The UI disables direct linking until that review exists.


Applying a verified snapshot-owner link requires a latest verified-match review naming the exact account, traceable evidence, a confirmed account email, and a completed snapshot. The endpoint never overwrites an existing different owner. If contact evidence is missing or conflicts, a submission log, release log, or admin documentation must explicitly resolve the discrepancy. It confirms the saved owner, updates the candidate projection, writes an audit event, and refreshes journey state; failed projection, audit, or refresh steps remain retryable and the review stays open until persisted state confirms the correction.


Discrepancy override control: if saved names, roles, or emails conflict, the latest verified review must use submission_log, release_log, or admin_documentation evidence and include a written explanation of at least 20 characters. The apply endpoints reject a discrepancy override without that explanation. Assessment-owner reconciliation also requires an exact match to the target account's confirmed email unless this documented exception applies.
