"use strict";

const fs = require("fs");
const path = require("path");

const signup = fs.readFileSync(
  path.join(__dirname, "../app/professional-signup/page.jsx"),
  "utf8"
);
const login = fs.readFileSync(
  path.join(__dirname, "../app/login/page.jsx"),
  "utf8"
);

describe("professional signup identity recovery", () => {
  test("existing Supabase identities are routed to sign-in instead of a false confirmation state", () => {
    expect(signup).toContain("Array.isArray(data.user.identities) && data.user.identities.length === 0");
    expect(signup).toContain("localStorage.setItem('pending_taster_id',tasterId)");
    expect(signup).toContain("/login?pending_taster_id=");
    expect(signup).toContain("return");
  });

  test("the login flow consumes the preserved taster reference after authentication", () => {
    expect(login).toContain("params.get('pending_taster_id')");
    expect(login).toContain("localStorage.setItem('pending_taster_id', pendingTasterId)");
    expect(login).toContain("fetch('/api/link-taster'");
    expect(login).toContain("redirectAfterLogin('/dashboard')");
    expect(login).toContain("requestedTarget.origin === window.location.origin");
    expect(login).toContain("parsed.origin === window.location.origin");
    expect(login).not.toContain("returnTo && returnTo.startsWith('/')");
  });

  test("new-account signup still requires password confirmation", () => {
    expect(signup).toContain("form.confirm");
    expect(signup).toContain("form.password===form.confirm");
    expect(signup).toContain("Confirm password");
  });
});
