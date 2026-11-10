# Valoria administrator invitations

## Purpose

Valoria uses a restricted, invite-only administrator model. There is no public admin signup page. An existing administrator invites each new administrator from the admin area.

## Invite an administrator

1. Sign in at [Valoria Admin](https://valoriainstitute.com/admin/login) using an existing administrator account.
2. Open **Administrators** from the admin navigation, or visit [Admin access management](https://valoriainstitute.com/admin/administrators).
3. Enter the recipient's email address. Add their full name if known.
4. Select **Send admin invitation**.
5. The recipient opens the Supabase invitation email and follows its secure link to set their password.
6. After setting the password, the recipient signs in at [Valoria Admin](https://valoriainstitute.com/admin/login).
7. Confirm their email appears in **Current administrators**.

## Existing Valoria account

If the email already belongs to a Valoria Auth account, the invitation endpoint grants administrator membership to that existing account instead of creating a duplicate account. Tell the recipient to use their existing Valoria sign-in credentials. If they cannot sign in, use the normal password-recovery flow.

## Security controls

- Only an authenticated user already listed in `public.admin_users` can invite another administrator.
- The service-role key is used only on the server. It must never be exposed in browser code or committed to the repository.
- Admin authorization is checked server-side against `public.admin_users`; hiding a link in the UI is not an authorization control.
- Admin invitations use Supabase Auth. The inviter never sets or receives the recipient's password.
- Admin access is separate from professional/buyer profile status. Removing admin membership must not delete the person's underlying Auth account.
- Do not create public admin signup routes or expose an endpoint that accepts an email without first authenticating and authorizing the inviter.

## Operational configuration

The Cloudflare deployment must have these server-side environment variables configured:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional; defaults to `https://valoriainstitute.com` for invitation redirects)

The Supabase Auth email template and allowed redirect URLs must permit the configured site URL and the `/reset-password` path. Verify the invitation email and password setup flow after deploying changes to Auth email templates or redirect configuration.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Invite action returns 401 | Sign in again at the admin login page. |
| Invite action returns 403 | The signed-in account is not present in `public.admin_users`; have an existing admin verify the account. |
| Invitation email is not received | Check spam, Supabase Auth email delivery, SMTP configuration, and allowed redirect URLs. |
| Email already has a Valoria account | The account is promoted in place; ask the recipient to sign in with their existing credentials. |
| Recipient cannot set a password | Confirm the invitation link is still valid and the `/reset-password` redirect is allowed; send a fresh invite if necessary. |
| Recipient can sign in but cannot open admin | Confirm their Auth user UUID matches the `id` stored in `public.admin_users`. |

## Database verification

Run this read-only query in the Supabase SQL Editor:

```sql
select id, email, full_name, invited_by, created_at
from public.admin_users
order by created_at;
```

To verify one invitee:

```sql
select au.id, au.email, au.email_confirmed_at, admins.full_name, admins.created_at
from auth.users as au
left join public.admin_users as admins on admins.id = au.id
where lower(au.email) = lower('recipient@example.com');
```

A matching row in `public.admin_users` confirms the account has been granted administrator membership. The recipient must still authenticate successfully before accessing protected admin pages.
