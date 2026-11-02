# Implementation Tasks — Event Registration & Email Marketing

Status labels: **Pending**, **In progress**, **Blocked**, **Verified**. Do not mark Verified without test evidence.

## Phase 0 — Approval and source validation

- [ ] **Blocked:** Obtain owner approval of the 14 November event record.
- [ ] Confirm exact title, description, speaker/facilitator, portrait role, date, start/end time, format, duration, registration terms and any capacity/fee.
- [ ] Reconcile the approved flyer against `professionalStandardSeries.js`.
- [ ] Keep Session 04 unavailable for promotion while `dateApproved` is false.
- [ ] Approve registration privacy/consent wording and marketing consent wording separately.
- [ ] Approve campaign copy, sender identity, audience and schedule.

## Phase 1 — Existing implementation audit

- [ ] Inspect `POST /api/session-registration` route and its persistence target.
- [ ] Inspect `src/lib/eventRegistrationBrevo.js` and determine exactly when/how Brevo is called.
- [ ] Inspect database schema, constraints, triggers and policies used by registration.
- [ ] Confirm duplicate-registration/idempotency behaviour.
- [ ] Confirm server-side consent enforcement.
- [ ] Confirm rate limiting, abuse protection and safe error responses.
- [ ] Confirm confirmation email behaviour and delivery observability.
- [ ] Record actual findings here before changing architecture.

## Phase 2 — Registration implementation

- [ ] Update only the canonical event record with owner-approved facts.
- [ ] Ensure approval state gates event visibility and registration.
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
