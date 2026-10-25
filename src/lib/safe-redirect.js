// src/lib/safe-redirect.js
//
// Validates a caller-supplied `returnTo` value before it is used as a
// navigation target.
//
// Incident: login/page.jsx and signup/page.jsx both accepted a `returnTo` query
// parameter and applied the guard `value.startsWith('/')`. That guard does not
// hold. A protocol-relative URL starts with '/' but is an absolute URL with an
// inherited scheme:
//
//   window.location.href = '//evil.com'   ->   https://evil.com/
//
// So a link such as
//   /login?returnTo=//evil.com
// rendered a genuine Valoria sign-in form and then delivered the user to an
// attacker's site immediately after they authenticated - a phishing pivot on
// the domain the participant is being asked to trust. Tab/newline variants
// ('/\t/evil.com') are normalised away by the URL parser and bypass the same
// guard, as does a leading backslash.
//
// This helper only accepts a same-origin absolute path. It is deliberately
// strict: anything ambiguous is dropped in favour of the caller's default.
//
// CommonJS to match the other src/lib modules, which tests load via require().

"use strict";

/**
 * Returns `value` if it is a safe same-origin path, otherwise null.
 *
 * Accepts:   "/dashboard", "/journey/continue?stage=assess", "/a/b#c"
 * Rejects:   "//evil.com", "///evil.com", "/\\evil.com", "https://evil.com",
 *            "javascript:alert(1)", "", "dashboard"
 */
function safeReturnPath(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;

  // A leading "//" (or any run of slashes/backslashes) is protocol-relative or
  // authority-based, not a path. Reject before parsing, because parsing would
  // silently accept it as same-origin.
  if (/^[\/\\]{2,}/.test(value)) return null;

  // URL parsers treat backslashes as forward slashes, so "/\evil.com" resolves
  // to https://evil.com/. Reject any backslash outright.
  if (value.includes("\\")) return null;

  // Reject control characters, which some parsers strip before resolving.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;

  try {
    // Resolve against a fixed origin. If the result is not on that origin, the
    // value escaped the path namespace.
    const resolved = new URL(value, "https://valoria.invalid");
    if (resolved.origin !== "https://valoria.invalid") return null;

    // Rebuild from the resolved components, then re-check. Dot-segment
    // normalisation runs during resolution, so '/..//evil.com' resolves to the
    // path '//evil.com' - protocol-relative again. The original value passed
    // the checks above, so the *result* must be validated, not just the input.
    const rebuilt = resolved.pathname + resolved.search + resolved.hash;
    if (!rebuilt.startsWith("/")) return null;
    if (/^[\/\\]{2,}/.test(rebuilt)) return null;
    if (rebuilt.includes("\\")) return null;
    return rebuilt;
  } catch {
    return null;
  }
}

/** Returns a safe path, or `fallback` when the value is unsafe or absent. */
function safeReturnPathOr(value, fallback) {
  const safe = safeReturnPath(value);
  return safe === null ? fallback : safe;
}

module.exports = { safeReturnPath, safeReturnPathOr };
