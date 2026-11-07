# Valoria Site — Agent and Engineering Charter

## Mission
Build the public Valoria Institute experience as a globally credible institution: discovery, proposition, conversion, events, public information and public Registry entry points. The experience must be useful, accessible, fast, coherent and evidence-led.

## Authority and source of truth
- Follow the root PRD, ARCHITECTURE, DESIGN, RULES, TESTING and RELEASE documents where present.
- Follow `docs/experience/VALORIA_EXPERIENCE_DESIGN_DIRECTION.md` and `docs/research/AUDIENCE_PSYCHOLOGY_AND_ETHICAL_ENGAGEMENT.md`.
- The approved brand palette is Deep Midnight #1A1A2E, Gold #C9A84C, Slate Indigo #2E2E4A, Warm Parchment #F7F4EE, Antique Linen #EDE8DC, Subtle Brass #D4C9A8 and Ivory #FAFAF7. Use Raleway as the approved typeface.
- Valoria's tone is institutional, precise, warm and internationally legible. Do not imply accreditation, certification authority, partnerships, outcomes or statistics without approved evidence.
- The platform repository is authoritative for assessment, scoring, authentication, member data and marketplace business rules. Do not duplicate those rules in the site.

## Role expectations
- Product architect: preserve boundaries between public site and platform; record consequential decisions.
- Product manager: require a user problem, measurable outcome and acceptance criteria for each feature.
- Designer/researcher: design complete journeys, validate with users, use progressive disclosure and avoid manipulative engagement.
- Frontend engineer: build responsive, semantic, maintainable components and preserve existing route behaviour.
- Content/brand reviewer: use approved terminology and substantiated claims only.
- QA/accessibility reviewer: verify keyboard, screen-reader, mobile, error, loading and empty states.
- Security/release reviewer: protect secrets, avoid production data in previews and verify the deployed staging build.

## Non-negotiable product rules
- The 9-question taster is separate from the 58-question formal assessment.
- Never describe the taster as the first part of the formal assessment.
- The official VALU Index is derived only from a completed formal assessment.
- VALU and PRIME results are expressed in points, never percentages.
- Do not fabricate profiles, testimonials, partners, opportunities, activity counts or social proof.
- Staging previews must be clearly labelled and must not expose genuine participant records.
- Do not change production data, settings, deployments or domains without explicit approval.

## Engineering rules
- Inspect existing implementation before editing; avoid duplicate components, dependencies and business logic.
- Prefer existing dependencies and established patterns. Any new dependency requires a documented need, maintenance assessment and approval.
- Keep secrets out of source, client bundles, logs and screenshots.
- Use semantic HTML, visible focus, reduced-motion support and WCAG 2.2 AA as the target.
- Do not use arbitrary inline visual styles where the design system provides tokens/components.
- Do not claim a test, audit or deployment passed unless it was actually run and its result inspected.

## Definition of done
A change is complete only when its acceptance criteria are met, relevant tests pass, responsive and accessibility checks are recorded, documentation is updated, and staging behaviour is verified. Production promotion requires explicit human approval.
