# Design Specification — Event Registration & Email Communications

**Governing references:** repository `DESIGN_CONSTITUTION.md`, `docs/DESIGN_REFERENCE_PLAYBOOK.md`, and canonical brand tokens.

## 1. Design objective

Make event discovery and registration calm, credible and easy to complete. The design should communicate the event's approved information, establish trust and make the next action obvious without overwhelming the visitor.

## 2. Brand system

- Deep Midnight: `#1A1A2E`
- Gold: `#C9A84C`
- Slate Indigo: `#2E2E4A`
- Warm Parchment: `#F7F4EE`
- Antique Linen: `#EDE8DC`
- Subtle Brass: `#D4C9A8`
- Ivory: `#FAFAF7`
- Typeface: Raleway.

Do not introduce a new event-only colour or typography system.

## 3. Event card and poster

- The event card should present one clear hierarchy: series/context → approved event title → concise approved description → date/time/format → registration action.
- Use the existing `EventPoster` component and event catalogue as the implementation baseline.
- Do not fabricate a speaker portrait, biography, credentials, outcomes or agenda.
- If an approved speaker portrait is supplied, use the original image without altering identity or inventing credentials; store it in the repository's approved public asset location and reference it through the component.
- Do not publish provisional event data while approval is false.

## 4. Registration modal

The current modal is a two-column editorial panel with event information and a registration form. Preserve the established structure unless browser testing identifies a usability issue.

Required states:
- closed;
- open and ready;
- submitting;
- success;
- validation/error;
- provider/database failure.

Form design:
- clear labels for every field;
- required and optional status stated explicitly;
- consent purpose written in plain language and linked to the applicable privacy information;
- errors shown beside the relevant field and announced accessibly;
- success message confirms the registration was received, not that an email was delivered unless delivery is independently confirmed;
- keyboard focus enters the modal, remains contained, and returns to the trigger after close;
- Escape closes the modal where safe;
- mobile layout stacks without clipping or horizontal scrolling.

## 5. Email design

- Use Valoria's institutional visual language, restrained editorial layout and Raleway typography.
- Ensure the email remains understandable with images disabled.
- Keep the event's approved title and essential logistics in live text, not embedded only in a graphic.
- Provide a clear primary CTA and descriptive link text.
- Include the required sender identity and a valid unsubscribe mechanism for promotional messages.
- Keep transactional and marketing templates visibly and operationally distinct.
- Optimise for narrow email clients; avoid relying on complex CSS, background images or unsupported interactions.

### Implemented email system

The shared renderer is `src/lib/valoriaEmailDesign.js`. It provides:

1. **Registration confirmation** — integrated into `src/lib/eventRegistrationBrevo.js`; confirms the registration and displays approved date, start time, guest speaker and host. The confirmation does not claim that a meeting link or venue has been confirmed.
2. **Operational reminder** — reusable transactional layout; displays a join action only when a valid HTTPS meeting URL is supplied. It does not invent an event platform or access details.
3. **Promotional campaign** — reusable marketing layout with a mandatory unsubscribe URL. Campaign copy, audience, consent and schedule still require owner approval before sending.

Email layout is table-based with inline styles, a plain-text alternative, a hidden preheader, a 600px desktop canvas and narrow-screen-friendly padding. It does not depend on remote images or web-font loading. Raleway is declared first with email-safe fallbacks.

Transactional email footer: Valoria Institute, website and support contact. Promotional email footer: website and unsubscribe link. These are intentionally different.

## 6. Portrait asset governance

The supplied Temitayo portrait is the host portrait for the 14 November event. Before publication:
- retain the confirmed host label (Temitayo Adetokunbo); do not present this image as the guest speaker;
- preserve the supplied image and use it only for the approved host presentation;
- optimised asset path: `public/images/temitayo-adetokunbo-host.webp` (360 × 499 WebP);
- preserve an original source copy where repository policy allows;
- use meaningful alt text only when the portrait conveys information; otherwise use empty alt text when decorative;
- do not crop away identifying/contextual details without design approval;
- do not infer that the person is the speaker, host or facilitator solely because the image was supplied.

## 7. Responsive and accessibility gates

Verify at 1440px, 1280px, 768px and 390px:
- no horizontal overflow or clipped copy;
- readable line lengths and event metadata;
- modal controls remain visible and operable;
- form labels and errors are associated;
- contrast meets WCAG AA targets;
- keyboard focus is visible;
- touch targets are practical on mobile;
- reduced motion is respected.

For email verification, test at a narrow mobile width and in major HTML email clients. Confirm the plain-text alternative, link destinations, sender/reply-to identity, and image-disabled presentation. A code build alone does not establish email-client rendering.

## 8. Design acceptance

A design is accepted only after source review, automated design checks and real-browser inspection. A successful build alone is insufficient.
