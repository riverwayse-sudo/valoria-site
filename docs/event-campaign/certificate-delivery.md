# Event certificate delivery

## Scope

The 14 November 2026 attendee certificates are event-participation records. They are deliberately separate from `professional_certificates`, which represents verified professional attendance linked to a Valoria professional profile.

## Storage and access

- PDFs are stored in the existing private `cvs` bucket. The bucket already permits PDF files and has a 10 MB limit; the upload endpoint applies a stricter 5 MB limit.
- The public site never exposes the Storage object path or a permanent Storage URL.
- Each attendee receives a 256-bit random URL token. Only its SHA-256 digest is stored in `event_certificate_deliveries`.
- The attendee page validates the token server-side and exposes no email address.
- The download endpoint creates a 60-second signed URL only after token validation.
- An administrator can revoke access by setting `revoked_at`.
- Public and authenticated browser roles have no table privileges. Server routes use the service role only after admin authentication or token validation.

## Upload

After the migration is applied, an authenticated Valoria administrator can upload each PDF with:

```http
POST /api/admin/event-certificate-deliveries
Authorization: Bearer <admin access token>
Content-Type: multipart/form-data

recipient_name=<certificate holder name>
recipient_email=<certificate holder email>
file=<individual PDF>
```

A successful response returns the private attendee page URL. Send that URL only to the matching attendee. Do not put recipient names or email addresses in the URL.

The route validates PDF MIME type, PDF file signature and a 5 MB size limit. It uploads the PDF before creating the delivery record and removes the uploaded object if the database insert fails.

## Campaign

Use one email per attendee. The email should link to that attendee's returned download page and include the event replay at https://youtu.be/Ae9N59SlR_8. Do not place multiple attendee links in one message.

The download page keeps certificate access immediate and account-free. Its primary next action is Valoria professional development through the Events page; marketplace discovery is secondary.

## Verification checklist

- Apply the migration to the production Valoria Supabase project.
- Upload a single test certificate and verify that the returned token opens only its matching record.
- Verify a malformed, unknown or revoked token returns the generic unavailable state.
- Verify the download endpoint returns a short-lived signed URL and the PDF is downloaded.
- Verify an unauthenticated upload is rejected and an authenticated non-admin is forbidden.
- Upload the remaining attendee PDFs and reconcile the 19 records against the approved attendance register before sending emails.
