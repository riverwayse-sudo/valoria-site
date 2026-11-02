# Product Requirements Document — Valoria Event Registration & Email Marketing

**Status:** Draft for implementation  
**Scope:** Reusable event registration and communications workflow in the Valoria public site, integrated with the existing Valoria data and marketing systems.  
**Confirmed event reference (28–29 October 2026 discussion):** Professional Standard Series · Enterprise — “Influence Without Authority: The Real Currency of Organisational Power”; 14 November 2026, 10:00 AM WAT; guest speaker Yinlayefa Thompson, SPHRi; host Temitayo Adetokunbo. No event duration, end time, venue/platform, agenda or additional event copy is established in the approved details available to this implementation. Do not add any of those details. The supplied Temitayo portrait is a host image asset; store it in the codebase as requested, without inferring any additional role.

## 1. Problem

Valoria needs a dependable, repeatable way to publish an event, collect registrations, record participant consent, communicate with registrants, and measure campaign outcomes without creating a separate or disconnected registration system for each event.

## 2. Product outcomes

1. A visitor can understand the event using only approved event information.
2. A visitor can register through the existing Events experience.
3. The system validates and records registration safely and prevents accidental duplicate records.
4. The registrant receives an appropriate transactional response after successful registration.
5. Marketing communications reach only contacts eligible for the specific campaign.
6. Organisers can distinguish registrants from general marketing subscribers and measure registration outcomes.
7. The workflow can be reused for later events by changing approved event data rather than rebuilding the process.

## 3. Users

- **Prospective participant:** discovers the event and submits a registration.
- **Registered participant:** receives event-related confirmation and operational updates.
- **Campaign recipient:** receives promotional email only where valid marketing permission and suppression checks allow it.
- **Event administrator:** maintains approved event details, reviews registrations and campaign performance.
- **Valoria operator:** maintains the website, data integration and email delivery configuration.

## 4. Functional requirements

### Event information
- Use the canonical event catalogue in `src/lib/professionalStandardSeries.js`.
- Do not publish an event while its approval state is false.
- Do not infer missing event details from another session, a previous flyer, or an assistant-generated summary.
- Keep approved title, series/cluster, guest speaker, host, date, start time, poster and registration state consistent across event card, poster, registration modal and confirmation email. Omit unconfirmed description, end time, duration and format.
- Treat the approved flyer and explicit owner approval as the source of truth for event-specific copy and creative.

### Registration
- Preserve the current Events page entry point and `EventRegistrationTrigger` / `EventRegistrationModal` flow unless implementation review demonstrates a concrete defect.
- Current form fields in source: full name, email, role, organisation, WhatsApp number and consent. Any change to collection must be justified and documented.
- Submit to the existing `POST /api/session-registration` endpoint.
- Validate required fields and consent server-side; client-side validation is supplementary.
- Associate each registration with the canonical session identifier.
- Return a clear success or recoverable error state. Never show success before the server confirms persistence.
- Idempotency/duplicate handling must be enforced server-side using a stable session + participant identity rule.
- Do not expose private registration data on public routes.

### Email
- Separate transactional event messages from promotional marketing.
- Transactional messages: registration acknowledgement/confirmation and approved event operational updates.
- Promotional messages: event announcement, approved reminders and post-event follow-up, subject to marketing eligibility and suppression.
- Use the existing Brevo integration and canonical lead pipeline where appropriate; do not create a parallel contact database.
- Honour unsubscribes, blocklists, complaints, hard bounces and contact-level suppression.
- Revalidate the live audience immediately before every campaign. Historical exports are not a send-authorisation list.
- Do not add a registrant to general marketing solely because they registered. Store and honour the relevant consent separately.

### Reporting
- Record event/session ID, registration timestamp, source/UTM attribution where available, consent state and delivery outcomes.
- Report counts from persisted records, not frontend success events.
- Track registration conversion and email delivery/engagement where the provider exposes reliable events.
- Avoid reporting open rate as definitive proof of human readership.

## 5. Non-functional requirements

- Privacy by design and data minimisation.
- Server-side validation, rate limiting and abuse protection.
- Secure handling of API credentials; no secrets in browser bundles.
- Accessible form labels, keyboard flow, visible focus, error announcements and mobile usability.
- Idempotent integration and retry-safe delivery.
- Observability for failed registration persistence and email delivery.
- No new paid services or dependencies without explicit approval.

## 6. Out of scope

- Inventing or rewriting event content.
- Changing the Valoria event series strategy.
- Building a new CRM or replacing Brevo.
- Sending a campaign before event details, recipient eligibility and final copy are approved.
- Treating event registration as blanket consent for unrelated marketing.

## 7. Acceptance criteria

- Event cannot appear as registration-open until approved.
- Event content is identical to the approved source across all public surfaces.
- Valid registration persists once against the correct session.
- Invalid or missing consent is rejected server-side.
- Duplicate submissions do not create duplicate participant records.
- Successful registration returns a confirmed server response and clear user feedback.
- Transactional email behaviour is tested independently from marketing campaigns.
- Campaign recipient selection excludes all suppressed/ineligible contacts at send time.
- Desktop and mobile registration journeys pass browser testing.
- Logs and reports can reconcile registrations and delivery outcomes.

## 8. Open decisions — must not be guessed

- Final owner approval of the 14 November event record and its exact content.
- Whether the currently coded Session 04 title/description/time and 90-minute duration are approved.
- Approved speaker/facilitator name and portrait usage/caption.
- Registration capacity, closing date and any fee (if applicable).
- Final campaign copy, send schedule and sender identity.
- Whether registrants separately opt into ongoing Valoria marketing.
- Approved privacy/retention period for event registration data.
