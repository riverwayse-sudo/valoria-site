# Valoria Security Verification Baseline

Use the current OWASP Application Security Verification Standard as the source of truth: https://github.com/OWASP/ASVS

This is a practical release checklist, not a certification claim. Record evidence for each applicable control and review the checklist when the platform changes.

## Identity and session security
- [ ] Authenticated endpoints validate the server-side session/token, not client-provided user IDs.
- [ ] User-editable metadata is never trusted for authorisation decisions.
- [ ] Sign-out, session expiry, and recovery flows behave correctly.
- [ ] Leaked-password protection is enabled where supported by the current Supabase Auth configuration.
- [ ] Secrets are server-only; no service-role or secret key appears in client bundles, logs, or public environment variables.

## Access control and data isolation
- [ ] RLS is enabled for every exposed table containing user or platform data.
- [ ] Every SELECT/INSERT/UPDATE/DELETE policy matches the intended role and row ownership.
- [ ] UPDATE policies include both USING and WITH CHECK where applicable.
- [ ] Anonymous access is explicitly tested, not inferred from the UI.
- [ ] A second authenticated account cannot read or alter another user's assessments, profile drafts, reports, or notifications.
- [ ] Public profile access is limited to records explicitly marked public and listed; profile completion is not confused with listing eligibility.
- [ ] Views, RPCs, storage buckets, and privileged functions have been reviewed for RLS bypass or excess privileges.

## Input, abuse, and API controls
- [ ] Request bodies have size limits and strict field validation.
- [ ] User-supplied HTML is escaped before being included in emails or rendered as markup.
- [ ] Public endpoints have a documented abuse-control strategy and safe failure behaviour.
- [ ] Errors returned to users do not disclose secrets, database internals, stack traces, or personal data.
- [ ] Third-party API calls have bounded input, timeouts, and explicit failure handling.

## Auditability and operations
- [ ] Security-relevant failures are logged without credentials or unnecessary personal data.
- [ ] Critical failures notify the responsible inbox without leaking user conversation contents unnecessarily.
- [ ] Dependency and secret scans run in CI.
- [ ] Backups, recovery, incident ownership, and credential rotation are documented.
- [ ] Production and preview environment variables are reviewed for parity and least privilege.

## Release evidence
For each release, record the commit/PR, checks run, preview URL, manual test results, outstanding risks, and whether any database policy or migration changed. An unchecked item must be marked as a known gap—not silently treated as passed.
