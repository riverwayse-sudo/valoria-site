# Global Institutional Website Redesign — Acceptance Specification

**Product:** Valoria Institute  
**Positioning:** Worth. Built.  
**Audience:** The 1% of the 1%: accomplished professionals, senior executives, board and institutional leaders, exceptional specialists, and the organizations entrusted with consequential decisions.  
**Status:** Implementation specification for the isolated redesign track. This is not evidence of completed testing, accreditation or global service availability.

## 1. Institutional proposition

Valoria Institute is a professional capability institution for people and organizations operating where judgment, expertise and execution carry significant consequence. It assesses, develops and supports the recognition and discovery of professional capability through:

- **PRIME:** Presence, Relationships, Intelligence, Mastery and Enterprise.
- **VALU Index:** an assessment-led, points-based view of capability.
- **Learning and development:** structured pathways connected to PRIME.
- **Professional Registry / Marketplace:** discovery of professionals across Talent, Speaker and Facilitator capabilities.
- **Institutional engagement:** pathways for employers, organizations and partners.

The website must explain how these parts relate without presenting every capability as equally mature or available in every market. Valoria is not to be presented as a generic job board, mass-market course catalogue, recruitment agency or personality-quiz product.

## 2. Audience standard: the 1% of the 1%

This audience designation is a quality and relevance standard, not a claim that Valoria has exclusive membership, a verified top-percentile cohort or a restricted-access institution.

### Primary audiences

- **Senior decision-makers:** C-suite executives, board members, founders, partners and senior public/private institutional leaders.
- **Exceptional professionals:** established specialists, senior operators, respected practitioners and high-performing professionals whose work carries material responsibility.
- **Talent and institutional buyers:** employers, boards, executive search and talent leaders, program owners and institutions making consequential people decisions.
- **Expert contributors:** accomplished speakers, facilitators and subject-matter leaders engaged for high-stakes events, programs and institutional work.

### What this audience expects

1. **Intellectual substance:** explain the framework, assessment purpose, limitations and practical implications. Avoid motivational filler and unsupported superlatives.
2. **Credibility before persuasion:** make governance, methodology, credential boundaries, operating status and evidence gaps easy to inspect.
3. **Discretion by default:** collect only necessary information, explain visibility and consent, protect assessment responses and avoid exposing private professional data.
4. **Executive utility:** make the next action obvious and relevant to the visitor's role; prioritize decision-useful information over feature volume.
5. **Editorial restraint:** precise language, strong hierarchy, confident whitespace and restrained visual signaling. Do not simulate prestige with gold overload, luxury clichés, fake scarcity or status badges.
6. **Operational excellence:** fast, accessible, responsive and dependable experiences. High standards must never become an excuse for friction, obscurity or inaccessible design.

### Positioning guardrails

- Speak to accomplished professionals without implying that only wealthy, famous or already-networked people belong.
- Do not claim exclusivity, selectivity, elite membership, top-percentile status or a distinguished cohort unless a real, governed program and evidence support the claim.
- Do not confuse a premium audience with luxury consumer marketing.
- Do not imply that VALU alone establishes professional worth, predicts performance or replaces human judgment and independent verification.
- Do not use fabricated testimonials, client logos, institutional affiliations, rankings, placement outcomes or market statistics.

## 3. Audience and language standard

- Write in clear American English for a premium US and international audience.
- Use US spelling and conventions in new public-facing copy (organization, program, recognize, resume).
- Lead with institutional purpose and professional capability, not a Nigeria-only marketplace identity.
- Be explicit about current operating footprint, live services, listing availability and institutional relationships where those facts matter.
- An international outlook is not a claim that every service is globally available.

## 4. Claims and trust governance

Never publish unsupported claims of global accreditation, regulatory recognition, universal acceptance, partnerships, credential verification or guaranteed professional competence.

The VALU Index is an assessment result, not by itself a professional certification or independent verification of qualifications, work history or competence. Employer-facing journeys must say that assessment information is one input and does not replace independent credential checks or the employer's own hiring process.

Keep these distinctions visible and consistent:

- Assessment completion versus an official VALU Index.
- Points versus percentages.
- Basic profile visibility versus full Registry access.
- Eligibility thresholds versus proof of competence.
- Assessment-derived insight versus independently verified credentials.
- Institutional certification pathways versus the VALU assessment result.

PRIME contains five dimensions and 17 skills. Preserve the established taster → account → separate full assessment → official VALU Index journey. Do not expose internal question counts, imply that taster answers are deducted from the full assessment, or lose saved progress.

## 5. Information architecture and audience journeys

Use the existing product routes and navigation as the source of truth. Do not expose unfinished products as if they are live.

### Professionals

Discover the Institute → understand PRIME and VALU → take the taster → create/confirm an account → complete or resume the separate full assessment → receive the official points-based result → manage profile and capabilities → understand Registry eligibility and visibility.

### Employers and talent decision-makers

Understand the institutional method → explore the Registry and capability categories → understand what assessment information does and does not establish → review available profiles → use the permitted engagement route.

### Institutions and partners

