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
    ["professional Taster signup", valuRegister],
    ["employer and organiser signup", buyerSignup],
    ["legacy professional signup", legacyProfessionalSignup],
    ["login recovery for unconfirmed accounts", login],
  ])("%s verifies the six-digit code with Supabase", (_name, source) => {
    expect(source).toContain("supabase.auth.verifyOtp");
    expect(source).toContain("type:'email'");
    expect(source).toContain("inputMode=\"numeric\"");
    expect(source).toContain("autoComplete=\"one-time-code\"");
    expect(source).toContain("pattern=\"[0-9]{6}\"");
    expect(source).toContain("email_confirmed_at");
  });

  test("login can resend and verify a signup code for an existing unconfirmed account", () => {
    expect(login).toContain("resendSignupOtp");
    expect(login).toContain("supabase.auth.resend");
    expect(login).toContain("window.location.replace('/auth/callback')");
  });

  test("Taster confirmation returns through the existing authenticated callback", () => {
    expect(valuRegister).toContain("/auth/callback?valu_taster=1");
    expect(callback).toContain("supabase.auth.getSession()");
    expect(callback).toContain("user_metadata?.valu_taster_signup !== true");
    expect(callback).toContain("fetch('/api/valu-taster/start'");
  });

  test("buyer signup preserves its dashboard or validated return destination", () => {
    expect(buyerSignup).toContain("window.location.replace(returnTo || '/dashboard?welcome=profile')");
  });
});
