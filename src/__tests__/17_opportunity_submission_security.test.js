"use strict";

const fs = require("node:fs");
const path = require("node:path");

const read = relative => fs.readFileSync(path.join(__dirname, "../..", relative), "utf8");

describe("opportunity submission security contracts", () => {
  test("validation helper enforces HTTP(S), bounded lists, and UUID idempotency keys", () => {
    const source = read("src/lib/opportunityValidation.js");
    expect(source).toContain("new URL(raw)");
    expect(source).toContain("['http:', 'https:']");
    expect(source).toContain("value.length > 20");
    expect(source).toContain("UUID_PATTERN");
    expect(source).toContain("export function normalizeOpportunityInput");
    expect(source).toContain("export function isSubmissionKey");
  });

  test("employer and admin publishing use atomic idempotent RPCs", () => {
    const employerApi = read("src/app/api/opportunities/route.js");
    const adminApi = read("src/app/api/admin/opportunities/create/route.js");
    expect(employerApi).toContain("create_employer_opportunity_submission");
    expect(employerApi).toContain("p_submission_key");
    expect(employerApi).not.toContain(".from('opportunities').insert");
    expect(adminApi).toContain("create_admin_opportunity");
    expect(adminApi).toContain("p_submission_key");
    expect(adminApi).not.toContain(".from('opportunities').insert");
  });

  test("publishing migrations enforce unique keys and service-role-only RPC access", () => {
    const migration = fs.readFileSync(path.join(__dirname, "../../supabase/migrations/20261107132337_add_idempotency_to_opportunity_publishing.sql"), "utf8");
    const correction = fs.readFileSync(path.join(__dirname, "../../supabase/migrations/20261107132404_fix_employer_opportunity_email_validation.sql"), "utf8");
    expect(migration).toContain("opportunity_submissions_submission_key_uidx");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("revoke all on function public.create_admin_opportunity");
    expect(migration).toContain("to service_role");
    expect(correction).toContain("[.][^[:space:]@]+$");
  });

  test("opportunity detail pages only render safe external destinations", () => {
    const detail = read("src/app/opportunities/[slug]/page.jsx");
    expect(detail).toContain("safeApplicationUrl");
    expect(detail).toContain("['http:', 'https:']");
    expect(detail).toContain("rel=\"noopener noreferrer\"");
  });
});
