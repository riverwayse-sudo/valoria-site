# Valoria Institute — Public Site

The public Valoria Institute marketing and marketplace-entry site, built with Next.js 14 and deployed to Vercel.

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

The public entry point is the **15-question directional VALU snapshot**. It is a teaser/acquisition experience and does **not** establish the official VALU Index.

After signup, a professional completes the remaining authoritative assessment. The official VALU Index and marketplace eligibility are established only by the authoritative assessment lifecycle in the platform application.

## Marketplace model

A professional account may hold multiple active modalities/profiles. Candidate, speaker and facilitator discovery are distinct marketplace pathways while remaining connected to the same account and authoritative VALU record.

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

## Security

Keep dependencies patched and review authentication, RLS, API routes and public profile data before shipping changes. Never use user-editable metadata as an authorization source.
