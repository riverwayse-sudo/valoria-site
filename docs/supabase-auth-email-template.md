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

The registration flow sets emailRedirectTo to the canonical /auth/callback?valu_taster=1 URL. Supabase supplies that value as {{ .RedirectTo }}; the confirmation handler accepts only same-origin /auth/callback or /dashboard destinations and rejects external redirects or identity/resume parameters.

## Release verification

After saving each project template:

1. Register a controlled test account on the matching site environment.
2. Open the confirmation email and verify the link opens the Valoria confirmation page without consuming the token.
3. Press **CONFIRM MY EMAIL ADDRESS**.
4. Verify the browser receives the authenticated Supabase session and returns to /auth/callback?valu_taster=1.
5. Verify the account is already signed in and the Taster handoff begins without asking the participant to sign in again.

Do not use a real participant account for this test. The staging project should be used first.
