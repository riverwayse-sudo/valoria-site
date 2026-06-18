# Valoria Institute — Marketing Site (Next.js)

Converted from the Webflow homepage export to Next.js 14 (App Router), ready to deploy on Vercel directly from GitHub.

## What's in this build

- **`/`** — Homepage, converted 1:1 from the Webflow export, with brand fixes applied (see below).
- **`src/components/Nav.jsx`** and **`Footer.jsx`** — Shared, locked nav/footer used across all pages. Single source of truth — edit here, not per-page.
- **`src/lib/brand.js`** — Single source of truth for brand constants (email, tagline, colors, entry points, PRIME clusters). Update here when copy or routing changes.
- **`src/styles/globals.css`** — Brand tokens (colors, font, spacing) as CSS variables.

## Fixes applied during conversion (from the live-site audit)

| Issue | Status |
|---|---|
| "Worth, Built." comma error | ✅ Fixed → "Worth. Built." |
| Hero CTA "Explore the Platform" routing to `/about-us` | ✅ Fixed → routes to assessment platform |
| `/wailtlist` typo | ✅ Fixed → `/waitlist` |
| Inconsistent nav across pages | ✅ Fixed → single shared `Nav` component |
| Inconsistent footer (3 variants found) | ✅ Fixed → single shared `Footer` component |
| Logo pulled from Webflow CDN | ✅ Fixed → served from `valoriainstitute.com/logo.png` |
| Privacy/Terms linking to `#` | ✅ Fixed → linked to real routes (pages still need to be built — see below) |

## ⚠️ Outstanding — not yet built

This conversion only covers the **homepage**. The following pages are linked from nav/footer but **do not exist yet** in this codebase and will currently 404 on Vercel:

- `/about-us`, `/prime`, `/atb-connect`, `/spotlight`, `/facilitators`
- `/programmes`, `/develop`, `/contact-us`
- `/register`, `/login`, `/waitlist`
- `/privacypolicy`, `/terms-of-use`

Recommend rebuilding these from the live site content next, using this same Nav/Footer/brand.js setup so they stay consistent — that was the core problem with the current live site.

## ⚠️ PRIME Framework — incomplete

`src/lib/brand.js` has the PRIME cluster list with **P (Presence), R (Relationships)** confirmed and **I, M, E placeholders** — only "Influence" and "Enterprise" are guesses carried over from an earlier (incorrect) framework name. **Confirm the full five PRIME cluster names before launch** — they appear on the homepage radar chart and checklist copy.

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repo. Framework preset auto-detects as Next.js.
3. No environment variables are required for this homepage-only build.
4. Deploy. Vercel will build with `next build` and serve automatically.

To point `valoriainstitute.com` at this instead of Webflow: add the domain in Vercel's project settings and update your DNS (A/CNAME records) per Vercel's instructions — this will be the cutover step once more pages are built.

## Security note

Pinned to `next@14.2.35`, which contains the patches for the December 2025 critical RSC vulnerabilities (CVE-2025-66478, CVE-2025-55183/55184/67779). Run `npm audit` periodically and keep Next.js patched.
