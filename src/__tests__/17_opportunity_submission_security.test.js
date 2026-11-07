"use strict";

import fs from "node:fs";
import path from "node:path";
import { isSubmissionKey, normalizeOpportunityInput } from "../lib/opportunityValidation.js";

const read = relative => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");

const validEmployerSubmission = () => ({
  submission_key: "11111111-1111-4111-8111-111111111111",
  title: "Senior Operations Lead",
  organisation_name: "Example Organisation",
  description: "Lead the organisation's operating model and strategic execution.",
  summary: "Senior leadership role",
  opportunity_type: "job",
  work_mode: "hybrid",
  employment_type: "full-time",
  application_url: "https://example.com/apply",
  closing_at: "2099-12-31",
  submitter_name: "Example Contact",
  submitter_email: "contact@example.com"
});

describe("opportunity submission validation and persistence", () => {
  test("normalizes a valid employer submission without truncating it", () => {
    const result = normalizeOpportunityInput(validEmployerSubmission(), { requireSubmitter: true });
    expect(result.error).toBeNull();
    expect(result.opportunity.title).toBe("Senior Operations Lead");
    expect(result.opportunity.application_url).toBe("https://example.com/apply");
    expect(result.opportunity.closing_at).toMatch(/^2099-12-31T23:59:59/);
    expect(result.submitter_email).toBe("contact@example.com");
  });

  test.each(["javascript:alert(1)", "data:text/html,hello", "ftp://example.com/apply"])(
    "rejects unsafe application URL %s",
    application_url => {
      const result = normalizeOpportunityInput({ ...validEmployerSubmission(), application_url }, { requireSubmitter: true });
      expect(result.error).toMatch(/HTTP or HTTPS|valid application URL/i);
    }
  );

  test("rejects unsupported work modes and invalid employment types", () => {
    expect(normalizeOpportunityInput({ ...validEmployerSubmission(), work_mode: "flexible" }, { requireSubmitter: true }).error).toMatch(/work mode/i);
    expect(normalizeOpportunityInput({ ...validEmployerSubmission(), employment_type: "permanent" }, { requireSubmitter: true }).error).toMatch(/employment type/i);
  });

  test("rejects expired and impossible closing dates", () => {
    expect(normalizeOpportunityInput({ ...validEmployerSubmission(), closing_at: "2020-01-01" }, { requireSubmitter: true }).error).toMatch(/future/i);
    expect(normalizeOpportunityInput({ ...validEmployerSubmission(), closing_at: "2026-02-31" }, { requireSubmitter: true }).error).toMatch(/valid application deadline/i);
  });

  test("rejects oversized fields and malformed lists instead of silently truncating", () => {
    expect(normalizeOpportunityInput({ ...validEmployerSubmission(), title: "x".repeat(181) }, { requireSubmitter: true }).error).toMatch(/length/i);
    expect(normalizeOpportunityInput({ ...validEmployerSubmission(), skills: Array(21).fill("Leadership") }, { requireSubmitter: true }).error).toMatch(/20/i);
    expect(normalizeOpportunityInput({ ...validEmployerSubmission(), capabilities: "Talent" }, { requireSubmitter: true }).error).toMatch(/list/i);
  });

  test("requires a UUID idempotency key", () => {
    expect(isSubmissionKey("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isSubmissionKey("not-a-uuid")).toBe(false);
  });

  test("both publishing paths use atomic idempotent RPCs rather than separate inserts", () => {
    const employerApi = fs.readFileSync(path.join(__dirname, "../app/api/opportunities/route.js"), "utf8");
    const adminApi = fs.readFileSync(path.join(__dirname, "../app/api/admin/opportunities/create/route.js"), "utf8");
    expect(employerApi).toContain("create_employer_opportunity_submission");
    expect(employerApi).toContain("p_submission_key");
    expect(employerApi).not.toContain(".from('opportunities').insert");
    expect(adminApi).toContain("create_admin_opportunity");
    expect(adminApi).toContain("p_submission_key");
    expect(adminApi).not.toContain(".from('opportunities').insert");
  });

  test("publishing migrations enforce unique submission keys and service-role-only RPC access", () => {
    const migration = fs.readFileSync(path.join(__dirname, "../../supabase/migrations/20261107132337_add_idempotency_to_opportunity_publishing.sql"), "utf8");
    const correction = fs.readFileSync(path.join(__dirname, "../../supabase/migrations/20261107132404_fix_employer_opportunity_email_validation.sql"), "utf8");
    expect(migration).toContain("opportunity_submissions_submission_key_uidx");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("revoke all on function public.create_admin_opportunity");
    expect(migration).toContain("to service_role");
    expect(correction).toContain("[.][^[:space:]@]+$");
  });

  test("opportunity detail pages only render safe external destinations", () => {
    const detail = fs.readFileSync(path.join(__dirname, "../app/opportunities/[slug]/page.jsx"), "utf8");
    expect(detail).toContain("safeApplicationUrl");
    expect(detail).toContain("['http:', 'https:']");
    expect(detail).toContain("rel=\"noopener noreferrer\"");
  });
});
