// valoria-site/src/__tests__/handoff-wire-contract.test.js
//
// The producer half of the site → platform handoff. The platform has the
// matching consumer test (27_handoff_wire_contract.test.js). Neither side can
// import the other, so each pins its own end of the wire format against the
// contract in docs/PLATFORM_INTEGRATION_CONTRACT.md.
//
// The split between query string and fragment is a security decision: the token
// goes in the fragment because browsers do not send fragments to the server, so
// it stays out of access logs and Referer headers. The identity fields are not
// secret and go in the query string, where the platform reads them on load.
//
// The audit's integration requirement is to "document the exact callback and
// redirect contract expected by valoria-site" and to "use environment-specific
// URLs; never hardcode preview deployment hosts as permanent destinations".
// These tests hold both halves of that.

"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

describe("handoff wire format (producer side)", () => {
  const handoff = read("src/app/api/valu-handoff/route.js");

  test("the token is placed in the fragment, not the query string", () => {
    expect(handoff).toMatch(/destination\.hash/);
    expect(handoff).toMatch(/handoff_token/);
    // The token must not also be added to the query string.
    const queryBlock = handoff.match(/destination\.search = new URLSearchParams\(\{([\s\S]*?)\}\)/);
    expect(queryBlock).not.toBeNull();
    expect(queryBlock[1]).not.toMatch(/handoff_token/);
  });

  test("identity fields travel in the query string", () => {
    const queryBlock = handoff.match(/destination\.search = new URLSearchParams\(\{([\s\S]*?)\}\)/)[1];
    for (const field of ["taster_id", "name", "role", "experience"]) {
      expect(queryBlock).toContain(field);
    }
  });

  test("the handoff destination is environment-specific, never a hardcoded preview host", () => {
    expect(handoff).toMatch(/process\.env\.VALU_ASSESSMENT_URL/);
    // A preview host as a permanent destination would expire and break every
    // handoff after the branch is deleted.
    expect(handoff).not.toMatch(/https:\/\/[a-z0-9-]+-git-[a-z0-9-]+\.vercel\.app/);
  });

  test("the token is signed and time-limited by the shared signer", () => {
    expect(handoff).toMatch(/createValuHandoffToken\(user\.id, taster\.id\)/);
    const signer = read("src/lib/valu-handoff-token.js");
    expect(signer).toMatch(/HANDOFF_SECRET|VALU_HANDOFF_SECRET|secret/i);
    expect(signer).toMatch(/exp|ttl|maxAge/i);
  });

  test("the handoff is refused unless the account email is confirmed", () => {
    // An unconfirmed account must not receive a token for a completed snapshot.
    expect(handoff).toMatch(/user\.email_confirmed_at/);
    expect(handoff).toMatch(/status:403/);
  });

  test("conflicting ownership evidence is refused rather than silently resolved", () => {
    expect(handoff).toMatch(/candidate\?\.linked_user_id && candidate\.linked_user_id !== user\.id/);
    expect(handoff).toMatch(/status:409/);
  });

  test("the handoff response is not cached and does not leak the referrer", () => {
    expect(handoff).toMatch(/'Cache-Control':'no-store'/);
    expect(handoff).toMatch(/'Referrer-Policy':'no-referrer'/);
  });
});

describe("auth callback redirect contract", () => {
  const siteUrl = read("src/lib/site-url.js");

  test("the site origin comes from the environment, not a literal", () => {
    expect(siteUrl).toMatch(/process\.env\.NEXT_PUBLIC_SITE_URL/);
  });

  test("the production origin is only a last-resort fallback", () => {
    // Scope to getSiteOrigin() — the const declaration at the top of the file
    // would otherwise be found first and prove nothing about resolution order.
    const body = siteUrl.match(/function getSiteOrigin\(\) \{([\s\S]*?)\n\}/);
    expect(body).not.toBeNull();
    const configured = body[1].indexOf("process.env.NEXT_PUBLIC_SITE_URL");
    const browser = body[1].indexOf("window.location");
    const production = body[1].indexOf("PRODUCTION_SITE_URL");
    expect(configured).toBeGreaterThanOrEqual(0);
    expect(browser).toBeGreaterThan(configured);
    expect(production).toBeGreaterThan(browser);
  });

  test("the callback URL is built from the resolved origin", () => {
    const fn = siteUrl.match(/function authCallbackUrl\(([\s\S]*?)\n\}/);
    expect(fn).not.toBeNull();
    expect(fn[1]).toMatch(/siteUrl\('\/auth\/callback'\)/);
  });

  test("the callback route the emails point at actually exists", () => {
    expect(fs.existsSync(path.join(root, "src/app/auth/callback/page.jsx"))).toBe(true);
  });
});