Understand institutional purpose → review methodology and standards → distinguish operational services from future pathways → make a partnership enquiry.

Navigation should prioritize clear audience intent. Keep About, framework, assessment, development, Registry and organization pathways discoverable, but do not add dead links or present unavailable services as operational.

### Route-specific experience requirements

- **Valoria Develop:** address accomplished professionals, leadership teams and institutions. Begin with the capability or organizational challenge, then explain PRIME-mapped development. Do not present a generic training catalogue. Clearly identify pathways that are still in development; participation must not be described as a completed professional certification.
- **ATB Connect:** address hiring leaders and institutions making consequential talent decisions. Present profile, experience and assessment information as structured context. VALU is not a hiring recommendation, credential check or substitute for references, due diligence and independent professional judgment. Buyer access and available roster scope must be stated accurately.
- **ATB Spotlight:** address event and institutional leaders commissioning speakers or facilitators for executive briefings, leadership forums and other consequential gatherings. Suitability and availability are confirmed against each brief. Do not describe a professional as certified while the relevant certification pathway remains in development.
- **Marketplace / Registry:** show only approved public profile information consistent with visibility choices and listing requirements. Make capability selection distinct from listing eligibility. Keep Talent, Speaker and Facilitator capability lanes visible, while avoiding any implication that a selected capability is automatically approved for listing. Show VALU context only where the completed assessment and public projection permit; never expose private assessment answers or contact details in public previews. State that VALU is not independent credential verification.

These pages should feel composed for senior, discerning audiences through precision, relevance and restraint. Do not use artificial scarcity, unsubstantiated exclusivity or luxury-marketing language to manufacture status.

## 6. Visual and interaction system

Use the approved Valoria tokens:

| Token | Value |
|---|---|
| Deep Midnight | `#1A1A2E` |
| Gold | `#C9A84C` |
| Slate Indigo | `#2E2E4A` |
| Warm Parchment | `#F7F4EE` |
| Antique Linen | `#EDE8DC` |
| Subtle Brass | `#D4C9A8` |
| Ivory | `#FAFAF7` |

Raleway is the only approved typeface. Gold is an accent, not the default for every label or action. Use restrained editorial composition, clear hierarchy, generous spacing and deliberate contrast. Do not copy another institution's visual identity.

For the 1% of the 1%, visual distinction must come from typographic discipline, editorial confidence, meaningful content and interaction quality—not decorative luxury cues, oversized claims, generic SaaS cards or gamified score treatments.

Mobile is a first-class design target, not a compressed desktop layout. Motion must be purposeful and respect `prefers-reduced-motion`.

## 7. Required page states

Every core route must be designed and tested for:

- Initial loading and fully loaded.
- Empty account and empty section.
- No search results.
- Partial data.
- Error and retry.
- Offline or unavailable service.
- Permission denied.
- Success and confirmation.
- Desktop, tablet and mobile.

Empty states must explain what is absent and provide a useful next action. A failed data request must never be disguised as an empty account. Partial failures should preserve available content and permit independent retry.

## 8. Accessibility, performance and engineering

- Target WCAG 2.2 AA, subject to formal verification.
- Keyboard-operable navigation, dialogs, menus and forms; visible focus states.
- Text contrast of at least 4.5:1 for normal text and 3:1 for large text.
- Adequate touch targets (44px minimum where practical).
- Semantic headings, form labels, accessible errors and screen-reader status announcements.
- Reduced-motion support and no essential information conveyed by color alone.
- Responsive image delivery, optimized fonts, minimized client JavaScript and layout-shift prevention.
- Server-side authorization and protected API boundaries.
- Keep site presentation separate from assessment/platform logic.
- Retain the Cloudflare-first deployment architecture; introduce no unnecessary paid dependencies.

## 9. Release gates

A redesign change is not complete because the source looks correct. Each release candidate must pass:

1. Product and content review against this specification.
2. Design-system and responsive checks.
3. Unit and journey-contract tests.
4. Production build.
5. Keyboard and accessibility checks.
6. Real-browser visual review at desktop, tablet and mobile sizes.
7. Loading, empty, error, partial-failure and success-state review.
8. Assessment and Registry regression checks.
9. Cloudflare staging smoke tests and rendered-page verification.
10. Explicit staging approval before any production release.

## 10. Delivery order

1. Institutional positioning, American-English metadata and homepage journeys.
2. Shared navigation, typography, spacing, color, controls and responsive foundations.
3. PRIME and VALU methodology pages.
4. Taster, authentication and full-assessment handoff.
5. Dashboard and professional profile.
6. Registry discovery, cards and eligibility communication (Marketplace directory, Talent, Speaker and Facilitator pathways).
7. Learning/development and employer/institution journeys (Valoria Develop, ATB Connect and ATB Spotlight).
8. Legal, privacy, consent and governance content.
9. Full accessibility, performance, security and regression verification.

**Completion rule:** The redesign is accepted only when the institutional proposition is clear, the 1% of the 1% audience can recognize its relevance without exaggerated status claims, every live journey is coherent, claims are substantiated, all important interface states are covered, and the implemented staging experience passes functional, responsive, accessibility and regression review.
