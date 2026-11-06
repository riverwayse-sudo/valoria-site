# Valoria Institute Experience Design Blueprint

Status: Staging design specification
Target: staging.valoriainstitute.com
Date: 2026-11-06
Production impact: None. This document governs the isolated staging redesign only.

## Product objective

Make Valoria the professional infrastructure people return to for credible professional identity, capability development, visibility and opportunity discovery. The product must communicate value at every step; it must not feel like an assessment funnel that ends at a score.

## Experience principles

1. Value before institutional explanation: visitors understand what they can accomplish before reading the full institutional story.
2. Professional identity is the organising principle: a member's dashboard starts with their profile, capability, visibility and next opportunity.
3. VALU Index provides evidence; PRIME provides the development framework; the Bureau/Registry provides discovery and connection.
4. Every screen has one primary action and a clear next step.
5. Separate product states are explained honestly; never imply eligibility, verification or certification that is not supported by data.
6. Design references inform patterns, never copy: Mobbin/Refero for flows, Land-book/Supahero/Godly for editorial composition, Supply for sections, 60FPS/Design Spells for restrained motion.
7. Rendered browser quality is the release authority. A passing build is not proof of good UX.

## Brand system

- Deep Midnight #1A1A2E
- Gold #C9A84C
- Slate Indigo #2E2E4A
- Warm Parchment #F7F4EE
- Antique Linen #EDE8DC
- Subtle Brass #D4C9A8
- Ivory #FAFAF7
- Raleway only

Use the canonical tokens. Remove drift from legacy dark surfaces and ad hoc colour values only where a change is safe and intentional. No new PRIME colour palette, gratuitous gradients, decorative glass cards, excessive rounded pills, or ornamental motion.

## Information architecture

### Public website
- Home: institutional promise -> audience-specific paths -> VALU explanation -> Registry proof -> programmes/events -> trust and next action.
- About: institution, standards, governance, methodology and credibility.
- VALU Index: two distinct assessment products and the value of each.
- PRIME: five dimensions, 17 skills, development use.
- Bureau/Registry: searchable professionals, clear eligibility and profile status.
- Programmes: learning and development pathways with outcomes and evidence.
- Events/Insights: current institutional activity and useful professional knowledge.

### Member application
- Dashboard: professional identity, journey status, VALU Index points, PRIME insight, profile visibility, opportunities and a prioritised next action.
- Assessment: calm, focused question flow; clear progress, save/resume, validation and recovery.
- Profile: evidence-led professional record, selected capabilities, verified capabilities and listing eligibility clearly distinguished.
- Marketplace: useful discovery, search/filter clarity, honest counts, profile comparison and direct engagement.
- Learning: programme progress, next lesson/action, outcomes and related opportunities.

## Critical journey contract

The 9-question taster is a standalone assessment. It is not part of the 58-question full assessment and must never be described as the first nine of 58 or as a 49-question remainder.

Journey:
1. Visitor starts the separate 9-question taster.
2. Visitor receives a directional snapshot, not the official full VALU Index.
3. Visitor creates an account and reaches the dashboard without an unnecessary second sign-in.
4. Dashboard makes the separate 58-question full assessment the priority.
5. Member can resume the full assessment without losing progress.
6. Completion produces the official VALU Index and PRIME results in points, with merit designation subject to the actual rules.
7. Profile and marketplace access reflect verified eligibility and selected capabilities without conflating them.

All VALU and PRIME scores are points. Never show percentage signs or describe points as percentages.

## Page-level design direction

### Homepage
- Retain a decisive institutional hero, but make the promise understandable to international audiences, not only African audiences.
- State the user value in plain language: assess capability, build a credible professional record, become discoverable and access opportunities.
- Separate pathways for professionals, employers and event organisers.
- Use real platform evidence and live profiles only when their status and data are valid.
- Use one dominant CTA per audience path; do not force every visitor into the assessment.

### VALU Index page
- Explain the 9-question taster and 58-question full assessment as two distinct experiences.
- Show what the taster gives, what the full assessment adds and what changes after completion.
- Replace vague multi-step wording with a clear journey diagram and explicit time/account expectations only when verified.
- Same-tab navigation and authenticated handoff; no unexpected new tabs.

### Dashboard
- First viewport: greeting, professional identity, journey status and one recommended next action.
- Assessment state should be clear but not dominate completed members.
- VALU points and PRIME dimensions should explain what they mean, not just display numbers.
- Surface visibility, profile completeness, relevant opportunities and activity as actionable modules.
- Preserve messages, requests and existing workflows; no data-model or business-rule changes in a visual redesign.

### Marketplace
- Lead with who is discoverable and why.
- Distinguish selected capabilities from currently eligible/listed capabilities.
- Counts must reconcile with the filter result set.
- Search and filters need active-state, result-count, clear-all, no-results and loading/error states.
- Profile cards should communicate professional identity, capability, VALU status and next action without dense badge clutter.

### Assessment
- Focused single-task layout with readable question text, clear response controls, progress and save/resume feedback.
- Mobile first; no squeezed question layouts.
- Keep taster and full assessment identities distinct.
- Never fabricate score previews or imply a result is official before completion.

### Learning and development
- Show learning pathways, progress, next action, expected outcomes and how development connects to capability and opportunity.
- Do not create placeholder functionality or imply courses exist if the underlying data is unavailable.

## Interaction and motion

- Motion communicates state changes, hierarchy or orientation only.
- Respect prefers-reduced-motion.
- Buttons have hover, focus, active, disabled and loading states.
- Forms have labels, inline validation and recovery guidance.
- Lists have loading, empty, error and success states.
- No auto-advancing hero unless pause controls, reduced-motion handling and accessible state are correct; prefer user-controlled progression.
- Keep route navigation in the same tab unless an explicit external destination requires otherwise.

## Accessibility and responsive acceptance

Test 1440px, 1280px, 768px and 390px:
- no horizontal overflow or clipped content;
- readable body text and line lengths;
- visible keyboard focus;
- semantic headings, landmarks and controls;
- WCAG AA contrast target;
- touch targets suitable for mobile;
- reduced-motion support;
- clear form errors and announcements;
- no critical interaction dependent on hover.

## Data and environment safety

- Staging must not write to production Supabase or production email systems.
- Existing Cloudflare Worker preview configuration currently uses disabled placeholder Supabase credentials. Preserve that safety boundary unless a separate staging backend is explicitly provisioned and verified.
- No production DNS, Worker routes, production variables, production data, auth configuration or live member profiles may be changed as part of this redesign.
- No database migrations or destructive changes in the visual redesign branch.
- Any workflow that deploys a staging branch must have an explicit non-production Worker target and environment preflight.

## Release gates

1. Run design:check and excellence:check.
2. Run unit and contract tests.
3. Run Next.js/OpenNext build and Wrangler dry-run.
4. Run Vite build and Worker routing tests.
5. Deploy only to isolated staging Workers.
6. Verify public and app routes at all four viewport widths.
7. Verify all critical journeys, including assessment resume and auth handoff where safe test credentials exist.
8. Confirm production DNS, Workers and Supabase data were not modified.
9. Obtain explicit user acceptance before any production promotion.

## Staging review checklist

- Homepage: value proposition, audience pathways, proof, conversion.
- VALU page: independent 9 and 58 question assessments, accurate copy, same-tab handoff.
- Dashboard: status, next action, points, PRIME, opportunity discovery.
- Marketplace: counts, filters, capability semantics, profiles.
- Assessment: question readability, progress, resume, errors, mobile.
- Programmes/events/insights: discoverability and credible content.
- Global: brand consistency, responsive behaviour, accessibility, motion and performance.
