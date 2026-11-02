# Engineering and Campaign Rules

These rules are mandatory for event registration and email marketing work.

## 1. Source-of-truth rules

1. The owner-approved event flyer and written approval control public event facts.
2. `src/lib/professionalStandardSeries.js` is the codebase's event catalogue; it must reflect approved facts, not become a source of invented facts.
3. `dateApproved: false` means the event is not approved for public registration promotion.
4. Never copy a title, speaker, time, duration, fee, venue, URL or agenda from another session unless explicitly approved for this event.
5. If sources conflict, stop publication and resolve the conflict with the owner. Do not silently choose.
6. Keep event metadata consistent across the homepage, Events page, poster, modal, registration record and emails.

## 2. Registration rules

- Use the existing registration journey and canonical session ID.
- Server-side validation is authoritative.
- Require explicit consent for the stated purpose; record when and how it was obtained.
- Do not infer consent from a form submission or from an existing contact record.
- Prevent duplicate registrations with server-side idempotency.
- Persist before returning success.
- Do not expose participant lists or personal contact details to unauthorised users.
- Do not add unnecessary form fields or make optional fields mandatory without approval.

## 3. Email rules

- Transactional event operations and promotional marketing are separate message classes.
- Do not use a transactional basis to send unrelated marketing.
- Honour unsubscribe, blocklist, complaint, bounce and suppression states.
- Re-check eligibility at send time, not only when a segment is first created.
- Do not upload or sync contacts to a new list unless the purpose, consent and suppression behaviour are clear.
- No bulk send until the event facts, recipient segment, sender, copy, links and test delivery are approved.
- Test rendering and links before sending to the full segment.
- Do not use misleading subject lines, false scarcity, fabricated endorsements or unverified claims.

## 4. Data and privacy rules

- Collect only fields needed for registration and event operations.
- Keep credentials and privileged database access server-side.
- Do not include personal data in URLs, analytics events or application logs.
- Do not use registration as blanket consent for future campaigns.
- Define retention and deletion handling before production rollout.
- Restrict attendee exports to authorised event operators.

## 5. Design rules

- Follow `DESIGN_CONSTITUTION.md` and existing Valoria tokens.
- Raleway is the canonical typeface.
- Use the established Midnight, Gold, Slate, Parchment, Linen and Ivory palette.
- Do not add unrelated colours, generic gradients, arbitrary glass effects or decorative motion.
- Preserve legible form labels, clear hierarchy, visible focus and mobile touch targets.
- Do not introduce inline style blocks or duplicate CSS overrides as a shortcut.
- Respect reduced-motion preferences.

## 6. Code and release rules

- Inspect existing route, helper, database and provider behaviour before modifying it.
- Reuse existing services; no parallel CRM, registration database or marketing sync.
- No new paid services or dependencies without explicit approval.
- Keep site and platform responsibilities separate.
- Do not change unrelated VALU assessment, dashboard, marketplace or authentication behaviour as part of event work.
- Build pass is not end-to-end proof.
- Verify the actual deployed Cloudflare-served result when release is requested.
- Do not state that an item is fixed, sent, deployed or verified without evidence.

## 7. Communication rules

- Label unknown facts as unresolved.
- Label provisional catalogue content as provisional.
- Do not turn implementation assumptions into event copy.
- Obtain owner approval for final event content and campaign send.
