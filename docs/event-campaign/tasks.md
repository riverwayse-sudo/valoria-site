# Implementation Tasks — Event Registration & Email Marketing

Status labels: **Pending**, **In progress**, **Blocked**, **Verified**. Do not mark Verified without test evidence.

## Phase 0 — Approval and source validation

- [x] Retrieve the 28–29 October owner-approved event details: Professional Standard Series · Enterprise; “Influence Without Authority: The Real Currency of Organisational Power”; 14 November 2026; 10:00 AM WAT; guest speaker Yinlayefa Thompson, SPHRi; host Temitayo Adetokunbo.
- [x] Update Session 04 in `professionalStandardSeries.js` to those confirmed details and set `dateApproved: true`.
- [x] Remove the unconfirmed 90-minute/end-time and virtual-format claims from the poster, registration modal and confirmation email.
- [ ] Store the supplied Temitayo host portrait in the repository's public asset directory and wire it only to the host presentation.
- [ ] Do not add a description, agenda, venue/platform, duration or event end time unless the owner supplies it.
- [ ] Approve registration privacy/consent wording and marketing consent wording separately.
- [ ] Approve campaign copy, sender identity, audience and schedule.

## Phase 1 — Existing implementation audit

- [x] Inspect `POST /api/session-registration` route and its persistence target. It upserts `professional_standard_event_registrations` on `session_id,email` using the Supabase service role.
- [x] Inspect `src/lib/eventRegistrationBrevo.js`: it upserts the contact to the configured event/master list and sends the registration confirmation through Brevo SMTP. The helper now uses the confirmed event date/time and guest/host names, with no unsupported virtual/duration claim.
- [x] Inspect live registration schema and lead-capture trigger. Registration records are persisted in `professional_standard_event_registrations`; lead capture is mirrored to `lead_captures` by trigger.
- [x] Confirm duplicate-registration/idempotency behaviour. Database upsert uses the `session_id,email` conflict key; verify the matching unique constraint in the deployed database.
- [x] Confirm server-side consent enforcement. A single Boolean is required; consent currently combines essential event information and relevant Valoria communications, so separate marketing permission remains a required policy/design decision.
- [x] Confirm rate limiting and safe error responses. Found a fail-open RPC error path; patched it to fail closed with HTTP 503 and prefer Cloudflare's `CF-Connecting-IP`. End-to-end verification remains pending.
- [x] Confirm confirmation email behaviour and delivery observability. A protected cron route retries rows with unsent Brevo sync/confirmation; verify the actual scheduler and deployed secret configuration.
- [ ] Record actual findings here before changing architecture.

## Phase 2 — Registration implementation

- [x] Update only the canonical event record with owner-approved facts.
- [x] Ensure approval state gates event visibility and registration.
- [ ] Preserve the existing Events page and registration modal.
- [ ] Validate all submitted fields on the server.
- [ ] Enforce required consent and persist its purpose/version/timestamp.
- [ ] Enforce idempotent registration.
- [ ] Persist registration before returning success.
- [ ] Ensure provider outage does not erase a valid registration.
- [ ] Provide clear loading, success and error states.
- [ ] Verify mobile and keyboard operation.

## Phase 3 — Email integration

- [ ] Separate transactional messages from promotional campaigns.
- [ ] Confirm verified sender/domain and reply-to configuration.
- [ ] Implement or verify registration acknowledgement.
- [ ] Implement or verify event operational reminders.
- [ ] Implement campaign templates using approved event copy only.
- [ ] Confirm unsubscribe and suppression synchronisation.
- [ ] Confirm retries and provider failure logging.
- [ ] Run test sends to internal/test recipients before any audience send.

## Phase 4 — Audience and campaign operations

- [ ] Reconcile the current Brevo audience and suppression status.
- [ ] Historical reference only: an October 2026 export reported 604 contacts, 583 email-eligible and 21 blocklisted/SMS-only. These figures must be revalidated live and are not send authorisation.
- [ ] Segment prior event participants separately from other eligible leads where data supports it.
- [ ] Exclude unsubscribed, blocklisted, complaint, hard-bounce and otherwise suppressed contacts.
- [ ] Confirm whether event registrants have opted into promotional email.
- [ ] Approve the final recipient count before sending.
- [ ] Schedule campaign only after event details and copy are approved.
- [ ] Monitor delivery, bounce, complaint and unsubscribe events.

## Phase 5 — QA and release

- [ ] Unit/integration tests for validation, consent, idempotency and error paths.
- [ ] End-to-end registration test using a test session or controlled test record.
- [ ] Confirm registration appears once in the authoritative store.
- [ ] Confirm confirmation behaviour independently from marketing sends.
- [ ] Test email links and responsive rendering.
- [ ] Run `npm test`.
- [ ] Run `npm run design:check`.
- [ ] Run `npm run excellence:check`.
- [ ] Run `npm run build`.
- [ ] Deploy using the currently authorised Cloudflare workflow.
- [ ] Verify the live Events page and registration endpoint after deployment.
- [ ] Confirm no regression to VALU, dashboard, marketplace or authentication routes.

## Phase 6 — Closeout

- [ ] Record deployment commit and environment.
- [ ] Record test evidence and unresolved issues.
- [ ] Record approved audience size and campaign send outcome.
- [ ] Record registration total from the authoritative database.
- [ ] Record delivery/bounce/complaint/unsubscribe metrics.
- [ ] Update `Memory.md` with durable decisions and final verified state.
