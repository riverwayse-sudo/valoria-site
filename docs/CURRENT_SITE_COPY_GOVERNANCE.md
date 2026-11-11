# Current-site copy governance

**Status:** Mandatory implementation control  
**Applies to:** Existing Valoria Institute website and platform copy  
**Authority:** *Valoria Institute Website review.pdf*, prepared by Riverways, updated 4 November 2026 (the Current Website Audit).  
**Scope boundary:** This policy governs the current website only. The separate *Global Website Redesign: Strategic, UX, Product and Experience Audit* is not authority for changing current-site copy.

## Non-negotiable rule

Do not create, rewrite, remove, reorder or materially alter public-facing copy unless the change is traceable to a specific requirement in the Current Website Audit or to a separately approved source-of-truth document. A developer's interpretation, generic conversion advice, redesign direction or preference is not approval.

If the audit does not clearly authorise a wording decision, preserve the existing approved copy and raise the question for approval. Do not fill gaps with invented language.

## Required workflow for every copy change

1. Identify the exact page, component, string and audience.
2. Cite the Current Website Audit section and PDF page that requires the change.
3. Record the current wording and proposed wording in the PR description or a copy-change register.
4. Explain why the proposed wording satisfies the cited requirement without expanding the claim.
5. Check the wording against the brand manual, approved institutional terminology, product reality and legal/evidence constraints.
6. Search for duplicate or equivalent wording across desktop/mobile views, navigation, forms, emails, assessment, dashboard and marketplace surfaces.
7. Implement only the approved change. Keep unrelated copy untouched.
8. Run relevant tests and inspect the rendered page. Confirm the copy is consistent at responsive breakpoints.
9. Mark the item complete only when the source, implementation and rendered result are all verified.

A PR that changes copy without the source reference and before/after record is not ready for review.

## Binding content rules from the Current Website Audit

### Positioning and audiences
- The first market is Africa, with Nigeria as the current jurisdiction. Do not imply that the platform already operates in countries or markets it has not entered.
- Explain the value to both professionals and buyers.
- Keep the institution, digital platform and opportunity ecosystem distinct but connected.
- Explain the practical user benefit in clear language; avoid unnecessary institutional jargon.
- Do not position Valoria as a general-purpose LinkedIn replacement.

### Assessment and VALU
- The 9-question taster/snapshot is a distinct first-stage experience.
- The 58-question full assessment is a separate assessment. The taster questions are not included in, or subtracted from, the full assessment.
- Never imply the taster establishes the official VALU Index.
- VALU results are expressed in points. Do not express scores as percentages or introduce percentage-based score displays.
- Preserve the established assessment/scoring logic; copy work must not redefine it.
- Do not expose internal mechanics or question-count progress labels to users unless explicitly approved by the product owner.

### Registry, marketplace and opportunities
- Distinguish assessment completion, eligibility for listing and actual public discoverability.
- Explain professional value as well as buyer value.
- Do not promise active opportunity categories unless real supply and a working application/enquiry route exist.
- Do not imply that an assessment guarantees competence, employment, professional success or suitability.
- Do not present unexplained match scores as guarantees.
- Do not invent listing counts, buyer participation, profile verification or opportunity availability.

### Evidence and institutional claims
- Do not claim the VALU Index is independently assessed/validated until independent validation is complete and approved for public statement.
- Do not claim every facilitator is PRIME-certified unless each claim is substantiated.
- Do not claim programmes are currently delivered before they are actually available.
- Do not claim a number of verified Registry professionals until the profiles and verification basis support it.
- Do not add accreditation, regulatory recognition, partnerships, endorsements, outcomes, credentials or impact statistics without documentary evidence and approval.

### Terminology and scoring
- Preserve approved names: Valoria Institute, PRIME, VALU Index and the approved opportunity pathways.
- PRIME means Presence, Relationships, Intelligence, Mastery and Enterprise.
- Use points, not percentages, for VALU scoring.
- Merit designations are earned credentials, not purchasable subscription tiers.

### Conversion and calls to action
- CTA labels and destinations must describe the action the user can actually complete.
- Do not add or retain a CTA that leads to a broken, unavailable, misleading or unsupported experience.
- Do not describe a future or proposed feature as currently available.
- Where the audit recommends a direction but proposes sample wording, treat the sample as a recommendation to validate against current product truth—not automatic permission to publish.

## Copy change register template

Every copy-changing PR must include a table with:

| Page/component | Existing wording | Proposed wording | Audit section/page | Product/evidence check | Test/visual verification |
|---|---|---|---|---|---|
| Exact location | Verbatim text | Exact replacement | Section + PDF page | Evidence and owner | Test/result |

For removals, record the removed claim and the audit requirement that justifies removal. For unchanged copy, do not create a register entry.

## Review and release gates

- **No source reference = no copy change.**
- **No product/evidence verification = no public claim.**
- **No approval where the source is ambiguous = preserve current wording and escalate.**
- **No mixing of current-site and redesign scope.**
- **No production release solely because a copy change compiles.** Verify the live rendered experience through the authorised release process.

This policy does not block technical fixes that do not change user-visible wording. If a technical fix requires visible copy changes, those changes must follow this policy.

## Source document handling

The authoritative audit is maintained as the Library file *Valoria Institute Website review.pdf* (20 pages; updated 4 November 2026). It is not silently replaced by this policy. This file formalises how its recommendations are applied in the repository. If a newer, explicitly approved audit supersedes it, update this policy with the new document title, date and approval reference before using the newer source.
