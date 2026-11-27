# Supabase confirmation-email template

This template is for the current account-at-entry Taster journey. The confirmation email is requested **after** the participant completes the Taster. Confirmation must establish the authenticated session and return the participant to the dashboard with the completed Taster linked.

## Staging configuration — apply before any production change

1. Open the **staging** Supabase project.
2. Go to **Authentication → URL Configuration**.
3. Set the Site URL to `https://staging.valoriainstitute.com`.
4. Ensure the allowed redirect URL includes `https://staging.valoriainstitute.com/auth/callback`.
5. Go to **Authentication → Email Templates → Confirm signup**.
6. Replace the current template with the HTML below and save.
7. Do not hard-code the production domain into the staging template. The application supplies a same-origin `emailRedirectTo` callback containing the completed Taster reference.

The current server route sends `emailRedirectTo` as `/auth/callback?pending_taster_id=<completed-Taster-UUID>` on the request's own origin. The template uses `{{ .SiteURL }}` for the confirmation page and `{{ .RedirectTo }}` for that validated callback. A redirect to another origin must never be accepted.

## HTML template

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm your Valoria email</title>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#1A1A2E;font-family:'Raleway',sans-serif;color:#1A1A2E;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#1A1A2E;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background:#F7F4EE;border-radius:12px;overflow:hidden;">
        <tr>
          <td align="center" style="background:#1A1A2E;padding:32px 24px;">
            <div style="font-family:'Raleway',sans-serif;font-size:12px;font-weight:800;letter-spacing:3px;color:#C9A84C;">VALORIA INSTITUTE</div>
            <div style="font-family:'Raleway',sans-serif;font-size:13px;font-weight:500;letter-spacing:.08em;color:#F7F4EE;margin-top:8px;">WORTH. BUILT.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 32px;background:#F7F4EE;font-family:'Raleway',sans-serif;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:800;letter-spacing:.16em;color:#8A6B24;">VALU INDEX TASTER COMPLETE</p>
            <h1 style="margin:0 0 18px;font-family:'Raleway',sans-serif;font-size:28px;line-height:1.25;font-weight:700;color:#1A1A2E;">Your next step is confirmation.</h1>
            <p style="margin:0 0 16px;font-family:'Raleway',sans-serif;font-size:15px;line-height:1.75;color:#2E2E4A;">Hello {{ .Data.full_name }},</p>
            <p style="margin:0 0 24px;font-family:'Raleway',sans-serif;font-size:15px;line-height:1.75;color:#2E2E4A;">Your VALU Index Taster is complete and your responses are saved. Confirm your email address to activate your account and open your Valoria dashboard.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr><td align="center" style="padding:8px 0 26px;">
                <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email&amp;next={{ .RedirectTo }}" style="display:inline-block;padding:15px 28px;background:#C9A84C;color:#1A1A2E;text-decoration:none;font-family:'Raleway',sans-serif;font-size:12px;line-height:1.4;font-weight:800;letter-spacing:.1em;border-radius:999px;">CONFIRM EMAIL &amp; OPEN DASHBOARD</a>
              </td></tr>
            </table>
            <div style="padding:18px 20px;background:#EDE8DC;border-radius:8px;">
              <p style="margin:0 0 10px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:800;letter-spacing:.12em;color:#1A1A2E;">WHAT HAPPENS NEXT</p>
              <p style="margin:0 0 8px;font-family:'Raleway',sans-serif;font-size:13px;line-height:1.65;color:#2E2E4A;"><strong>01 — Confirm your email.</strong> Activate your Valoria account securely.</p>
              <p style="margin:0 0 8px;font-family:'Raleway',sans-serif;font-size:13px;line-height:1.65;color:#2E2E4A;"><strong>02 — Open your dashboard.</strong> Your completed Taster will be connected to this account.</p>
              <p style="margin:0;font-family:'Raleway',sans-serif;font-size:13px;line-height:1.65;color:#2E2E4A;"><strong>03 — Continue when ready.</strong> The full VALU Index assessment is a separate next step.</p>
            </div>
            <p style="margin:24px 0 0;font-family:'Raleway',sans-serif;font-size:12px;line-height:1.7;color:#5B5B68;">If the button does not work, copy this address into your browser:</p>
            <p style="margin:8px 0 0;word-break:break-all;font-family:'Raleway',sans-serif;font-size:11px;line-height:1.6;color:#5B5B68;">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email&amp;next={{ .RedirectTo }}</p>
            <p style="margin:24px 0 0;font-family:'Raleway',sans-serif;font-size:12px;line-height:1.7;color:#5B5B68;">If you did not create this Valoria account, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:22px 24px;background:#1A1A2E;color:#D4C9A8;font-family:'Raleway',sans-serif;font-size:10px;line-height:1.7;">
            VALORIA INSTITUTE · WORTH. BUILT.<br>
            <a href="mailto:info@valoriainstitute.com" style="color:#C9A84C;text-decoration:none;font-family:'Raleway',sans-serif;">info@valoriainstitute.com</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
```

## Plain-text fallback

```text
VALORIA INSTITUTE
WORTH. BUILT.

Your VALU Index Taster is complete and your responses are saved.

Confirm your email address to activate your account and open your Valoria dashboard:

{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}

After confirmation:
1. Your completed Taster is connected to this account.
2. You land on your authenticated dashboard.
3. The full VALU Index assessment remains a separate next step.

If you did not create this Valoria account, ignore this email.
```

## Release verification

Use a synthetic staging account and a controlled mailbox:

1. Register at `https://staging.valoriainstitute.com/valu/register`.
2. Complete the Taster.
3. Confirm that the email is sent only after Taster completion.
4. Inspect the link without exposing or sharing its token. Its confirmation endpoint and callback must remain on `staging.valoriainstitute.com`; the callback must preserve the exact `pending_taster_id`.
5. Open the link. The GET must render the scanner-safe confirmation form without consuming the token.
6. Press **CONFIRM EMAIL & OPEN DASHBOARD**.
7. Verify a confirmed Supabase session, exact Taster ownership/linkage, and dashboard landing without a second sign-in.
8. Start the separate full assessment from the dashboard and verify save/resume.

Do not use a real participant account or copy production participant data into staging. Do not change the production Supabase template until staging passes and production promotion is explicitly authorised.

## Important implementation note

The current account-at-entry route creates the unconfirmed account without sending the confirmation email. The email is requested only after the completed Taster has been ownership-checked by `/api/valu-taster/complete`, which explicitly supplies the callback from the current request origin. Legacy resend routes must not be used to test the new journey because they may omit the explicit callback.
