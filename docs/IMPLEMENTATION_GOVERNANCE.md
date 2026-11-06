# Site Implementation Governance

## Scope
This repository owns public-facing Valoria experiences: homepage, institutional proposition, programme/event discovery, conversion, public VALU education, public Registry entry points and site-level navigation.

## Role-to-tool allocation
| Role | Primary tools | Repository responsibility |
|---|---|---|
| Product architect | GitHub, Mermaid, Markdown | Site/platform boundary and decision records |
| Product manager | GitHub Issues/Projects, Markdown | Requirements, priorities, acceptance criteria |
| UX researcher | Interview notes, FigJam, spreadsheets | Evidence about audience needs and usability |
| Product designer | Figma/FigJam, browser DevTools | Journeys, responsive UI, design system |
| Frontend engineer | Node, Next.js, React, browser DevTools | Accessible and maintainable site implementation |
| Content/brand strategist | Approved brand manual, claims register, Markdown | Accurate proposition and institutional language |
| QA engineer | Jest, Playwright, axe-core | Functional, visual, responsive and accessibility tests |
| Security reviewer | Gitleaks, Semgrep, OWASP guidance | Secret hygiene and application security |
| Performance engineer | Lighthouse, Chrome DevTools | Core Web Vitals and rendering performance |
| Release engineer | GitHub Actions, Cloudflare/Vercel as configured | Staging builds, environment verification and rollback |

## Required controls
- Keep the existing design and excellence checks in the build path.
- Add automated browser coverage for navigation, conversion and public-facing critical journeys.
- Use WCAG 2.2 AA as the accessibility target; combine automated scans with manual keyboard and screen-reader checks.
- Measure Core Web Vitals at the 75th percentile: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- No fabricated testimonials, user counts, employer logos, opportunities, scarcity or outcomes.
- Track meaningful actions and user-reported clarity/trust; do not optimise session duration alone.

## Release evidence
Every staging release should record commit SHA, workflow result, tested routes/viewports, accessibility findings, performance findings, known defects and rollback route. Staging success is not production approval.
