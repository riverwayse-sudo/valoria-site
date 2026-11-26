"use strict";

const fs = require("fs");
const path = require("path");

const workflow = fs.readFileSync(
  path.join(__dirname, "../../.github/workflows/cloudflare-site-worker-deploy.yml"),
  "utf8"
);

describe("Production smoke-test privacy and Registry contract", () => {
  test("production smoke tests do not depend on a hard-coded participant profile", () => {
    expect(workflow).not.toContain("ATB-C-TAA-00177");
    expect(workflow).not.toContain("/profile/");
  });

  test("production smoke verifies the public Registry is available without requiring a sample profile", () => {
    expect(workflow).toContain('curl -fsS "$base/marketplace"');
    expect(workflow).toContain("Assessment-informed professional profiles");
    expect(workflow).toContain("Marketplace data could not be verified");
  });
});
