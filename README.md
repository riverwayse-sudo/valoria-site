# Valoria Institute — Public Site

The public Valoria Institute marketing and marketplace-entry site, built with Next.js 14 and deployed to Vercel.

## Staging deployment

The `staging` branch is the integration validation branch. Changes must pass the Vercel build before production promotion.

## Production architecture

- **`/`** — Institutional homepage with live professional count/profile rail, VALU snapshot entry point, marketplace pathways and webinar replay.
- **`/marketplace`** — Public African Talent Bureau marketplace and track-specific discovery.
- **`/profile/[id]`** — Public professional profile surface using the platform's public profile identifiers.
- **`/profile/setup`** — Authenticated professional profile completion flow.
- **`/dashboard`** — Authenticated account dashboard.
- **`/login`** — Authentication entry point.
- **`/about-us`**, **`/prime`**, **`/programmes`**, **`/develop`**, **`/facilitators`**, **`/atb-connect`**, **`/atb-spotlight`**, **`/contact-us`** — Institutional and pathway pages.
- **`/privacypolicy`**, **`/terms-of-use`** — Legal pages.

## Brand source of truth

`src/lib/brand.js` is governed by Valoria Institute Brand Guidelines **VI-BG-2026-001**.

Approved PRIME architecture:

- **P — Presence** — How you show up
- **R — Relationships** — How you connect
- **I — Intelligence** — How you think
- **M — Mastery** — How you deliver
- **E — Enterprise** — How you build

The site uses the approved institutional palette and Raleway typography. Merit tiers are score-based credentials and are never paid upgrades.

## VALU funnel

The public entry point is the **15-question directional VALU snapshot**. It is a teaser/acquisition experience and does **not** establish the official VALU Index; marketplace eligibility requires the current authoritative assessment.

After signup, a professional completes the authoritative full assessment and profile. The official VALU Index and marketplace eligibility are established only by the authoritative assessment lifecycle in the platform application.

## Marketplace model

One professional account has one canonical professional profile and can hold multiple capability paths: Talent, Speaker and Facilitator. Category discovery uses capability projections from that same professional identity; capabilities are not separate marketplace profiles.

Public profile surfaces use the approved public profile/ATB identifier and do not expose private email addresses.

## Motion

The site uses restrained interaction rather than decorative animation:

- Lenis smooth scrolling where enabled.
- Intersection-based editorial reveals.
- Hover and navigation micro-interactions.
- Continuous profile rail motion with reduced-motion support.

All motion should preserve hierarchy, performance and accessibility.

## Development

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Build and test

```bash
npm run build
npm test
```

## Deployment

Production is deployed through Vercel from the `main` branch. Environment variables are configured in Vercel; public browser code must never contain a Supabase service-role secret.

## Closure baseline

Phase 1 through Phase 8 are now the canonical release line on `main`. This includes marketplace integrity/evidence governance, opportunity/application lifecycle, assessment continuity, operations/security hardening, coaching/placement, controlled assessment reconciliation, canonical marketplace reconciliation, and report-generation permission hardening.

The canonical release line keeps the marketplace and public profile architecture server-first, uses the canonical VALU/scoring contracts, defers privileged Supabase clients until request time, and treats CI/build failures as blocking release issues.

## Security

The remaining Supabase security-advisor warning is the Auth **Leaked Password Protection** setting. This is a Supabase Auth project setting rather than a repository migration and must be enabled in the Supabase Auth configuration before the security checklist can be considered fully green.

Never use user-editable metadata as an authorization source, and never expose a Supabase service-role secret to browser code.

## Release recovery

The Phase 5 expansion that caused the September 28, 2026 Vercel production build failures is preserved on `backup/phase5-broken-2026-09-28` for staged repair. The repaired Phase 5–8 release line remains the canonical production source; failed historical deployments are not used as release baselines.

## Phase 8 closure

