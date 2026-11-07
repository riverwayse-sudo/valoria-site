import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";

const helperSource = fs.readFileSync(new URL("../../src/lib/opportunityValidation.js", import.meta.url), "utf8");
const helperUrl = `data:text/javascript;base64,${Buffer.from(helperSource).toString("base64")}`;
const { normalizeOpportunityInput, isSubmissionKey } = await import(helperUrl);

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
  submitter_email: "contact@example.com",
});

describe("opportunity submission input validation", () => {
  test("normalizes a valid employer submission without truncating it", () => {
    const result = normalizeOpportunityInput(validEmployerSubmission(), { requireSubmitter: true });
    assert.equal(result.error, null);
    assert.equal(result.opportunity.title, "Senior Operations Lead");
    assert.equal(result.opportunity.application_url, "https://example.com/apply");
    assert.match(result.opportunity.closing_at, /^2099-12-31T23:59:59/);
    assert.equal(result.submitter_email, "contact@example.com");
  });

  test("rejects unsafe application URL schemes", () => {
    for (const application_url of ["javascript:alert(1)", "data:text/html,hello", "ftp://example.com/apply"]) {
      const result = normalizeOpportunityInput({ ...validEmployerSubmission(), application_url }, { requireSubmitter: true });
      assert.match(result.error, /HTTP or HTTPS|valid application URL/i);
    }
  });

  test("rejects unsupported work modes and employment types", () => {
    assert.match(normalizeOpportunityInput({ ...validEmployerSubmission(), work_mode: "flexible" }, { requireSubmitter: true }).error, /work mode/i);
    assert.match(normalizeOpportunityInput({ ...validEmployerSubmission(), employment_type: "permanent" }, { requireSubmitter: true }).error, /employment type/i);
  });

  test("rejects expired and impossible closing dates", () => {
    assert.match(normalizeOpportunityInput({ ...validEmployerSubmission(), closing_at: "2020-01-01" }, { requireSubmitter: true }).error, /future/i);
    assert.match(normalizeOpportunityInput({ ...validEmployerSubmission(), closing_at: "2026-02-31" }, { requireSubmitter: true }).error, /valid application deadline/i);
  });

  test("rejects oversized fields and malformed lists instead of silently truncating", () => {
    assert.match(normalizeOpportunityInput({ ...validEmployerSubmission(), title: "x".repeat(181) }, { requireSubmitter: true }).error, /length/i);
    assert.match(normalizeOpportunityInput({ ...validEmployerSubmission(), skills: Array(21).fill("Leadership") }, { requireSubmitter: true }).error, /20/i);
    assert.match(normalizeOpportunityInput({ ...validEmployerSubmission(), capabilities: "Talent" }, { requireSubmitter: true }).error, /list/i);
  });

  test("requires a UUID idempotency key", () => {
    assert.equal(isSubmissionKey("11111111-1111-4111-8111-111111111111"), true);
    assert.equal(isSubmissionKey("not-a-uuid"), false);
  });
});
