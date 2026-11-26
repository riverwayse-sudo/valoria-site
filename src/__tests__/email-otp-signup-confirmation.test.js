"use strict";

const fs = require("fs");
const path = require("path");

const read = (file) => fs.readFileSync(path.join(__dirname, file), "utf8");
const valuRegister = read("../app/valu/register/page.jsx");
const buyerSignup = read("../app/signup/page.jsx");
const legacyProfessionalSignup = read("../app/professional-signup/page.jsx");
const login = read("../app/login/page.jsx");
const callback = read("../app/auth/callback/page.jsx");

describe("email OTP signup confirmation", () => {
  test.each([
    ["employer and organiser signup", buyerSignup],
    ["legacy professional signup", legacyProfessionalSignup],
    ["login recovery for unconfirmed accounts", login],
  ])("%s verifies the six-digit code with Supabase", (_name, source) => {
    expect(source).toContain("supabase.auth.verifyOtp");
    expect(source).toMatch(/type:\s*['"]email['"]/);
    expect(source).toContain("inputMode=\"numeric\"");
    expect(source).toContain("autoComplete=\"one-time-code\"");
    expect(source).toContain("pattern=\"[0-9]{6}\"");
    expect(source).toContain("email_confirmed_at");
  });

  test.each([
    ["employer and organiser signup", buyerSignup],
    ["legacy professional signup", legacyProfessionalSignup],
  ])("%s uses the OTP template and exposes code resend without redirect links", (_name, source) => {
    expect(source).not.toContain("emailRedirectTo");
    expect(source).toContain("supabase.auth.resend");
    expect(source).toMatch(/type\s*:\s*['"]signup['"]/);
  });

  test("login can resend and verify a signup code for an existing unconfirmed account", () => {
    expect(login).toContain("resendSignupOtp");
    expect(login).toContain("supabase.auth.resend");
    expect(login).toContain("window.location.replace('/auth/callback')");
  });

  test("VALU registration creates an unconfirmed account and begins the Taster before email confirmation", () => {
    const createRoute = read("../app/api/valu-taster/register/route.js");
    expect(valuRegister).toContain("/api/valu-taster/register");
    expect(createRoute).toContain("admin.auth.admin.createUser");
    expect(createRoute).toContain("email_confirm: false");
    expect(createRoute).toContain("entry_point: 'taster_start'");
    expect(createRoute).toContain("target_stage: 'taster'");
  });

  test("VALU email confirmation is requested only after the completed Taster is ownership-verified", () => {
    const completeRoute = read("../app/api/valu-taster/complete/route.js");
    expect(completeRoute).toContain("admin.auth.admin.getUserById");
    expect(completeRoute).toContain("user.email_confirmed_at");
    expect(completeRoute).toContain("type: 'signup'");
    expect(completeRoute).toContain("candidate.lead_capture_id !== taster.lead_capture_id");
    expect(completeRoute).toContain("lead?.source !== 'valu_taster_signup'");
    expect(completeRoute).toContain("taster.user_id !== user.id")
    expect(completeRoute).toContain("candidate.linked_user_id !== user.id")
  });

  test("post-Taster signup confirmation returns through the authenticated callback", () => {
    expect(legacyProfessionalSignup).toContain("/auth/callback?pending_taster_id=");
    expect(callback).toContain("supabase.auth.getSession()");
    expect(callback).toContain("fetch('/api/link-taster'");
  });

  test("buyer signup preserves its dashboard or validated return destination", () => {
    expect(buyerSignup).toContain("window.location.replace(returnTo || '/dashboard?welcome=profile')");
  });
});