The canonical release line includes the professional lifecycle, coaching and placement surfaces, assessment reconciliation, journey continuity, marketplace normalization, public opportunity abuse protection, and database permission hardening. Auth leaked-password protection remains a Supabase Auth project setting.

## Design Constitution — VI-DS-2026-001

The public site follows one institutional visual language. This section is normative for all future UI work.

### 1. Visual identity
- **Midnight** '#1A1A2E' — primary institutional field and inverse surface.
- **Gold** '#C9A84C' — action, emphasis and merit signal.
- **Slate** '#2E2E4A' — secondary dark surface and high-legibility text.
- **Parchment** '#F7F4EE' — editorial light field.
- **Linen** '#EDE8DC' — restrained secondary light surface.
- **Ivory** '#FAFAF7' — high-contrast light content.
- Raleway is the canonical site typeface. No ad-hoc font families.

### 2. Composition laws
- One container rhythm, one spacing rhythm, one button language and one card geometry.
- Dark and light sections must transition deliberately; a background change must communicate hierarchy, not component ownership.
- A section gets one dominant visual idea. Do not stack competing card systems, gradients or decorative devices.
- Content hierarchy must survive the squint test: primary message → supporting context → action.
- Cards are structural surfaces, not default containers. Do not nest cards without a documented information-architecture reason.
- Full-pill controls are reserved for actions. Editorial links remain links only where the surrounding context clearly treats them as navigation rather than a conversion control.
- Motion is restrained, purposeful and reduced when prefers-reduced-motion is active.

### 3. Accessibility and interaction
- Normal text targets at least 4.5:1 contrast; large text at least 3:1.
- Interactive targets are at least 44px where practical.
- Every keyboard-interactive element has a visible focus state.
- Hover never carries essential information that is unavailable on touch.
- Motion should communicate state or spatial continuity, not decoration.

### 4. Source-of-truth rules
- 'src/app/home.css' is the single homepage stylesheet entrypoint. Other homepage CSS files may be composed through it but must not be imported directly by 'page.jsx'.
- No homepage '<style>' blocks and no inline 'style={{...}}' presentation rules.
- Reuse brand tokens from 'src/styles/brand-standard.css'; do not invent replacement brand colors.
- Do not introduce legacy PRIME colors, arbitrary gradients, unrelated radii or one-off button geometries.
- Component-level CSS may define internal layout, but composition-level decisions belong in the homepage authority.
- Before adding a new visual pattern, first search the existing design language for a reusable primitive.

### 5. Design protocol
Every UI change must pass these gates:
1. **Context** — identify audience, task, hierarchy and brand intent.
2. **System** — map the change to existing tokens/components before inventing anything.
3. **Implementation** — make one authoritative change; do not patch the same problem in multiple selectors/files.
4. **Responsive** — verify desktop and mobile, including content wrapping and touch targets.
5. **Accessibility** — contrast, focus, semantics and reduced motion.
6. **Browser truth** — verify rendered output, not only source/CSS presence.
7. **Production truth** — confirm the deployed asset contains the intended change before calling the work complete.

### 6. Reference stack
The design review stack is informed by:
- Impeccable: context gathering, deterministic anti-pattern checks, bounded visual QA and a durable design document.
- UI/UX Pro Max: accessibility → touch/interaction → performance → responsive layout → typography/color → motion priority.
- UI Skills / interface-design: intent-first systems and quiet, editorial surfaces.
- Emil Kowalski-inspired interaction craft: motion should be responsive, spatial and purposeful.
- shadcn/ui: compose existing primitives and semantic tokens before inventing new variants.

**Reference principle:** external products are references, not templates. Valoria must remain recognizably Valoria.

### 7. Anti-patterns
Do not ship: generic SaaS gradients, arbitrary glassmorphism, mixed font families, inconsistent card radii, tiny low-contrast body text, decorative animation, duplicate CTA treatments, unexplained shadows, or multiple competing visual authorities.
