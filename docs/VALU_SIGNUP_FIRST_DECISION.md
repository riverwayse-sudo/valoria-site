# VALU registration-first journey decision

**Decision status:** Approved by the product owner in the implementation conversation on 7 November 2026.

## Decision

Participants register their contact and professional details **before** beginning the VALU taster. This registration is not the creation of a Valoria platform account. Platform account creation remains a separate conversion step after the taster, when the participant chooses to continue.

This supersedes the earlier public-copy direction in the original website content and review documents that said the taster could begin without any registration. It does not change the VALU assessment methodology.

## Participant journey

1. **Registration:** collect name, email, current role and experience band. Organisation and professional interest are optional qualification fields. Require acknowledgement of the Privacy Notice. Offer a separate, optional marketing-email opt-in.
2. **Taster:** create a resumable taster-progress record already linked to the registered lead. Save each response against that progress record.
3. **Account creation:** after the taster, let the participant create an account or sign in to an existing account. Confirm the email and claim the saved taster.
4. **Full assessment:** continue to the separate full VALU assessment from the authenticated dashboard.
5. **Official result:** produce the official VALU Index and PRIME points only from the completed full assessment.

## Identity and data contract

- `public.lead_captures.id` is the durable pre-taster identity: `lead_capture_id`.
- `public.taster_progress.lead_capture_id`, `public.taster_sessions.lead_capture_id` and `public.taster_identity_candidates.lead_capture_id` must point to that same lead.
- Lead creation and initial progress creation occur atomically in `begin_valu_taster_signup`.
- A client-generated signup idempotency key and secure resume token make network retries safe.
- New progress and taster-session inserts without a lead ID are rejected by database triggers.
- Legacy in-progress sessions can be resumed and attached to a new registration without discarding saved answers.
- Account ownership is not inferred from the lead ID. It is established only by the existing authenticated, verified-email taster-claim flow.
- The taster and full assessment remain separate records. Taster answers are never seeded into the 58-question full assessment.

## Consent and follow-up

The required Privacy Notice acknowledgement is distinct from optional marketing permission. The `lead_captures.consent` field is set only when the participant explicitly opts into marketing emails. Assessment registration alone must not trigger Brevo marketing sync. Transactional assessment and account messages remain governed by their own operational basis and templates.

## Public experience requirements

- Do not call this step “Create account”; it is registration before the taster.
- Explain simply that the participant registers details first and secures a Valoria account after the snapshot.
- Do not expose internal assessment counts, progress-count labels or database mechanics.
- Preserve the 9-question taster and 58-question full assessment as separate stages.

## Deployment and verification

- Database migrations: `20261107131125`, `20261107131149`, `20261107131213`.
- Staging database: `valoria-staging` (project ref `yccxgjdqworgcbircnvn`).
- The registration and submission RPCs are restricted to `service_role`.
- Staging Worker must have its own `SUPABASE_SERVICE_ROLE_KEY` secret before write APIs are enabled. Never copy the production key into staging.
- Keep `VALU_STAGING_API_ENABLED=0` until the staging service-role secret is configured; enable only after the staging Worker is deployed and smoke-tested.
- Run database RPC idempotency tests, API contract tests, full build, browser registration-to-account journey, taster claim, and separate full-assessment start/resume tests before marking the work complete.
