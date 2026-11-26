# Supabase confirmation-email template

The /auth/confirm endpoint deliberately does not consume a one-time token on a GET request. It renders a confirmation page and verifies the token only after the recipient presses the confirmation button (POST). This prevents common email-security link scanners from consuming the token before the participant opens the message.

## Supabase Dashboard configuration

Apply this to **both** the staging and production Supabase projects:

1. Open **Authentication → Email Templates → Confirm signup**.
2. Replace the link that uses {{ .ConfirmationURL }} with the token-hash endpoint below.
3. Save the template.

HTML link:

~~~html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email&amp;next={{ .RedirectTo }}">
  Confirm your Valoria email address
</a>
~~~

Plain-text URL:

~~~text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
~~~

There are two supported same-origin callback states. The legacy confirmed-account-first route uses /auth/callback?valu_taster=1. The current account-at-entry route requests confirmation only after the Taster is completed and uses /auth/callback?pending_taster_id=<completed-Taster-UUID>. The confirmation handler accepts either the single legacy flag or one syntactically valid Taster UUID; it rejects duplicate parameters, combined states, arbitrary identity/resume parameters and external redirects. The Taster UUID is only a lookup hint: the authenticated /api/link-taster endpoint must independently verify ownership before linking the saved record.

## Release verification

After saving each project template:

1. Register a controlled test account on the matching site environment.
2. Open the confirmation email and verify the link opens the Valoria confirmation page without consuming the token.
3. Press **CONFIRM MY EMAIL ADDRESS**.
4. Verify the browser receives the authenticated Supabase session and returns to the exact callback state requested by that flow.
5. For the current journey, verify the callback contains pending_taster_id, the authenticated account links only its own completed Taster, and the participant lands on the dashboard already signed in.
6. Verify the separate 58-question assessment remains a subsequent dashboard action.

Do not use a real participant account for this test. The staging project should be used first.
