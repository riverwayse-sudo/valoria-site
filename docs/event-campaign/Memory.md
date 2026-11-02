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

## 2. Known event catalogue state

- Session 04 is currently represented in code as:
  - title: “Emotional Intelligence Is Not About Being Nice”;
  - start: 14 November 2026, 10:00 WAT;
  - end: 11:30 WAT;
  - description: “Treat emotional intelligence as a precision instrument for perception, regulation and strategic application.”
  - `dateApproved: false`.
- These are current code values only. The false approval flag means they must not be treated as final public event facts until the owner confirms them against the approved flyer.
- Session 05 is separately represented as a 5 December 2026 provisional record. Do not confuse its title or content with Session 04.
- An image of Temitayo was supplied in the conversation. The image alone does not establish whether Temitayo is the event speaker, host or facilitator. Confirm the intended role and permission before publication or use in email creative.

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

## 5. Non-negotiable project constraints

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

## 6. Update protocol

After each implementation milestone, update:
1. current verified behaviour;
2. changed files and commit;
3. test evidence;
4. deployed environment/URL and verification evidence;
5. remaining blockers and owner decisions.

Keep provisional assumptions in the Open Decisions section of the PRD, not in the facts above. Replace historical counts only with a dated, verified export.
