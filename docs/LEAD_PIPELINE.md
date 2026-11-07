# Valoria lead pipeline

Canonical flow:

Meta Lead Ads -> Supabase meta_lead_events -> process-meta-leads -> lead_captures -> sync-leads-to-brevo -> Brevo.

Website waitlist submissions and Professional Standard registrations are captured into lead_captures by database triggers. pg_cron runs the Meta processor and Brevo sync workers every minute.

lead_captures is the canonical marketing-lead record. source + external_id is idempotent, and Meta leads additionally use meta_leadgen_id as a unique key.

VALU taster registrations also create a `lead_captures` row with source `valu_taster_signup` and an idempotent `external_id`. The returned `lead_capture_id` is the identity anchor for the new taster progress record, submitted taster session, and identity-candidate projection. Account creation remains a separate, later step; the authenticated account claims the saved taster only after email verification.

For VALU registrations, `lead_captures.consent` means optional marketing-email permission, not permission to administer the assessment. It is false unless the participant explicitly opts into Valoria updates. The required Privacy Notice acknowledgement is recorded separately in the registration payload. A participant can register and complete the assessment without opting into marketing emails. Only explicitly opted-in leads are eligible for Brevo marketing sync.

Brevo contact upserts use updateEnabled=true. Delivery failures are persisted in brevo_last_error, brevo_attempt_count, and brevo_next_attempt_at for automatic retry.

The public meta-lead-webhook validates Meta verification and X-Hub-Signature-256. Meta page credentials remain server-side.

Required Meta Function secrets:
- META_VERIFY_TOKEN
- META_APP_SECRET
- META_PAGE_ACCESS_TOKEN
- META_GRAPH_API_VERSION (optional)

Required Brevo Function secret:
- BREVO_API_KEY

The Brevo list uses BREVO_LEAD_LIST_ID, then BREVO_LIST_ID, then the existing Valoria list ID 3.

Operational note: Brevo is currently rejecting Supabase function egress with HTTP 401 because IP authorisation is enabled for the Brevo credential. The queue preserves leads and retries with backoff until that external security setting is corrected.
