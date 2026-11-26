# Valoria lead pipeline

## Canonical lead capture

Meta Lead Ads -> Supabase `meta_lead_events` -> `process-meta-leads` -> `lead_captures`.

Website waitlist submissions and Professional Standard registrations are captured into `lead_captures` by database triggers. `lead_captures` remains the canonical marketing-lead record. `source + external_id` is idempotent, and Meta leads additionally use `meta_leadgen_id` as a unique key.

The Meta processor and contact-sync workers are scheduled through pg_cron. The public `meta-lead-webhook` validates Meta verification and `X-Hub-Signature-256`. Meta page credentials remain server-side.

## Transactional email

The following user-facing transactional sends use Resend:
- Marketplace enquiry notifications to Valoria, the buyer and the listed professional.
- Admin-triggered buyer/professional introduction emails.
- Buyer welcome emails.
- Waitlist continuation emails.

They use `RESEND_API_KEY`, the verified `info@valoriainstitute.com` sender, HTML and plain-text bodies, and stable idempotency keys for retry safety. Supabase Auth confirmation remains a separate Auth-template flow.

## Legacy marketing contact sync

`sync-leads-to-brevo` is a legacy contact-list synchronisation function, not the transactional email provider. Supabase `lead_captures` remains canonical even when this optional external sync is unavailable.

The Brevo contact sync is currently not considered operational: the previously configured credential was rejected by Brevo IP authorisation, and no active Brevo credential is required by the current Cloudflare site Worker. Do not rely on Brevo list state for signup, enquiry or introduction delivery. A future migration of marketing contact sync to Resend Contacts (or another approved CRM) is a separate workstream.

Required Meta Function secrets:
- `META_VERIFY_TOKEN`
- `META_APP_SECRET`
- `META_PAGE_ACCESS_TOKEN`
- `META_GRAPH_API_VERSION` (optional)

Legacy Brevo Function secret (only if the old contact-sync function is deliberately re-enabled):
- `BREVO_API_KEY`

Optional contact-list identifiers:
- `BREVO_LEAD_LIST_ID`
- `BREVO_LIST_ID`

Do not re-enable the legacy Brevo sync until its credential and egress policy are verified.


Other legacy Brevo references remain outside the current transactional route set: `supabase/functions/send-lead-meeting-link` (meeting-link delivery), `src/lib/eventRegistrationBrevo.js` (event registration), `src/app/api/feedback/route.js` (contact sync), and `src/app/api/cron/valu-reminders/route.js` (legacy reminder route; scheduled assessment reminders are handled by the platform Resend Worker). These paths must be migrated or retired before claiming full provider consolidation.
