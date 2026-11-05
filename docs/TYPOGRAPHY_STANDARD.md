# Valoria Website Typography Standard

Status: Active implementation standard  
Owner: Valoria Institute product/design authority  
Applies to: Public website and account-facing pages in `valoria-site`

## 1. Typeface

- Raleway is the canonical website typeface.
- Load Raleway once, from `src/styles/globals.css`.
- Do not add a second Google Fonts import to a page, component, or secondary stylesheet.
- Do not introduce a decorative or editorial fallback typeface into website UI.
- Generic `sans-serif` is the fallback only.
- Platform-specific assessment typography must remain aligned to the same Raleway family; any additional technical/monospace face must be limited to data or code-like values and must not replace the UI typeface.

## 2. Approved weights

Use the shared weight tokens in `src/styles/globals.css`:

| Token | Weight | Intended use |
|---|---:|---|
| `--vi-weight-light` | 300 | restrained supporting display text |
| `--vi-weight-regular` | 400 | body and default text |
| `--vi-weight-medium` | 500 | emphasis and secondary headings |
| `--vi-weight-semibold` | 600 | section headings and controls |
| `--vi-weight-bold` | 700 | primary headings and strong emphasis |
| `--vi-weight-extrabold` | 800 | limited institutional display emphasis |
| `--vi-weight-black` | 900 | rare, deliberate display use |

Do not use arbitrary numeric weights or browser-synthesised weights where an approved weight exists.

## 3. Type hierarchy

The existing global scale remains the source of truth:

| Role | Token | Desktop range / size |
|---|---|---:|
| H1 | `--vi-type-h1` | 2rem–3.5rem, fluid |
| H2 | `--vi-type-h2` | 1.65rem–2.75rem, fluid |
| H3 | `--vi-type-h3` | 1.3rem–1.75rem, fluid |
| H4 | `--vi-type-h4` | 1.125rem–1.375rem, fluid |
| Body | `--vi-type-body` | 1rem |
| Small | `--vi-type-small` | 0.875rem |
| Label | `--vi-type-label` | 0.8125rem |

Use semantic heading levels in document order. Do not choose heading tags for their visual size. Use the type tokens for visual roles without breaking heading semantics.

## 4. Line height and measure

- Use `--vi-leading-tight` for large display headings.
- Use `--vi-leading-heading` for headings and short text blocks.
- Use `--vi-leading-body` for paragraphs and long-form content.
- Keep paragraph measure comfortable; avoid full-width text blocks on desktop.
- Do not compress line height to force copy into a fixed-height card.
- Do not use manual line breaks to compensate for a broken responsive layout.

## 5. Responsive rules

- Desktop and mobile use the same hierarchy; sizes may scale through the existing fluid tokens.
- At 390px, headings must wrap naturally without clipping or horizontal scrolling.
- Body text must remain readable and must not be reduced to preserve card geometry.
- Labels and metadata must remain legible; do not make small text the default for content.

## 6. Implementation rules

- The global stylesheet owns the site-wide type scale and tokens.
- The brand stylesheet owns brand application, not a second font download or a competing type scale.
- Components should consume shared tokens rather than introduce independent type scales.
- Avoid broad page-level `!important` rules and unexplained inline typography overrides.
- Email templates and transactional messages may have separate rendering constraints; they must be reviewed as a distinct surface rather than silently treated as website UI.

## 7. Automated enforcement

`npm run design:check` must verify:
- the approved Google Font is loaded once from the canonical global stylesheet;
- the required typography tokens exist;
- existing design-system checks continue to pass.

A passing static check does not replace browser inspection at 1440px, 1280px, 768px, and 390px.
