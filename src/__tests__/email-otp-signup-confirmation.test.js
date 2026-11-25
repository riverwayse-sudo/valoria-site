"use strict";

const fs = require("fs");
const path = require("path");

const read = (file) => fs.readFileSync(path.join(__dirname, file), "utf8");
const valuRegister = read("../app/valu/register/page.jsx");
const buyerSignup = read("../app/signup/page.jsx");
const legacyProfessionalSignup = read("../app/professional-signup/page.jsx");
const login = read("../app/login/page.jsx");
const callback = read("../app/auth/callback/page.jsx");
const confirmationRoute = read("../app/auth/confirm/route.js");

describe("email-link signup confirmation", () => {
  test.each([
    ["professional Taster signup", valuRegister, "/auth/callback?valu_taster=1"],
    ["employer and organiser signup", buyerSignup, "/auth/callback"],
    ["legacy professional signup", legacyProfessionalSignup, "/auth/callback?pending_taster_id="],
  ])("%s requests a confirmation link with its correct callback", (_name, source, callbackPath) => {
    expect(source).toContain("emailRedirectTo");
    expect(source).toContain(callbackPath);
    expect(source).not.toContain("supabase.auth.verifyOtp");
    expect(source).not.toContain("otpCode");
    expect(source).toContain("supabase.auth.resend");
  });

  test("buyer signup preserves a validated return destination through confirmation", () => {
    expect(buyerSignup).toContain("encodeURIComponent(returnTo)");
    expect(callback).toContain("params.get('returnTo')");
    expect(callback).toContain("target.origin === window.location.origin");
    expect(callback).toContain("router.replace(destination)");
  });

  test("unconfirmed login resends a link instead of requesting a six-digit code", () => {
    expect(login).toContain("resendSignupConfirmationLink");
    expect(login).toContain("emailRedirectTo: getConfirmationRedirectUrl()");
    expect(login).not.toContain("supabase.auth.verifyOtp");
    expect(login).not.toContain("six-digit");
    expect(login).not.toContain("otpCode");
  });

  test("confirmation route does not consume tokens on GET and verifies token_hash on POST", () => {
    const getHandler = confirmationRoute.split("export async function POST")[0];
    const postHandler = confirmationRoute.split("export async function POST")[1];
    expect(getHandler).toContain("token_hash");
    expect(getHandler).not.toContain("verifyOtp");
    expect(postHandler).toContain("token_hash: tokenHash");
    expect(postHandler).toContain("type: 'email'");
    expect(postHandler).toContain("response.cookies.set");
    expect(postHandler).toContain("supabase.auth.verifyOtp");
  });

  test("Taster confirmation links the saved Taster and returns the participant to the dashboard", () => {
    expect(valuRegister).toContain("/auth/callback?valu_taster=1");
    expect(legacyProfessionalSignup).toContain("/auth/callback?pending_taster_id=");
    expect(callback).toContain("supabase.auth.getSession()");
    expect(callback).toContain("fetch('/api/valu-taster/start'");
    expect(callback).toContain("/api/link-taster");
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')");
  });
});
