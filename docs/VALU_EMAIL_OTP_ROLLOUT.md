# Valoria signup email OTP rollout

## Why this change exists

Supabase Auth logs on 24 November 2026 recorded a Google-operated request to the signup confirmation URL followed by `403: Email link is invalid or has expired` and `One-time token not found`. Email security scanners can prefetch confirmation URLs and consume single-use links before the recipient opens them.

The application now presents a six-digit code entry for all current signup surfaces:
- Professional VALU Taster registration (`/valu/register`)
- Employer and organiser registration (`/signup`)
- Legacy professional registration (`/professional-signup`)

Each surface verifies the code with `supabase.auth.verifyOtp({ email, token, type: 'email' })`. The existing authenticated callback remains responsible for the professional Taster handoff and buyer dashboard routing.

## Required Supabase dashboard configuration

This code change is not sufficient until the project's **Authentication → Email Templates → Confirm signup** template is changed. This is a project-level configuration and must be applied to the Supabase project `sbkgpisgkuhbalsxqkdr`.

Subject:

`Your Valoria confirmation code`

HTML body:

```html
<h2>Confirm your Valoria account</h2>
<p>Enter this six-digit code on the Valoria Institute page to confirm your email address and activate your account.</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 8px;">{{ .Token }}</p>
<p>This code is single-use. If you did not create a Valoria account, you can ignore this email.</p>
```

Do not include `{{ .ConfirmationURL }}` or a clickable Supabase verification URL in this template. This prevents URL-prefetch scanners from consuming the signup token. Keep email confirmation enabled.

## Verification gate

Before production release:
1. Apply the Confirm signup template above in Supabase.
2. Deploy the site code.
3. Create a fresh test-only account at `/valu/register`.
4. Confirm the email contains a six-digit code and no confirmation URL.
5. Enter the code on the same signup page.
6. Verify the account becomes confirmed in `auth.users`, a browser session is established, and the VALU Taster opens.
7. Repeat with `/signup` to verify buyer dashboard routing.
8. Confirm test accounts remain excluded from participant counts and public marketplace listings.

Do not treat a successful signup API response or email delivery alone as completion of this test.
