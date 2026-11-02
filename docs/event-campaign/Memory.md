# Project Memory — Valoria Event Registration & Email Marketing

**Purpose:** Durable handoff notes for future contributors. This file records established facts, constraints and unresolved decisions. It is not an authority to invent event details.

## 1. Project context

- Public website repository: `riverwayse-sudo/valoria-site`.
- Platform repository: `riverwayse-sudo/valoria-platform`.
- Public Events route: `/events`.
- Canonical event catalogue: `src/lib/professionalStandardSeries.js`.
- Registration UI: `EventRegistrationTrigger` and `EventRegistrationModal`.
- Current form endpoint in the modal: `POST /api/session-registration`.
- Existing marketing provider: Brevo.
- Existing lead pipeline documentation: `docs/LEAD_PIPELINE.md`.

## 2. Confirmed 14 November 2026 event

Confirmed in the user's 28–29 October 2026 event discussion:
- Series: Professional Standard Series · Enterprise.
- Title: “Influence Without Authority: The Real Currency of Organisational Power”.
- Date: Saturday, 14 November 2026.
- Time: 10:00 AM WAT.
- Guest speaker: Yinlayefa Thompson, SPHRi.
- Host: Temitayo Adetokunbo.
- Two planned creatives, in order: speaker profile poster, then main event announcement poster.
- Existing creative direction: Valoria navy, gold and light blue; user asked to keep the work simple and not add unnecessary elements.
- User supplied a Temitayo portrait and explicitly asked that it be stored in the codebase. It is the host portrait; do not label it as the guest speaker. An optimised copy is committed at `public/images/temitayo-adetokunbo-host.webp`.
- No approved event duration/end time, venue/platform, agenda, or further description is evidenced. Do not invent or display these fields.

Session 04 in the codebase has been updated on the working branch to match the confirmed title, Enterprise cluster, date/time, guest speaker and host. The previously coded 90-minute end time was removed because it was not confirmed. The event remains active after its start until an operator explicitly marks it ended; this avoids inventing an end time.

Session 05 is a separate provisional 5 December record with `dateApproved: false`. Do not confuse it with the 14 November event or reuse its unapproved copy.

## 3. Audience and email history

- A historical October 2026 audience export was reported as 604 total contacts, 583 email-eligible and 21 blocklisted/SMS-only.
- These figures are historical and must be revalidated from Brevo before any send.
- Previous guidance: do not blast all contacts; segment previous event registrants/attendees separately from other Valoria leads.
- Preserve all unsubscribe, blocklist, complaint, bounce and suppression exclusions.
- Event registration is not blanket consent for ongoing marketing.

## 4. Existing technical facts

- Events page uses the canonical event catalogue and derives state from `dateApproved` and event dates.
- Registration modal currently collects full name, email, role, organisation, WhatsApp and a consent checkbox.
- Modal posts `session_id` and form data to `/api/session-registration`.
- The modal displays the journey URL returned by the endpoint, defaulting to `/journey`.
- `src/lib/eventRegistrationBrevo.js` exists as a registration/Brevo helper.
- `docs/LEAD_PIPELINE.md` documents Supabase `lead_captures` and a Brevo synchronisation worker. It also records a historical Brevo HTTP 401 egress/IP-authorisation issue. Recheck current provider status; do not assume it is still failing or resolved.
- Exact registration persistence schema and transactional delivery behaviour must be confirmed by inspecting the route and database before implementation claims are made.

## 5. Registration audit findings (2 November 2026)

- `POST /api/session-registration` uses Supabase service-role access and upserts `professional_standard_event_registrations` on `session_id,email`.
- Registration API requires a true consent Boolean. The UI wording currently combines essential event information and “relevant Valoria communications”; this is not a clean separation of transactional and optional promotional consent. Resolve the approved consent wording and data model before marketing sends.
- The rate-limit RPC previously failed open. A code change on the event-campaign documentation branch now returns HTTP 503 if the RPC errors and prefers Cloudflare's `CF-Connecting-IP` header. This patch is not yet merged, deployed or runtime-tested.
- A protected `GET /api/cron/event-registration-sync` route exists and retries registrations where Brevo sync or confirmation is incomplete, with a maximum attempt count of 10. The only schedule declaration found is in `vercel.json` at daily 09:00; this is Vercel-specific and does not establish execution after the Cloudflare migration. A Cloudflare-compatible or Supabase-managed schedule must be implemented and verified.
- The event sync route has been patched on the working branch to retry only sessions with `dateApproved === true`; this is not yet merged, deployed or runtime-tested.
- The registration flow adds the contact to a Brevo list and sends a confirmation email through the same helper. Verify list purpose and suppression/consent semantics before campaign use.
- The registration API creates a Valoria re-entry link and attempts to resolve an existing account; the account lookup result is currently unused.
- The event-registration sync cron currently selects future sessions from `EVENT_SESSIONS`; verify approval gating and do not treat this as permission to market a provisional session.

## 6. Non-negotiable project constraints

- Do not invent event title, speaker, role, credentials, date, time, duration, venue, price, agenda, capacity or outcomes.
- Approved flyer and explicit owner confirmation control event copy.
- Do not publish while event approval is false.
- Do not silently change the existing registration architecture.
- Do not create a parallel CRM or registration database.
- Keep transactional and promotional email separate.
- Revalidate the recipient audience immediately before send.
- Keep secrets server-side.
- Follow the Valoria Design Constitution and brand tokens.
- The project owner has directed the team to use Cloudflare for current deployments; do not revert to Vercel deployment paths without explicit direction.
- Do not claim a deployment, test, send or fix is complete without evidence.

- Live aggregate registration check on 2 November 2026: records exist for sessions 02 (74) and 03 (9); no session 04 or 05 rows were returned. This is a point-in-time count, not a forecast or approval.

## 7. Update protocol

After each implementation milestone, update:
1. current verified behaviour;
2. changed files and commit;
3. test evidence;
4. deployed environment/URL and verification evidence;
5. remaining blockers and owner decisions.

Keep provisional assumptions in the Open Decisions section of the PRD, not in the facts above. Replace historical counts only with a dated, verified export.
