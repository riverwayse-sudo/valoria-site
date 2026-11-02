# Architecture — Event Registration & Email Marketing

**Status:** Current-state map plus target controls  
**Repositories:** `riverwayse-sudo/valoria-site` (public experience and integration) and existing Valoria Supabase/Brevo lead infrastructure. Platform-owned functionality must remain in its authoritative service; do not duplicate it in the public site.

## 1. Current implementation observed

- Event catalogue: `src/lib/professionalStandardSeries.js`.
- Events page: `src/app/events/page.jsx`.
- Event poster: `src/components/EventPoster.jsx`.
- Registration trigger: `src/components/EventRegistrationTrigger.jsx`.
- Registration modal: `src/components/EventRegistrationModal.jsx`.
- Registration submission: modal posts JSON to `POST /api/session-registration`.
- Brevo registration integration helper: `src/lib/eventRegistrationBrevo.js`.
- Existing lead pipeline documentation: `docs/LEAD_PIPELINE.md`.
- Existing lead pipeline: Meta Lead Ads / website captures → Supabase `lead_captures` → sync worker → Brevo. The documented pipeline uses idempotent source/external identifiers and retry metadata.

The event page derives event states from the canonical event catalogue. The catalogue currently marks Session 04 as not date-approved. The UI must respect that approval flag.

## 2. Logical flow

```text
Approved event record
       |
       v
professionalStandardSeries.js
       |
       +--> Events page / EventPoster
       |
       +--> EventRegistrationTrigger
                    |
                    v
            EventRegistrationModal
                    |
                    | POST /api/session-registration
                    v
            Server-side validation
                    |
          +---------+-----------+
          |                     |
          v                     v
   Registration store     Consent/marketing
   (authoritative DB)     eligibility record
          |                     |
          v                     v
   Confirmation result    Brevo integration
          |                     |
          v                     v
   User success state     Transactional/marketing
                          delivery + suppression
```

The diagram describes the required separation of responsibilities. Verify the actual route implementation and persistence target before changing or documenting a specific table/schema as implemented.

## 3. System boundaries

### Public site
Owns event presentation, registration form interaction, client-side validation for usability, request submission and confirmation/error states.

### Server/API layer
Owns authoritative validation, consent enforcement, abuse controls, idempotency, persistence and safe provider calls. Browser code must never receive provider API keys or privileged database credentials.

### Registration data store
Owns the durable registration record and event association. It must be the source for registration counts and operational attendee lists. Do not treat Brevo as the authoritative event registration database.

### Brevo
Owns email delivery and marketing audience execution. It is not the source of truth for whether a person is registered. Existing suppression state must be respected.

### Supabase lead pipeline
The documented `lead_captures` pipeline supports marketing lead capture and synchronisation. Reuse it where the existing implementation and consent model fit; do not bypass it with a second, ungoverned contact sync.

## 4. Data contracts

Minimum registration record (logical contract; map to actual schema after route inspection):
- immutable registration ID;
- canonical session ID;
- participant name;
- normalized email;
- optional role, organisation and WhatsApp fields currently collected;
- registration timestamp;
- consent purpose, state, timestamp and policy/version reference;
- source/UTM metadata when available;
- processing/delivery status and error metadata where operationally required.

Do not store unnecessary sensitive information. Do not expose registrant records publicly.

Marketing permission must be distinct from operational event communication. A registrant may receive essential event operations without being silently subscribed to unrelated promotional mail.

## 5. Reliability and security

- Validate and normalize on the server.
- Apply rate limiting and anti-abuse controls.
- Enforce idempotency for retries and double-clicks.
- Persist registration before reporting success.
- Make email delivery retryable without duplicating registration records.
- Record provider message IDs and delivery failures where available.
- Keep secrets in server-side environment/secret management.
- Never log full personal form payloads or credentials.
- Provide safe, non-enumerating error responses.
- Keep data access restricted to authorised operators.

## 6. Failure handling

| Failure | Required behaviour |
|---|---|
| Validation failure | Return field-safe error; do not persist |
| Consent absent | Reject registration submission |
| Database unavailable | Return recoverable error; do not claim success |
| Duplicate submission | Return stable existing/success outcome without duplicate record |
| Email provider unavailable | Keep registration; queue/retry email; surface operational alert |
| Provider suppression | Do not attempt prohibited send; retain suppression outcome |
| Unknown session ID | Reject request; do not create orphan registration |

## 7. Deployment and configuration

- Public-site changes follow the repository's current Cloudflare deployment path as directed by the project owner; do not silently switch deployment providers.
- Required environment variables must be documented by name and purpose without including values.
- Deployments must be validated against the deployed origin, not inferred from a successful commit.
- Provider configuration changes are separate from code deployment and require independent verification.

## 8. Architecture decisions still requiring verification

- Exact persistence table and constraints used by `/api/session-registration`.
- Whether transactional confirmations are currently sent by the route or by a database/provider worker.
- Whether event registrants are synchronised to Brevo and under what consent conditions.
- Existing duplicate detection key and rate-limit policy.
- Current webhook/event tracking coverage for delivered, bounced, complained and unsubscribed events.
