# Valoria Experience Design Direction

## Product objective
Make Valoria Institute the place ambitious professionals return to because it helps them understand their capability, make progress, find credible opportunities, and build sustainable professional value. The experience should feel like an institution with a living professional ecosystem—not a generic SaaS dashboard or a LinkedIn clone.

## Audience psychology
Primary audience: capable, ambitious professionals and high performers who understand what matters but struggle to convert effort into sustained progress. Their tensions include plateauing, overwork, burnout, fragmented development, and the gap between strategic intent and consistent execution.

Design for:
- Recognition: articulate the tension without shaming the visitor.
- Agency: make the next step clear and voluntary.
- Competence: show progress, meaningful feedback, and evidence of capability.
- Belonging: demonstrate a credible professional community and pathways to contribution.
- Relevance: connect PRIME capabilities to real professional situations and opportunities.
- Sustainable momentum: encourage deliberate progress, not compulsive checking.

## Ethical engagement principles
Use autonomy, competence, and relatedness as design foundations. Use clear prompts, reduce friction, provide meaningful feedback, and make progress visible. Do not use fake scarcity, fabricated social proof, infinite scroll, deceptive notifications, forced disclosure, shame-based copy, or streak mechanics that punish absence.

## Experience architecture
1. Marketing site: clear institutional proposition, audience recognition, proof, pathways, and a focused primary CTA.
2. 9-question taster: a distinct directional experience; no conflation with the formal assessment and no claim that it is the VALU Index.
3. Account bridge: explain what is saved, why an account is needed, and what happens next.
4. 58-question formal assessment: a separate assessment with its own progress, save/resume, accessibility, and completion states.
5. VALU Index: report points (never percentages), PRIME dimensions, interpretation, and actionable development recommendations.
6. Member dashboard: next best action, assessment status, professional profile, opportunities, development, and saved activity.
7. Professional Registry: discoverability based on capabilities and credible profile evidence.
8. Learning/development: guided pathways tied to identified capability needs and professional goals.

## Critical product invariants
- The 9-question taster is separate from the 58-question formal assessment.
- Taster answers do not silently become the formal assessment answers.
- The official VALU Index is based on the completed 58-question assessment only.
- Display results in points, never percentages.
- Preserve authentication continuity and assessment save/resume.
- Staging must use isolated test identities and test data; do not expose or mutate genuine member records.
- No production merge, deployment, database writes, or production setting changes without explicit approval.

## Visual direction
Use Valoria's established palette: Deep Midnight #1A1A2E, Gold #C9A84C, Slate Indigo #2E2E4A, Warm Parchment #F7F4EE, Antique Linen #EDE8DC, Subtle Brass #D4C9A8, Ivory #FAFAF7. Typography: Raleway. The visual character is institutional, editorial, precise, warm, and globally credible.

## Assessment interaction requirements
- One question per screen with clear answer affordances.
- Visible position and progress without overstating completion.
- Keyboard-operable controls and strong focus states.
- Save state, retry state, and resume state are explicit.
- Back/forward navigation preserves the user's answer.
- Mobile layouts are designed intentionally.
- Completion screen explains the next step and does not imply a score before formal scoring.

## Dashboard interaction requirements
- Show current status and one clearly prioritised next action.
- Distinguish taster completion from formal assessment completion.
- Show VALU Index only after formal assessment completion.
- Provide meaningful Registry and development previews without fabricating live opportunity data.
- Empty states explain how to create value; loading and error states provide recovery.

## Validation
Test the full journey at desktop and mobile widths with a staging-only identity. Verify all route transitions, session continuity, separate assessment data models, point-based reporting, keyboard use, empty/loading/error states, and no production network or data access from preview mode.


## Staging deployment and browser-verification boundary

The paired Cloudflare staging Workers are intentionally isolated from production:

- Site: `https://valoria-staging-site.riverwayse.workers.dev`
- Assessment: `https://valoria-staging-assessment.riverwayse.workers.dev`

The site preview must resolve assessment pages and API paths to the assessment staging Worker, never to the production assessment host. Build-time preview origins are explicitly configured to these two staging Worker URLs.

The assessment Worker has a staging-only runtime guard. Until an isolated staging database and staging-only credentials are configured, assessment persistence endpoints return HTTP 503. The taster and full 58-question screens may be exercised in local-only simulation mode; that mode must not create accounts, write answers, generate a VALU Index, or access participant data.

A browser-verification pass must confirm the noindex staging banner, homepage and dashboard preview, assessment route and asset loading, the nine-question taster, the account bridge, the independent 58-question flow, responsive layouts, keyboard operation, and absence of production analytics or production data access.
